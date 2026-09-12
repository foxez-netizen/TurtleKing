#!/usr/bin/env python3
"""
Fetch Japan Loto 6 historical winning numbers, write both the aggregate
frequency file and the per-draw archive.

Source: https://www.mk-mode.com/rails/loto/LOTO6_ALL.csv
A complete CSV of every Loto 6 draw since the first draw (Oct 2000),
maintained by mk-mode (a long-running Japanese lottery-data site linked
from mk-mode.com/rails/loto/loto6). Columns (Japanese headers): draw no.,
draw date, 6 main numbers (数字１..６), and a bonus number
(数字Ｂ) which games.js does not track for loto6 (no bonus
pool defined), so it is read but not counted.
"""
import csv
import io
import json
import os
import urllib.request

SRC_URL = "https://www.mk-mode.com/rails/loto/LOTO6_ALL.csv"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_PATH = f"{ROOT}/data/loto6.json"
DRAWS_PATH = f"{ROOT}/data/loto6-draws.json"

MAIN_MIN, MAIN_MAX, MAIN_COUNT = 1, 43, 6

def main():
    req = urllib.request.Request(SRC_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        raw = r.read().decode("utf-8-sig")

    reader = csv.reader(io.StringIO(raw))
    header = next(reader)

    main_counts = {str(n): 0 for n in range(MAIN_MIN, MAIN_MAX + 1)}
    total = 0
    dates = []
    draws = []

    for row in reader:
        if not row or not row[0].strip().isdigit():
            continue
        draw_no = int(row[0].strip())
        draw_date = row[1].strip()  # YYYY/MM/DD
        iso = draw_date.replace("/", "-")
        main_nums = [int(row[i]) for i in range(2, 8)]  # columns 3-8 (0-indexed 2-7)
        for n in main_nums:
            if str(n) in main_counts:
                main_counts[str(n)] += 1
            else:
                raise ValueError(f"main number out of range: {n} on draw {row[0]} ({draw_date})")
        total += 1
        dates.append(draw_date)
        draws.append({"id": draw_no, "date": iso, "main": main_nums})

    assert sum(main_counts.values()) == total * MAIN_COUNT, "main count mismatch"

    draws.sort(key=lambda x: x["id"])
    with open(DRAWS_PATH, "w") as f:
        json.dump(draws, f, ensure_ascii=False)

    out = {
        "source": SRC_URL + " (mk-mode Loto 6 complete draw archive)",
        "asOf": f"draws from {dates[0]} to {dates[-1]} (draw 1 to draw {total})",
        "totalDraws": total,
        "latestId": draws[-1]["id"],
        "latestDate": draws[-1]["date"],
        "main": main_counts,
    }
    with open(OUT_PATH, "w") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print(f"loto6: {total} draws, {dates[0]}..{dates[-1]}")

if __name__ == "__main__":
    main()
