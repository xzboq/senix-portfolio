"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/content/i18n";
import type { Dict } from "@/content/dict";
import type { Card } from "@/content/game";
import { analyzeText, assess, signalText, type Assessment } from "@/lib/engine";

interface Props {
  lang: Locale;
  t: Dict["play"];
  verdicts: Dict["verdicts"];
  cards: Card[];
}

const DURATION = 30;
const BEST_KEY = "utkir.verify.best";

interface Entry {
  card: Card;
  guessScam: boolean;
  correct: boolean;
  a: Assessment;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

export default function Game({ lang, t, verdicts, cards }: Props) {
  const [phase, setPhase] = useState<"idle" | "play" | "over">("idle");
  const [deck, setDeck] = useState<Card[]>([]);
  const [i, setI] = useState(0);
  const [left, setLeft] = useState(DURATION);
  const [log, setLog] = useState<Entry[]>([]);
  const [best, setBest] = useState(readBest);
  const [dx, setDx] = useState(0);
  const drag = useRef<{ x: number; id: number } | null>(null);
  const endAt = useRef(0);

  const correct = log.filter((e) => e.correct).length;
  let streak = 0;
  for (let k = log.length - 1; k >= 0 && log[k].correct; k--) streak++;
  const card = deck[i % Math.max(deck.length, 1)];

  const start = () => {
    setBest(shownBest);
    setDeck(shuffle(cards));
    setI(0);
    setLog([]);
    setLeft(DURATION);
    setDx(0);
    endAt.current = performance.now() + DURATION * 1000;
    setPhase("play");
  };

  const answer = useCallback(
    (guessScam: boolean) => {
      if (phase !== "play" || !card) return;
      const a = assess(analyzeText(card.text));
      setLog((l) => [...l, { card, guessScam, correct: guessScam === card.scam, a }]);
      setDx(0);
      const next = i + 1;
      if (next % cards.length === 0) setDeck(shuffle(deck));
      setI(next);
    },
    [phase, card, cards.length, i, deck],
  );

  // таймер
  useEffect(() => {
    if (phase !== "play") return;
    const id = setInterval(() => {
      const rest = Math.max(0, (endAt.current - performance.now()) / 1000);
      setLeft(rest);
      if (rest <= 0) setPhase("over");
    }, 200);
    return () => clearInterval(id);
  }, [phase]);

  // рекорд: показываем max(сохранённый, текущий), пишем в localStorage без setState
  const shownBest = Math.max(best, phase === "over" ? correct : 0);
  useEffect(() => {
    if (phase !== "over") return;
    try {
      if (correct > readBest()) localStorage.setItem(BEST_KEY, String(correct));
    } catch {}
  }, [phase, correct]);

  // клавиатура
  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        answer(true);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        answer(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, answer]);

  const last = log[log.length - 1];
  const dragTone = dx < -30 ? "scam" : dx > 30 ? "safe" : undefined;

  return (
    <div className="game panel" role="group" aria-label={t.group}>
      <div className="game-bar">
        <div><span className="label">{t.time}</span><b>{Math.ceil(left)}</b></div>
        <div><span className="label">{t.score}</span><b>{correct}</b></div>
        <div><span className="label">{t.streak}</span><b>{streak}</b></div>
      </div>
      <div className="timer" data-low={left < 8} aria-hidden="true">
        <i style={{ transform: `scaleX(${left / DURATION})` }} />
      </div>

      {phase === "idle" && (
        <div className="game-center">
          <p className="big">{t.title}</p>
          <p style={{ maxWidth: "46ch" }}>{t.lead}</p>
          <button type="button" className="btn btn--solid" onClick={start}>{t.start} <span className="arrow">→</span></button>
          {shownBest > 0 && <p className="label">{t.best}: {shownBest}</p>}
        </div>
      )}

      {phase === "play" && card && (
        <>
          <div className="stage">
            <div
              key={i}
              className="card-msg enter"
              data-drag={dragTone}
              style={{ transform: `translateX(${dx}px) rotate(${dx / 30}deg)` }}
              onPointerDown={(e) => {
                drag.current = { x: e.clientX, id: e.pointerId };
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (drag.current) setDx(e.clientX - drag.current.x);
              }}
              onPointerUp={() => {
                const d = dx;
                drag.current = null;
                if (d < -80) answer(true);
                else if (d > 80) answer(false);
                else setDx(0);
              }}
              onPointerCancel={() => {
                drag.current = null;
                setDx(0);
              }}
            >
              <span className="label">{t.tap}</span>
              {card.text}
            </div>
          </div>
          <div className="answers">
            <button type="button" onClick={() => answer(true)}><span className="k">←</span> {t.scam}</button>
            <button type="button" onClick={() => answer(false)}>{t.safe} <span className="k">→</span></button>
          </div>
          <div className="last" aria-live="polite">
            {last ? (
              <>
                <span className={last.correct ? "ok-t" : "no-t"}>{last.correct ? t.right : t.wrong}</span>
                {" · "}{t.was} {last.card.scam ? t.wasScam : t.wasSafe}
                <br />
                <span style={{ color: "var(--mute)" }}>
                  {t.engine}: {last.a.evidence.length ? `${verdicts[last.a.verdict]} ${last.a.score}` : t.noSignals}
                </span>
              </>
            ) : null}
          </div>
          <p className="label game-hint">{t.hint}</p>
        </>
      )}

      {phase === "over" && (
        <div className="game-center">
          <p className="big">{correct}</p>
          <p>
            {t.result.replace("{n}", String(correct)).replace("{m}", String(log.length))}
            {" · "}{t.best}: {shownBest}
          </p>
          <div style={{ width: "100%" }}>
            <p className="label" style={{ marginBottom: 6 }}>{t.review}</p>
            {log.some((e) => !e.correct) ? (
              <ul className="miss">
                {log.filter((e) => !e.correct).slice(0, 4).map((e, k) => (
                  <li key={k}>
                    {e.card.text}
                    <span className="why">
                      {e.card.scam ? t.wasScam : t.wasSafe}
                      {e.a.evidence.length ? ` — ${e.a.evidence.slice(0, 2).map((s) => signalText(s, lang)).join("; ")}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="note">{t.empty}</p>
            )}
          </div>
          <button type="button" className="btn btn--solid" onClick={start}>{t.again} <span className="arrow">→</span></button>
        </div>
      )}
    </div>
  );
}
