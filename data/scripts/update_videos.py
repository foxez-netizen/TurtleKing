#!/usr/bin/env python3
"""
Refresh data/videos.json from the 거북왕의 사주풀이 channel RSS feed.

    python3 data/scripts/update_videos.py

The feed (no API key needed) lists the channel's 15 most recent uploads,
long-form videos and Shorts alike, with title, publish date, description
and current view count. Every video ever seen is kept in the JSON, so the
archive grows past those 15.

Per video:
- Auto fields (refreshed each run): type ("video" | "short"), title,
  published, views, history, summary, auto_concept.
- Hand-written fields (never touched): person, concept, note, duration.
  When present they take priority over the auto ones on the page.

history keeps [date, views] snapshots so the page can rank videos by
views gained over the past week ("이번 주 인기").
"""
import datetime
import json
import os
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = f"{ROOT}/data/videos.json"
FEED = "https://www.youtube.com/feeds/videos.xml?channel_id={}"
NS = {
    "a": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
    "m": "http://search.yahoo.com/mrss/",
}
HISTORY_KEEP = 10  # snapshots per video (~10 weeks at one run a week)

# "백호대살(白虎大煞)", "식신생재(食神生財)" … a Hangul term followed by its Hanja.
CONCEPT_RE = re.compile(r"([가-힣]+(?:·[가-힣]+)*)\s*\(([一-鿿·]+)\)")


def fetch(channel_id):
    req = urllib.request.Request(FEED.format(channel_id), headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def summarize(desc):
    """First sentence(s) of the description, without hashtags, links or emoji lines."""
    lines = []
    for line in desc.splitlines():
        line = line.strip()
        if not line:
            if lines:
                break
            continue
        if line.startswith("#") or "http" in line:
            break
        lines.append(line)
    text = " ".join(lines)
    if len(text) > 160:
        cut = text.rfind(".", 0, 160)
        text = text[: cut + 1] if cut > 60 else text[:157].rstrip() + "…"
    return text


def auto_concept(title):
    m = CONCEPT_RE.search(title)
    if m:
        return f"{m.group(1)}({m.group(2)})"
    m = re.search(r"\[([^\]]+)\]", title)
    return m.group(1) if m else ""


def parse(xml_bytes):
    root = ET.fromstring(xml_bytes)
    out = []
    for e in root.findall("a:entry", NS):
        link = e.find("a:link", NS).get("href", "")
        stats = e.find(".//m:statistics", NS)
        desc = e.find(".//m:description", NS)
        title = e.find("a:title", NS).text or ""
        out.append({
            "id": e.find("yt:videoId", NS).text,
            "type": "short" if "/shorts/" in link else "video",
            "title": title,
            "published": e.find("a:published", NS).text,
            "views": int(stats.get("views", 0)) if stats is not None else 0,
            "summary": summarize(desc.text or "") if desc is not None else "",
            "auto_concept": auto_concept(title),
        })
    return out


def main():
    d = json.load(open(DATA, encoding="utf-8"))
    try:
        feed = parse(fetch(d["channel"]["id"]))
    except Exception as ex:  # keep the current data if YouTube is unreachable
        print(f"Feed fetch failed: {ex}", file=sys.stderr)
        sys.exit(1)
    if not feed:
        print("Feed was empty; leaving data untouched.", file=sys.stderr)
        sys.exit(1)

    today = datetime.date.today().isoformat()
    by_id = {v["id"]: v for v in d["videos"]}
    added = 0
    for f in feed:
        v = by_id.get(f["id"])
        if v is None:
            v = by_id[f["id"]] = {"id": f["id"]}
            added += 1
        v.update(f)
        hist = [h for h in v.get("history", []) if h[0] != today]
        hist.append([today, f["views"]])
        v["history"] = hist[-HISTORY_KEEP:]

    d["videos"] = sorted(by_id.values(), key=lambda v: v.get("published", ""), reverse=True)
    d["updated"] = today
    with open(DATA, "w", encoding="utf-8") as fp:
        json.dump(d, fp, ensure_ascii=False, indent=2)
        fp.write("\n")
    print(f"videos.json: {len(feed)} in feed, {added} new, {len(d['videos'])} total")


if __name__ == "__main__":
    main()
