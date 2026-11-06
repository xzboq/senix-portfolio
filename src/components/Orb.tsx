"use client";

import { useEffect, useRef } from "react";

/** Шар с орбитой в первом экране.
 *  Базовая версия — чистый CSS/SVG: задняя половина орбиты лежит за шаром, передняя — перед ним.
 *  На ПК (от 1024px), если есть WebGL и не просили «уменьшить движение», поверх включается
 *  WebGL-версия из orb-gl.ts: стекло с туманностью, блик за курсором, орбита из частиц.
 *  Её код грузится динамически — телефоны его не скачивают. На ПК CSS-шар обёрнут в .orb-css
 *  и проявляется с задержкой — только если WebGL так и не завёлся. */
export function Orb() {
  const ref = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const ptr = useRef({ x: 0, y: 0 });

  // на мыши шар чуть уходит от курсора, а блик смещается — получается объём
  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    const loop = () => {
      x += (tx - x) * 0.07;
      y += (ty - y) * 0.07;
      ptr.current.x = x;
      ptr.current.y = y;
      el.style.setProperty("--ox", x.toFixed(3));
      el.style.setProperty("--oy", y.toFixed(3));
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.002 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      kick();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      kick();
    };
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // WebGL-шар — только на ПК
  useEffect(() => {
    const wrap = ref.current;
    const canvas = glRef.current;
    if (!wrap || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    let stop: (() => void) | null = null;
    let loading = false;
    let gone = false;
    const off = () => {
      delete wrap.dataset.gl;
    };
    const init = () => {
      if (stop || loading || !mq.matches) return;
      loading = true;
      import("./orb-gl")
        .then(({ startOrbGL }) => {
          if (gone) return;
          stop = startOrbGL(canvas, ptr.current, off);
          if (stop) wrap.dataset.gl = "";
        })
        .catch(off);
    };
    init();
    mq.addEventListener("change", init);
    return () => {
      gone = true;
      mq.removeEventListener("change", init);
      stop?.();
      off();
    };
  }, []);

  return (
    <div ref={ref} className="orb-wrap" aria-hidden="true">
      <canvas ref={glRef} className="orb-gl" />
      <div className="orb-css">
        <i className="orb-rays" />
        <svg className="orb-ring orb-ring--alt" viewBox="0 0 600 600">
          <ellipse cx="300" cy="300" rx="292" ry="66" />
        </svg>
        <svg className="orb-ring" viewBox="0 0 600 600">
          <ellipse cx="300" cy="300" rx="292" ry="66" className="ring-glow" />
          <ellipse cx="300" cy="300" rx="292" ry="66" />
        </svg>
        <div className="orb">
          <i className="orb-glow" />
          <i className="orb-glow orb-glow--2" />
          <i className="orb-shine" />
          <i className="orb-rim" />
        </div>
        <svg className="orb-ring orb-ring--front" viewBox="0 0 600 600">
          <defs>
            <clipPath id="orb-front">
              <rect x="0" y="300" width="600" height="300" />
            </clipPath>
          </defs>
          <g clipPath="url(#orb-front)">
            <ellipse cx="300" cy="300" rx="292" ry="66" className="ring-glow" />
            <ellipse cx="300" cy="300" rx="292" ry="66" />
            <circle r="5" className="orb-moon">
              <animateMotion dur="11s" repeatCount="indefinite" path="M 8 300 A 292 66 0 1 0 592 300 A 292 66 0 1 0 8 300" />
            </circle>
          </g>
        </svg>
      </div>
    </div>
  );
}
