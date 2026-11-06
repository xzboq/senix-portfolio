/** «Гиперпрыжок»: на секунду с небольшим экран затягивает звёздными лучами из центра, вспышка — и обратно.
 *  Холст создаётся на время эффекта и сразу удаляется. При «уменьшить движение» ничего не делает. */
export function hyperjump() {
  if (document.querySelector(".jump") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = document.createElement("canvas");
  c.className = "jump";
  c.setAttribute("aria-hidden", "true");
  document.body.append(c);
  window.dispatchEvent(new Event("utkir:jump")); // туманность вспыхивает вместе с прыжком
  const x = c.getContext("2d");
  if (!x) {
    c.remove();
    return;
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const w = window.innerWidth;
  const h = window.innerHeight;
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  x.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cx = w / 2;
  const cy = h / 2;
  const M = Math.max(w, h);
  const light = document.documentElement.dataset.theme === "light";
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#07070c";
  const col = light ? "108,92,231" : "205,196,255";
  const stars = Array.from({ length: 380 }, () => {
    const d = Math.random() * M * 0.08;
    return { a: Math.random() * Math.PI * 2, d, p: d, s: 0.5 + Math.random() * 1.7 };
  });
  const t0 = performance.now();
  const frame = (now: number) => {
    const k = (now - t0) / 1000;
    if (k > 1.5 || !c.isConnected) return;
    x.globalAlpha = 0.3;
    x.fillStyle = bg;
    x.fillRect(0, 0, w, h);
    x.globalAlpha = 1;
    // скорость растёт по кубу — разгон, потом лучи через весь экран
    const v = 1.5 + Math.pow(Math.min(k, 1.1) * 2.4, 3) * 5;
    for (const s of stars) {
      const ca = Math.cos(s.a);
      const sa = Math.sin(s.a);
      s.p = s.d;
      s.d += v * s.s * (0.35 + (s.d / M) * 2);
      x.strokeStyle = `rgba(${col},${Math.min(1, s.d / (M * 0.25)).toFixed(3)})`;
      x.lineWidth = Math.min(2.6, 0.5 + s.d / (M * 0.33));
      x.beginPath();
      x.moveTo(cx + ca * s.p, cy + sa * s.p);
      x.lineTo(cx + ca * s.d, cy + sa * s.d);
      x.stroke();
      if (s.d > M) {
        s.d = Math.random() * M * 0.05;
        s.p = s.d;
      }
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  window.setTimeout(() => c.remove(), 1700);
}
