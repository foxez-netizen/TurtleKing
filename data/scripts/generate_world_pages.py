#!/usr/bin/env python3
"""
Generate static SEO pages for the 7 non-Korean lottery games in games.js:
  - draws/<key>/<id>.html      one page per historical draw
  - draws/<key>/index.html     archive listing every draw, grouped by year
  - numbers/<key>/<n>.html     one page per number (appearance count + recent history)
  - numbers/<key>/index.html   grid linking to all number pages for that game

Mirrors generate_kr645_pages.py but is parameterized across games and
languages (matching each game's home-country language, same as world.js's
GAME_LANG mapping), and has no prize-tier table since that data isn't
available from the sources used for these games (see data/scripts/fetch_*.py
- unlike dhlottery.co.kr, none of NY Open Data / FDJ / beatlottery.co.uk /
mk-mode / lotto-8.com / estrazionilottooggi.it publish per-draw prize/winner
breakdowns for these games).

Re-run any time a data/<key>-draws.json is updated with new draws.
"""
import json
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SITE_URL = "https://lottopick.org"
ADSENSE_SCRIPT = (
    '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
    '?client=ca-pub-2176623685813595" crossorigin="anonymous"></script>'
)

GAME_META = {
    "powerball": {"lang": "en", "name": "Powerball", "flag": "🇺🇸", "main_max": 69, "has_id": False, "bonus_label": "Powerball"},
    "megamillions": {"lang": "en", "name": "Mega Millions", "flag": "🇺🇸", "main_max": 70, "has_id": False, "bonus_label": "Mega Ball"},
    "euromillions": {"lang": "en", "name": "EuroMillions", "flag": "🇪🇺", "main_max": 50, "has_id": True, "bonus_label": "Lucky Star"},
    "uklotto": {"lang": "en", "name": "UK Lotto", "flag": "🇬🇧", "main_max": 59, "has_id": False, "bonus_label": None},
    "loto6": {"lang": "ja", "name": "ロト6", "flag": "🇯🇵", "main_max": 43, "has_id": True, "bonus_label": None},
    "auspowerball": {"lang": "en", "name": "Powerball (Australia)", "flag": "🇦🇺", "main_max": 35, "has_id": False, "bonus_label": "Powerball"},
    "superenalotto": {"lang": "it", "name": "SuperEnalotto", "flag": "🇮🇹", "main_max": 90, "has_id": False, "bonus_label": None},
}

