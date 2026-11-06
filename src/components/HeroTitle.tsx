"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

const Q = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";
const CALM = "(prefers-reduced-motion: reduce)";
const HEAVY = 800; // начертание заголовка
const THIN = 220; // буквы прямо под курсором

const subscribe = (cb: () => void) => {
  const a = window.matchMedia(Q);
  const b = window.matchMedia(CALM);
  a.addEventListener("change", cb);
  b.addEventListener("change", cb);
  return () => {
    a.removeEventListener("change", cb);
    b.removeEventListener("change", cb);
  };
};
const live = () => window.matchMedia(Q).matches && !window.matchMedia(CALM).matches;

/** Главный заголовок. На ПК с мышью он «жидкий»: буквы рядом с курсором плавно становятся тонкими
 *  (вариативный шрифт, ось начертания), дальние остаются жирными. На сервере и на телефоне —
 *  обычный текст, на ПК буквы разбиваются после загрузки; имя заголовка — целиком из aria-label. */
export function HeroTitle({ lines }: { lines: readonly string[] }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const split = useSyncExternalStore(subscribe, live, () => false);
  const label = `${lines[0]} ${lines[1]}.`;

  useEffect(() => {
    const h1 = ref.current;
    if (!split || !h1) return;
    const rows = [...h1.querySelectorAll<HTMLElement>(".mega-l")];
    const els = [...h1.querySelectorAll<HTMLElement>(".mg-c")];
    // центры букв относительно левого края своей строки — в покое, при обычном начертании.
    // Строка выровнена влево, поэтому от ширины соседей эти точки не зависят — без обратной связи.
    let at: { row: number; x: number; y: number }[] = [];
    const cur = els.map(() => HEAVY);
    const shown = els.map(() => HEAVY);
    let radius = 140;
    let mx = -1e5;
    let my = -1e5;
    let raf = 0;
    let near = false;

    const measure = () => {
      for (const el of els) el.style.fontWeight = "";
      cur.fill(HEAVY);
      shown.fill(HEAVY);
      const boxes = rows.map((r) => r.getBoundingClientRect());
      at = els.map((el) => {
        const row = rows.findIndex((r) => r.contains(el));
        const b = el.getBoundingClientRect();
        return { row, x: b.left + b.width / 2 - boxes[row].left, y: b.top + b.height / 2 - boxes[row].top };
      });
      radius = parseFloat(getComputedStyle(h1).fontSize) * 1.15;
    };

    const tick = () => {
      raf = 0;
      const boxes = rows.map((r) => r.getBoundingClientRect());
      const box = h1.getBoundingClientRect();
      near = mx > box.left - radius && mx < box.right + radius && my > box.top - radius && my < box.bottom + radius;
      let busy = false;
      for (let i = 0; i < els.length; i++) {
        const p = at[i];
        const b = boxes[p.row];
        let want = HEAVY;
        if (near) {
          const dx = b.left + p.x - mx;
          const dy = (b.top + p.y - my) * 1.25;
          want = HEAVY - (HEAVY - THIN) * Math.exp(-(dx * dx + dy * dy) / (radius * radius));
        }
        cur[i] += (want - cur[i]) * 0.16;
        if (Math.abs(want - cur[i]) < 0.6) cur[i] = want;
        else busy = true;
        const wv = Math.round(cur[i]);
        if (wv !== shown[i]) {
          els[i].style.fontWeight = wv === HEAVY ? "" : String(wv);
          shown[i] = wv;
        }
      }
      if (busy) raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      kick();
    };
    const onOut = (e: PointerEvent) => {
      if (e.relatedTarget) return;
      mx = my = -1e5;
      kick();
    };
    const onResize = () => {
      measure();
      kick();
    };

    measure();
    document.fonts?.ready.then(() => {
      if (ref.current) measure();
    });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onOut);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onOut);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", onResize);
      for (const el of els) el.style.fontWeight = "";
    };
  }, [split]);

  const letters = (text: string) => Array.from(text).map((ch, i) => <span key={i} className="mg-c">{ch}</span>);

  return (
    <h1 ref={ref} id="hero-h" className="mega" aria-label={split ? label : undefined}>
      <span className="mega-l" aria-hidden={split || undefined}>
        {split ? letters(lines[0]) : lines[0]}
      </span>
      <span className="mega-l" aria-hidden={split || undefined}>
        {split ? letters(lines[1]) : lines[1]}
        <span className="mega-dot">.</span>
      </span>
    </h1>
  );
}
