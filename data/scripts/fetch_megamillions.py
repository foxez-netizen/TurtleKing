#!/usr/bin/env python3
"""
Fetch US Mega Millions historical winning numbers from NY State Open Data
(Socrata), write both the aggregate frequency file and the per-draw archive.

Source: https://data.ny.gov/resource/5xaw-6ayf.json (NY Lottery Mega Millions
winning numbers dataset, official state open-data portal).

Note: Mega Millions changed its main-number range from 1-75 to 1-70 (and
mega ball 1-15 to 1-25) effective the Oct 31 2017 draw. We only count draws
under the CURRENT rules (main 1-70, mega ball 1-25) per games.js, and skip
older draws so the frequency table stays consistent with a single rule set.
"""
import json
import os
import urllib.request
from datetime import date

SRC_URL = "https://data.ny.gov/resource/5xaw-6ayf.json"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_PATH = f"{ROOT}/data/megamillions.json"
DRAWS_PATH = f"{ROOT}/data/megamillions-draws.json"

MAIN_MIN, MAIN_MAX, MAIN_COUNT = 1, 70, 5
BONUS_MIN, BONUS_MAX, BONUS_COUNT = 1, 25, 1

RULE_CHANGE_DATE = date(2017, 10, 31)  # first draw under current 1-70/1-25 rules

def fetch_all():
    limit = 5000
    offset = 0
    rows = []
    while True:
        url = f"{SRC_URL}?$limit={limit}&$offset={offset}&$order=draw_date"
        with urllib.request.urlopen(url, timeout=30) as r:
            batch = json.load(r)
        rows.extend(batch)
        if len(batch) < limit:
            break
        offset += limit
    return rows

def main():
    rows = fetch_all()

    main_counts = {str(n): 0 for n in range(MAIN_MIN, MAIN_MAX + 1)}
    bonus_counts = {str(n): 0 for n in range(BONUS_MIN, BONUS_MAX + 1)}
    total = 0
    dates = []
    skipped_old_rules = 0
    draws = []

    for row in rows:
        d_str = row["draw_date"][:10]
        d = date.fromisoformat(d_str)
        if d < RULE_CHANGE_DATE:
            skipped_old_rules += 1
            continue
        nums_str = row["winning_numbers"].strip()
        main_nums = [int(x) for x in nums_str.split()]
        mb = int(row["mega_ball"])
        if len(main_nums) != MAIN_COUNT:
            continue
        for n in main_nums:
            if str(n) in main_counts:
                main_counts[str(n)] += 1
            else:
                raise ValueError(f"main number out of range: {n} on {d_str}")
        if str(mb) in bonus_counts:
            bonus_counts[str(mb)] += 1
        else:
            raise ValueError(f"bonus number out of range: {mb} on {d_str}")
        total += 1
        dates.append(d_str)
        draws.append({"id": d_str, "date": d_str, "main": main_nums, "bonus": [mb]})

    assert sum(main_counts.values()) == total * MAIN_COUNT, "main count mismatch"
    assert sum(bonus_counts.values()) == total * BONUS_COUNT, "bonus count mismatch"

    draws.sort(key=lambda x: x["date"])
    with open(DRAWS_PATH, "w") as f:
        json.dump(draws, f, ensure_ascii=False)

    out = {
        "source": SRC_URL + " (NY State Open Data - Lottery Mega Millions Winning Numbers)",
        "asOf": f"draws from {min(dates)} to {max(dates)} (current 1-70/1-25 rules only; "
                f"{skipped_old_rules} pre-2017-10-31 draws under the old 1-75/1-15 rules excluded)",
        "totalDraws": total,
        "latestId": draws[-1]["id"],
        "latestDate": draws[-1]["date"],
        "main": main_counts,
        "bonus": bonus_counts,
    }
    with open(OUT_PATH, "w") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print(f"megamillions: {total} draws, {min(dates)}..{max(dates)}, skipped(old rules)={skipped_old_rules}")

if __name__ == "__main__":
    main()