STR = {
    "en": {
        "darkToggle": "Toggle dark/light mode",
        "drawnOn": lambda date: f"Drawn on {date}",
        "drawTitleId": lambda name, id_: f"{name} Draw #{id_} Winning Numbers | LottoPick",
        "drawTitleDate": lambda name, date: f"{name} Winning Numbers for {date} | LottoPick",
        "drawDescId": lambda name, id_, date, nums, bonus: f"{name} draw #{id_} ({date}) winning numbers: {nums}{bonus}.",
        "drawDescDate": lambda name, date, nums, bonus: f"{name} winning numbers for {date}: {nums}{bonus}.",
        "drawH1Id": lambda name, id_: f"{name} Draw #{id_}",
        "drawH1Date": lambda name, date: f"{name} Winning Numbers",
        "allDraws": "All draws",
        "prevDraw": "← Previous draw",
        "nextDraw": "Next draw →",
        "recentHeading": "Recent Appearances",
        "numberDisclaimer": "Past frequency is for reference only and does not predict future draws — each drawing is a statistically independent event.",
        "numberTitle": lambda name, n: f"{name} Number {n} — Appearance Count | LottoPick",
        "numberDesc": lambda name, n, count, total, pct: f"{name} number {n} has appeared {count} of {total} draws so far ({pct}%). See its recent draw history.",
        "numberH1": lambda name, n: f"{name} Number {n}",
        "numberSubtitle": lambda count, total, pct: f"Appeared {count} of {total} draws ({pct}%)",
        "allNumbers": "All numbers",
        "prevNumber": "← Previous number",
        "nextNumber": "Next number →",
        "drawsIndexTitle": lambda name: f"{name} — Full Draw Archive | LottoPick",
        "drawsIndexDesc": lambda name, latest: f"Every {name} draw result, grouped by year, from the earliest on record to draw {latest}.",
        "drawsIndexH1": lambda name: f"{name} — Draw Archive",
        "numbersIndexTitle": lambda name: f"{name} — Number Frequency | LottoPick",
        "numbersIndexDesc": lambda name: f"How many times each {name} number has been drawn — pick a number to see its full history.",
        "numbersIndexH1": lambda name: f"{name} — Number Frequency",
        "backToGenerator": "🌍 Back to World Lottery Generator",
        "backToNumbers": lambda name: f"🔢 {name} Number Frequency",
        "backToDraws": lambda name: f"📅 {name} Draw Archive",
        "backToStats": "📊 Number Frequency Stats",
        "drawLabel": lambda id_, date, has_id: (f"Draw #{id_} ({date})" if has_id else date),
    },
    "ja": {
        "darkToggle": "ダークモード切替",
        "drawnOn": lambda date: f"{date} 抽せん",
        "drawTitleId": lambda name, id_: f"{name} 第{id_}回 当せん番号 | LottoPick",
        "drawTitleDate": lambda name, date: f"{name} {date} 当せん番号 | LottoPick",
        "drawDescId": lambda name, id_, date, nums, bonus: f"{name} 第{id_}回（{date}）の当せん番号は {nums}{bonus} です。",
        "drawDescDate": lambda name, date, nums, bonus: f"{name} {date} の当せん番号は {nums}{bonus} です。",
        "drawH1Id": lambda name, id_: f"{name} 第{id_}回",
        "drawH1Date": lambda name, date: f"{name} 当せん番号",
        "allDraws": "全回一覧",
        "prevDraw": "← 前回",
        "nextDraw": "次回 →",
        "recentHeading": "最近の出現回",
        "numberDisclaimer": "過去の出現頻度は参考情報であり、次回の抽せん結果を予測するものではありません。各回の抽せんは独立した事象です。",
        "numberTitle": lambda name, n: f"{name} {n}番 出現回数 | LottoPick",
        "numberDesc": lambda name, n, count, total, pct: f"{name} の{n}番はこれまで{total}回中{count}回出現しています（{pct}%）。最近の出現履歴を確認できます。",
        "numberH1": lambda name, n: f"{name} {n}番",
        "numberSubtitle": lambda count, total, pct: f"全{total}回中{count}回出現（{pct}%）",
        "allNumbers": "全番号一覧",
        "prevNumber": "← 前の番号",
        "nextNumber": "次の番号 →",
        "drawsIndexTitle": lambda name: f"{name} 全回アーカイブ | LottoPick",
        "drawsIndexDesc": lambda name, latest: f"{name} の全抽せん結果を年別にまとめました（第{latest}回まで）。",
        "drawsIndexH1": lambda name: f"{name} 抽せんアーカイブ",
        "numbersIndexTitle": lambda name: f"{name} 番号別出現回数 | LottoPick",
        "numbersIndexDesc": lambda name: f"{name} の各番号がこれまで何回出現したか確認できます。",
        "numbersIndexH1": lambda name: f"{name} 番号別出現回数",
        "backToGenerator": "🌍 世界の宝くじジェネレーターに戻る",
        "backToNumbers": lambda name: f"🔢 {name} 番号別出現回数",
        "backToDraws": lambda name: f"📅 {name} 抽せんアーカイブ",
        "backToStats": "📊 番号別当選統計",
        "drawLabel": lambda id_, date, has_id: (f"第{id_}回（{date}）" if has_id else date),
    },
    "it": {
        "darkToggle": "Attiva/disattiva la modalità scura",
        "drawnOn": lambda date: f"Estrazione del {date}",
        "drawTitleId": lambda name, id_: f"{name} Estrazione #{id_} - Numeri Vincenti | LottoPick",
        "drawTitleDate": lambda name, date: f"{name} - Numeri Vincenti del {date} | LottoPick",
        "drawDescId": lambda name, id_, date, nums, bonus: f"{name} estrazione #{id_} ({date}): numeri vincenti {nums}{bonus}.",
        "drawDescDate": lambda name, date, nums, bonus: f"{name} - numeri vincenti del {date}: {nums}{bonus}.",
        "drawH1Id": lambda name, id_: f"{name} Estrazione #{id_}",
        "drawH1Date": lambda name, date: f"{name} - Numeri Vincenti",
        "allDraws": "Tutte le estrazioni",
        "prevDraw": "← Estrazione precedente",
        "nextDraw": "Estrazione successiva →",
        "recentHeading": "Estrazioni recenti",
        "numberDisclaimer": "La frequenza passata è solo a titolo informativo e non predice le estrazioni future: ogni estrazione è un evento statisticamente indipendente.",
        "numberTitle": lambda name, n: f"{name} Numero {n} - Frequenza | LottoPick",
        "numberDesc": lambda name, n, count, total, pct: f"Il numero {n} di {name} è uscito {count} volte su {total} estrazioni ({pct}%). Consulta la cronologia recente.",
        "numberH1": lambda name, n: f"{name} Numero {n}",
        "numberSubtitle": lambda count, total, pct: f"Uscito {count} volte su {total} estrazioni ({pct}%)",
        "allNumbers": "Tutti i numeri",
        "prevNumber": "← Numero precedente",
        "nextNumber": "Numero successivo →",
        "drawsIndexTitle": lambda name: f"{name} - Archivio Estrazioni | LottoPick",
        "drawsIndexDesc": lambda name, latest: f"Tutte le estrazioni di {name}, raggruppate per anno, fino al {latest}.",
        "drawsIndexH1": lambda name: f"{name} - Archivio Estrazioni",
        "numbersIndexTitle": lambda name: f"{name} - Frequenza Numeri | LottoPick",
        "numbersIndexDesc": lambda name: f"Quante volte è uscito ogni numero di {name}: scegline uno per la cronologia completa.",
        "numbersIndexH1": lambda name: f"{name} - Frequenza Numeri",
        "backToGenerator": "🌍 Torna al generatore di lotterie mondiali",
        "backToNumbers": lambda name: f"🔢 Frequenza Numeri {name}",
        "backToDraws": lambda name: f"📅 Archivio Estrazioni {name}",
        "backToStats": "📊 Statistiche Numeri",
        "drawLabel": lambda id_, date, has_id: (f"Estrazione #{id_} ({date})" if has_id else date),
    },
}


