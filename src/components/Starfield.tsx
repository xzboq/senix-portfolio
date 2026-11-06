"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  r: number;
  tw: number;
  c: string;
}

const COLORS = ["255,255,255", "255,255,255", "255,255,255", "214,206,255", "180,226,255", "255,233,196"];

/** Звёздное небо первого экрана на <canvas>: звёзды мерцают и смещаются с параллаксом,
 *  рядом с курсором соединяются в «созвездия», иногда пролетает метеор.
 *  Цикл работает только пока первый экран виден; при «уменьшить движение» — один статичный кадр. */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouseOk = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let raf = 0;
    let visible = true;
    let mouse = false;
    let mx = 0;
    let my = 0;
    let px = 0;
    let py = 0;
    let meteor: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    let nextMeteor = performance.now() + 2500;

    const seed = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.max(60, Math.min(150, Math.round((w * h) / 10000)));
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: 0.25 + Math.random() * 0.75,
        r: 0.4 + Math.random() * 1.3,
        tw: Math.random() * Math.PI * 2,
        c: `rgb(${COLORS[(Math.random() * COLORS.length) | 0]})`,
      }));
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      const t = now / 1000;
      // точка притяжения созвездий: курсор или медленно плывущая точка
      const ax = mouse ? mx : w * (0.62 + 0.25 * Math.sin(t * 0.21));
      const ay = mouse ? my : h * (0.42 + 0.22 * Math.sin(t * 0.33 + 1));
      px += ((mouse ? (mx / w - 0.5) * 2 : 0) - px) * 0.05;
      py += ((mouse ? (my / h - 0.5) * 2 : 0) - py) * 0.05;

      const near: { x: number; y: number; d: number }[] = [];
      for (const s of stars) {
        if (!reduce) {
          s.x += 0.035 * s.z;
          if (s.x > w + 4) s.x = -4;
        }
        const x = s.x - px * 22 * s.z;
        const y = s.y - py * 16 * s.z;
        const a = reduce ? 0.8 : 0.45 + 0.55 * Math.abs(Math.sin(t * (0.6 + s.z) + s.tw));
        const size = s.r * (1.1 + 0.8 * s.z);
        ctx.globalAlpha = a * (0.35 + 0.65 * s.z);
        ctx.fillStyle = s.c;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
        const d = Math.hypot(x - ax, y - ay);
        if (d < 170) near.push({ x, y, d });
      }

      ctx.globalAlpha = 1;
      // созвездия: соединяем близкие друг к другу звёзды возле точки притяжения
      ctx.lineWidth = 0.8;
      for (let i = 0; i < near.length; i++) {
        for (let j = i + 1; j < near.length; j++) {
          const a = near[i];
          const b = near[j];
          const dd = Math.hypot(a.x - b.x, a.y - b.y);
          if (dd > 95) continue;
          const alpha = (1 - dd / 95) * (1 - Math.max(a.d, b.d) / 170) * 0.85;
          ctx.strokeStyle = `rgba(169,156,255,${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // метеор раз в несколько секунд
      if (!reduce) {
        if (!meteor && now > nextMeteor) {
          meteor = { x: w * (0.2 + Math.random() * 0.7), y: -20, vx: -5 - Math.random() * 3, vy: 3.2 + Math.random() * 1.6, life: 1 };
          nextMeteor = now + 4000 + Math.random() * 5000;
        }
        if (meteor) {
          const m = meteor;
          const tail = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 16, m.y - m.vy * 16);
          tail.addColorStop(0, `rgba(255,255,255,${(0.9 * m.life).toFixed(3)})`);
          tail.addColorStop(1, "rgba(169,156,255,0)");
          ctx.strokeStyle = tail;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x - m.vx * 16, m.y - m.vy * 16);
          ctx.stroke();
          m.x += m.vx;
          m.y += m.vy;
          m.life -= 0.012;
          if (m.life <= 0 || m.y > h + 40 || m.x < -60) meteor = null;
        }
      }
    };

    let last = 0;
    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      if (now - last >= 32) {
        last = now;
        draw(now);
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (reduce) draw(performance.now());
      else if (!raf) raf = requestAnimationFrame(loop);
    };

    seed();
    start();
    const ro = new ResizeObserver(() => {
      seed();
      if (reduce) draw(performance.now());
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) {
        delete host.dataset.off;
        start();
      } else {
        host.dataset.off = "";
      }
    });
    io.observe(host);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      mouse = true;
    };
    const onLeave = () => {
      mouse = false;
    };
    if (mouseOk) {
      host.addEventListener("pointermove", onMove, { passive: true });
      host.addEventListener("pointerleave", onLeave);
    }
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className="starfield" aria-hidden="true" />;
}
