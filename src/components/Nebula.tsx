"use client";

import { useEffect, useRef } from "react";

/** Туманность за всей страницей — только на ПК (от 1024px) и только если есть WebGL.
 *  Код шейдера (nebula-gl.ts) грузится динамически, поэтому телефоны его не скачивают;
 *  без WebGL холст просто остаётся пустым — под ним прежний фон. */
export function Nebula() {
  const ref = useRef<HTMLCanvasElement>(null);

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
      import("./nebula-gl")
        .then(({ startNebula }) => {
          loading = false;
          if (!gone && mq.matches) stop = startNebula(canvas);
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

  return <canvas ref={ref} className="nebula" aria-hidden="true" />;
}