def band_class(n, max_n):
    ratio = n / max_n
    if ratio <= 0.2:
        return "yellow"
    if ratio <= 0.4:
        return "blue"
    if ratio <= 0.6:
        return "red"
    if ratio <= 0.8:
        return "gray"
    return "green"


def page_shell(key, meta, lang, title, description, body, canonical_path):
    s = STR[lang]
    canonical = f"{SITE_URL}{canonical_path}"
    footer_nav = "\n        ".join([
        f'<a href="/world.html?game={key}&amp;lang={lang}">{s["backToGenerator"]}</a>',
        f'<a href="/numbers/{key}/index.html">{s["backToNumbers"](meta["name"])}</a>',
        f'<a href="/draws/{key}/index.html">{s["backToDraws"](meta["name"])}</a>',
        f'<a href="/stats.html">{s["backToStats"]}</a>',
    ])
    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="canonical" href="{canonical}">
<link rel="stylesheet" href="/style.css">
{ADSENSE_SCRIPT}
</head>
<body>
  <div class="wrap">
    <header>
      <button id="theme-toggle" class="theme-toggle" aria-label="{s['darkToggle']}" title="{s['darkToggle']}">
        <span id="theme-toggle-icon">🌙</span>
        <span id="theme-toggle-label">Darkmode</span>
      </button>
{body}
    <footer>
      <nav class="site-nav">
        {footer_nav}
      </nav>
    </footer>
  </div>
