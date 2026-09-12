#!/usr/bin/env python3
"""
Generate static SEO pages for Korea Lotto 6/45:
  - draws/<n>.html   one page per historical draw (winning numbers + prize table)
  - draws/index.html archive listing every draw, grouped by year
  - numbers/<n>.html one page per number 1-45 (appearance count + recent history)
  - numbers/index.html grid linking to all 45 number pages

Reads data/kr645-draws.json (raw per-draw results) and data/kr645.json
(aggregate frequency counts, used for the total/percentage shown on each
number page). Re-run this script any time kr645-draws.json is updated
with new draws (see update_kr645.py) to regenerate everything.
"""
import json
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DRAWS_JSON = f"{ROOT}/data/kr645-draws.json"
STATS_JSON = f"{ROOT}/data/kr645.json"
DRAWS_DIR = f"{ROOT}/draws"
NUMBERS_DIR = f"{ROOT}/numbers"

RANK_LABELS = ["1등", "2등", "3등", "4등", "5등"]

ADSENSE_SCRIPT = (
    '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
    '?client=ca-pub-2176623685813595" crossorigin="anonymous"></script>'
)


def band_class(n, max_n=45):
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


def fmt_date_kr(iso_date):
    y, m, d = iso_date.split("-")
    return f"{y}년 {int(m)}월 {int(d)}일"


def fmt_won(n):
    return f"{n:,}원"


def page_shell(title, description, body, depth=1):
    prefix = "../" * depth
    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="stylesheet" href="{prefix}style.css">
{ADSENSE_SCRIPT}
</head>
<body>
  <div class="wrap">
    <header>
      <button id="theme-toggle" class="theme-toggle" aria-label="다크/화이트 모드 전환" title="다크/화이트 모드 전환">
        <span id="theme-toggle-icon">🌙</span>
        <span id="theme-toggle-label">Darkmode</span>
      </button>
{body}
    <footer>
      <nav class="site-nav">
        <a href="{prefix}index.html">🇰🇷 로또 번호 생성기로 돌아가기</a>
        <a href="{prefix}numbers/index.html">🔢 번호별 통계</a>
        <a href="{prefix}draws/index.html">📅 회차별 당첨번호</a>
        <a href="{prefix}stats.html">📊 번호별 당첨 통계</a>
      </nav>
    </footer>
  </div>
<script src="{prefix}theme.js"></script>
</body>
</html>
"""


def render_draw_page(draw, prev_no, next_no, latest_no):
    n = draw["draw_no"]
    balls_html = "".join(
        f'<div class="ball-wrap"><div class="ball {band_class(x)}">{x}</div></div>'
        for x in draw["numbers"]
    )
    bonus_html = (
        f'<div class="ball-divider">+</div>'
        f'<div class="ball-wrap"><div class="ball bonus {band_class(draw["bonus_no"])}">{draw["bonus_no"]}</div></div>'
    )

    rows = []
    for i, div in enumerate(draw["divisions"][:5]):
        label = RANK_LABELS[i] if i < len(RANK_LABELS) else f"{i+1}등"
        if div:
            rows.append(f"<tr><td>{label}</td><td>{fmt_won(div['prize'])}</td><td>{div['winners']:,}명</td></tr>")
        else:
            rows.append(f"<tr><td>{label}</td><td>정보 없음</td><td>정보 없음</td></tr>")
    table_rows = "\n        ".join(rows)

    nav_links = []
    if prev_no:
        nav_links.append(f'<a href="{prev_no}.html">← {prev_no}회</a>')
    else:
        nav_links.append("<span></span>")
    nav_links.append('<a href="index.html">전체 회차 목록</a>')
    if next_no and next_no <= latest_no:
        nav_links.append(f'<a href="{next_no}.html">{next_no}회 →</a>')
    else:
        nav_links.append("<span></span>")

    numbers_str = ", ".join(str(x) for x in draw["numbers"])
    title = f"로또 {n}회 당첨번호 | 로또 번호 생성기"
    description = (
        f"로또 {n}회({draw['date']}) 당첨번호는 {numbers_str} + 보너스 {draw['bonus_no']}입니다. "
        f"등수별 당첨금과 당첨자 수, 총 판매금액을 확인하세요."
    )

    body = f"""      <h1>🎱 로또 {n}회 당첨번호</h1>
      <p class="subtitle">{fmt_date_kr(draw['date'])} 추첨</p>
    </header>

    <section class="results">
      <div class="game-row">
        <div class="balls">
          {balls_html}
          {bonus_html}
        </div>
      </div>
    </section>

    <section class="info">
      <h2>등수별 당첨 결과</h2>
      <table class="prize-table">
        <thead><tr><th>등수</th><th>당첨금(1인당)</th><th>당첨자 수</th></tr></thead>
        <tbody>
        {table_rows}
        </tbody>
      </table>
      <p>이번 회차 총 판매금액은 {fmt_won(draw['total_sales_amount'])}입니다.</p>
    </section>

    <nav class="draw-nav">
      {nav_links[0]}
      {nav_links[1]}
      {nav_links[2]}
    </nav>
