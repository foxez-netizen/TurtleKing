function bandColor(n, max) {
  const ratio = n / max;
  if (ratio <= 0.2) return "yellow";
  if (ratio <= 0.4) return "blue";
  if (ratio <= 0.6) return "red";
  if (ratio <= 0.8) return "gray";
  return "green";
}

function isExcludeFormatValid(raw) {
  const trimmed = raw.trim();
  if (trimmed === "") return true;
  return /^\d+(\s*,\s+\d+)*$/.test(trimmed);
}

function parseExclude(raw, max) {
  return new Set(
    raw
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= max)
  );
}

function pickUnique(count, min, max, excluded) {
  const pool = [];
  for (let i = min; i <= max; i++) {
    if (!excluded || !excluded.has(i)) pool.push(i);
  }
  if (pool.length < count) {
    throw new Error(APP_I18N.t("excludeError"));
  }
  const picked = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picked.sort((a, b) => a - b);
}

function generateOneGame(config, excludedMain) {
  const main = pickUnique(config.main.count, config.main.min, config.main.max, excludedMain);
  const bonus = config.bonus
    ? pickUnique(config.bonus.count, config.bonus.min, config.bonus.max, null)
    : [];
  return { main, bonus };
}

function populateGameSelect() {
  const select = document.getElementById("game");
  Object.entries(GAMES).forEach(([key, config]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = `${config.flag} ${config.country} · ${config.name}`;
    select.appendChild(option);
  });
  if (GAMES[APP_I18N.game]) {
    select.value = APP_I18N.game;
  }
}

function populateQuickFlags() {
  const container = document.getElementById("quick-flags");
  container.setAttribute("aria-label", APP_I18N.t("quickFlagsLabel"));
  Object.entries(GAMES).forEach(([key, config]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "flag-btn";
    btn.setAttribute("aria-label", `${config.country} ${config.name}`);
    btn.dataset.game = key;

    const icon = document.createElement("span");
    icon.className = "flag-icon";
    icon.textContent = config.flag;
    btn.appendChild(icon);

    const text = document.createElement("span");
    text.className = "flag-text";

    const country = document.createElement("span");
    country.className = "flag-country";
    country.textContent = config.country;
    text.appendChild(country);

    const game = document.createElement("span");
    game.className = "flag-game";
    game.textContent = config.name;
    text.appendChild(game);

    btn.appendChild(text);
    container.appendChild(btn);
  });
}

function populateCountSelect() {
  const select = document.getElementById("count");
  const current = select.value || "5";
  select.innerHTML = "";
  for (let n = 1; n <= 5; n++) {
    const option = document.createElement("option");
    option.value = n;
    option.textContent = APP_I18N.t("countOption", n);
    select.appendChild(option);
  }
  select.value = current;
}

function applyGameLanguage(key) {
  const lang = APP_I18N.gameLang(key);
  if (lang !== APP_I18N.lang) {
    APP_I18N.setLang(lang);
  }
  document.documentElement.lang = APP_I18N.lang;
  document.getElementById("quick-flags").setAttribute("aria-label", APP_I18N.t("quickFlagsLabel"));
  populateCountSelect();
}

function updateGameInfo() {
  const key = document.getElementById("game").value;
  const config = GAMES[key];
  const info = document.getElementById("game-info");
  let text = APP_I18N.t("mainInfo", config.main.min, config.main.max, config.main.count);
  if (config.bonus) {
    text += APP_I18N.t("bonusInfo", config.bonus.label, config.bonus.min, config.bonus.max, config.bonus.count);
  }
  info.textContent = text;
}

function makeBallWrap(n, className, freqCount) {
  const wrap = document.createElement("div");
  wrap.className = "ball-wrap";

  const ball = document.createElement("div");
  ball.className = className;
  ball.textContent = n;
  wrap.appendChild(ball);

  if (freqCount != null) {
    const freq = document.createElement("span");
    freq.className = "ball-freq";
    freq.textContent = APP_I18N.t("timesLabel", freqCount);
    wrap.appendChild(freq);
  }

  return wrap;
}

