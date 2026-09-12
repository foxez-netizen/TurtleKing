#!/usr/bin/env python3
"""
Generate sitemap.xml (a sitemap index) plus per-section child sitemaps
under /sitemaps/, covering every static page and every generated
draws/numbers page across all 8 games. Split into multiple files instead
of one giant sitemap because a single game (superenalotto: 3244 draws +
90 numbers) already approaches sizes that are awkward to hand-maintain,
and because search engines process a sitemap index more reliably than
one very large file.

Re-run any time draws/numbers pages are regenerated (see update_kr645.py
/ update_world.py, which call this at the end) so the sitemap stays
current as new draws are added.
"""
import json
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SITE_URL = "https://lottopick.org"
SITEMAPS_DIR = f"{ROOT}/sitemaps"

WORLD_GAMES = {
    "powerball": 69,
    "megamillions": 70,
    "euromillions": 50,
    "uklotto": 59,
    "loto6": 43,
    "auspowerball": 35,
    "superenalotto": 90,
}

URLSET_HEADER = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
URLSET_FOOTER = "</urlset>\n"


def url_entry(loc, lastmod=None):
    lm = f"\n    <lastmod>{lastmod}</lastmod>" if lastmod else ""
    return f"  <url>\n    <loc>{loc}</loc>{lm}\n  </url>\n"


def write_urlset(path, entries):
    with open(path, "w", encoding="utf-8") as f:
        f.write(URLSET_HEADER)
        for e in entries:
            f.write(e)
        f.write(URLSET_FOOTER)


def build_pages_sitemap():
    # No lastmod: these are hand-edited pages, not tied to a data refresh,
    # so there's no accurate "last modified" signal to compute here - and
    # stamping today's date on every run would make this file (and thus a
    # commit) change daily for no real reason.
    static_pages = [
        "/index.html", "/world.html", "/ko/world.html", "/en/world.html",
        "/ja/world.html", "/it/world.html", "/stats.html", "/about.html",
        "/privacy.html", "/partnership.html", "/draws/index.html", "/numbers/index.html",
    ]
    for key in WORLD_GAMES:
        static_pages.append(f"/draws/{key}/index.html")
        static_pages.append(f"/numbers/{key}/index.html")

    entries = [url_entry(f"{SITE_URL}{p}") for p in static_pages]
    write_urlset(f"{SITEMAPS_DIR}/pages.xml", entries)
    return len(entries)


def build_kr645_sitemaps():
    draws = json.load(open(f"{ROOT}/data/kr645-draws.json"))
    draw_entries = [url_entry(f"{SITE_URL}/draws/{d['draw_no']}.html", d["date"]) for d in draws]
    write_urlset(f"{SITEMAPS_DIR}/kr645-draws.xml", draw_entries)

    number_entries = [url_entry(f"{SITE_URL}/numbers/{n}.html") for n in range(1, 46)]
    write_urlset(f"{SITEMAPS_DIR}/kr645-numbers.xml", number_entries)
    return len(draw_entries), len(number_entries)


def build_world_sitemaps():
    counts = {}
    for key, main_max in WORLD_GAMES.items():
        draws = json.load(open(f"{ROOT}/data/{key}-draws.json"))
        draw_entries = [url_entry(f"{SITE_URL}/draws/{key}/{d['id']}.html", d["date"]) for d in draws]
        write_urlset(f"{SITEMAPS_DIR}/{key}-draws.xml", draw_entries)

        number_entries = [url_entry(f"{SITE_URL}/numbers/{key}/{n}.html") for n in range(1, main_max + 1)]
        write_urlset(f"{SITEMAPS_DIR}/{key}-numbers.xml", number_entries)
        counts[key] = (len(draw_entries), len(number_entries))
    return counts


def build_index(child_files):
    # No <lastmod> here: it's optional per the sitemap spec, and using the
    # current run time would make sitemap.xml change on every single
    # automation run even when no page content actually changed, which
    # would break the "only commit on real changes" behavior in
    # update-lotto.yml. Each child sitemap already carries real per-URL
    # lastmod dates that only change when data changes.
    with open(f"{ROOT}/sitemap.xml", "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for name in child_files:
            f.write(f"  <sitemap>\n    <loc>{SITE_URL}/sitemaps/{name}</loc>\n  </sitemap>\n")
        f.write("</sitemapindex>\n")


def main():
    os.makedirs(SITEMAPS_DIR, exist_ok=True)

    n_pages = build_pages_sitemap()
    n_kr_draws, n_kr_numbers = build_kr645_sitemaps()
    world_counts = build_world_sitemaps()

    child_files = ["pages.xml", "kr645-draws.xml", "kr645-numbers.xml"]
    for key in WORLD_GAMES:
        child_files += [f"{key}-draws.xml", f"{key}-numbers.xml"]

    build_index(child_files)

    total = n_pages + n_kr_draws + n_kr_numbers + sum(a + b for a, b in world_counts.values())
    print(f"sitemap.xml -> {len(child_files)} child sitemaps, {total} URLs total")


if __name__ == "__main__":
    main()
