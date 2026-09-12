const GAMES = {
  kr645: {
    flag: "🇰🇷",
    country: "대한민국",
    name: "로또 6/45",
    main: { count: 6, min: 1, max: 45 },
  },
  powerball: {
    flag: "🇺🇸",
    country: "United States",
    name: "Powerball",
    main: { count: 5, min: 1, max: 69 },
    bonus: { label: "PB", count: 1, min: 1, max: 26 },
  },
  megamillions: {
    flag: "🇺🇸",
    country: "United States",
    name: "Mega Millions",
    main: { count: 5, min: 1, max: 70 },
    bonus: { label: "MB", count: 1, min: 1, max: 25 },
  },
  euromillions: {
    flag: "🇪🇺",
    country: "Europe",
    name: "EuroMillions",
    main: { count: 5, min: 1, max: 50 },
    bonus: { label: "★", count: 2, min: 1, max: 12 },
  },
  uklotto: {
    flag: "🇬🇧",
    country: "United Kingdom",
    name: "UK Lotto",
    main: { count: 6, min: 1, max: 59 },
  },
  loto6: {
    flag: "🇯🇵",
    country: "日本",
    name: "ロト6",
    main: { count: 6, min: 1, max: 43 },
  },
  auspowerball: {
    flag: "🇦🇺",
    country: "Australia",
    name: "Powerball",
    main: { count: 7, min: 1, max: 35 },
    bonus: { label: "PB", count: 1, min: 1, max: 20 },
  },
  superenalotto: {
    flag: "🇮🇹",
    country: "Italia",
    name: "SuperEnalotto",
    main: { count: 6, min: 1, max: 90 },
  },
};

const GAME_STATS_CACHE = {};

function loadGameStats(key) {
  if (GAME_STATS_CACHE[key]) return GAME_STATS_CACHE[key];
  GAME_STATS_CACHE[key] = fetch(`/data/${key}.json`)
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null);
  return GAME_STATS_CACHE[key];
}
