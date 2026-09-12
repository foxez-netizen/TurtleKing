function populateWorldQuickLinks() {
  const container = document.getElementById("world-quick-flags");
  if (!container) return;
  Object.entries(GAMES).forEach(([key, config]) => {
    const link = document.createElement("a");
    link.className = "flag-btn";
    link.href = `world.html?game=${key}&lang=${APP_I18N.gameLang(key)}`;
    link.setAttribute("aria-label", `${config.country} ${config.name}`);

    const icon = document.createElement("span");
    icon.className = "flag-icon";
    icon.textContent = config.flag;
    link.appendChild(icon);

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

    link.appendChild(text);
    container.appendChild(link);
  });
}

populateWorldQuickLinks();

function ballColor(n) {
  if (n <= 10) return "yellow";
  if (n <= 20) return "blue";
  if (n <= 30) return "red";
  if (n <= 40) return "gray";
  return "green";
}

function isExcludeFormatValid(raw) {
  const trimmed = raw.trim();
  if (trimmed === "") return true;
  return /^\d+(\s*,\s+\d+)*$/.test(trimmed);
}

function parseExclude(raw) {
  return new Set(
    raw
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 45)
  );
}

function generateOneGame(excluded) {
  const pool = [];
  for (let i = 1; i <= 45; i++) {
    if (!excluded.has(i)) pool.push(i);
  }
  if (pool.length < 6) {
    throw new Error("제외한 번호가 너무 많아 6개를 뽑을 수 없어요.");
  }
  const picked = [];
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picked.sort((a, b) => a - b);
}

let KR645_STATS = null;
const KR645_STATS_READY = loadGameStats("kr645").then((stats) => {
  KR645_STATS = stats;
});

function renderGames(games) {
  const results = document.getElementById("results");
  results.innerHTML = "";
  games.forEach((nums, i) => {
    const row = document.createElement("div");
    row.className = "game-row";
    row.style.animationDelay = `${i * 60}ms`;

    const label = document.createElement("div");
    label.className = "game-label";
    label.textContent = `${i + 1}게임`;
    row.appendChild(label);

    const balls = document.createElement("div");
    balls.className = "balls";
    nums.forEach((n) => {
      const wrap = document.createElement("div");
      wrap.className = "ball-wrap";

      const ball = document.createElement("div");
      ball.className = `ball ${ballColor(n)}`;
      ball.textContent = n;
      wrap.appendChild(ball);

      const freqCount = KR645_STATS && KR645_STATS.main ? KR645_STATS.main[String(n)] : null;
      if (freqCount != null) {
        const freq = document.createElement("span");
        freq.className = "ball-freq";
        freq.textContent = `${freqCount}회`;
        wrap.appendChild(freq);
      }

      balls.appendChild(wrap);
    });
    row.appendChild(balls);

    const selectBtn = document.createElement("button");
    selectBtn.type = "button";
    selectBtn.className = "select-btn";
    selectBtn.textContent = "⭐ 이 번호 선택";
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
    btn.textContent = "✅ 선택됨";
    const rect = btn.getBoundingClientRect();
    celebrateAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
    showWishToast("이 번호가 당첨되길 기원합니다! 🍀✨");
  } else {
    btn.textContent = "⭐ 이 번호 선택";
  }
});

const excludeInput = document.getElementById("exclude");
const excludeHint = document.getElementById("exclude-hint");

function validateExcludeFormat() {
  const invalid = !isExcludeFormatValid(excludeInput.value);
  excludeHint.hidden = !invalid;
  excludeInput.classList.toggle("exclude-invalid", invalid);
}

excludeInput.addEventListener("input", validateExcludeFormat);

document.getElementById("generate").addEventListener("click", () => {
  const count = parseInt(document.getElementById("count").value, 10);
  const excludeRaw = document.getElementById("exclude").value;
  const excluded = parseExclude(excludeRaw);

  try {
    const games = [];
    for (let i = 0; i < count; i++) {
      games.push(generateOneGame(excluded));
    }
    renderGames(games);
  } catch (err) {
    const results = document.getElementById("results");
    results.innerHTML = `<p style="color:#ff7272; text-align:center;">${err.message}</p>`;
  }
});

// Generate an initial set on load, once frequency stats are ready (or have failed to load)
KR645_STATS_READY.finally(() => {
  document.getElementById("generate").click();
});
