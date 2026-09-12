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
    selectBtn: "⭐ 이 번호 선택",
    selectedBtn: "✅ 선택됨",
    wishMessage: "이 번호가 당첨되길 기원합니다! 🍀✨",
    timesLabel: (n) => `${n}회`,
    statsLink: "📊 번호별 당첨 통계 보기",
    aboutLink: "ℹ️ 사이트 소개",
    privacyLink: "🔒 개인정보처리방침",
    infoTitle: "번호 생성기 이용 안내",
    infoIntro: "이 도구는 선택한 국가의 복권 규칙에 맞춰 번호를 그 자리에서 무작위로 뽑아드리는 재미용 생성기입니다. 실제 복권 구매나 당첨을 대행하지 않으며, 생성된 번호는 어떠한 경우에도 당첨을 보장하지 않습니다.",
    infoRandomTitle: "번호는 어떻게 생성되나요?",
    infoRandom: "매 회차 추첨은 이전 결과와 통계적으로 독립적인 사건입니다. 과거에 자주 나온 번호라고 해서 다음 추첨에서 더 잘 나올 확률이 높아지는 것은 아니에요.",
    infoOddsTitle: "당첨 확률",
    infoOddsLabel: (odds) => `현재 선택한 게임의 1등 당첨 확률은 약 ${odds}분의 1입니다.`,
    infoStatsNote: "번호별 실제 과거 당첨 빈도는 이 사이트의 통계 페이지에서 확인할 수 있어요.",
    infoDisclaimer: "본 서비스는 성인 대상 오락용 도구이며, 과도한 복권 구매를 권장하지 않습니다.",
    seoDrawsLink: "📅 회차별 당첨번호",
    seoNumbersLink: "🔢 번호별 출현 횟수",
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
    selectBtn: "⭐ Pick this one",
    selectedBtn: "✅ Selected",
    wishMessage: "Wishing you the jackpot with this one! 🍀✨",
    timesLabel: (n) => `${n} time${n === 1 ? "" : "s"}`,
    statsLink: "📊 View Number Frequency Stats",
    aboutLink: "ℹ️ About This Site",
    privacyLink: "🔒 Privacy Policy",
    infoTitle: "About This Generator",
    infoIntro: "This tool draws random numbers on the spot according to the rules of whichever country's lottery you pick. It does not sell tickets or process any purchase, and the numbers it generates never guarantee a win.",
    infoRandomTitle: "How are the numbers generated?",
    infoRandom: "Each drawing is statistically independent of past results. A number that has appeared often in the past is not more likely to be drawn next time.",
    infoOddsTitle: "Odds of Winning",
    infoOddsLabel: (odds) => `The jackpot odds for the currently selected game are about 1 in ${odds}.`,
    infoStatsNote: "You can check each number's real historical draw frequency on this site's stats page.",
    infoDisclaimer: "This service is an entertainment tool for adults and does not encourage excessive lottery spending.",
    seoDrawsLink: "📅 Draw Archive",
    seoNumbersLink: "🔢 Number Frequency",
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
    selectBtn: "⭐ この番号を選ぶ",
    selectedBtn: "✅ 選択済み",
    wishMessage: "この番号が当たりますように！🍀✨",
    timesLabel: (n) => `${n}回`,
    statsLink: "📊 番号別当選統計を見る",
    aboutLink: "ℹ️ サイト紹介",
    privacyLink: "🔒 プライバシーポリシー",
    infoTitle: "番号生成機について",
    infoIntro: "このツールは選択した国の宝くじルールに従って、その場でランダムに番号を選ぶ娯楽用ジェネレーターです。実際の宝くじの購入や当選を代行するものではなく、生成された番号が当選を保証することはありません。",
    infoRandomTitle: "番号はどのように生成されますか？",
    infoRandom: "各抽選は過去の結果と統計的に独立した事象です。過去によく出た番号だからといって、次回当選しやすくなるわけではありません。",
    infoOddsTitle: "当選確率",
    infoOddsLabel: (odds) => `現在選択中のゲームの1等当選確率は約${odds}分の1です。`,
    infoStatsNote: "番号ごとの実際の過去当選頻度は、このサイトの統計ページで確認できます。",
    infoDisclaimer: "本サービスは成人向けの娯楽用ツールであり、過度な宝くじ購入を推奨するものではありません。",
    seoDrawsLink: "📅 抽せんアーカイブ",
    seoNumbersLink: "🔢 番号別出現回数",
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
    selectBtn: "⭐ Scegli questo",
    selectedBtn: "✅ Selezionato",
    wishMessage: "Che questi numeri ti portino il jackpot! 🍀✨",
    timesLabel: (n) => `${n} volte`,
    statsLink: "📊 Vedi le statistiche dei numeri",
    aboutLink: "ℹ️ Chi siamo",
    privacyLink: "🔒 Informativa sulla privacy",
    infoTitle: "Informazioni sul generatore",
    infoIntro: "Questo strumento estrae numeri casuali sul momento secondo le regole della lotteria del paese selezionato. Non vende biglietti né gestisce acquisti, e i numeri generati non garantiscono mai una vincita.",
    infoRandomTitle: "Come vengono generati i numeri?",
    infoRandom: "Ogni estrazione è statisticamente indipendente dai risultati precedenti. Un numero uscito spesso in passato non ha più probabilità di essere estratto la prossima volta.",
    infoOddsTitle: "Probabilità di vincita",
    infoOddsLabel: (odds) => `Le probabilità di fare jackpot con il gioco selezionato sono di circa 1 su ${odds}.`,
    infoStatsNote: "La frequenza storica reale di ogni numero è consultabile nella pagina delle statistiche di questo sito.",
    infoDisclaimer: "Questo servizio è uno strumento di intrattenimento per adulti e non incoraggia un gioco eccessivo.",
    seoDrawsLink: "📅 Archivio Estrazioni",
    seoNumbersLink: "🔢 Frequenza Numeri",
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
