#!/usr/bin/env python3
"""
Generate /videos/index.html — the 거북왕의 사주풀이 YouTube video section —
from data/videos.json.

The video list is curated by hand (only the videos listed in the JSON are
shown), so edit data/videos.json and re-run this script to add or remove a
video:

    python3 data/scripts/generate_videos_page.py

Each card shows a YouTube thumbnail that only loads the real player
(youtube-nocookie.com) when clicked, so the page stays fast and no YouTube
cookies are set until the visitor actually plays a video.
"""
import html
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = f"{ROOT}/data/videos.json"
OUT_DIR = f"{ROOT}/videos"
SITE = "https://luckyturtle.life"

PLAY_SVG = ('<svg class="yt-ico" viewBox="0 0 28 20" aria-hidden="true">'
            '<rect width="28" height="20" rx="5" fill="#ff0000"/>'
            '<path d="M11 5.5v9l8-4.5z" fill="#fff"/></svg>')


def esc(s):
    return html.escape(s, quote=True)


def card(v):
    vid = esc(v["id"])
    title = esc(v["title"])
    concept = f'<p class="vcard-concept">{esc(v["concept"])}</p>' if v.get("concept") else ""
    return f"""    <article class="card vcard" id="v-{vid}">
      <button type="button" class="vplayer" data-id="{vid}" aria-label="{title} 재생">
        <img src="https://i.ytimg.com/vi/{vid}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360">
        <span class="vplay">{PLAY_SVG}</span>
        <span class="vdur">{esc(v.get("duration", ""))}</span>
      </button>
      <div class="vcard-body">
        <span class="vperson">{esc(v.get("person", ""))}</span>
        <h2>{title}</h2>
        {concept}
        <p>{esc(v["note"])}</p>
        <a class="vlink" href="https://www.youtube.com/watch?v={vid}" target="_blank" rel="noopener">유튜브에서 보기 ↗</a>
      </div>
    </article>"""


def main():
    d = json.load(open(DATA, encoding="utf-8"))
    ch = d["channel"]
    videos = d["videos"]
    people = " · ".join(v["person"] for v in videos if v.get("person"))
    desc = f"거북왕의 사주풀이 유튜브 영상 모음. {people}의 사주를 명리학으로 풀어 봅니다."
    cards = "\n".join(card(v) for v in videos)

    page = f"""<!DOCTYPE html>
<html lang="ko">
<head>
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
<div class="wrap">
  <div class="topbar">
    <div class="brand-wrap"><a class="brand" href="/"><i class="brand-turtle" aria-hidden="true">🐢</i>느릿느릿 <span>사주풀이</span></a><a class="brand-video" href="/videos/" aria-current="page">{PLAY_SVG}영상</a></div>
    <nav class="topnav"><a href="/">사주 보기</a><a href="/guide.html">사주 가이드</a><button type="button" id="theme-btn" aria-label="다크/라이트 모드 전환">🌙 다크</button></nav>
  </div>

  <section class="hero vhero">
    {PLAY_SVG.replace('class="yt-ico"', 'class="yt-ico lg"')}
    <h1>거북왕의 사주풀이 영상</h1>
    <p>역사 속 인물들의 사주를 명리학으로 풀어 보는 영상입니다. 영상마다 핵심 사주 개념을 함께 정리해 두었어요.</p>
  </section>

{cards}

  <a class="card vchannel" href="{esc(ch["url"])}" target="_blank" rel="noopener">
    {PLAY_SVG}
    <span><b>{esc(ch["name"])} 채널 구독하기</b><small>youtube.com/{esc(ch["handle"])}</small></span>
    <span class="go">↗</span>
  </a>

  <p class="disc">영상 속 사주 해석은 전통 명리학에 기반한 참고용 이야기입니다. <a href="/guide.html">사주 가이드</a>에서 용어를 더 자세히 볼 수 있고, <a href="/">내 사주</a>도 바로 확인해 볼 수 있습니다.</p>

  <footer>
    <a href="/">사주 보기</a><a href="/guide.html">사주 가이드</a><a href="/videos/">영상</a><a href="/lotto/">로또</a><a href="/about.html">소개</a><a href="/privacy.html">개인정보처리방침</a>
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
    f.className = 'vframe';
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
    print(f"Wrote videos/index.html with {len(videos)} videos")


if __name__ == "__main__":
    main()
