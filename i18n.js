const I18N_STRINGS = {
  ko: {
    worldLink: "🌍 전 세계 로또 번호 생성기 보러가기",
    worldTitle: "🌍 세계 로또 번호 생성기",
    worldSubtitle: "세계 각국의 복권 규칙에 맞춰 번호를 무작위로 뽑아드려요",
    gameLabel: "국가 / 게임",
    countLabel: "생성 게임 수",
    countOption: (n) => `${n}게임`,
    excludeLabel: "제외할 번호 (선택)",
    excludePlaceholder: "예: 1, 7, 23",
    excludeFormatHint: "쉼표(,) 뒤에 띄어쓰기를 넣어주세요. 예: 1, 7, 23",
    generateBtn: "번호 생성하기",
    footerNote: "재미로 즐기는 번호 생성기입니다. 당첨을 보장하지 않아요 🍀",
    backLink: "🇰🇷 한국 로또 생성기로 돌아가기",
    partnershipLink: "제휴 문의하기 →",
    excludeError: "제외한 번호가 너무 많아 필요한 개수를 뽑을 수 없어요.",
    mainInfo: (min, max, count) => `메인 번호 ${min}~${max} 중 ${count}개`,
    bonusInfo: (label, min, max, count) => ` + 보너스(${label}) ${min}~${max} 중 ${count}개`,
    gameRowLabel: (n) => `${n}게임`,
    quickFlagsLabel: "국가별 빠른 생성",
  },
  en: {
    worldLink: "🌍 View World Lottery Number Generator",
    worldTitle: "🌍 World Lottery Number Generator",
    worldSubtitle: "Get random numbers based on lottery rules from countries around the world",
    gameLabel: "Country / Game",
    countLabel: "Number of Games",
    countOption: (n) => `${n} Game${n > 1 ? "s" : ""}`,
    excludeLabel: "Numbers to Exclude (optional)",
    excludePlaceholder: "e.g. 1, 7, 23",
    excludeFormatHint: "Please add a space after each comma. e.g. 1, 7, 23",
    generateBtn: "Generate Numbers",
    footerNote: "Just for fun. No winnings guaranteed 🍀",
    backLink: "🇰🇷 Back to Korean Lotto Generator",
    partnershipLink: "Partnership Inquiry →",
    excludeError: "Too many excluded numbers — can't pick the required amount.",
    mainInfo: (min, max, count) => `Main numbers: ${count} of ${min}–${max}`,
    bonusInfo: (label, min, max, count) => ` + Bonus (${label}): ${count} of ${min}–${max}`,
    gameRowLabel: (n) => `Game ${n}`,
    quickFlagsLabel: "Quick generate by country",
  },
  ja: {
    worldLink: "🌍 世界の宝くじ番号ジェネレーターを見る",
    worldTitle: "🌍 世界の宝くじ番号ジェネレーター",
    worldSubtitle: "世界各国の宝くじルールに合わせて番号をランダムに生成します",
    gameLabel: "国 / ゲーム",
    countLabel: "生成するゲーム数",
    countOption: (n) => `${n}ゲーム`,
    excludeLabel: "除外する番号（任意）",
    excludePlaceholder: "例: 1, 7, 23",
    excludeFormatHint: "カンマ（,）の後にスペースを入れてください。例: 1, 7, 23",
    generateBtn: "番号を生成する",
    footerNote: "お楽しみ用の番号生成機です。当選を保証するものではありません🍀",
    backLink: "🇰🇷 韓国宝くじジェネレーターに戻る",
    partnershipLink: "提携のお問い合わせ →",
    excludeError: "除外する番号が多すぎて、必要な個数を選べません。",
    mainInfo: (min, max, count) => `メイン番号 ${min}〜${max}のうち${count}個`,
    bonusInfo: (label, min, max, count) => ` + ボーナス(${label}) ${min}〜${max}のうち${count}個`,
    gameRowLabel: (n) => `${n}ゲーム`,
    quickFlagsLabel: "国別クイック生成",
  },
  it: {
    worldLink: "🌍 Vedi il Generatore di Numeri della Lotteria Mondiale",
    worldTitle: "🌍 Generatore di Numeri della Lotteria Mondiale",
    worldSubtitle: "Genera numeri casuali in base alle regole della lotteria dei paesi di tutto il mondo",
    gameLabel: "Paese / Gioco",
    countLabel: "Numero di partite",
    countOption: (n) => `${n} partit${n > 1 ? "e" : "a"}`,
    excludeLabel: "Numeri da escludere (opzionale)",
    excludePlaceholder: "es: 1, 7, 23",
    excludeFormatHint: "Inserisci uno spazio dopo ogni virgola. Es: 1, 7, 23",
    generateBtn: "Genera numeri",
    footerNote: "Solo per divertimento. Nessuna vincita garantita 🍀",
    backLink: "🇰🇷 Torna al generatore di lotto coreano",
    partnershipLink: "Richiesta di partnership →",
    excludeError: "Troppi numeri esclusi: non è possibile selezionarne abbastanza.",
    mainInfo: (min, max, count) => `Numeri principali: ${count} su ${min}–${max}`,
    bonusInfo: (label, min, max, count) => ` + Bonus (${label}): ${count} su ${min}–${max}`,
    gameRowLabel: (n) => `Partita ${n}`,
    quickFlagsLabel: "Generazione rapida per paese",
  },
};

