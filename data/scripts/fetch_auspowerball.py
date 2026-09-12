#!/usr/bin/env python3
"""
Fetch Australia Powerball historical winning numbers, write both the
aggregate frequency file and the per-draw archive.

Source: https://www.lotto-8.com/Australia/listltoAPOW.asp?indexpage=<N>&orderby=new
(a third-party lottery-results aggregator; thelott.com, the official
operator, only exposes the last 10 draws with no historical archive or API).
Each page has a plain HTML table with one row per draw: a DD/MM<br>YY(DOW)
date, 7 comma-separated main numbers, and a bonus (BB) number.

The site's archive only goes back to 19 Apr 2018, which aligns with when
Australia Powerball moved to its current 7-from-35 main pool with a
1-from-20 Powerball (matching games.js); no rule-change filtering is
needed here.
"""
import re
import time
import json
import os
import urllib.error
import urllib.request
from datetime import date

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_PATH = f"{ROOT}/data/auspowerball.json"
DRAWS_PATH = f"{ROOT}/data/auspowerball-draws.json"
BASE = "https://www.lotto-8.com/Australia/listltoAPOW.asp?indexpage={page}&orderby=new"

MAIN_MIN, MAIN_MAX, MAIN_COUNT = 1, 35, 7
BONUS_MIN, BONUS_MAX, BONUS_COUNT = 1, 20, 1
MAX_PAGES = 60  # safety cap; real loop stops when a page returns no rows

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="ignore")

def parse_page(html):
    """Return list of (dd, mm, yy2, [7 main numbers], bonus)."""
    out = []
    date_re = re.compile(
        r'<td class="date-cell"[^>]*>(\d{2})/(\d{2})<br>(\d{2})\([A-Z]+\)</td>\s*'
        r'<td class="number-cell"[^>]*>\s*([\d,\s;&nbsp;]+?)\s*</td>\s*'
        r'<td class="bonus-cell"[^>]*>\s*(\d+)\s*</td>',
        re.S,
    )
    for m in date_re.finditer(html):
        dd, mm, yy2, nums_raw, bonus = m.groups()
        nums = [int(x) for x in re.findall(r"\d+", nums_raw)]
        out.append((dd, mm, yy2, nums, int(bonus)))
    return out

def main():
    main_counts = {str(n): 0 for n in range(MAIN_MIN, MAIN_MAX + 1)}
    bonus_counts = {str(n): 0 for n in range(BONUS_MIN, BONUS_MAX + 1)}
    total = 0
    dates = []
    seen = set()
    draws = []

    for page in range(1, MAX_PAGES + 1):
        try:
            html = fetch(BASE.format(page=page))
        except urllib.error.HTTPError as e:
            print(f"  page {page}: HTTP {e.code}, stopping")
            break
        rows = parse_page(html)
        if not rows:
            break
        for dd, mm, yy2, nums, bonus in rows:
            year = 2000 + int(yy2)
            d = date(year, int(mm), int(dd))
            key = (d.isoformat(), tuple(nums), bonus)
            if key in seen:
                continue
            seen.add(key)
            if len(nums) != MAIN_COUNT:
                raise ValueError(f"expected {MAIN_COUNT} main numbers, got {nums} on {d}")
            for n in nums:
                if str(n) in main_counts:
                    main_counts[str(n)] += 1
                else:
                    raise ValueError(f"main number out of range: {n} on {d}")
            if str(bonus) in bonus_counts:
                bonus_counts[str(bonus)] += 1
            else:
                raise ValueError(f"bonus number out of range: {bonus} on {d}")
            total += 1
            iso = d.isoformat()
            dates.append(iso)
            draws.append({"id": iso, "date": iso, "main": nums, "bonus": [bonus]})
        time.sleep(0.3)

    assert sum(main_counts.values()) == total * MAIN_COUNT, "main count mismatch"
    assert sum(bonus_counts.values()) == total * BONUS_COUNT, "bonus count mismatch"

    draws.sort(key=lambda x: x["date"])
    with open(DRAWS_PATH, "w") as f:
        json.dump(draws, f, ensure_ascii=False)

    out = {
        "source": "https://www.lotto-8.com/Australia/listltoAPOW.asp (third-party Australia Powerball draw archive)",
        "asOf": f"draws from {min(dates)} to {max(dates)}",
        "totalDraws": total,
        "latestId": draws[-1]["id"],
        "latestDate": draws[-1]["date"],
        "main": main_counts,
        "bonus": bonus_counts,
    }
    with open(OUT_PATH, "w") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print(f"auspowerball: {total} draws, {min(dates)}..{max(dates)}")

if __name__ == "__main__":
    main()
