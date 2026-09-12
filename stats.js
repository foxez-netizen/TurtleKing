function bandColor(n, max) {
  const ratio = n / max;
  if (ratio <= 0.2) return "yellow";
  if (ratio <= 0.4) return "blue";
  if (ratio <= 0.6) return "red";
  if (ratio <= 0.8) return "gray";
  return "green";
}

let currentSort = "number";

function populateGameSelect() {
  const select = document.getElementById("stats-game");
  Object.entries(GAMES).forEach(([key, config]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = `${config.flag} ${config.country} · ${config.name}`;
    select.appendChild(option);
  });
}

function renderStatsGrid(container, poolConfig, statsObj, totalDraws) {
  container.innerHTML = "";
  const { min, max } = poolConfig;
  const entries = [];
  for (let n = min; n <= max; n++) {
    entries.push({ n, count: (statsObj && statsObj[String(n)]) || 0 });
  }

  const byFrequency = [...entries].sort((a, b) => b.count - a.count || a.n - b.n);
  const hotSet = new Set(byFrequency.slice(0, 3).map((e) => e.n));
  const coldSet = new Set(byFrequency.slice(-3).map((e) => e.n));

  const ordered = currentSort === "frequency" ? byFrequency : entries;

  ordered.forEach(({ n, count }) => {
    const cell = document.createElement("div");
    cell.className = "stat-cell";
    if (hotSet.has(n)) cell.classList.add("stat-hot");
    else if (coldSet.has(n)) cell.classList.add("stat-cold");

    const ball = document.createElement("div");
    ball.className = `ball ${bandColor(n, max)}`;
    ball.textContent = n;
    cell.appendChild(ball);

    if (hotSet.has(n) || coldSet.has(n)) {
      const badge = document.createElement("span");
      badge.className = "stat-badge";
      badge.textContent = hotSet.has(n) ? "🔥" : "❄️";
      cell.appendChild(badge);
    }

    const countEl = document.createElement("span");
    countEl.className = "stat-count";
    const pct = totalDraws ? ((count / totalDraws) * 100).toFixed(1) : "0.0";
    countEl.textContent = `${count}회 (${pct}%)`;
    cell.appendChild(countEl);

    container.appendChild(cell);
  });
}

function loadAndRender(key) {
  const config = GAMES[key];
  document.getElementById("stats-bonus").hidden = !config.bonus;

  loadGameStats(key).then((stats) => {
    const info = document.getElementById("stats-info");
    const source = document.getElementById("stats-source");
    const mainGrid = document.getElementById("stats-main-grid");
    const bonusGrid = document.getElementById("stats-bonus-grid");

    if (!stats || !stats.totalDraws) {
      info.textContent = "이 게임의 통계 데이터를 아직 준비하지 못했어요.";
      mainGrid.innerHTML = "";
      bonusGrid.innerHTML = "";
      source.textContent = "";
      return;
    }

    info.textContent = `총 ${stats.totalDraws.toLocaleString()}회차 데이터 기준 (${stats.asOf})`;
    source.textContent = `출처: ${stats.source}`;
    renderStatsGrid(mainGrid, config.main, stats.main, stats.totalDraws);
    if (config.bonus) {
      renderStatsGrid(bonusGrid, config.bonus, stats.bonus, stats.totalDraws);
    }
  });
}

populateGameSelect();

const initialGame = GAMES[APP_I18N.game] ? APP_I18N.game : "kr645";
document.getElementById("stats-game").value = initialGame;
loadAndRender(initialGame);

document.getElementById("stats-game").addEventListener("change", (e) => {
  loadAndRender(e.target.value);
});

document.querySelectorAll(".sort-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sort-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentSort = btn.dataset.sort;
    loadAndRender(document.getElementById("stats-game").value);
  });
});
