"use client";

import { useSyncExternalStore } from "react";
import type { Dict } from "@/content/dict";

const clock = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tashkent", hour: "2-digit", minute: "2-digit", hour12: false });
const subscribe = (cb: () => void) => {
  const id = window.setInterval(cb, 15000);
  return () => window.clearInterval(id);
};
const now = () => clock.format(new Date());

/** Местное время автора (Чирчик, UTC+5) в первом экране — только на ПК (CSS).
 *  Ночью подсказывает, что ответ будет утром. На сервере пусто: время ставится после загрузки. */
export function LocalTime({ t }: { t: Dict["fun"] }) {
  const time = useSyncExternalStore(subscribe, now, () => "");
  if (!time) return null;
  const h = Number(time.slice(0, 2));
  const night = h >= 23 || h < 8;
  return (
    <span className="clock-pill" data-night={night || undefined}>
      <i aria-hidden="true" />
      {t.city} · <time>{time}</time> · {night ? t.night : t.day}
    </span>
  );
}
