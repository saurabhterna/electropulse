import { getCorsHeaders, isDisallowedOrigin } from './_cors.js';
import { fetchWithTimeout, getRelayBaseUrl, getRelayHeaders } from './_relay.js';
import { Redis } from '@upstash/redis';

export const config = { runtime: 'edge' };

// ECI state codes for 2026 assembly elections
const STATE_CODES = {
  ASSAM: 'S03',
  KERALA: 'S11',
  'TAMIL NADU': 'S22',
  'WEST BENGAL': 'S25',
  PUDUCHERRY: 'U07',
};

const STATE_SEATS = {
  ASSAM: 126,
  KERALA: 140,
  'TAMIL NADU': 234,
  'WEST BENGAL': 294,
  PUDUCHERRY: 30,
};

// ECI URL slug — will be confirmed on counting day.
// Convention: ResultAcGen{Month}{Year}
const ECI_SLUG = process.env.ECI_RESULT_SLUG || 'ResultAcGenMay2026';
const ECI_BASE = `https://results.eci.gov.in/${ECI_SLUG}`;

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

/**
 * Fetch a single ECI statewise page and parse the HTML table.
 * Each page has up to 20 constituencies.
 * Returns array of { acNo, acName, leading, party, status, totalVotes, margin }
 */
async function fetchStatewisePage(stateCode, pageNum) {
  const url = `${ECI_BASE}/statewise${stateCode}${pageNum}.htm`;
  const reqHeaders = {
    'User-Agent': BROWSER_UA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': `https://results.eci.gov.in/${ECI_SLUG}/`,
  };

  // Try direct fetch first
  let resp = null;
  try {
    resp = await fetchWithTimeout(url, { headers: reqHeaders }, 15000);
  } catch (_) { /* fall through to relay */ }

  // ECI blocks datacenter IPs (Akamai) — fall back to Railway relay
  if (!resp || !resp.ok) {
    const relayBase = getRelayBaseUrl();
    if (relayBase) {
      try {
        const relayUrl = `${relayBase}/proxy?url=${encodeURIComponent(url)}`;
        resp = await fetchWithTimeout(relayUrl, {
          headers: getRelayHeaders({ ...reqHeaders }),
        }, 20000);
      } catch (_) { /* relay also failed */ }
    }
  }

  if (!resp || !resp.ok) return [];

  const html = await resp.text();
  // Quick sanity check — Access Denied pages have no table rows
  if (html.includes('Access Denied') || html.includes('access denied')) return [];
  return parseStatewiseHtml(html);
}

/**
 * Parse ECI statewise HTML table.
 * Table structure (observed from past elections):
 * Each row has: Constituency | Leading Candidate | Party | Status | Total Votes | Margin
 * The constituency cell typically contains "No. Name" format.
 */
function parseStatewiseHtml(html) {
  const results = [];

  // Find table rows — ECI uses <tr> with <td> cells containing data
  // Pattern: look for rows with constituency data
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];

    // Extract all <td> cell contents
    const cells = [];
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      // Strip HTML tags, get text content
      let text = cellMatch[1]
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
      cells.push(text);
    }

    if (cells.length < 4) continue;

    // Try to find constituency number from the first cell
    // Format varies: "1 - Mekliganj" or just the number in a separate cell
    let acNo = null;
    let acName = '';
    let dataStartIdx = 0;

    // Check first cell for "No - Name" pattern
    const acMatch = cells[0].match(/^\s*(\d+)\s*[-–.]\s*(.+)/);
    if (acMatch) {
      acNo = parseInt(acMatch[1]);
      acName = acMatch[2].trim();
      dataStartIdx = 1;
    } else if (/^\d+$/.test(cells[0].trim())) {
      // First cell is just a number
      acNo = parseInt(cells[0].trim());
      acName = cells[1]?.trim() || '';
      dataStartIdx = 2;
    }

    if (!acNo || acNo < 1 || acNo > 300) continue;

    const remaining = cells.slice(dataStartIdx);
    if (remaining.length < 2) continue;

    // Extract candidate, party, status, votes, margin
    // The exact layout varies — use heuristics
    let leading = '';
    let party = '';
    let status = '';
    let totalVotes = 0;
    let margin = 0;

    // Common patterns:
    // [Candidate, Party, Status, Votes, Margin]
    // [Candidate, Party, Votes, Margin]
    leading = remaining[0] || '';
    party = remaining[1] || '';

    // Find numeric cells for votes and margin
    for (let i = 2; i < remaining.length; i++) {
      const num = parseInt(remaining[i].replace(/,/g, ''));
      if (!isNaN(num)) {
        if (totalVotes === 0) {
          // Check if this is a status cell like "Won" / "Leading"
          if (/won|leading|trailing|result/i.test(remaining[i])) {
            status = remaining[i];
            continue;
          }
          totalVotes = num;
        } else {
          margin = num;
        }
      } else if (/won|leading|trailing|result/i.test(remaining[i])) {
        status = remaining[i];
      }
    }

    // Normalize party abbreviation
    party = party.replace(/\s*\(.*?\)\s*$/, '').trim();

    results.push({
      acNo,
      acName: acName.replace(/\s*\(.*?\)\s*$/, '').trim(), // Remove (SC)/(ST) suffix for matching
      acNameFull: acName, // Keep full name with reservation marker
      leading: leading.trim(),
      party: party.toUpperCase(),
      status: status.toLowerCase().includes('won') ? 'won' : 'counting',
      totalVotes,
      margin,
    });
  }

  return results;
}

/**
 * Fetch all pages for a state.
 * ECI paginates at 20 results per page.
 */
