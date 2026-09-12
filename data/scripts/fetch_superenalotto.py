#!/usr/bin/env python3
"""
Fetch Italian SuperEnalotto historical winning numbers and compute frequency
counts.

Source: http://www.estrazionilottooggi.it/superenalotto/Archivio-superenalotto-<YEAR>/(offset)/<N>
The official superenalotto.it site returns HTTP 403/999 (bot-blocked) from
this network, and several other mirrors (sourceforge EnalStorico.CSV,
tuttosuperenalotto.it) were also blocked or unreachable. This mirror serves
plain server-rendered HTML tables (30 draws per page, paginated via an
"(offset)/N" path segment) going back to the first 1997 draw, and was
verified reachable and parseable.

Each draw's table row has 8 columns: 6 main numbers, Jolly, SuperStar.
games.js defines superenalotto with only a main pool (1-90, count 6) and no
bonus, so Jolly/SuperStar are read (to validate row shape) but not counted.
"""
import re
import time
import json
import urllib.request
from datetime import date

OUT_PATH = "/workspaces/TurtleKing/data/superenalotto.json"
BASE = "http://www.estrazionilottooggi.it/superenalotto/Archivio-superenalotto-{year}/(offset)/{offset}"

MAIN_MIN, MAIN_MAX, MAIN_COUNT = 1, 90, 6
START_YEAR = 1997
END_YEAR = date.today().year
PAGE_SIZE = 30

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="ignore")

def parse_draws(html):
    draws = []
    for t in re.findall(r"<tbody>(.*?)</tbody>", html, re.S):
        for row in re.findall(r"<tr[^>]*>(.*?)</tr>", t, re.S):
            tds = [x.strip() for x in re.findall(r"<td[^>]*>([^<]*)</td>", row)]
            if len(tds) == 8 and all(x != "" for x in tds):
                try:
                    nums = [int(x) for x in tds]
                except ValueError:
                    continue
                draws.append(nums)
    return draws

def main():
    main_counts = {str(n): 0 for n in range(MAIN_MIN, MAIN_MAX + 1)}
    total = 0
    years_with_data = []

    for year in range(START_YEAR, END_YEAR + 1):
        offset = 0
        year_total = 0
        while True:
            url = BASE.format(year=year, offset=offset)
            try:
                html = fetch(url)
            except Exception as e:
                print(f"  {year} offset={offset}: fetch error {e}, stopping year")
                break
            draws = parse_draws(html)
            if not draws:
                break
            for row in draws:
                main_nums = row[:MAIN_COUNT]
                for n in main_nums:
                    if str(n) in main_counts:
                        main_counts[str(n)] += 1
                    else:
                        raise ValueError(f"main number out of range: {n} in {year} offset {offset}")
            total += len(draws)
            year_total += len(draws)
            offset += PAGE_SIZE
            time.sleep(0.3)
        print(f"year {year}: {year_total} draws")
        if year_total > 0:
            years_with_data.append(year)

    assert sum(main_counts.values()) == total * MAIN_COUNT, "main count mismatch"

    first_year = years_with_data[0] if years_with_data else None
    last_year = years_with_data[-1] if years_with_data else None
    out = {
        "source": "http://www.estrazionilottooggi.it/superenalotto/Archivio-superenalotto-<year>/(offset)/<n> "
                  "(third-party SuperEnalotto draw archive)",
        "asOf": f"draws {first_year}-{last_year} (SuperEnalotto itself launched in Dec 1997, but this "
                f"archive mirror only has data from {first_year} onward; years {START_YEAR}-{first_year - 1} "
                f"returned no rows and were skipped)",
        "totalDraws": total,
        "main": main_counts,
    }
    with open(OUT_PATH, "w") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print(f"superenalotto TOTAL: {total} draws")

if __name__ == "__main__":
    main()
