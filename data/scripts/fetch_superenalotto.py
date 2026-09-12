#!/usr/bin/env python3
"""
Fetch Italian SuperEnalotto historical winning numbers, write both the
aggregate frequency file and the per-draw archive.

Source: http://www.estrazionilottooggi.it/superenalotto/Archivio-superenalotto-<YEAR>/(offset)/<N>
The official superenalotto.it site returns HTTP 403/999 (bot-blocked) from
this network, and several other mirrors (sourceforge EnalStorico.CSV,
tuttosuperenalotto.it) were also blocked or unreachable. This mirror serves
plain server-rendered HTML: each draw is its own <table>, preceded by an
<h2><a> heading reading "Estrazione Superenalotto del <D> <Mese> <YYYY> -
n. <N>" (the draw's Italian date, plus a within-year sequence number, not
a global archive id - we use the parsed date as our id instead). Each
table's <tbody> has 8 numeric columns: 6 main numbers, Jolly, SuperStar.
games.js defines superenalotto with only a main pool (1-90, count 6) and no
bonus, so Jolly/SuperStar are read (to validate row shape) but not counted
or stored.
"""
import re
import time
import json
import os
import urllib.request
from datetime import date

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_PATH = f"{ROOT}/data/superenalotto.json"
DRAWS_PATH = f"{ROOT}/data/superenalotto-draws.json"
BASE = "http://www.estrazionilottooggi.it/superenalotto/Archivio-superenalotto-{year}/(offset)/{offset}"

MAIN_MIN, MAIN_MAX, MAIN_COUNT = 1, 90, 6
START_YEAR = 1997
END_YEAR = date.today().year
PAGE_SIZE = 30

MONTHS_IT = {
    "gennaio": 1, "febbraio": 2, "marzo": 3, "aprile": 4, "maggio": 5, "giugno": 6,
    "luglio": 7, "agosto": 8, "settembre": 9, "ottobre": 10, "novembre": 11, "dicembre": 12,
}

DRAW_RE = re.compile(
    r'Estrazione Superenalotto del\s+(\d{1,2})\s+([A-Za-z\xe0\xe8\xe9\xec\xf2\xf9]+)\s+(\d{4})\s*-\s*n\.\s*\d+'
    r'.*?<tbody>(.*?)</tbody>',
    re.S | re.I,
)

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="ignore")

def parse_draws(html):
    """Return list of (iso_date, [8 numbers]) for each valid draw on the page."""
    out = []
    skipped_no_date = 0
    for m in DRAW_RE.finditer(html):
        dd, month_it, yyyy, tbody = m.groups()
        month = MONTHS_IT.get(month_it.lower())
        if not month:
            skipped_no_date += 1
            continue
        iso = f"{int(yyyy):04d}-{month:02d}-{int(dd):02d}"
        nums = None
        for row in re.findall(r"<tr[^>]*>(.*?)</tr>", tbody, re.S):
            tds = [x.strip() for x in re.findall(r"<td[^>]*>([^<]*)</td>", row)]
            if len(tds) == 8 and all(x != "" for x in tds):
                try:
                    nums = [int(x) for x in tds]
                except ValueError:
                    nums = None
                break
        if nums:
            out.append((iso, nums))
    return out, skipped_no_date

def main():
    main_counts = {str(n): 0 for n in range(MAIN_MIN, MAIN_MAX + 1)}
    total = 0
    years_with_data = []
    draws_by_date = {}
    total_skipped_no_date = 0

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
            draws, skipped_no_date = parse_draws(html)
            total_skipped_no_date += skipped_no_date
            if not draws:
                break
            for iso, row in draws:
                main_nums = row[:MAIN_COUNT]
                draws_by_date[iso] = main_nums  # de-dupe repeated rows across paginated offsets
            year_total += len(draws)
            offset += PAGE_SIZE
            time.sleep(0.3)
        print(f"year {year}: {year_total} draws")
        if year_total > 0:
            years_with_data.append(year)

    for iso, main_nums in draws_by_date.items():
        for n in main_nums:
            if str(n) in main_counts:
                main_counts[str(n)] += 1
            else:
                raise ValueError(f"main number out of range: {n} on {iso}")
        total += 1

    assert sum(main_counts.values()) == total * MAIN_COUNT, "main count mismatch"

    draws = [{"id": iso, "date": iso, "main": nums} for iso, nums in sorted(draws_by_date.items())]
    with open(DRAWS_PATH, "w") as f:
        json.dump(draws, f, ensure_ascii=False)

    first_year = years_with_data[0] if years_with_data else None
    last_year = years_with_data[-1] if years_with_data else None
    out = {
        "source": "http://www.estrazionilottooggi.it/superenalotto/Archivio-superenalotto-<year>/(offset)/<n> "
                  "(third-party SuperEnalotto draw archive)",
        "asOf": f"draws {first_year}-{last_year} (SuperEnalotto itself launched in Dec 1997, but this "
                f"archive mirror only has data from {first_year} onward; years {START_YEAR}-{first_year - 1} "
                f"returned no rows and were skipped)",
        "totalDraws": total,
        "latestId": draws[-1]["id"] if draws else None,
        "latestDate": draws[-1]["date"] if draws else None,
        "main": main_counts,
    }
    with open(OUT_PATH, "w") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print(f"superenalotto TOTAL: {total} draws, skipped(no parseable date)={total_skipped_no_date}")

if __name__ == "__main__":
    main()
