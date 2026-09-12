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
      const ball = document.createElement("div");
      ball.className = `ball ${ballColor(n)}`;
      ball.textContent = n;
      balls.appendChild(ball);
    });
    row.appendChild(balls);

    results.appendChild(row);
  });
}

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

// Generate an initial set on load
document.getElementById("generate").click();
