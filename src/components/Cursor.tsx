"use client";

import { useEffect, useRef } from "react";

/** Светящееся кольцо за курсором — только ПК с мышью и без «уменьшить движение».
 *  Мягко догоняет курсор, раздувается над ссылками и кнопками, над полями ввода сжимается,
 *  а над карточками проектов становится диском с подписью из data-cursor.
 *  Системный курсор остаётся на месте — кольцо только подсказывает. */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const label = el?.firstElementChild as HTMLElement | null;
    if (!el || !label) return;
    if (!window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    let shown = false;
    const loop = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.15 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      if (!shown) {
        x = tx;
        y = ty;
        shown = true;
        el.dataset.on = "";
      }
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const card = t?.closest?.("[data-cursor]") as HTMLElement | null;
      if (card) {
        label.textContent = card.dataset.cursor ?? "";
        el.dataset.state = "label";
      } else if (t?.closest?.("input, textarea, select")) {
        el.dataset.state = "text";
      } else if (t?.closest?.("a, button, label, summary, [role='button']")) {
        el.dataset.state = "link";
      } else {
        delete el.dataset.state;
      }
    };
    const onOut = (e: PointerEvent) => {
      if (e.relatedTarget) return;
      delete el.dataset.on;
      shown = false;
    };
    const onDown = () => {
      el.dataset.down = "";
    };
    const onUp = () => {
      delete el.dataset.down;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div ref={ref} className="cursor" aria-hidden="true">
      <span />
    </div>
  );
}
