#!/usr/bin/env python3
"""Scrape 2026 election candidate data from Wikipedia for TN and WB.
Parses the full-page HTML using regex (no external deps needed)."""

import json
import re
import urllib.request
import urllib.parse


def fetch_full_page(page_title):
    """Fetch the full rendered HTML of a Wikipedia page."""
    url = f"https://en.wikipedia.org/w/api.php?action=parse&page={urllib.parse.quote(page_title)}&prop=text&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'ElectroPulse/1.0 (election dashboard)'})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
    return data['parse']['text']['*']


def clean_text(html_text):
    """Strip HTML tags and clean text."""
    text = re.sub(r'<br\s*/?>', ' | ', html_text)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'&#91;.*?&#93;', '', text)
    text = re.sub(r'\[.*?\]', '', text)
    text = text.replace('&amp;', '&').replace('&#39;', "'").replace('&nbsp;', ' ')
    return text.strip()


def extract_raw_rows(html, marker):
    """Find the sortable wikitable containing `marker` and extract raw cell data with rowspans."""
    idx = html.find(marker)
    if idx < 0:
        return []

    tbl_start = html.rfind('<table', 0, idx)
    tbl_end = html.find('</table>', idx)
    if tbl_start < 0 or tbl_end < 0:
        return []

    table_html = html[tbl_start:tbl_end]
    row_htmls = re.findall(r'<tr[^>]*>(.*?)</tr>', table_html, re.DOTALL)

    # Parse with full rowspan tracking
    rowspan_state = {}  # col -> (remaining, text)
    all_rows = []

    for row_html in row_htmls:
        cells = re.findall(r'<t[dh][^>]*?(?:rowspan="(\d+)")?[^>]*>(.*?)</t[dh]>', row_html, re.DOTALL)

        full_row = []
        col = 0
        cell_idx = 0

        while col < 20:
            if col in rowspan_state and rowspan_state[col][0] > 0:
                full_row.append(rowspan_state[col][1])
                rowspan_state[col] = (rowspan_state[col][0] - 1, rowspan_state[col][1])
                if rowspan_state[col][0] == 0:
                    del rowspan_state[col]
                col += 1
            elif cell_idx < len(cells):
                rs_str, content = cells[cell_idx]
                text = clean_text(content)
                rs = int(rs_str) if rs_str else 1
                full_row.append(text)
                if rs > 1:
                    rowspan_state[col] = (rs - 1, text)
                cell_idx += 1
                col += 1
            else:
                break

        if full_row:
            all_rows.append(full_row)

    return all_rows


def parse_tn(html):
    """Parse TN candidates. Table: District | No | Constituency | [clr] | SPAParty | SPACand | [clr] | AIADMKParty | AIADMKCand"""
    rows = extract_raw_rows(html, 'Gummidipoondi')
    print(f"  {len(rows)} raw rows")

    candidates = {}
    current_district = ""

    for row in rows:
        if len(row) < 5:
            continue

        num = None
        num_col = -1
        for i, cell in enumerate(row):
            if cell.isdigit() and 1 <= int(cell) <= 234:
                num = int(cell)
                num_col = i
                break
        if num is None:
            continue

        # District
        if num_col > 0:
            d = row[num_col - 1]
            if d and len(d) > 1 and d not in ('District', 'Party', 'Candidate', 'No.'):
                current_district = d

        # Constituency
        ac_name = row[num_col + 1] if num_col + 1 < len(row) else ""
        ac_name = ac_name.strip()
        if not ac_name or ac_name in ('Constituency',):
            continue

        # After constituency: [color] Party Candidate [color] Party Candidate
        remaining = row[num_col + 2:]
        # Filter out empty/color cells (length <= 1)
        parts = [p for p in remaining if p and len(p) > 1]

        spa_party = parts[0] if len(parts) > 0 else ""
        spa_cand = parts[1] if len(parts) > 1 else ""
        aia_party = parts[2] if len(parts) > 2 else ""
        aia_cand = parts[3] if len(parts) > 3 else ""

        entry = {'ac_name': ac_name, 'district': current_district}
        if spa_cand:
            entry['spa'] = {'candidate': spa_cand, 'party': spa_party}
        if aia_cand:
            entry['aiadmk_plus'] = {'candidate': aia_cand, 'party': aia_party}

        candidates[str(num)] = entry

    return candidates


