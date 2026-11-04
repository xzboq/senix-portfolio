"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Монтирует детей (и тем самым загружает их JS-чанк) только когда блок близко к экрану. */
export function OnView({ children, minHeight = 240 }: { children: ReactNode; minHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} style={on ? undefined : { minHeight }}>
      {on ? children : <div className="skeleton" style={{ minHeight }} aria-hidden="true">…</div>}
    </div>
  );
}
