#!/usr/bin/env python3
"""
Fetch EuroMillions historical winning numbers, write both the aggregate
frequency file and the per-draw archive.

Source: https://www.mes-resultats-fdj.fr/api/telecharger/euromillions
This mirrors France's FDJ (the lead EuroMillions operator) official draw
history as a semicolon-separated CSV: date;numero_tirage;boule_1..5;etoile_1..2

Note: EuroMillions has changed its "star" (bonus) range over the years
(1-9 at 2004 launch, then 1-10, then 1-11, then 1-12 from the 27-Sep-2016
draw onward). Main numbers have stayed 1-50 throughout. Since games.js
defines the bonus pool as 1-12, only draws from the 1-12 star era are
counted here to keep the bonus table consistent with a single rule set.
"""
import csv
import io
import json
import os
import urllib.request
from datetime import date

SRC_URL = "https://www.mes-resultats-fdj.fr/api/telecharger/euromillions"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_PATH = f"{ROOT}/data/euromillions.json"
DRAWS_PATH = f"{ROOT}/data/euromillions-draws.json"

MAIN_MIN, MAIN_MAX, MAIN_COUNT = 1, 50, 5
BONUS_MIN, BONUS_MAX, BONUS_COUNT = 1, 12, 2

RULE_CHANGE_DATE = date(2016, 9, 27)  # first draw with stars 1-12

def main():
    req = urllib.request.Request(SRC_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        raw = r.read().decode("utf-8-sig")

    reader = csv.DictReader(io.StringIO(raw), delimiter=";")

    main_counts = {str(n): 0 for n in range(MAIN_MIN, MAIN_MAX + 1)}
    bonus_counts = {str(n): 0 for n in range(BONUS_MIN, BONUS_MAX + 1)}
    total = 0
    dates = []
    skipped_old_rules = 0
    draws = []

    for row in reader:
        d_str = row["date"].strip()  # DD/MM/YYYY
        dd, mm, yyyy = d_str.split("/")
        d = date(int(yyyy), int(mm), int(dd))
        if d < RULE_CHANGE_DATE:
            skipped_old_rules += 1
            continue
        main_nums = [int(row[f"boule_{i}"]) for i in range(1, 6)]
        stars = [int(row["etoile_1"]), int(row["etoile_2"])]
        for n in main_nums:
            if str(n) in main_counts:
                main_counts[str(n)] += 1
            else:
                raise ValueError(f"main number out of range: {n} on {d_str}")
        for s in stars:
            if str(s) in bonus_counts:
                bonus_counts[str(s)] += 1
            else:
                raise ValueError(f"bonus number out of range: {s} on {d_str}")
        total += 1
        iso = d.isoformat()
        dates.append(iso)
        draws.append({"id": row["numero_tirage"].strip(), "date": iso, "main": main_nums, "bonus": stars})

    assert sum(main_counts.values()) == total * MAIN_COUNT, "main count mismatch"
    assert sum(bonus_counts.values()) == total * BONUS_COUNT, "bonus count mismatch"

    draws.sort(key=lambda x: x["date"])
    with open(DRAWS_PATH, "w") as f:
        json.dump(draws, f, ensure_ascii=False)

    out = {
        "source": SRC_URL + " (FDJ official EuroMillions draw history mirror)",
        "asOf": f"draws from {min(dates)} to {max(dates)} (current 1-12 star rules only; "
                f"{skipped_old_rules} pre-2016-09-27 draws under older star ranges excluded)",
        "totalDraws": total,
        "latestId": draws[-1]["id"],
        "latestDate": draws[-1]["date"],
        "main": main_counts,
        "bonus": bonus_counts,
    }
    with open(OUT_PATH, "w") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print(f"euromillions: {total} draws, {min(dates)}..{max(dates)}, skipped(old rules)={skipped_old_rules}")

if __name__ == "__main__":
    main()
