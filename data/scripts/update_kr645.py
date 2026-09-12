#!/usr/bin/env python3
"""
Weekly updater for Korea Lotto 6/45 data + generated pages.

Run by .github/workflows/update-lotto.yml every Saturday night KST, after
that week's draw. Fetches the latest draws from the smok95/lotto mirror
(a community-maintained mirror of dhlottery.co.kr - see fetch_kr645.py for
why the official API isn't hit directly), and if new draws exist beyond
what's currently stored, updates data/kr645-draws.json and data/kr645.json,
then regenerates draws/*.html and numbers/*.html via generate_kr645_pages.py.

Prints "UPDATED to draw N" if anything changed (the workflow greps for this
to decide whether to commit), or "NO_CHANGE" otherwise. Always exits 0
unless the source fetch itself fails or data looks inconsistent.
"""
import json
import os
import subprocess
import sys
import urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC_URL = "https://raw.githubusercontent.com/smok95/lotto/main/results/all.json"
DRAWS_JSON = f"{ROOT}/data/kr645-draws.json"
STATS_JSON = f"{ROOT}/data/kr645.json"
MAIN_MIN, MAIN_MAX, MAIN_COUNT = 1, 45, 6


def main():
    existing = json.load(open(DRAWS_JSON))
    latest_existing = max((d["draw_no"] for d in existing), default=0)

    with urllib.request.urlopen(SRC_URL, timeout=30) as r:
        raw = json.load(r)

    latest_source = max(d["draw_no"] for d in raw)
    if latest_source <= latest_existing:
        print("NO_CHANGE")
        return

    trimmed = []
    for r in raw:
        divisions = r.get("divisions", [])
        div_out = [
            ({"prize": d.get("prize", 0), "winners": d.get("winners", 0)} if d else None)
            for d in divisions
        ]
        trimmed.append({
            "draw_no": r["draw_no"],
            "date": r["date"][:10],
            "numbers": r["numbers"],
            "bonus_no": r["bonus_no"],
            "divisions": div_out,
            "total_sales_amount": r.get("total_sales_amount", 0),
        })
    trimmed.sort(key=lambda d: d["draw_no"])
    json.dump(trimmed, open(DRAWS_JSON, "w"), ensure_ascii=False)

    main_counts = {str(n): 0 for n in range(MAIN_MIN, MAIN_MAX + 1)}
    total = 0
    last_no = None
    last_date = None
    for d in trimmed:
        if len(d["numbers"]) != MAIN_COUNT:
            continue
        for n in d["numbers"]:
            main_counts[str(n)] += 1
        total += 1
        if last_no is None or d["draw_no"] > last_no:
            last_no = d["draw_no"]
            last_date = d["date"]

    assert sum(main_counts.values()) == total * MAIN_COUNT, "main count mismatch"

    stats = {
        "source": SRC_URL + " (community mirror of dhlottery.co.kr official draws)",
        "asOf": f"draws 1-{last_no} (latest draw date {last_date})",
        "totalDraws": total,
        "latestDrawNo": last_no,
        "latestDrawDate": last_date,
        "main": main_counts,
    }
    json.dump(stats, open(STATS_JSON, "w"), indent=2, ensure_ascii=False)

    subprocess.run([sys.executable, f"{ROOT}/data/scripts/generate_kr645_pages.py"], check=True)
    print(f"UPDATED to draw {last_no}")


if __name__ == "__main__":
    main()
