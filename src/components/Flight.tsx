"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore, type CSSProperties } from "react";
import type { Dict } from "@/content/dict";
import type { Locale } from "@/content/i18n";
import { scrollToSection } from "@/lib/platform";

/** Остановки полёта — разделы главной; расстояние от Земли, км (средние, округлённые). */
const STOPS = [
  { id: "top", km: 0 }, // Чирчик
  { id: "demo", km: 408 }, // орбита МКС
  { id: "works", km: 384_400 }, // Луна
  { id: "method", km: 2.25e8 }, // Марс
  { id: "play", km: 4.1e8 }, // пояс астероидов
  { id: "contact", km: 6.3e8 }, // Юпитер
  { id: "foot", km: 4.011e13 }, // Проксима b — 4,24 светового года
] as const;
const LAST = STOPS.length - 1;
const LY = 9.4607e12;

const PC = "(min-width: 1024px)";
const subPc = (cb: () => void) => {
  const m = window.matchMedia(PC);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const isPc = () => window.matchMedia(PC).matches;

/** «Полёт» (ПК, только главная): прокрутка страницы — путь от Чирчика через орбиту МКС, Луну, Марс,
 *  пояс астероидов и Юпитер к планете Проксима b — той, что восходит в подвале. Слева рельс с остановками
 *  (клик — перейти к разделу) и ракета, рядом с ней — куда летим и сколько пролетели. Между остановками
 *  расстояние растёт по логарифму, поэтому к концу счётчик разгоняется до световых лет. */
export function Flight({ lang, t }: { lang: Locale; t: Dict["flight"] }) {
  const pc = useSyncExternalStore(subPc, isPc, () => false);
  const home = /^\/(ru|uz|en)\/?$/.test(usePathname());
  return pc && home ? <Rail lang={lang} t={t} /> : null;
}

function Rail({ lang, t }: { lang: Locale; t: Dict["flight"] }) {
  const ref = useRef<HTMLElement>(null);
  const readRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const read = readRef.current;
    if (!el || !read) return;
    const items = [...el.querySelectorAll<HTMLElement>("li")];
    const n0 = new Intl.NumberFormat(lang, { maximumFractionDigits: 0 });
    const n1 = new Intl.NumberFormat(lang, { maximumFractionDigits: 1 });
    const n2 = new Intl.NumberFormat(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const big = (v: number) => (v < 10 ? n1 : n0).format(v);
    const dist = (km: number) => {
      if (km < 1e6) return `${n0.format(Math.round(km))} ${t.km}`;
      if (km < 1e9) return `${big(km / 1e6)} ${t.mkm}`;
      if (km < 1e12) return `${big(km / 1e9)} ${t.bkm}`;
      if (km < 0.1 * LY) return `${big(km / 1e12)} ${t.tkm}`;
      return `${n2.format(km / LY)} ${t.ly}`;
    };

    let raf = 0;
    let idle = 0;
    let shown = "";
    let at = -1;
    let prevY = window.scrollY;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const y = window.scrollY;
      const line = y + vh * 0.5;
      // где на странице остановки: старт — самый верх, прибытие — самый низ, между ними — разделы
      const pos = STOPS.map((s, i) => {
        if (i === 0) return vh * 0.5;
        if (i === LAST) return document.documentElement.scrollHeight - vh * 0.5;
        const node = document.getElementById(s.id);
        return node ? node.getBoundingClientRect().top + y : Number.NaN;
      });
      let k = 0;
      pos.forEach((v, i) => {
        if (v <= line) k = i;
      });
      const next = Math.min(k + 1, LAST);
      const span = pos[next] - pos[k];
      const f = k === LAST || !(span > 0) ? 0 : Math.min(Math.max((line - pos[k]) / span, 0), 1);
      const a = Math.log10(STOPS[k].km + 1);
      const b = Math.log10(STOPS[next].km + 1);
      const km = 10 ** (a + (b - a) * f) - 1;
      const p = (k + f) / LAST;
      el.style.setProperty("--p", p.toFixed(4));
      // скорость прокрутки — длина пламени
      const v = Math.min(Math.abs(y - prevY) / 60, 1);
      prevY = y;
      el.style.setProperty("--v", v.toFixed(2));
      if (v > 0.02) {
        el.dataset.moving = "";
        clearTimeout(idle);
        idle = window.setTimeout(() => delete el.dataset.moving, 220);
      }
      el.toggleAttribute("data-flip", p > 0.5);
      if (k !== at) {
        at = k;
        items.forEach((li, i) => li.toggleAttribute("data-on", i <= k));
      }
      const there = k === LAST || f < 0.03;
      const name = there ? t.stops[k] : `→ ${t.stops[next]}`;
      const text = `${name} · ${dist(km)}${k === LAST ? ` · ${t.arrived}` : ""}`;
      if (text !== shown) {
        shown = text;
        read.textContent = text;
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    const ro = new ResizeObserver(kick);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(idle);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      ro.disconnect();
    };
  }, [lang, t]);

  const go = (id: string) => {
    if (id !== "foot") {
      scrollToSection(id);
      return;
    }
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  };

  return (
    <nav ref={ref} className="flight" aria-label={t.label}>
      <i className="flight-track" aria-hidden="true" />
      <ol>
        {STOPS.map((s, i) => (
          <li key={s.id} style={{ "--i": i / LAST } as CSSProperties}>
            <button type="button" className="flight-stop" onClick={() => go(s.id)} aria-label={t.stops[i]}>
              <span className="flight-tip" aria-hidden="true">
                {t.stops[i]}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <span className="flight-ship" aria-hidden="true">
        <svg viewBox="0 0 14 26">
          <defs>
            <linearGradient id="flight-flame" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#fff3c4" />
              <stop offset="0.35" stopColor="#ffb35c" />
              <stop offset="1" stopColor="#ff6aa8" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path className="flight-flame" d="M7 0.5C9.6 4.5 9.4 7.5 7 10C4.6 7.5 4.4 4.5 7 0.5Z" />
          <path className="flight-fins" d="M4.2 10.5L1 8.5L1.6 13.6L4.2 14.6ZM9.8 10.5L13 8.5L12.4 13.6L9.8 14.6Z" />
          <path className="flight-body" d="M7 25.5C10.6 21.5 11 15.5 10 10L4 10C3 15.5 3.4 21.5 7 25.5Z" />
          <circle className="flight-window" cx="7" cy="17" r="1.7" />
        </svg>
      </span>
      <span ref={readRef} className="flight-read" aria-hidden="true" />
    </nav>
  );
}
