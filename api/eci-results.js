import { getCorsHeaders, isDisallowedOrigin } from './_cors.js';
import { validateApiKey } from './_api-key.js';
import { fetchWithTimeout } from './_relay.js';

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
  const resp = await fetchWithTimeout(url, {
    headers: {
      'User-Agent': BROWSER_UA,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': `https://results.eci.gov.in/${ECI_SLUG}/`,
    },
  }, 15000);

  if (!resp.ok) return [];

  const html = await resp.text();
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

  const keyCheck = validateApiKey(req);
  if (keyCheck.required && !keyCheck.valid) {
    return new Response(JSON.stringify({ error: keyCheck.error }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const requestUrl = new URL(req.url);
  const stateParam = requestUrl.searchParams.get('state');

  try {
    const statesToFetch = stateParam
      ? { [stateParam.toUpperCase()]: true }
      : Object.keys(STATE_CODES);

    const output = {
      slug: ECI_SLUG,
      timestamp: new Date().toISOString(),
      states: {},
    };

    // Fetch all requested states in parallel
    const stateEntries = (Array.isArray(statesToFetch) ? statesToFetch : Object.keys(statesToFetch))
      .filter(s => STATE_CODES[s]);

    const statePromises = stateEntries.map(async (stateName) => {
      const code = STATE_CODES[stateName];
      const seats = STATE_SEATS[stateName];
      const results = await fetchStateResults(code, seats);

      // Build tally
      const tally = {};
      let declared = 0;
      let counting = 0;

      for (const r of results) {
        if (r.party) {
          tally[r.party] = (tally[r.party] || 0) + 1;
        }
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

    const stateResults = await Promise.allSettled(statePromises);
    for (const r of stateResults) {
      if (r.status === 'fulfilled') {
        output.states[r.value.stateName] = r.value.data;
      }
    }

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Short cache: results change every few minutes on counting day
        'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=120',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('ECI results error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch ECI results',
      details: error?.message || String(error),
    }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
