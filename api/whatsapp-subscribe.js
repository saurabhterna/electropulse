import { getCorsHeaders, isDisallowedOrigin } from './_cors.js';
import { Redis } from '@upstash/redis';

export const config = { runtime: 'edge' };

// ─── Redis ────────────────────────────────────────────────────────────────────
// Subscribers are stored in a Redis SET: eci:whatsapp:subscribers
// Value: E.164 phone numbers e.g. "+919876543210"
// Redis is required for subscriptions — if not configured, API returns graceful error.

const REDIS_KEY = 'eci:whatsapp:subscribers';

let _redis = null;
function getRedis() {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

// ─── Phone number validation ──────────────────────────────────────────────────
// Accept E.164 or bare Indian 10-digit numbers.
// Normalises to E.164 +91XXXXXXXXXX for Indian numbers.

function normalisePhone(raw) {
  if (typeof raw !== 'string') return null;
  // Strip whitespace, dashes, dots, parentheses
  let p = raw.replace(/[\s\-().]/g, '');
  if (!p) return null;

  // Already E.164 with + prefix
  if (/^\+\d{7,15}$/.test(p)) return p;

  // Starts with 0 (Indian national prefix) → drop 0, prepend +91
  if (/^0\d{10}$/.test(p)) return '+91' + p.slice(1);

  // 10-digit bare Indian number
  if (/^\d{10}$/.test(p)) return '+91' + p;

  // Country code without + (e.g. 919876543210)
  if (/^91\d{10}$/.test(p)) return '+' + p;

  return null;
}

// ─── In-memory per-instance rate limit (no Redis dependency) ─────────────────
const ipMap = new Map();
const IP_LIMIT = 3;
const IP_WINDOW_MS = 10 * 60 * 1000; // 10 min

function ipRateLimited(ip) {
  const now = Date.now();
  const e = ipMap.get(ip);
  if (!e || now - e.t > IP_WINDOW_MS) {
    ipMap.set(ip, { t: now, n: 1 });
    return false;
  }
  e.n += 1;
  return e.n > IP_LIMIT;
}

function getIp(req) {
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '0.0.0.0'
  );
}

function json(body, status, cors) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req) {
  const cors = getCorsHeaders(req, 'POST, DELETE, OPTIONS');

  if (isDisallowedOrigin(req)) return json({ error: 'Origin not allowed' }, 403, cors);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

  const ip = getIp(req);

  // ── POST /api/whatsapp-subscribe — subscribe ────────────────────────────────
  if (req.method === 'POST') {
    if (ipRateLimited(ip)) return json({ error: 'Too many requests — try again in 10 minutes' }, 429, cors);

    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400, cors);
    }

    const phone = normalisePhone(body?.phone);
    if (!phone) {
      return json({
        error: 'Invalid phone number. Please enter a valid Indian mobile number (10 digits) or full international number.',
      }, 400, cors);
    }

    const redis = getRedis();
    if (!redis) {
      // Redis not configured — return the Twilio sandbox join instructions anyway
      // so the feature partially works even without subscriber storage
      return json({
        status: 'no_storage',
        message: 'WhatsApp alerts storage not configured yet — join the broadcast manually.',
        whatsapp_join_url: buildJoinUrl(),
        phone,
      }, 200, cors);
    }

    try {
      const added = await redis.sadd(REDIS_KEY, phone);
      const alreadySubscribed = added === 0;

      return json({
        status: alreadySubscribed ? 'already_subscribed' : 'subscribed',
        phone,
        message: alreadySubscribed
          ? `${phone} is already subscribed for WhatsApp alerts.`
          : `Subscribed! You'll receive WhatsApp alerts on ${phone} on counting day.`,
        // For Twilio sandbox users must also text the join word
        sandbox_required: !!process.env.TWILIO_SANDBOX_MODE,
        whatsapp_join_url: process.env.TWILIO_SANDBOX_MODE ? buildJoinUrl() : null,
      }, 200, cors);
    } catch (err) {
      console.error('[whatsapp-subscribe] Redis error:', err?.message);
      return json({ error: 'Storage error — please try again' }, 500, cors);
    }
  }

  // ── DELETE /api/whatsapp-subscribe — unsubscribe ───────────────────────────
  if (req.method === 'DELETE') {
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400, cors);
    }

    const phone = normalisePhone(body?.phone);
    if (!phone) return json({ error: 'Invalid phone number' }, 400, cors);

    const redis = getRedis();
    if (!redis) return json({ error: 'Storage not configured' }, 503, cors);

    try {
      await redis.srem(REDIS_KEY, phone);
      return json({ status: 'unsubscribed', phone }, 200, cors);
    } catch (err) {
      console.error('[whatsapp-unsubscribe] Redis error:', err?.message);
      return json({ error: 'Storage error — please try again' }, 500, cors);
    }
  }

  return json({ error: 'Method not allowed' }, 405, cors);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildJoinUrl() {
  // Twilio WhatsApp Sandbox: users text "join <word>" to +14155238886
  // TWILIO_SANDBOX_JOIN_WORD env var — set in Twilio console (e.g. "joins-palace")
  const word = process.env.TWILIO_SANDBOX_JOIN_WORD || '';
  const msg = word
    ? `join ${word}`
    : 'join electropulse';
  return `https://wa.me/14155238886?text=${encodeURIComponent(msg)}`;
}
