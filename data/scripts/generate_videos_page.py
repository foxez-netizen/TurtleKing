#!/usr/bin/env python3
"""
Generate /videos/index.html — the 거북왕의 사주풀이 YouTube video section —
from data/videos.json.

data/videos.json is refreshed weekly from the channel RSS feed by
data/scripts/update_videos.py (GitHub Actions: update-videos.yml); this
script then lays it out as three sections:

- 이번 주 인기: most views gained over the last 7 days (videos + Shorts)
- 최신 영상: newest long-form videos
- 쇼츠: newest Shorts

Hand-written person / concept / note / duration fields in the JSON win over
the auto-filled ones. It also refreshes the video CTA subtitle on the home
page (between the <!--vcta--> markers in index.html).

    python3 data/scripts/generate_videos_page.py

Each card shows a YouTube thumbnail that only loads the real player
(youtube-nocookie.com) when clicked, so the page stays fast and no YouTube
cookies are set until the visitor actually plays a video.
"""
import datetime
import html
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = f"{ROOT}/data/videos.json"
OUT_DIR = f"{ROOT}/videos"
SITE = "https://luckyturtle.life"
INDEX = f"{ROOT}/index.html"
LATEST_N = 12   # long-form cards in 최신 영상
SHORTS_N = 12   # tiles in 쇼츠
POPULAR_N = 4   # tiles in 이번 주 인기

PLAY_SVG = ('<svg class="yt-ico" viewBox="0 0 28 20" aria-hidden="true">'
            '<rect width="28" height="20" rx="5" fill="#ff0000"/>'
            '<path d="M11 5.5v9l8-4.5z" fill="#fff"/></svg>')


GTM_HEAD = """<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KN25528B');</script>
<!-- End Google Tag Manager -->"""

GTM_BODY = """<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KN25528B"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->"""


def esc(s):
    return html.escape(s, quote=True)


def concept_of(v):
    return v.get("concept") or v.get("auto_concept") or ""


def week_gain(v, today):
    """Views gained over the last ~7 days, or None when it can't be told."""
    cutoff = (today - datetime.timedelta(days=6)).isoformat()
    older = [h for h in v.get("history", []) if h[0] <= cutoff]
    if older:
        return v.get("views", 0) - older[-1][1]
    pub = v.get("published", "")[:10]
    if pub and pub >= (today - datetime.timedelta(days=7)).isoformat():
        return v.get("views", 0)  # brand-new: every view is this week's
    return None


def player(v, extra=""):
    vid = esc(v["id"])
    badge = "Shorts" if v.get("type") == "short" else v.get("duration", "")
    badge = f'<span class="vdur">{esc(badge)}</span>' if badge else ""
    cls = "vplayer short" if v.get("type") == "short" else "vplayer"
    return (f'<button type="button" class="{cls}" data-id="{vid}" aria-label="{esc(v["title"])} 재생">'
            f'<img src="https://i.ytimg.com/vi/{vid}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360">'
            f'<span class="vplay">{PLAY_SVG}</span>{badge}{extra}</button>')


def yt_url(v):
    kind = "shorts/" if v.get("type") == "short" else "watch?v="
    return f"https://www.youtube.com/{kind}{esc(v['id'])}"


def card(v):
    vid = esc(v["id"])
    concept = concept_of(v)
    concept = f'<p class="vcard-concept">{esc(concept)}</p>' if concept else ""
    person = f'<span class="vperson">{esc(v["person"])}</span>' if v.get("person") else ""
    note = v.get("note") or v.get("summary") or ""
    note = f"<p>{esc(note)}</p>" if note else ""
    return f"""    <article class="card vcard" id="v-{vid}">
      {player(v)}
      <div class="vcard-body">
        {person}
        <h3>{esc(v["title"])}</h3>
        {concept}
        {note}
        <a class="vlink" href="{yt_url(v)}" target="_blank" rel="noopener">유튜브에서 보기 ↗</a>
      </div>
    </article>"""


def tile(v, rank=None, gain=None):
    rank_html = f'<span class="vrank">{rank}</span>' if rank else ""
    meta = f"이번 주 +{gain:,}회" if gain is not None else concept_of(v)
    meta = f'<small>{esc(meta)}</small>' if meta else ""
    return f"""      <div class="vtile{' short' if v.get('type') == 'short' else ''}">
        {player(v, rank_html)}
        <a href="{yt_url(v)}" target="_blank" rel="noopener"><b>{esc(v["title"])}</b>{meta}</a>
      </div>"""


def section(title, sub, body, cls=""):
    return f"""  <section class="vsec">
    <h2>{title} <small>{sub}</small></h2>
    {f'<div class="{cls}">' if cls else ''}
{body}
    {'</div>' if cls else ''}
  </section>"""


def update_home_cta(latest):
    if not latest or not os.path.exists(INDEX):
        return
    src = open(INDEX, encoding="utf-8").read()
    new = re.sub(r"<!--vcta-->.*?<!--/vcta-->",
                 lambda _: f"<!--vcta-->최신: {esc(latest['title'])}<!--/vcta-->", src, flags=re.S)
    if new != src:
        with open(INDEX, "w", encoding="utf-8") as f:
            f.write(new)
        print("Updated home video CTA")


