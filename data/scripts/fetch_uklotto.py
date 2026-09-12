#!/usr/bin/env python3
"""
Fetch UK Lotto historical winning numbers, write both the aggregate
frequency file and the per-draw archive.

Source: https://www.beatlottery.co.uk/lotto/draw-history/year/<YEAR>
(a well-established third-party UK lottery results archive; the official
national-lottery.co.uk site is a JS-rendered SPA with no discoverable raw
data endpoint, and national-lottery.com and lotterychecker.co.uk did not
respond from this network). Each year page renders a plain HTML table with
one <tr> per draw containing a DD/MM/YYYY date and 6 "ball-lotto" numbers
(plus a bonus ball, which games.js does not track for uklotto and which we
therefore ignore).

Note: UK Lotto changed its main-number matrix from 6-from-49 to 6-from-59
starting with the 10 October 2015 draw. Per games.js (main 1-59), only
draws from that date onward are counted.
"""
import re
import time
import json
import os
import urllib.request
from datetime import date

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_PATH = f"{ROOT}/data/uklotto.json"
DRAWS_PATH = f"{ROOT}/data/uklotto-draws.json"
BASE_URL = "https://www.beatlottery.co.uk/lotto/draw-history/year/{year}"

MAIN_MIN, MAIN_MAX, MAIN_COUNT = 1, 59, 6
RULE_CHANGE_DATE = date(2015, 10, 10)
START_YEAR = 2015
END_YEAR = date.today().year

def fetch_year(year):
    url = BASE_URL.format(year=year)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="ignore")

def parse_rows(html):
    """Yield (date, [6 main numbers]) for each valid draw row."""
    for row in html.split("<tr>"):
        m = re.search(r"(\d{2})/(\d{2})/(\d{4})</td>", row)
        if not m:
            continue
        dd, mm, yyyy = m.groups()
        d = date(int(yyyy), int(mm), int(dd))
        balls = [int(x) for x in re.findall(r'ball-lotto">(\d+)</span>', row)]
        if len(balls) == MAIN_COUNT:
            yield d, balls

def main():
    main_counts = {str(n): 0 for n in range(MAIN_MIN, MAIN_MAX + 1)}
    total = 0
    dates = []
    seen = set()
    draws = []

    for year in range(START_YEAR, END_YEAR + 1):
        html = fetch_year(year)
        for d, balls in parse_rows(html):
            if d < RULE_CHANGE_DATE:
                continue
            key = (d, tuple(balls))
            if key in seen:
                continue  # de-dupe hero-widget repeats of the latest draw
            seen.add(key)
            for n in balls:
                if str(n) in main_counts:
                    main_counts[str(n)] += 1
                else:
                    raise ValueError(f"main number out of range: {n} on {d}")
            total += 1
            iso = d.isoformat()
            dates.append(iso)
            draws.append({"id": iso, "date": iso, "main": balls})
        time.sleep(0.5)

    assert sum(main_counts.values()) == total * MAIN_COUNT, "main count mismatch"

    draws.sort(key=lambda x: x["date"])
    with open(DRAWS_PATH, "w") as f:
        json.dump(draws, f, ensure_ascii=False)

    out = {
        "source": "https://www.beatlottery.co.uk/lotto/draw-history/year/<year> (third-party UK Lotto draw archive)",
        "asOf": f"draws from {min(dates)} to {max(dates)} (current 6/59 matrix only; "
                f"pre-2015-10-10 draws under the old 6/49 matrix excluded)",
        "totalDraws": total,
        "latestId": draws[-1]["id"],
        "latestDate": draws[-1]["date"],
        "main": main_counts,
    }
    with open(OUT_PATH, "w") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print(f"uklotto: {total} draws, {min(dates)}..{max(dates)}")

if __name__ == "__main__":
    main()
