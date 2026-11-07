/** «Сигнал»: при отправке формы от кнопки расходятся радиоволны, и световой импульс улетает к краю
 *  экрана — сообщение уходит в Telegram. Только ПК и без «уменьшить движение». Возвращает, сколько
 *  миллисекунд подождать перед открытием Telegram, чтобы импульс успели увидеть (0 — открывать сразу;
 *  браузеры разрешают открыть вкладку в пределах секунды после клика). */
export function launchSignal(from: HTMLElement): number {
  if (!window.matchMedia("(min-width: 1024px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
  const r = from.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const layer = document.createElement("div");
  layer.className = "signal";
  layer.setAttribute("aria-hidden", "true");
  layer.style.left = `${x}px`;
  layer.style.top = `${y}px`;
  document.body.append(layer);

  for (let i = 0; i < 3; i++) {
    const ring = document.createElement("i");
    layer.append(ring);
    ring.animate(
      [
        { transform: "translate(-50%, -50%) scale(0.3)", opacity: 0.9 },
        { transform: "translate(-50%, -50%) scale(6)", opacity: 0 },
      ],
      { duration: 1300, delay: i * 200, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)", fill: "both" },
    );
  }

  // импульс — к верхнему правому углу, хвост смотрит назад
  const dx = window.innerWidth - 60 - x;
  const dy = 40 - y;
  const bolt = document.createElement("b");
  bolt.style.setProperty("--a", `${Math.atan2(dy, dx)}rad`);
  layer.append(bolt);
  bolt.animate(
    [
      { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
      { opacity: 1, offset: 0.75 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.5)`, opacity: 0 },
    ],
    { duration: 900, delay: 120, easing: "cubic-bezier(0.55, 0, 0.8, 0.4)", fill: "both" },
  );
  window.setTimeout(() => layer.remove(), 1900);
  return 650;
}
