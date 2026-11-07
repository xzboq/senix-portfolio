"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { fmt, type Dict } from "@/content/dict";
import { hyperjump } from "@/lib/hyperjump";
import { SOUND_TOGGLE, initSound, setSound, sfx, soundEnabled, subscribeSound } from "@/lib/sound";
import { Music } from "./Music";

const PC = "(min-width: 1024px)";
const subPc = (cb: () => void) => {
  const m = window.matchMedia(PC);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const isPc = () => window.matchMedia(PC).matches;

/** События от других частей сайта: клик по WebGL-шару (orb-gl.ts) и пойманная золотая комета (Warp.tsx). */
const ORB_EVENT = "utkir:orb";
const COMET_EVENT = "utkir:comet";
const COMETS_KEY = "utkir.comets";

/** Секретное слово — по физическим клавишам, поэтому работает в любой раскладке. */
const SECRET = ["KeyW", "KeyA", "KeyR", "KeyP"];
const INTERACTIVE = "a, button, [role='button'], label, summary, select";
const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

/** Счётчик пойманных комет в localStorage: прибавить и вернуть новое значение. */
function bumpComets(): number {
  let n = 0;
  try {
    n = (Number(localStorage.getItem(COMETS_KEY)) || 0) + 1;
    localStorage.setItem(COMETS_KEY, String(n));
  } catch {}
  return n;
}

interface Toast {
  key: number;
  n: number; // сколько комет поймано всего
}

/** Функции ПК: кнопки в правом нижнем углу (музыка и «наверх» с кольцом прогресса), карточка плеера,
 *  уведомление о пойманной комете справа под шапкой, секретное слово и звуки интерфейса.
 *  На телефоне и планшете ничего не рендерит. */
export function Extras({ t }: { t: Dict["fun"] }) {
  const pc = useSyncExternalStore(subPc, isPc, () => false);
  return pc ? <ExtrasPC t={t} /> : null;
}

function ExtrasPC({ t }: { t: Dict["fun"] }) {
  const sound = useSyncExternalStore(subscribeSound, soundEnabled, () => false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showTop, setShowTop] = useState(() => window.scrollY > window.innerHeight * 0.9);
  const seq = useRef(0);
  const toggleSound = useCallback(() => setSound(!soundEnabled()), []);

  // звук, включённый в прошлый раз, оживает на первом клике
  useEffect(() => initSound(), []);

  // клик по шару — «вжух»; пойманная комета — звон и уведомление со счётчиком
  useEffect(() => {
    const onOrb = () => sfx("whoosh");
    const onComet = () => {
      sfx("comet");
      const key = ++seq.current;
      const n = bumpComets();
      setToasts((list) => [...list.slice(-2), { key, n }]);
      window.setTimeout(() => setToasts((list) => list.filter((it) => it.key !== key)), 4700);
    };
    window.addEventListener(ORB_EVENT, onOrb);
    window.addEventListener(COMET_EVENT, onComet);
    window.addEventListener(SOUND_TOGGLE, toggleSound);
    return () => {
      window.removeEventListener(ORB_EVENT, onOrb);
      window.removeEventListener(COMET_EVENT, onComet);
      window.removeEventListener(SOUND_TOGGLE, toggleSound);
    };
  }, [toggleSound]);

  // кнопка «наверх» — после первого экрана
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > window.innerHeight * 0.9);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // секретное слово и звуки интерфейса (наведение, клик)
  useEffect(() => {
    let pos = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
      pos = e.code === SECRET[pos] ? pos + 1 : e.code === SECRET[0] ? 1 : 0;
      if (pos < SECRET.length) return;
      pos = 0;
      hyperjump();
      sfx("jump");
    };
    let hovered: Element | null = null;
    let at = 0;
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element | null)?.closest?.(INTERACTIVE) ?? null;
      if (el === hovered) return;
      hovered = el;
      const now = performance.now();
      if (el && now - at > 70) {
        at = now;
        sfx("hover");
      }
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.(INTERACTIVE)) sfx("click");
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("click", onClick, { capture: true, passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("click", onClick, { capture: true });
    };
  }, []);

  return (
    <>
      <div className="fab" role="group" aria-label={t.tools}>
        <button
          type="button"
          className="fab-btn fab-top"
          data-show={showTop || undefined}
          tabIndex={showTop ? undefined : -1}
          aria-label={t.toTop}
          data-cursor={t.toTop}
          onClick={() => {
            sfx("whoosh");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <svg viewBox="0 0 44 44" aria-hidden="true">
            <circle className="fab-track" cx="22" cy="22" r="20" />
            <circle className="fab-prog" cx="22" cy="22" r="20" pathLength={100} />
          </svg>
          <span aria-hidden="true">↑</span>
        </button>
        <button
          type="button"
          className="fab-btn fab-sound"
          aria-pressed={sound}
          aria-label={t.sound}
          data-on={sound || undefined}
          data-cursor={t.sound}
          onClick={toggleSound}
        >
          <span className="eq" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
        </button>
      </div>

      <Music t={t} />

      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((x) => (
          <div key={x.key} className="toast" data-tone="comet">
            <span className="toast-icon" aria-hidden="true">☄️</span>
            <span className="toast-body">
              <span className="toast-label">{t.cometLabel}</span>
              <b>{t.comet}</b>
              <span>{fmt(t.cometCount, { n: x.n })}</span>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
