import { getCorsHeaders, isDisallowedOrigin } from './_cors.js';
import { Redis } from '@upstash/redis';

export const config = { runtime: 'edge' };

// ─── WhatsApp notification dispatcher ────────────────────────────────────────
//
// Called by DeckGLMap when ECI milestone events are detected (e.g. state winner
// called, half-way declared, all constituencies reporting).
//
// Protected by WHATSAPP_NOTIFY_SECRET env var — must match `?secret=` query
// param or `Authorization: Bearer <secret>` header.
//
// Required env vars:
//   TWILIO_ACCOUNT_SID        — Twilio account SID (ACxxx...)
//   TWILIO_AUTH_TOKEN         — Twilio auth token
//   TWILIO_WHATSAPP_FROM      — e.g. whatsapp:+14155238886 (sandbox) or production number
//   WHATSAPP_NOTIFY_SECRET    — arbitrary secret to protect this endpoint
//   UPSTASH_REDIS_REST_URL    — Upstash Redis REST URL
//   UPSTASH_REDIS_REST_TOKEN  — Upstash Redis REST token
//
// Optional:
//   TWILIO_SANDBOX_MODE       — if set, reminder to users they need to join sandbox

const REDIS_KEY = 'eci:whatsapp:subscribers';
// Hard cap: Twilio free tier has rate limits; stay under 100 messages/dispatch
const MAX_RECIPIENTS = 200;
// Track recently sent messages to avoid duplicate alerts
const SENT_CACHE_KEY = 'eci:whatsapp:sent_hashes';
const SENT_CACHE_TTL = 3600; // 1 hour — don't resend same alert within an hour

let _redis = null;
function getRedis() {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

// ─── Simple hash to deduplicate alerts ───────────────────────────────────────
async function simpleHash(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

// ─── Twilio WhatsApp API ──────────────────────────────────────────────────────
async function sendWhatsApp(to, body) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

  if (!sid || !token) throw new Error('Twilio credentials not configured');

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const auth = btoa(`${sid}:${token}`);

  const params = new URLSearchParams({
    From: from.startsWith('whatsapp:') ? from : `whatsapp:${from}`,
    To: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
    Body: body,
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Twilio ${res.status}: ${errBody.slice(0, 200)}`);
  }

  return await res.json();
}

// ─── Auth check ───────────────────────────────────────────────────────────────
function isAuthorised(req) {
  const secret = process.env.WHATSAPP_NOTIFY_SECRET;
  if (!secret) {
    // Secret not configured — only allow requests from same origin (Vercel internal)
    const origin = req.headers.get('origin') || '';
    return origin.includes('electropulse') || origin.includes('localhost');
  }
  const url = new URL(req.url);
  const qsSecret = url.searchParams.get('secret');
  if (qsSecret === secret) return true;
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader === `Bearer ${secret}`) return true;
  return false;
}

function json(body, status, cors) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req) {
  const cors = getCorsHeaders(req, 'POST, OPTIONS');

  if (isDisallowedOrigin(req)) return json({ error: 'Origin not allowed' }, 403, cors);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, cors);

  if (!isAuthorised(req)) {
    return json({ error: 'Unauthorized' }, 401, cors);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400, cors);
  }

  const { message, event_type } = body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return json({ error: 'message is required' }, 400, cors);
  }
  if (message.length > 1000) {
    return json({ error: 'message too long (max 1000 chars)' }, 400, cors);
  }

  const redis = getRedis();
  if (!redis) {
    return json({ error: 'Storage not configured (UPSTASH_REDIS_REST_URL missing)' }, 503, cors);
  }

  // ── Deduplication: skip if same message was sent in last hour ───────────────
  const msgHash = await simpleHash(message);
  try {
    const alreadySent = await redis.sismember(SENT_CACHE_KEY, msgHash);
    if (alreadySent) {
      return json({ status: 'skipped', reason: 'duplicate — same alert sent in last hour', hash: msgHash }, 200, cors);
    }
  } catch { /* ignore Redis errors in dedup check */ }

  // ── Fetch subscriber list ───────────────────────────────────────────────────
  let subscribers = [];
  try {
    subscribers = await redis.smembers(REDIS_KEY);
  } catch (err) {
    return json({ error: `Failed to fetch subscribers: ${err?.message}` }, 500, cors);
  }

  if (subscribers.length === 0) {
    return json({ status: 'no_subscribers', sent: 0 }, 200, cors);
  }

  const targets = subscribers.slice(0, MAX_RECIPIENTS);

  // ── Check Twilio credentials before attempting sends ───────────────────────
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return json({
      status: 'twilio_not_configured',
      message: 'Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) not set in Vercel env vars.',
      subscribers: targets.length,
    }, 503, cors);
  }

  // ── Send messages (concurrency capped at 5 to respect Twilio rate limits) ──
  const results = { sent: 0, failed: 0, errors: [] };
  const CONCURRENCY = 5;

  for (let i = 0; i < targets.length; i += CONCURRENCY) {
    const batch = targets.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      batch.map((phone) => sendWhatsApp(phone, message))
    );
    for (const r of settled) {
      if (r.status === 'fulfilled') {
        results.sent += 1;
      } else {
        results.failed += 1;
        results.errors.push(r.reason?.message || String(r.reason));
      }
    }
  }

  // ── Mark as sent (dedup cache, TTL 1h) ────────────────────────────────────
  if (results.sent > 0) {
    try {
      await redis.sadd(SENT_CACHE_KEY, msgHash);
      await redis.expire(SENT_CACHE_KEY, SENT_CACHE_TTL);
    } catch { /* non-fatal */ }
  }

  console.log(`[whatsapp-notify] event=${event_type || 'manual'} sent=${results.sent} failed=${results.failed} total=${targets.length}`);

  return json({
    status: 'done',
    event_type: event_type || 'manual',
    sent: results.sent,
    failed: results.failed,
    total: targets.length,
    ...(results.errors.length > 0 ? { errors: results.errors.slice(0, 5) } : {}),
  }, 200, cors);
}