"""
    return page_shell(title, description, body, depth=1)


def render_draws_index(draws):
    by_year = {}
    for d in draws:
        year = d["date"][:4]
        by_year.setdefault(year, []).append(d)

    sections = []
    for year in sorted(by_year.keys(), reverse=True):
        items = sorted(by_year[year], key=lambda d: d["draw_no"], reverse=True)
        links = " ".join(f'<a href="{d["draw_no"]}.html">{d["draw_no"]}회</a>' for d in items)
        sections.append(f'<h3>{year}년</h3>\n      <div class="draw-year-links">{links}</div>')
    sections_html = "\n      ".join(sections)

    latest = max(draws, key=lambda d: d["draw_no"])
    title = "로또 회차별 당첨번호 전체 목록 | 로또 번호 생성기"
    description = f"로또 1회부터 {latest['draw_no']}회까지 전체 회차의 당첨번호를 연도별로 모아놓은 목록입니다."
    body = f"""      <h1>📅 회차별 당첨번호</h1>
      <p class="subtitle">1회부터 {latest['draw_no']}회까지, 연도별로 모아봤어요</p>
    </header>

    <section class="info">
      {sections_html}
    </section>
"""
    return page_shell(title, description, body, depth=1)


def render_number_page(num, stats, recent_draws, latest_no):
    count = stats["main"].get(str(num), 0)
    total = stats["totalDraws"]
    pct = round(count / total * 100, 1) if total else 0.0

    recent_html = "\n        ".join(
        f'<li><a href="../draws/{d["draw_no"]}.html">{d["draw_no"]}회 ({d["date"]})</a></li>'
        for d in recent_draws
    )

    prev_n = num - 1
    next_n = num + 1
    nav_links = []
    nav_links.append(f'<a href="{prev_n}.html">← {prev_n}번</a>' if prev_n >= 1 else "<span></span>")
    nav_links.append('<a href="index.html">전체 번호 목록</a>')
    nav_links.append(f'<a href="{next_n}.html">{next_n}번 →</a>' if next_n <= 45 else "<span></span>")

    title = f"로또 {num}번 출현 횟수 및 최근 당첨 이력 | 로또 번호 생성기"
    description = f"로또 {num}번은 지금까지(1~{latest_no}회) 총 {count}회 나왔습니다({pct}%). 최근 출현 회차와 이력을 확인하세요."
    body = f"""      <h1>🔢 로또 {num}번 출현 횟수</h1>
      <p class="subtitle">역대 {total}회차 중 {count}회 출현 ({pct}%)</p>
    </header>

    <section class="results">
      <div class="game-row" style="justify-content:center;">
        <div class="ball-wrap"><div class="ball {band_class(num)}">{num}</div></div>
      </div>
    </section>

    <section class="info">
      <h2>최근 출현 회차</h2>
      <ul class="recent-list">
        {recent_html}
      </ul>
      <p class="disclaimer">과거 출현 빈도는 참고용 정보일 뿐, 다음 추첨 결과를 예측하지 않습니다. 매 회차 추첨은 이전 결과와 통계적으로 독립적인 사건입니다.</p>
    </section>

    <nav class="draw-nav">
      {nav_links[0]}
      {nav_links[1]}
      {nav_links[2]}
    </nav>
"""
    return page_shell(title, description, body, depth=1)


def render_numbers_index():
    cells = "".join(
        f'<a class="ball-wrap number-index-link" href="{n}.html"><div class="ball {band_class(n)}">{n}</div></a>'
        for n in range(1, 46)
    )
    title = "로또 번호별 출현 횟수 전체 목록 | 로또 번호 생성기"
    description = "로또 1번부터 45번까지 각 번호의 역대 출현 횟수와 최근 당첨 이력 페이지 모음입니다."
    body = f"""      <h1>🔢 번호별 출현 횟수</h1>
      <p class="subtitle">번호를 눌러 출현 횟수와 최근 당첨 이력을 확인하세요</p>
    </header>

    <section class="info">
      <div class="stats-grid">
        {cells}
      </div>
    </section>
"""
    return page_shell(title, description, body, depth=1)


def main():
    draws = json.load(open(DRAWS_JSON))
    stats = json.load(open(STATS_JSON))
    draws.sort(key=lambda d: d["draw_no"])
    latest_no = draws[-1]["draw_no"]

    os.makedirs(DRAWS_DIR, exist_ok=True)
    os.makedirs(NUMBERS_DIR, exist_ok=True)

    by_no = {d["draw_no"]: d for d in draws}
    for d in draws:
        n = d["draw_no"]
        html = render_draw_page(d, n - 1 if n - 1 in by_no else None, n + 1, latest_no)
        with open(f"{DRAWS_DIR}/{n}.html", "w") as f:
            f.write(html)

    with open(f"{DRAWS_DIR}/index.html", "w") as f:
        f.write(render_draws_index(draws))

    draws_desc = sorted(draws, key=lambda d: d["draw_no"], reverse=True)
    for num in range(1, 46):
        recent = [d for d in draws_desc if num in d["numbers"]][:10]
        html = render_number_page(num, stats, recent, latest_no)
        with open(f"{NUMBERS_DIR}/{num}.html", "w") as f:
            f.write(html)

    with open(f"{NUMBERS_DIR}/index.html", "w") as f:
        f.write(render_numbers_index())

    print(f"Generated {len(draws)} draw pages (+index), 45 number pages (+index). Latest draw: {latest_no}")


if __name__ == "__main__":
    main()