def main():
    d = json.load(open(DATA, encoding="utf-8"))
    ch = d["channel"]
    videos = sorted(d["videos"], key=lambda v: v.get("published", ""), reverse=True)
    today = datetime.date.fromisoformat(d.get("updated") or datetime.date.today().isoformat())

    longs = [v for v in videos if v.get("type") != "short"][:LATEST_N]
    shorts = [v for v in videos if v.get("type") == "short"][:SHORTS_N]
    ranked = sorted(((week_gain(v, today), v) for v in videos), key=lambda t: -(t[0] or 0))
    popular = [(g, v) for g, v in ranked if g][:POPULAR_N]

    sections = []
    if popular:
        sections.append(section("🔥 이번 주 인기", "최근 7일 조회수 기준",
                                "\n".join(tile(v, i + 1, g) for i, (g, v) in enumerate(popular)), "vgrid"))
    if longs:
        sections.append(section("🎬 최신 영상", "새로 올라온 순", "\n".join(card(v) for v in longs)))
    if shorts:
        sections.append(section("⚡ 쇼츠", "1분 사주 이야기", "\n".join(tile(v) for v in shorts), "vgrid shorts"))
    body = "\n\n".join(sections)

    titles = " · ".join(v.get("person") or concept_of(v) for v in longs[:4] if v.get("person") or concept_of(v))
    desc = f"거북왕의 사주풀이 유튜브 영상과 쇼츠 모음. {titles} 등 인물과 신살 이야기를 명리학으로 풀어 봅니다."
    updated = f'<p class="vupdated">매주 자동 업데이트 · 마지막 업데이트 {today.isoformat()}</p>'

    page = f"""<!DOCTYPE html>
<html lang="ko">
<head>
{GTM_HEAD}
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>거북왕의 사주풀이 영상 – 인물 사주 이야기 | 느릿느릿 사주풀이</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{SITE}/videos/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="느릿느릿 사주풀이">
<meta property="og:locale" content="ko_KR">
<meta property="og:url" content="{SITE}/videos/">
<meta property="og:title" content="거북왕의 사주풀이 영상">
<meta property="og:description" content="{esc(desc)}">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="/saju.css">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2176623685813595" crossorigin="anonymous"></script>
</head>
<body>
{GTM_BODY}
<div class="wrap">
  <div class="topbar">
    <div class="brand-wrap"><a class="brand" href="/"><i class="brand-turtle" aria-hidden="true">🐢</i>느릿느릿 <span>사주풀이</span></a><a class="brand-video" href="/videos/" aria-current="page">{PLAY_SVG}영상</a></div>
    <nav class="topnav"><a href="/">사주 보기</a><a href="/guide">사주 가이드</a><button type="button" id="theme-btn" aria-label="다크/라이트 모드 전환">🌙 다크</button></nav>
  </div>

  <section class="hero vhero">
    {PLAY_SVG.replace('class="yt-ico"', 'class="yt-ico lg"')}
    <h1>거북왕의 사주풀이 영상</h1>
    <p>역사 속 인물과 신살(神煞) 이야기를 명리학으로 풀어 보는 영상입니다. 영상마다 핵심 사주 개념을 함께 정리해 두었어요.</p>
    {updated}
  </section>

{body}

  <a class="card vchannel" href="{esc(ch["url"])}" target="_blank" rel="noopener">
    {PLAY_SVG}
    <span><b>{esc(ch["name"])} 채널 구독하기</b><small>youtube.com/{esc(ch["handle"])}</small></span>
    <span class="go">↗</span>
  </a>

  <p class="disc">영상 속 사주 해석은 전통 명리학에 기반한 참고용 이야기입니다. <a href="/guide">사주 가이드</a>에서 용어를 더 자세히 볼 수 있고, <a href="/">내 사주</a>도 바로 확인해 볼 수 있습니다.</p>

  <footer>
    <a href="/">사주 보기</a><a href="/guide">사주 가이드</a><a href="/videos/">영상</a><a href="/lotto/">로또</a><a href="/about">소개</a><a href="/privacy">개인정보처리방침</a>
    <div style="margin-top:8px">© 느릿느릿 사주풀이 · luckyturtle.life</div>
  </footer>
</div>
<script>
document.querySelectorAll('.vplayer').forEach(function (b) {{
  b.addEventListener('click', function () {{
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + b.dataset.id + '?autoplay=1&rel=0';
    f.title = b.getAttribute('aria-label');
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    f.allowFullscreen = true;
    f.className = b.classList.contains('short') ? 'vframe short' : 'vframe';
    b.replaceWith(f);
  }});
}});
</script>
<script src="/saju-core.js"></script>
<script src="/saju-app.js"></script>
</body>
</html>
"""
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(f"{OUT_DIR}/index.html", "w", encoding="utf-8") as f:
        f.write(page)
    print(f"Wrote videos/index.html: {len(popular)} popular, {len(longs)} videos, {len(shorts)} shorts")
    update_home_cta(longs[0] if longs else (videos[0] if videos else None))


if __name__ == "__main__":
    main()
