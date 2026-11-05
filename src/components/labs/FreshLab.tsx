"use client";

import { useState } from "react";
import type { Dict } from "@/content/dict";
import { fmt } from "@/content/dict";
import type { LabProps } from "../Lab";

const OPEN_H = 8;
const PREP_MIN = 10;
const DAY = 24 * 60;

/** Текущая минута суток по Ташкенту (UTC+5) — как tashkentNow() на живом сайте. */
function tashkentMinute() {
  const now = new Date();
  return (now.getUTCHours() * 60 + now.getUTCMinutes() + 5 * 60) % DAY;
}

const hhmm = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export default function FreshLab({ t }: LabProps<Dict["lab"]["fresh"]>) {
  const [min, setMin] = useState(tashkentMinute);
  const [tg, setTg] = useState(true);

  // Та же логика, что в renderReady(): открыто с 08:00, готовка 10 минут,
  // заказ, который не успеть до полуночи, не обещаем.
  const open = Math.floor(min / 60) >= OPEN_H;
  const ready = min + PREP_MIN;
  const tooLate = open && ready >= DAY;
  const badge = !open ? t.closed : Math.floor(min / 60) === 23 ? fmt(t.closingIn, { n: 60 - (min % 60) }) : t.open;
  const note = !open ? t.closedNote : tooLate ? t.lastOrders : "";

  return (
    <div className="panel lab">
      <div className="panel-bar"><span>{t.title}</span><span>UTC+5 · 08:00–00:00</span></div>
      <div className="lab-body">
        <p className="lab-lead">{t.lead}</p>
        <div className="lab-grid">
          <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
            <label className="label" htmlFor="fresh-time">{t.time}</label>
            <div className="clock">
              <output htmlFor="fresh-time" className="clock-time">{hhmm(min)}</output>
              <span className="fresh-badge" data-open={open || undefined}>{badge}</span>
            </div>
            <input
              id="fresh-time"
              type="range"
              className="range"
              min={0}
              max={DAY - 1}
              step={1}
              value={min}
              onChange={(e) => setMin(Number(e.target.value))}
            />
            <div className="range-scale" aria-hidden="true">
              <span>00:00</span><span>08:00</span><span>16:00</span><span>23:59</span>
            </div>
          </div>
          <div className="result-box" data-ok={note ? "false" : "true"} aria-live="polite">
            {note ? (
              <strong>{note}</strong>
            ) : (
              <strong>
                {t.readyBy} <span className="mono">{hhmm(ready)}</span>
              </strong>
            )}
          </div>
        </div>

        <div className="lab-grid">
          <div style={{ display: "grid", gap: 8, alignContent: "start" }}>
            <p className="label">{t.mode}</p>
            <div className="seg" role="group" aria-label={t.mode}>
              <button type="button" aria-pressed={tg} onClick={() => setTg(true)}>{t.tg}</button>
              <button type="button" aria-pressed={!tg} onClick={() => setTg(false)}>{t.web}</button>
            </div>
          </div>
          <div className="result-box" aria-live="polite">
            <span className="mono note">{tg ? "window.Telegram.WebApp ✓" : "window.Telegram.WebApp → undefined"}</span>
            <p style={{ fontSize: "0.9375rem" }}>{tg ? t.tgWhat : t.webWhat}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
