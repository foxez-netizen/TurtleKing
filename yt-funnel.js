// YouTube funnel card for the lottery pages.
// Renders into #yt-funnel: a click-to-load Shorts preview plus a one-tap
// subscribe link (?sub_confirmation=1 opens YouTube's subscribe dialog).
// Video data comes from /data/videos.json, refreshed weekly by update-videos.yml.
// Clicks are pushed to the GTM dataLayer as yt_funnel_* events.
(function () {
  const CHANNEL = "https://www.youtube.com/@TurtleKingSaju";
  // Per-language pick; falls back to the most-viewed Short.
  const FEATURED = { en: "Q3Wh0IokwZI", it: "Q3Wh0IokwZI" };
  // Localized caption for the featured Short (its YouTube title is Korean).
  const FEATURED_TITLE = {
    en: "Bill Gates' birth chart, read the Korean way",
    it: "Il tema natale di Bill Gates, letto alla coreana",
  };

  const TEXT = {
    en: {
      kicker: "While you wait for the draw",
      head: "Is luck written in your birth date?",
      body: "1-minute Shorts on Korean saju (Four Pillars of Destiny) — the traditional Korean way of reading fortune from your birth date.",
      lang: "Korean audio",
      play: "Play preview",
      sub: "Subscribe on YouTube",
      more: "More videos",
    },
    ja: {
      kicker: "抽選を待つあいだに",
      head: "運は生年月日に書かれている？",
      body: "韓国の四柱推命（サジュ）を1分で紹介するショート動画です。",
      lang: "韓国語音声",
      play: "プレビュー再生",
      sub: "YouTubeでチャンネル登録",
      more: "他の動画",
    },
    it: {
      kicker: "Aspettando l'estrazione",
      head: "La fortuna è scritta nella tua data di nascita?",
      body: "Shorts di 1 minuto sul saju coreano (i Quattro Pilastri del Destino).",
      lang: "Audio in coreano",
      play: "Guarda l'anteprima",
      sub: "Iscriviti su YouTube",
      more: "Altri video",
    },
    ko: {
      kicker: "추첨 기다리는 동안",
      head: "번호 말고, 내 운은 언제 들어올까?",
      body: "인물과 신살 이야기로 풀어 보는 1분 사주 쇼츠. 거북왕의 사주풀이 채널에서 매주 새 영상이 올라와요.",
      lang: "",
      play: "미리보기 재생",
      sub: "유튜브 구독하기",
      more: "영상 더 보기",
    },
  };

  let videosPromise = null;

  function loadVideos() {
    if (!videosPromise) {
      videosPromise = fetch("/data/videos.json")
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
    }
    return videosPromise;
  }

  function track(event, extra) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: event, yt_lang: currentLang(), yt_page: location.pathname }, extra));
  }

  function currentLang() {
    const lang = (document.documentElement.lang || "en").slice(0, 2);
    return TEXT[lang] ? lang : "en";
  }

  function pickShort(videos, lang) {
    const shorts = videos.filter((v) => v.type === "short");
    const featured = FEATURED[lang] && shorts.find((v) => v.id === FEATURED[lang]);
    if (featured) return featured;
    return shorts.slice().sort((a, b) => (b.views || 0) - (a.views || 0))[0];
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (k === "text") node.textContent = v;
      else node.setAttribute(k, v);
    });
    (children || []).forEach((c) => c && node.appendChild(c));
    return node;
  }

  function buildCard(video, lang) {
    const t = TEXT[lang];
    const subUrl = `${CHANNEL}?sub_confirmation=1`;

    const player = el("button", { type: "button", class: "ytf-player", "aria-label": `${t.play}: ${video.title}` }, [
      el("img", { src: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`, alt: "", loading: "lazy", width: "480", height: "360" }),
      el("span", { class: "ytf-play", "aria-hidden": "true" }),
      el("span", { class: "ytf-badge", text: "Shorts" }),
    ]);
    player.addEventListener("click", () => {
      // Load the iframe only on click: keeps the page light and sets no YouTube cookies until then.
      const frame = el("iframe", {
        src: `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&playsinline=1&rel=0`,
        title: video.title,
        allow: "autoplay; encrypted-media; picture-in-picture",
        allowfullscreen: "",
      });
      player.replaceWith(el("div", { class: "ytf-player ytf-frame" }, [frame]));
      track("yt_funnel_play", { yt_video: video.id });
    }, { once: true });

    const subscribe = el("a", { class: "ytf-sub", href: subUrl, target: "_blank", rel: "noopener", text: t.sub });
    subscribe.addEventListener("click", () => track("yt_funnel_subscribe", { yt_video: video.id }));

    const more = el("a", { class: "ytf-more", href: `${CHANNEL}/shorts`, target: "_blank", rel: "noopener", text: `${t.more} ↗` });
    more.addEventListener("click", () => track("yt_funnel_channel", { yt_video: video.id }));

    const caption = (video.id === FEATURED[lang] && FEATURED_TITLE[lang]) || video.title;
    const meta = el("p", { class: "ytf-title" }, [el("span", { text: caption })]);
    if (t.lang) meta.appendChild(el("small", { text: ` · ${t.lang}` }));

    return el("aside", { class: "ytf", "aria-label": "YouTube" }, [
      player,
      el("div", { class: "ytf-body" }, [
        el("p", { class: "ytf-kicker", text: t.kicker }),
        el("h2", { class: "ytf-head", text: t.head }),
        el("p", { class: "ytf-text", text: t.body }),
        meta,
        el("div", { class: "ytf-actions" }, [subscribe, more]),
      ]),
    ]);
  }

  let shownLang = null;

  function render() {
    const slot = document.getElementById("yt-funnel");
    if (!slot) return;
    const lang = currentLang();
    if (lang === shownLang) return;
    loadVideos().then((data) => {
      if (!data || !Array.isArray(data.videos)) return;
      const video = pickShort(data.videos, lang);
      if (!video) return;
      slot.replaceChildren(buildCard(video, lang));
      if (shownLang === null) observeView(slot, video);
      shownLang = lang;
    });
  }

  function observeView(slot, video) {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        track("yt_funnel_view", { yt_video: video.id });
        io.disconnect();
      }
    }, { threshold: 0.5 });
    io.observe(slot);
  }

  window.YTFunnel = { render: render };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
