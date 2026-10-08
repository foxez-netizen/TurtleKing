#!/usr/bin/env python3
"""
Generate sitemap.xml (a sitemap index) pointing at /sitemaps/pages.xml,
which lists the site's indexable pages: the saju home/guide, the lotto
tools, and the per-game archive index pages. Individual draw/number pages
are intentionally excluded (they are noindex) - see LEGACY_CHILD_SITEMAPS.

Re-run any time draws/numbers pages are regenerated (see update_kr645.py
/ update_world.py, which call this at the end) so the sitemap stays
current as new draws are added.
"""
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SITE_URL = "https://luckyturtle.life"
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
    #
    # Extensionless URLs only: Cloudflare redirects "/x.html" -> "/x", and a
    # sitemap listing redirecting URLs is wasted crawl budget.
    static_pages = [
        "/", "/guide", "/videos/", "/lotto/", "/world", "/ko/world", "/en/world",
        "/ja/world", "/it/world", "/stats", "/about",
        "/privacy", "/partnership", "/draws/", "/numbers/",
        "/en/", "/en/blog/", "/en/about", "/en/contact", "/en/privacy",
    ]
    # English blog posts: picked up from the folder so new posts are listed
    # without editing this script.
    blog_dir = os.path.join(ROOT, "en", "blog")
    for name in sorted(os.listdir(blog_dir)):
        if name.endswith(".html") and name != "index.html":
            static_pages.append(f"/en/blog/{name[:-5]}")
    for key in WORLD_GAMES:
        static_pages.append(f"/draws/{key}/")
        static_pages.append(f"/numbers/{key}/")

    entries = [url_entry(f"{SITE_URL}{p}") for p in static_pages]
    write_urlset(f"{SITEMAPS_DIR}/pages.xml", entries)
    return len(entries)


# Per-draw / per-number pages are deliberately NOT in any sitemap: each one
# is a few lines of numbers with almost no unique text, and thousands of
# them on a new domain got the whole site (saju pages included) stuck at
# "Crawled - currently not indexed". Those pages now carry
# noindex,follow (see generate_*_pages.py); the archive index pages above
# still link to them so users and crawlers can reach them.
LEGACY_CHILD_SITEMAPS = ["kr645-draws.xml", "kr645-numbers.xml"] + [
    f"{key}-{kind}.xml" for key in WORLD_GAMES for kind in ("draws", "numbers")
]


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
    for name in LEGACY_CHILD_SITEMAPS:
        path = f"{SITEMAPS_DIR}/{name}"
        if os.path.exists(path):
            os.remove(path)

    child_files = ["pages.xml"]
    build_index(child_files)
    print(f"sitemap.xml -> {len(child_files)} child sitemap, {n_pages} URLs total")


if __name__ == "__main__":
    main()
