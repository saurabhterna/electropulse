# ElectroPulse — Claude Code Context

Live site: https://electropulse.vercel.app  
Repo: https://github.com/saurabhterna/electropulse  
Forked from: worldmonitor.app (koala73/worldmonitor, MIT)

---

## What This Is

Open-source real-time India Assembly Election Results Dashboard.  
Tracks 824 constituency results across 5 states on counting day: **May 4, 2026**.

**States & seats:**
- Kerala: 140 seats (voted April 9)
- Assam: 126 seats (voted April 9)
- Puducherry: 30 seats (voted April 9)
- Tamil Nadu: 234 seats (voted April 23)
- West Bengal: 294 seats (voted April 23 + 29)

Total voters: 17.4 crore

---

## Tech Stack

- **Frontend:** TypeScript, deck.gl (map rendering)
- **Deployment:** Vercel Edge Functions
- **Backend relay:** Railway
- **ML:** Transformers.js (browser-side)
- **Maps:** Datameet India GeoJSON shapefiles

---

## ⚠️ Critical Deployment Note

**Always run from project root, not from `src/`:**
```bash
cd ~/Documents/electropulse/electropulse
# NOT: cd ~/Documents/electropulse/electropulse/src
```

---

## What's Already Built

- Election variant system with branded UI
- 832 constituency GeoJSON rendered on deck.gl
- Click-to-zoom state drill-down panel
- 38-party config with colors and alliances (`election-parties.ts`)
- 2021 results baseline (`results-2021.json`) for swing analysis
- Seat tally + alliance bars
- Right-side constituency drawer
- Search bar with ⌘K support
- Pixel-space collision-detected labels (zoom-progressive, Google Maps style)
- Voter search panel: EPIC search + cascading dropdowns using local GeoJSON (`electionSearchIndex`), accessible via header "🗳️ Voter Search" button
- **2026 candidates — all 5 states complete (824/824):**
  - Kerala: 140/140 (LDF/UDF/NDA) — scraped from keralist.com
  - Assam: 126/126 (NDA/ASOM) — scraped from Wikipedia
  - Puducherry: 30/30 (NDA/INDIA) — scraped from Wikipedia
  - Tamil Nadu: 234/234 (SPA/AIADMK+) — parsed from Wikipedia HTML via MediaWiki API
  - West Bengal: 294/294 (AITC+/BJP/LF+/INC) — parsed from Wikipedia HTML via MediaWiki API
  - Drawer reads alliance config dynamically per state from `_alliances` key in `candidates-2026.json`
  - Scraping scripts: `scripts/scrape-wiki-candidates.py`, `scripts/build-candidates-2026.py`
- **Party coloring:** Built but intentionally DISABLED — activates May 4 (counting day)

---

## What's Pending

### Pre-May 4
- Reverse-engineer ECI XHR endpoints at results.eci.gov.in for live result ingestion
- Aggressive caching strategy (ECI site degrades badly under counting day load)
- News feed
- WhatsApp alert integration

---

## Data Sources

| Data | Source | Notes |
|------|--------|-------|
| Live results | results.eci.gov.in | No public API — reverse-engineer internal XHR endpoints before May 4 |
| Historical baseline | Lok Dhaba (TCPD Ashoka) | Free CSV, 2021 data for swing analysis |
| Maps | Datameet India GeoJSON | Already integrated |
| Candidate data | ECI affidavit portal | Pre-scraped; MyNeta/ADR + Wikipedia as backup |
| Alliance mapping | Manual YAML | NDA/INDIA bloc |
| Backup live feed | NDTV/Republic scrape | Cross-check only |

---

## Key Gotchas

**ECI has no public API.**  
CORS blocks direct calls. Electoral roll ZIP URLs return 404. Don't wait for official APIs — scrape and reverse-engineer.

**Label collision detection.**  
Must use pixel-space bounding box via `map.project()`, not degree-based distance. Always render selected constituency label first. Labels appear progressively on zoom-in.

**Voter search pattern.**  
Don't build forms that redirect to ECI — users have to re-enter everything. EPIC search + quick links is the right approach. Cascading dropdowns use local GeoJSON (`electionSearchIndex`) — instant, no network calls.

**Party coloring is intentionally off.**  
It activates on May 4 (results day). Do not enable it before then.

**Vercel deploy hook required for deploys.**  
The GitHub integration webhook is unreliable. Use the deploy hook to trigger builds:  
`curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_OtVC7ca6GscMA9K3CalLXIHJcdoS/57wfLDQCVi"`  
The `ignoreCommand` in `vercel.json` skips builds when only non-web files change. Remove it temporarily if deploys are stuck.

**`/data/` has 1-year immutable cache.**  
After deploying changes to `public/data/`, users must clear site data + unregister service workers to see updates. New Vercel deployments bust the CDN cache, but browser/SW cache persists.

**Token sensitivity.**  
Don't retry failed operations or loop multi-step tasks without explicit confirmation.

---

## Alliance Colors (Reference)

- 🔴 LDF (Left Democratic Front) — Kerala
- 🔵 UDF (United Democratic Front) — Kerala  
- 🟠 NDA (BJP + allies) — all states
- 🔵 INDIA bloc (INC + allies) — Puducherry
- 🔵 ASOM (INC + Raijor Dal + AJP) — Assam
- 🔴 SPA (DMK-led Secular Progressive Alliance) — Tamil Nadu
- 🟢 AIADMK+ (AIADMK + BJP + PMK) — Tamil Nadu
- 🟢 AITC+ (TMC + allies) — West Bengal
- 🔴 LF+ (Left Front, CPI(M)-led) — West Bengal

---

## File Structure Notes

- `election-parties.ts` — 38-party config, colors, alliances
- `results-2021.json` — Historical baseline for swing
- `candidates-2026.json` — 824 candidates across 5 states with `_alliances` metadata
- `event-handlers.ts` → `MapContainer` → `DeckGLMap` — voter search wiring
- `electionSearchIndex` — local GeoJSON index for cascading dropdowns
- `scripts/scrape-wiki-candidates.py` — Wikipedia HTML table parser (TN/WB)
- `scripts/build-candidates-2026.py` — Compiles all 5 states into final JSON
