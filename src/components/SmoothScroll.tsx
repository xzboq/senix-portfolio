"use client";

import { useEffect } from "react";

const PC = "(min-width: 1024px) and (pointer: fine)";
const CALM = "(prefers-reduced-motion: reduce)";
const LOCKED = /^(hidden|clip)$/;

/** Инерционная прокрутка колесом — только на ПК и без «уменьшить движение».
 *  Колесо сдвигает цель, страница догоняет её с затуханием. Клавиатура, полоса прокрутки, якоря,
 *  переходы между страницами и вложенные прокручиваемые блоки работают как обычно: любая «чужая»
 *  прокрутка просто сбрасывает цель. Пока открыта палитра команд (body overflow: hidden) — не вмешивается. */
export function SmoothScroll() {
  useEffect(() => {
    const pc = window.matchMedia(PC);
    const calm = window.matchMedia(CALM);
    const root = document.documentElement;
    let on = false;
    let raf = 0;
    let last = 0;
    let target = 0;
    let current = 0;
    let applied = -1;

    const max = () => root.scrollHeight - window.innerHeight;
    const halt = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      applied = -1;
    };

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64);
      last = now;
      target = Math.min(target, max()); // страница могла стать короче
      current += (target - current) * (1 - Math.exp(-dt / 110));
      if (Math.abs(target - current) < 0.5) current = target;
      window.scrollTo({ top: current, behavior: "instant" });
      applied = window.scrollY;
      raf = current === target ? 0 : requestAnimationFrame(tick);
      if (!raf) applied = -1;
    };

    // можно ли отдать колесо вложенному блоку (список палитры, поле ввода с прокруткой и т. п.)
    const nested = (from: EventTarget | null, dy: number) => {
      for (let el = from instanceof Element ? from : null; el && el !== document.body && el !== root; el = el.parentElement) {
        if (el.scrollHeight <= el.clientHeight + 1) continue;
        if (!/(auto|scroll)/.test(getComputedStyle(el).overflowY)) continue;
        if (dy < 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
      }
      return false;
    };

    const onWheel = (e: WheelEvent) => {
      if (e.defaultPrevented || e.ctrlKey) return;
      const dy = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      if (!dy || Math.abs(e.deltaX) > Math.abs(dy)) return;
      if (LOCKED.test(document.body.style.overflow) || nested(e.target, dy)) return;
      e.preventDefault();
      if (!raf) {
        current = target = window.scrollY;
        last = performance.now();
      }
      target = Math.min(Math.max(target + dy, 0), max());
      if (!raf && target !== current) raf = requestAnimationFrame(tick);
    };

    // прокрутка не от нас (клавиши, полоса, якорь, переход) — останавливаемся и не спорим
    const onScroll = () => {
      if (raf && applied >= 0 && Math.abs(window.scrollY - applied) > 2) halt();
    };

    const off = () => {
      halt();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", halt);
      window.removeEventListener("keydown", halt);
    };
    const sync = () => {
      const want = pc.matches && !calm.matches;
      if (want === on) return;
      on = want;
      if (on) {
        window.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("scroll", onScroll, { passive: true });
        // клик или клавиша гасят инерцию — как касание пальцем на телефоне
        window.addEventListener("pointerdown", halt);
        window.addEventListener("keydown", halt);
      } else {
        off();
      }
    };
    sync();
    pc.addEventListener("change", sync);
    calm.addEventListener("change", sync);
    return () => {
      pc.removeEventListener("change", sync);
      calm.removeEventListener("change", sync);
      off();
    };
  }, []);

  return null;
}
