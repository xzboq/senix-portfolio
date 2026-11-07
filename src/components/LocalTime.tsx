"use client";

import { useSyncExternalStore } from "react";
import { fmt, type Dict } from "@/content/dict";

const clock = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tashkent", hour: "2-digit", minute: "2-digit", hour12: false });
const subscribe = (cb: () => void) => {
  const id = window.setInterval(cb, 15000);
  return () => window.clearInterval(id);
};
// фаза Луны: доля синодического месяца от известного новолуния (0 — новолуние, 0,5 — полнолуние)
const SYNODIC = 29.530588853;
const NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);
const moonPhase = (ms: number) => ((((ms - NEW_MOON) / 86400000 / SYNODIC) % 1) + 1) % 1;
// снимок — время и фаза (с округлением, чтобы между тиками строка не менялась)
const now = () => {
  const d = new Date();
  return `${clock.format(d)}|${moonPhase(d.getTime()).toFixed(2)}`;
};

/** Освещённая часть диска: лимб — полуокружность со стороны Солнца, терминатор — полуэллипс. */
function moonPath(phase: number, r = 5, c = 6) {
  const waxing = phase < 0.5;
  const k = Math.cos(2 * Math.PI * phase); // 1 — новолуние, −1 — полнолуние
  const rx = Math.abs(k) * r;
  const limb = waxing ? 1 : 0;
  const term = k > 0 === waxing ? 0 : 1;
  return `M ${c} ${c - r} A ${r} ${r} 0 0 ${limb} ${c} ${c + r} A ${rx.toFixed(2)} ${r} 0 0 ${term} ${c} ${c - r} Z`;
}

/** Местное время автора (Чирчик, UTC+5) в первом экране — только на ПК (CSS).
 *  Ночью подсказывает, что ответ будет утром и вместо точки показывает настоящую фазу Луны
 *  (подсказка — сколько диска освещено). На сервере пусто: время ставится после загрузки. */
export function LocalTime({ t }: { t: Dict["fun"] }) {
  const snap = useSyncExternalStore(subscribe, now, () => "");
  if (!snap) return null;
  const [time, ph] = snap.split("|");
  const phase = Number(ph);
  const h = Number(time.slice(0, 2));
  const night = h >= 23 || h < 8;
  const lit = Math.round(((1 - Math.cos(2 * Math.PI * phase)) / 2) * 100);
  return (
    <span className="clock-pill" data-night={night || undefined} title={night ? fmt(t.moon, { n: lit }) : undefined}>
      {night ? (
        <svg className="moon" viewBox="0 0 12 12" aria-hidden="true">
          <circle cx="6" cy="6" r="5" />
          <path d={moonPath(phase)} />
        </svg>
      ) : (
        <i aria-hidden="true" />
      )}
      {t.city} · <time>{time}</time> · {night ? t.night : t.day}
    </span>
  );
}