def parse_wb(html):
    """Parse WB candidates. Table: District | No | Constituency | [clr] | AITC_Party | AITC_Cand | [clr] | BJP_Party | BJP_Cand | [clr] | LF_Party | LF_Cand | [clr] | INC_Party | INC_Cand"""
    rows = extract_raw_rows(html, 'Mekliganj')
    print(f"  {len(rows)} raw rows")

    candidates = {}
    current_district = ""

    for row in rows:
        if len(row) < 5:
            continue

        num = None
        num_col = -1
        for i, cell in enumerate(row):
            if cell.isdigit() and 1 <= int(cell) <= 294:
                num = int(cell)
                num_col = i
                break
        if num is None:
            continue

        if num_col > 0:
            d = row[num_col - 1]
            if d and len(d) > 1 and d not in ('District', 'Party', 'Candidate', 'No.'):
                current_district = d

        ac_name = row[num_col + 1] if num_col + 1 < len(row) else ""
        ac_name = ac_name.strip()
        if not ac_name or ac_name in ('Constituency',):
            continue

        # After constituency: 4 groups of [color] Party Candidate
        remaining = row[num_col + 2:]
        parts = [p for p in remaining if p and len(p) > 1]

        # 4 alliances: AITC+, BJP, LF+, INC
        # Each has Party + Candidate = 8 fields
        entry = {'ac_name': ac_name, 'district': current_district}

        alliance_map = [
            ('aitc', 0, 1),    # parts[0]=party, parts[1]=candidate
            ('bjp', 2, 3),
            ('lf', 4, 5),
            ('inc', 6, 7),
        ]

        for key, party_idx, cand_idx in alliance_map:
            party = parts[party_idx] if party_idx < len(parts) else ""
            cand = parts[cand_idx] if cand_idx < len(parts) else ""
            if cand and cand not in ('No nominee', '—', '-'):
                entry[key] = {'candidate': cand, 'party': party}

        candidates[str(num)] = entry

    return candidates


def main():
    print("=== Tamil Nadu ===")
    tn_html = fetch_full_page("2026_Tamil_Nadu_Legislative_Assembly_election")
    print(f"  Fetched {len(tn_html)} chars")
    tn = parse_tn(tn_html)
    print(f"  Parsed {len(tn)}/234 constituencies")

    missing = [i for i in range(1, 235) if str(i) not in tn]
    if missing:
        print(f"  Missing: {missing}")

    # Show samples
    for k in ['1', '13', '86', '234']:
        if k in tn:
            print(f"    #{k}: {tn[k]}")

    print("\n=== West Bengal ===")
    wb_html = fetch_full_page("2026_West_Bengal_Legislative_Assembly_election")
    print(f"  Fetched {len(wb_html)} chars")
    wb = parse_wb(wb_html)
    print(f"  Parsed {len(wb)}/294 constituencies")

    missing = [i for i in range(1, 295) if str(i) not in wb]
    if missing:
        print(f"  Missing: {missing}")

    for k in ['1', '37', '150', '294']:
        if k in wb:
            print(f"    #{k}: {wb[k]}")

    output = {'TAMIL NADU': tn, 'WEST BENGAL': wb}
    outfile = '/Users/saurabhdp/Documents/electropulse/electropulse/scripts/parsed-candidates-raw.json'
    with open(outfile, 'w') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print(f"\nSaved to {outfile}")


if __name__ == '__main__':
    main()
