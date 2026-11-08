"use client";

import { useEffect, useRef } from "react";

/** Планеты полёта за страницей и МКС у края Земли — только на ПК (от 1024px) и только если есть WebGL.
 *  Код шейдера (planets-gl.ts) грузится динамически, поэтому телефоны его не скачивают.
 *  На страницах без разделов главной тел нет — холст просто пустой. */
export function Planets() {
  const ref = useRef<HTMLCanvasElement>(null);
  const issRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    let stop: (() => void) | null = null;
    let loading = false;
    let gone = false;
    const sync = () => {
      if (!mq.matches) {
        stop?.();
        stop = null;
        return;
      }
      if (stop || loading) return;
      loading = true;
      import("./planets-gl")
        .then(({ startPlanets }) => {
          loading = false;
          if (!gone && mq.matches) stop = startPlanets(canvas, issRef.current);
        })
        .catch(() => {
          loading = false;
        });
    };
    sync();
    mq.addEventListener("change", sync);
    return () => {
      gone = true;
      mq.removeEventListener("change", sync);
      stop?.();
    };
  }, []);

  return (
    <>
      <canvas ref={ref} className="planets" aria-hidden="true" />
      {/* МКС: ферма с восемью солнечными панелями и модули посередине */}
      <svg ref={issRef} className="iss" viewBox="0 0 44 22" aria-hidden="true">
        <g className="iss-panels">
          <rect x="2" y="2" width="7" height="8" />
          <rect x="2" y="12" width="7" height="8" />
          <rect x="11" y="2" width="7" height="8" />
          <rect x="11" y="12" width="7" height="8" />
          <rect x="26" y="2" width="7" height="8" />
          <rect x="26" y="12" width="7" height="8" />
          <rect x="35" y="2" width="7" height="8" />
          <rect x="35" y="12" width="7" height="8" />
        </g>
        <rect className="iss-truss" x="1" y="10.2" width="42" height="1.6" />
        <rect className="iss-body" x="19" y="7" width="6" height="8" rx="1" />
        <rect className="iss-body" x="20.5" y="4" width="3" height="14" rx="1" />
      </svg>
    </>
  );
}