<script src="/theme.js"></script>
</body>
</html>
"""


def render_draw_page(key, meta, lang, draw, prev_id, next_id):
    s = STR[lang]
    name = meta["name"]
    max_n = meta["main_max"]
    main_sorted = sorted(draw["main"])
    balls_html = "".join(
        f'<div class="ball-wrap"><div class="ball {band_class(x, max_n)}">{x}</div></div>' for x in main_sorted
    )
    bonus_html = ""
    if draw.get("bonus"):
        bonus_sorted = sorted(draw["bonus"])
        bonus_balls = "".join(
            f'<div class="ball-wrap"><div class="ball bonus {band_class(x, max(bonus_sorted+[1]))}">{x}</div></div>'
            for x in bonus_sorted
        )
        bonus_html = f'<div class="ball-divider">+</div>{bonus_balls}'

    nums_str = ", ".join(str(x) for x in main_sorted)
    bonus_str = ""
    if draw.get("bonus"):
        bonus_str = f" + {meta['bonus_label']} {', '.join(str(x) for x in sorted(draw['bonus']))}"

    if meta["has_id"]:
        title = s["drawTitleId"](name, draw["id"])
        description = s["drawDescId"](name, draw["id"], draw["date"], nums_str, bonus_str)
        h1 = s["drawH1Id"](name, draw["id"])
    else:
        title = s["drawTitleDate"](name, draw["date"])
        description = s["drawDescDate"](name, draw["date"], nums_str, bonus_str)
        h1 = s["drawH1Date"](name, draw["date"])

    nav_bits = []
    nav_bits.append(f'<a href="/draws/{key}/{prev_id}.html">{s["prevDraw"]}</a>' if prev_id is not None else "<span></span>")
    nav_bits.append(f'<a href="/draws/{key}/index.html">{s["allDraws"]}</a>')
    nav_bits.append(f'<a href="/draws/{key}/{next_id}.html">{s["nextDraw"]}</a>' if next_id is not None else "<span></span>")

    body = f"""      <h1>{meta['flag']} {h1}</h1>
      <p class="subtitle">{s['drawnOn'](draw['date'])}</p>
    </header>

    <section class="results">
      <div class="game-row">
        <div class="balls">
          {balls_html}
          {bonus_html}
        </div>
      </div>
    </section>

    <nav class="draw-nav">
      {nav_bits[0]}
      {nav_bits[1]}
      {nav_bits[2]}
    </nav>
"""
    return page_shell(key, meta, lang, title, description, body, f"/draws/{key}/{draw['id']}.html")


def render_draws_index(key, meta, lang, draws):
    s = STR[lang]
    name = meta["name"]
    by_year = {}
    for d in draws:
        by_year.setdefault(d["date"][:4], []).append(d)

    sections = []
    for year in sorted(by_year.keys(), reverse=True):
        items = sorted(by_year[year], key=lambda d: d["date"], reverse=True)
        links = " ".join(f'<a href="/draws/{key}/{d["id"]}.html">{d["id"] if meta["has_id"] else d["date"]}</a>' for d in items)
        sections.append(f'<h3>{year}</h3>\n      <div class="draw-year-links">{links}</div>')
    sections_html = "\n      ".join(sections)

    latest = draws[-1]
    latest_label = latest["id"] if meta["has_id"] else latest["date"]
    title = s["drawsIndexTitle"](name)
    description = s["drawsIndexDesc"](name, latest_label)
    body = f"""      <h1>{meta['flag']} {s['drawsIndexH1'](name)}</h1>
    </header>

    <section class="info">
      {sections_html}
    </section>
