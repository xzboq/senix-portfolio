"use client";

import { useEffect, useRef } from "react";

const Q = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";
const CALM = "(prefers-reduced-motion: reduce)";
const MAX = 120; // больше искр одновременно не бывает
const STEP = 6; // новая искра — на каждые ~6 px пути курсора

interface Dust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  c: number;
  spark: boolean;
}

const DARK = ["255,255,255", "214,206,255", "169,156,255", "103,212,255"];
const LIGHT = ["108,92,231", "91,76,214", "14,116,144", "124,58,237"];

/** Звёздная пыль за курсором (ПК с мышью): при движении из-под курсора сыплются светящиеся искры,
 *  крупные — четырёхлучевые звёздочки, и гаснут за полсекунды–секунду. Рисует, только пока искры живы. */
export function Stardust() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const mq = window.matchMedia(Q);
    const calm = window.matchMedia(CALM);
    const dust: Dust[] = [];
    let on = false;
    let raf = 0;
    let last = 0;
    let w = 0;
    let h = 0;
    let lx = NaN;
    let ly = NaN;
    let acc = 0;

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const loop = (now: number) => {
      raf = 0;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, w, h);
      const pal = document.documentElement.dataset.theme === "light" ? LIGHT : DARK;
      for (let i = dust.length - 1; i >= 0; i--) {
        const d = dust[i];
        d.life -= d.decay * dt;
        if (d.life <= 0) {
          dust.splice(i, 1);
          continue;
        }
        d.vx *= 0.93;
        d.vy = d.vy * 0.93 + 26 * dt; // искры чуть оседают
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        const col = `rgb(${pal[d.c]})`;
        const a = Math.pow(d.life, 1.3);
        // мягкое свечение вокруг искры
        ctx.globalAlpha = a * 0.22;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size * 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = a;
        if (d.spark) {
          const s = d.size * (1.6 + d.life * 2.4);
          ctx.strokeStyle = col;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(d.x - s, d.y);
          ctx.lineTo(d.x + s, d.y);
          ctx.moveTo(d.x, d.y - s);
          ctx.lineTo(d.x, d.y + s);
          ctx.stroke();
        }
        const r = d.size * (0.6 + d.life * 0.5);
        ctx.fillRect(d.x - r / 2, d.y - r / 2, r, r);
      }
      ctx.globalAlpha = 1;
      if (dust.length) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const x = e.clientX;
      const y = e.clientY;
      if (Number.isNaN(lx)) {
        lx = x;
        ly = y;
        return;
      }
      const dx = x - lx;
      const dy = y - ly;
      lx = x;
      ly = y;
      acc = Math.min(acc + Math.hypot(dx, dy), STEP * 8);
      while (acc >= STEP && dust.length < MAX) {
        acc -= STEP;
        const t = Math.random();
        dust.push({
          x: x - dx * t + (Math.random() - 0.5) * 6,
          y: y - dy * t + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 40 - dx * 1.2,
          vy: (Math.random() - 0.5) * 40 - dy * 1.2,
          life: 1,
          decay: 1.15 + Math.random() * 0.9,
          size: 1.1 + Math.random() * 1.6,
          c: (Math.random() * DARK.length) | 0,
          spark: Math.random() < 0.22,
        });
      }
      if (!raf && dust.length) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    const onLeave = () => {
      lx = ly = NaN;
    };

    const stop = () => {
      on = false;
      cancelAnimationFrame(raf);
      raf = 0;
      dust.length = 0;
      ctx.clearRect(0, 0, w, h);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", fit);
    };
    const sync = () => {
      const want = mq.matches && !calm.matches;
      if (want === on) return;
      if (!want) {
        stop();
        return;
      }
      on = true;
      fit();
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      window.addEventListener("resize", fit);
    };
    sync();
    mq.addEventListener("change", sync);
    calm.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      calm.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return <canvas ref={ref} className="dust" aria-hidden="true" />;
}
