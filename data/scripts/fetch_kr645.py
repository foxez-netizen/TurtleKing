#!/usr/bin/env python3
"""
Fetch Korea Lotto 6/45 historical winning numbers and compute frequency counts.

Source: smok95/lotto GitHub repo (results/all.json), a community-maintained
mirror of the official Dong-Hang Lottery (dhlottery.co.kr) draw results.
Direct access to dhlottery.co.kr's getLottoNumber API was attempted first but
the HTTPS endpoint hangs indefinitely from this sandbox (TLS handshake
completes, then no HTTP response is ever sent - looks like an anti-bot
tarpit blocking this network's outbound IP), so this mirror is used instead.
"""
import json
import urllib.request

SRC_URL = "https://raw.githubusercontent.com/smok95/lotto/main/results/all.json"
OUT_PATH = "/workspaces/TurtleKing/data/kr645.json"

MAIN_MIN, MAIN_MAX, MAIN_COUNT = 1, 45, 6

def main():
    with urllib.request.urlopen(SRC_URL, timeout=30) as r:
        draws = json.load(r)

    main_counts = {str(n): 0 for n in range(MAIN_MIN, MAIN_MAX + 1)}
    total = 0
    last_date = None
    last_no = None
    for d in draws:
        nums = d["numbers"]
        if len(nums) != MAIN_COUNT:
            continue
        for n in nums:
            main_counts[str(n)] += 1
        total += 1
        if last_no is None or d["draw_no"] > last_no:
            last_no = d["draw_no"]
            last_date = d["date"][:10]

    assert sum(main_counts.values()) == total * MAIN_COUNT, "main count mismatch"

    out = {
        "source": SRC_URL + " (community mirror of dhlottery.co.kr official draws)",
        "asOf": f"draws 1-{last_no} (latest draw date {last_date})",
        "totalDraws": total,
        "main": main_counts,
    }
    with open(OUT_PATH, "w") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print(f"kr645: {total} draws, latest={last_no} ({last_date})")

if __name__ == "__main__":
    main()
