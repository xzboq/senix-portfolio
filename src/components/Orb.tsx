"use client";

import { useEffect, useRef } from "react";

/** Глянцевый шар с орбитой в первом экране — чистый CSS/SVG, без WebGL.
 *  Задняя половина орбиты лежит за шаром, передняя — перед ним; спутник виден только на передней.
 *  На мыши шар чуть уходит от курсора, а блик смещается — получается объём. */
export function Orb() {
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={ref} className="orb-wrap" aria-hidden="true">
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
  );
}
