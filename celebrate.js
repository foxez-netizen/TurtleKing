const CONFETTI_COLORS = ["#fbbf24", "#f59e0b", "#6366f1", "#a855f7", "#22c55e", "#ef4444"];

function celebrateAt(x, y) {
  if (typeof confetti !== "function") return;
  const origin =
    x != null && y != null
      ? { x: x / window.innerWidth, y: y / window.innerHeight }
      : { y: 0.6 };

  confetti({
    particleCount: 90,
    spread: 70,
    startVelocity: 38,
    ticks: 200,
    origin,
    colors: CONFETTI_COLORS,
  });
  confetti({
    particleCount: 40,
    spread: 100,
    startVelocity: 25,
    scalar: 0.7,
    origin,
    colors: CONFETTI_COLORS,
  });
}

function showWishToast(message) {
  const existing = document.querySelector(".wish-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "wish-toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 2400);
}