function renderGames(config, games, stats) {
  const results = document.getElementById("results");
  results.innerHTML = "";
  games.forEach((game, i) => {
    const row = document.createElement("div");
    row.className = "game-row";
    row.style.animationDelay = `${i * 60}ms`;

    const label = document.createElement("div");
    label.className = "game-label";
    label.textContent = APP_I18N.t("gameRowLabel", i + 1);
    row.appendChild(label);

    const balls = document.createElement("div");
    balls.className = "balls";
    game.main.forEach((n) => {
      const freqCount = stats && stats.main ? stats.main[String(n)] : null;
      balls.appendChild(makeBallWrap(n, `ball ${bandColor(n, config.main.max)}`, freqCount));
    });

    if (game.bonus.length > 0) {
      const divider = document.createElement("div");
      divider.className = "ball-divider";
      divider.textContent = "+";
      balls.appendChild(divider);

      game.bonus.forEach((n) => {
        const freqCount = stats && stats.bonus ? stats.bonus[String(n)] : null;
        balls.appendChild(makeBallWrap(n, `ball bonus ${bandColor(n, config.bonus.max)}`, freqCount));
      });
    }

    row.appendChild(balls);

    const selectBtn = document.createElement("button");
    selectBtn.type = "button";
    selectBtn.className = "select-btn";
    selectBtn.textContent = APP_I18N.t("selectBtn");
    row.appendChild(selectBtn);

    results.appendChild(row);
  });
}

document.getElementById("results").addEventListener("click", (e) => {
  const btn = e.target.closest(".select-btn");
  if (!btn) return;
  const row = btn.closest(".game-row");
  const selected = row.classList.toggle("selected");
  if (selected) {
    btn.textContent = APP_I18N.t("selectedBtn");
    const rect = btn.getBoundingClientRect();
    celebrateAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
    showWishToast(APP_I18N.t("wishMessage"));
  } else {
    btn.textContent = APP_I18N.t("selectBtn");
  }
});

function selectGame(key) {
  document.getElementById("game").value = key;
  applyGameLanguage(key);
  updateGameInfo();
  document.getElementById("generate").click();
}

const excludeInput = document.getElementById("exclude");
const excludeHint = document.getElementById("exclude-hint");

function validateExcludeFormat() {
  const invalid = !isExcludeFormatValid(excludeInput.value);
  excludeHint.hidden = !invalid;
  excludeInput.classList.toggle("exclude-invalid", invalid);
}

excludeInput.addEventListener("input", validateExcludeFormat);

populateGameSelect();
populateQuickFlags();
applyGameLanguage(document.getElementById("game").value);
updateGameInfo();

document.getElementById("game").addEventListener("change", () => {
  selectGame(document.getElementById("game").value);
});

document.getElementById("quick-flags").addEventListener("click", (e) => {
  const btn = e.target.closest(".flag-btn");
  if (!btn) return;
  selectGame(btn.dataset.game);
});

document.getElementById("generate").addEventListener("click", () => {
  const key = document.getElementById("game").value;
  const config = GAMES[key];
  const count = parseInt(document.getElementById("count").value, 10);
  const excludeRaw = document.getElementById("exclude").value;
  const excludedMain = parseExclude(excludeRaw, config.main.max);

  try {
    const games = [];
    for (let i = 0; i < count; i++) {
      games.push(generateOneGame(config, excludedMain));
    }
    loadGameStats(key).then((stats) => renderGames(config, games, stats));
  } catch (err) {
    const results = document.getElementById("results");
    results.innerHTML = `<p style="color:#ff7272; text-align:center;">${err.message}</p>`;
  }
});

// Generate an initial set on load
document.getElementById("generate").click();
