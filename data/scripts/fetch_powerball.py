#!/usr/bin/env python3
"""
Fetch US Powerball historical winning numbers from NY State Open Data (Socrata),
write both the aggregate frequency file and the per-draw archive.

Source: https://data.ny.gov/resource/d6yy-54nr.json (NY Lottery Powerball
winning numbers dataset, official state open-data portal).
"""
import json
import os
import urllib.request
from datetime import date

SRC_URL = "https://data.ny.gov/resource/d6yy-54nr.json"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_PATH = f"{ROOT}/data/powerball.json"
DRAWS_PATH = f"{ROOT}/data/powerball-draws.json"

MAIN_MIN, MAIN_MAX, MAIN_COUNT = 1, 69, 5
BONUS_MIN, BONUS_MAX, BONUS_COUNT = 1, 26, 1

RULE_CHANGE_DATE = date(2015, 10, 7)  # first draw under current 69/26 rules

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
        parts = [int(x) for x in nums_str.split()]
        if len(parts) != MAIN_COUNT + 1:
            # Some historical rows (pre-2015 format changes) may differ; skip if malformed
            continue
        main_nums = parts[:MAIN_COUNT]
        pb = parts[MAIN_COUNT]
        for n in main_nums:
            if str(n) in main_counts:
                main_counts[str(n)] += 1
            else:
                raise ValueError(f"main number out of range: {n}")
        if str(pb) in bonus_counts:
            bonus_counts[str(pb)] += 1
        else:
            raise ValueError(f"bonus number out of range: {pb}")
        total += 1
        dates.append(d_str)
        draws.append({"id": d_str, "date": d_str, "main": main_nums, "bonus": [pb]})

    assert sum(main_counts.values()) == total * MAIN_COUNT, "main count mismatch"
    assert sum(bonus_counts.values()) == total * BONUS_COUNT, "bonus count mismatch"

    draws.sort(key=lambda x: x["date"])
    with open(DRAWS_PATH, "w") as f:
        json.dump(draws, f, ensure_ascii=False)

    out = {
        "source": SRC_URL + " (NY State Open Data - Lottery Powerball Winning Numbers)",
        "asOf": f"draws from {min(dates)} to {max(dates)} (current 69/26 rules only; "
                f"{skipped_old_rules} pre-2015-10-07 draws under older number ranges excluded)",
        "totalDraws": total,
        "latestId": draws[-1]["id"],
        "latestDate": draws[-1]["date"],
        "main": main_counts,
        "bonus": bonus_counts,
    }
    with open(OUT_PATH, "w") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print(f"powerball: {total} draws, {min(dates)}..{max(dates)}, skipped(old rules)={skipped_old_rules}")

if __name__ == "__main__":
    main()