async function fetchStateResults(stateCode, totalSeats) {
  const totalPages = Math.ceil(totalSeats / 20);
  const results = [];

  // Fetch pages in parallel (max 4 concurrent)
  const batchSize = 4;
  for (let i = 0; i < totalPages; i += batchSize) {
    const batch = [];
    for (let j = i; j < Math.min(i + batchSize, totalPages); j++) {
      batch.push(fetchStatewisePage(stateCode, j + 1));
    }
    const batchResults = await Promise.allSettled(batch);
    for (const r of batchResults) {
      if (r.status === 'fulfilled') results.push(...r.value);
    }
  }

  return results;
}

// ─── Cache layer ──────────────────────────────────────────────────────────────
// Two-tier: in-memory (warm edge instance) + Redis (if configured).
// Even without Redis, Vercel reuses warm instances within a region —
// in-memory cache keeps ECI load low across concurrent requests.

const CACHE_TTL_SECONDS = 60;       // Refresh ECI data at most once per minute
const CACHE_STALE_SECONDS = 300;    // Serve stale up to 5 min if ECI is down

// In-memory store — shared across requests on the same warm edge instance
let _memCache = null;  // { data, scraped_at_ms }

// Redis — optional, gives cross-instance sharing and cross-region protection
const CACHE_KEY = 'eci:results:v1';
let _redis = null;
function getRedis() {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

async function getCached() {
  // 1. Check in-memory first (zero latency)
  if (_memCache && _memCache.scraped_at_ms) return _memCache.data;

  // 2. Fall back to Redis if configured
  const redis = getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get(CACHE_KEY);
    if (!raw) return null;
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    // Warm the in-memory cache from Redis
    _memCache = { data: parsed, scraped_at_ms: parsed.scraped_at_ms };
    return parsed;
  } catch { return null; }
}

async function setCached(data) {
  // Always update in-memory
  _memCache = { data, scraped_at_ms: data.scraped_at_ms };

  // Write to Redis if configured (fire-and-forget)
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(CACHE_KEY, JSON.stringify(data), { ex: CACHE_STALE_SECONDS });
  } catch (e) {
    console.warn('[ECI] Redis write failed:', e?.message);
  }
}

// ─── Scrape all 5 states from ECI ────────────────────────────────────────────

async function scrapeAllStates() {
  const stateEntries = Object.keys(STATE_CODES);
  const output = {
    slug: ECI_SLUG,
    timestamp: new Date().toISOString(),
    scraped_at_ms: Date.now(),
    states: {},
  };

  const statePromises = stateEntries.map(async (stateName) => {
    const code = STATE_CODES[stateName];
    const seats = STATE_SEATS[stateName];
    const results = await fetchStateResults(code, seats);

    const tally = {};
    let declared = 0;
    let counting = 0;

    for (const r of results) {
      if (r.party) tally[r.party] = (tally[r.party] || 0) + 1;
      if (r.status === 'won') declared++;
      else counting++;
    }

    return {
      stateName,
      data: {
        total_seats: seats,
        declared,
        counting,
        results_available: results.length,
        tally,
        constituencies: Object.fromEntries(
          results.map(r => [String(r.acNo), {
            ac_name: r.acNameFull,
            leading: r.leading,
            party: r.party,
            status: r.status,
            total_votes: r.totalVotes,
            margin: r.margin,
          }])
        ),
      },
    };
  });

  const settled = await Promise.allSettled(statePromises);
  for (const r of settled) {
    if (r.status === 'fulfilled') output.states[r.value.stateName] = r.value.data;
  }

  return output;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req) {
  const corsHeaders = getCorsHeaders(req, 'GET, OPTIONS');

  if (isDisallowedOrigin(req)) {
    return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const requestUrl = new URL(req.url);
  const forceRefresh = requestUrl.searchParams.get('refresh') === '1';

  try {
    // ── 1. Try cache first ──────────────────────────────────────────────────
    const cached = forceRefresh ? null : await getCached();
    const nowMs = Date.now();
    const cacheAgeMs = cached?.scraped_at_ms ? nowMs - cached.scraped_at_ms : Infinity;
    const isFresh = cacheAgeMs < CACHE_TTL_SECONDS * 1000;
    const isStale = cacheAgeMs < CACHE_STALE_SECONDS * 1000;

    if (cached && isFresh) {
      // Serve fresh cache — no ECI request needed
      return new Response(JSON.stringify({ ...cached, cache: 'hit' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=120',
          'X-Cache': 'HIT',
          'X-Cache-Age': String(Math.round(cacheAgeMs / 1000)),
          ...corsHeaders,
        },
      });
    }

    // ── 2. Scrape ECI ───────────────────────────────────────────────────────
    let fresh;
    let eciError = null;
    try {
      fresh = await scrapeAllStates();
      // Persist to Redis (fire-and-forget — don't block response)
      setCached(fresh).catch(() => {});
    } catch (err) {
      eciError = err;
      console.error('[ECI] Scrape failed:', err?.message);
    }

    // ── 3. Fallback to stale cache if ECI is down ───────────────────────────
    if (!fresh && cached && isStale) {
      return new Response(JSON.stringify({ ...cached, cache: 'stale', stale_reason: eciError?.message }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=15, s-maxage=30',
          'X-Cache': 'STALE',
          'X-Cache-Age': String(Math.round(cacheAgeMs / 1000)),
          ...corsHeaders,
        },
      });
    }

    if (!fresh) {
      return new Response(JSON.stringify({
        error: 'ECI results unavailable',
        details: eciError?.message || 'No data',
      }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ ...fresh, cache: 'miss' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=120',
        'X-Cache': 'MISS',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('[ECI] Handler error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch ECI results',
      details: error?.message || String(error),
    }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