const SUPPORTED_LANGS = Object.keys(I18N_STRINGS);

// Countries that share the game most relevant to their region.
const REGION_GAME = {
  KR: "kr645",
  US: "powerball",
  GB: "uklotto",
  UK: "uklotto",
  JP: "loto6",
  AU: "auspowerball",
  IT: "superenalotto",
  FR: "euromillions",
  DE: "euromillions",
  ES: "euromillions",
  PT: "euromillions",
  BE: "euromillions",
  NL: "euromillions",
  IE: "euromillions",
  LU: "euromillions",
  CH: "euromillions",
  AT: "euromillions",
};

const LANG_GAME_FALLBACK = { ko: "kr645", ja: "loto6", it: "superenalotto", en: "powerball" };

// Which UI language each game's home country actually speaks.
const GAME_LANG = {
  kr645: "ko",
  powerball: "en",
  megamillions: "en",
  euromillions: "en",
  uklotto: "en",
  loto6: "ja",
  auspowerball: "en",
  superenalotto: "it",
};

function normalizeLang(code) {
  const c = (code || "").toLowerCase();
  return SUPPORTED_LANGS.includes(c) ? c : "en";
}

function detectAppI18n() {
  const params = new URLSearchParams(location.search);
  const tag = navigator.language || "en-US";
  const [rawLang, rawRegion] = tag.split("-");
  const region = rawRegion ? rawRegion.toUpperCase() : null;

  const paramLang = params.get("lang");
  const lang = paramLang && SUPPORTED_LANGS.includes(paramLang) ? paramLang : normalizeLang(rawLang);

  const paramGame = params.get("game");
  const game = paramGame || (region && REGION_GAME[region]) || LANG_GAME_FALLBACK[lang] || "powerball";

  return { lang, game };
}

const APP_I18N_DATA = detectAppI18n();

function t(key, ...args) {
  const dict = I18N_STRINGS[APP_I18N_DATA.lang] || I18N_STRINGS.en;
  const entry = dict[key] !== undefined ? dict[key] : I18N_STRINGS.en[key];
  return typeof entry === "function" ? entry(...args) : entry;
}

function applyDataI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
  });
}

function setLang(lang) {
  APP_I18N_DATA.lang = SUPPORTED_LANGS.includes(lang) ? lang : "en";
  window.APP_I18N.lang = APP_I18N_DATA.lang;
  document.documentElement.lang = APP_I18N_DATA.lang;
  applyDataI18n();
}

function gameLang(gameKey) {
  return GAME_LANG[gameKey] || "en";
}

window.APP_I18N = { lang: APP_I18N_DATA.lang, game: APP_I18N_DATA.game, t, setLang, gameLang };

document.addEventListener("DOMContentLoaded", () => {
  applyDataI18n();

  const worldLink = document.getElementById("world-link");
  if (worldLink) {
    worldLink.href = `world.html?game=${APP_I18N_DATA.game}&lang=${APP_I18N_DATA.lang}`;
  }
});