"""
    return page_shell(key, meta, lang, title, description, body, f"/draws/{key}/index.html")


def render_number_page(key, meta, lang, num, stats, recent_draws):
    s = STR[lang]
    name = meta["name"]
    count = stats["main"].get(str(num), 0)
    total = stats["totalDraws"]
    pct = round(count / total * 100, 1) if total else 0.0

    recent_html = "\n        ".join(
        f'<li><a href="/draws/{key}/{d["id"]}.html">{s["drawLabel"](d["id"], d["date"], meta["has_id"])}</a></li>'
        for d in recent_draws
    )

    prev_n, next_n = num - 1, num + 1
    nav_bits = []
    nav_bits.append(f'<a href="/numbers/{key}/{prev_n}.html">{s["prevNumber"]}</a>' if prev_n >= 1 else "<span></span>")
    nav_bits.append(f'<a href="/numbers/{key}/index.html">{s["allNumbers"]}</a>')
    nav_bits.append(f'<a href="/numbers/{key}/{next_n}.html">{s["nextNumber"]}</a>' if next_n <= meta["main_max"] else "<span></span>")

    title = s["numberTitle"](name, num)
    description = s["numberDesc"](name, num, count, total, pct)
    body = f"""      <h1>{meta['flag']} {s['numberH1'](name, num)}</h1>
      <p class="subtitle">{s['numberSubtitle'](count, total, pct)}</p>
    </header>

    <section class="results">
      <div class="game-row" style="justify-content:center;">
        <div class="ball-wrap"><div class="ball {band_class(num, meta['main_max'])}">{num}</div></div>
      </div>
    </section>

    <section class="info">
      <h2>{s['recentHeading']}</h2>
      <ul class="recent-list">
        {recent_html}
      </ul>
      <p class="disclaimer">{s['numberDisclaimer']}</p>
    </section>

    <nav class="draw-nav">
      {nav_bits[0]}
      {nav_bits[1]}
      {nav_bits[2]}
    </nav>
"""
    return page_shell(key, meta, lang, title, description, body, f"/numbers/{key}/{num}.html")


def render_numbers_index(key, meta, lang):
    s = STR[lang]
    name = meta["name"]
    cells = "".join(
        f'<a class="ball-wrap number-index-link" href="/numbers/{key}/{n}.html"><div class="ball {band_class(n, meta["main_max"])}">{n}</div></a>'
        for n in range(1, meta["main_max"] + 1)
    )
    title = s["numbersIndexTitle"](name)
    description = s["numbersIndexDesc"](name)
    body = f"""      <h1>{meta['flag']} {s['numbersIndexH1'](name)}</h1>
    </header>

    <section class="info">
      <div class="stats-grid">
        {cells}
      </div>
    </section>
"""
    return page_shell(key, meta, lang, title, description, body, f"/numbers/{key}/index.html")



def generate_game(key):
    meta = GAME_META[key]
    lang = meta["lang"]
    draws = json.load(open(f"{ROOT}/data/{key}-draws.json"))
    stats = json.load(open(f"{ROOT}/data/{key}.json"))
    draws.sort(key=lambda d: d["date"])

    draws_dir = f"{ROOT}/draws/{key}"
    numbers_dir = f"{ROOT}/numbers/{key}"
    os.makedirs(draws_dir, exist_ok=True)
    os.makedirs(numbers_dir, exist_ok=True)

    ids = [d["id"] for d in draws]
    for i, d in enumerate(draws):
        prev_id = ids[i - 1] if i > 0 else None
        next_id = ids[i + 1] if i < len(draws) - 1 else None
        html = render_draw_page(key, meta, lang, d, prev_id, next_id)
        with open(f"{draws_dir}/{d['id']}.html", "w") as f:
            f.write(html)

    html = render_draws_index(key, meta, lang, draws)
    with open(f"{draws_dir}/index.html", "w") as f:
        f.write(html)

    draws_desc = sorted(draws, key=lambda d: d["date"], reverse=True)
    for num in range(1, meta["main_max"] + 1):
        recent = [d for d in draws_desc if num in d["main"]][:10]
        html = render_number_page(key, meta, lang, num, stats, recent)
        with open(f"{numbers_dir}/{num}.html", "w") as f:
            f.write(html)

    html = render_numbers_index(key, meta, lang)
    with open(f"{numbers_dir}/index.html", "w") as f:
        f.write(html)

    print(f"{key}: {len(draws)} draw pages (+index), {meta['main_max']} number pages (+index)")


def main():
    for key in GAME_META:
        generate_game(key)


if __name__ == "__main__":
    main()
