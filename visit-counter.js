// Small visitor-count banner. Counts one visit per browser session on the
// live domain (abacus.jasoncameron.dev, free JSON counter), and only reads
// the numbers everywhere else (local preview, etc.) so testing doesn't inflate them.
(function () {
  const el = document.getElementById("visit-counter");
  if (!el) return;

  const API = "https://abacus.jasoncameron.dev";
  const NS = "luckyturtle-life";
  const LIVE = location.hostname === "luckyturtle.life" || location.hostname === "www.luckyturtle.life";

  // Day key in KST so "오늘" resets at Korean midnight.
  const kst = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10).replace(/-/g, "");
  const keys = { total: "total", today: "d" + kst };

  let counted = false;
  try { counted = sessionStorage.getItem("lt-visit-counted") === "1"; } catch (e) {}
  const mode = LIVE && !counted ? "hit" : "get";

  const fetchCount = (key) =>
    fetch(`${API}/${mode}/${NS}/${key}`)
      .then((r) => (r.ok ? r.json() : { value: 0 }))
      .then((d) => d.value || 0)
      .catch(() => null);

  Promise.all([fetchCount(keys.today), fetchCount(keys.total)]).then(([today, total]) => {
    if (today === null && total === null) return; // service unreachable: keep banner hidden
    if (mode === "hit") {
      try { sessionStorage.setItem("lt-visit-counted", "1"); } catch (e) {}
    }
    const fmt = (n) => (n === null ? "-" : n.toLocaleString("ko-KR"));
    el.querySelector("[data-vc=today]").textContent = fmt(today);
    el.querySelector("[data-vc=total]").textContent = fmt(total);
    el.hidden = false;
  });
})();
