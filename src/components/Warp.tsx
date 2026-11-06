"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  r: number;
  c: number;
}

const BASE = [
  [255, 255, 255],
  [214, 206, 255],
  [180, 226, 255],
];
const SHIFT = [
  [110, 220, 255], // вниз — «к нам»: голубое смещение
  [255, 140, 196], // вверх — «от нас»: красное смещение
];
const LEVELS = 6;

/** Палитра заранее: цвет звезды × направление × сила смещения — без строк в каждом кадре. */
const PALETTE = BASE.map((b) =>
  SHIFT.map((s) =>
    Array.from({ length: LEVELS + 1 }, (_, i) => {
      const k = (i / LEVELS) * 0.85;
      return `rgb(${b.map((v, j) => Math.round(v + (s[j] - v) * k)).join(",")})`;
    }),
  ),
);

/** Ближний слой звёзд для ПК поверх неподвижного дальнего (.bg-stars): при прокрутке звёзды плывут
 *  с параллаксом по глубине, на скорости вытягиваются в лучи и меняют цвет — вниз в голубой,
 *  вверх в розовый, как эффект Доплера. Раз в 6–13 секунд через экран пролетает метеор, а раз
 *  в полминуты–минуту — медленная золотая комета: её можно поймать кликом (событие utkir:comet).
 *  Скорость прокрутки отдаёт элементам с [data-sv] в переменную --sv (огромная бегущая строка кренится).
 *  Рисует только пока что-то движется; в покое цикл стоит. */
export function Warp() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const pc = window.matchMedia("(min-width: 1024px)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

    let on = false;
    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let raf = 0;
    let last = 0;
    let prevY = window.scrollY;
    let vel = 0;
    let mx = 0;
    let my = 0;
    let px = 0;
    let py = 0;
    let show = true; // в светлой теме холст скрыт — считаем только скорость для --sv
    let leaners: HTMLElement[] = [];
    let meteor: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    let timer = 0;
    let comet: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    let burst: { x: number; y: number; t: number } | null = null;
    let cometTimer = 0;

    const seed = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      const n = Math.round(Math.min(240, Math.max(110, (w * h) / 6500)));
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: 0.15 + Math.pow(Math.random(), 2) * 0.85,
        r: 0.55 + Math.random() * 1.05,
        c: (Math.random() * BASE.length) | 0,
      }));
    };

    const draw = (dt: number) => {
      const y = window.scrollY;
      let dy = y - prevY;
      prevY = y;
      if (Math.abs(dy) > h) dy = 0; // прыжок (якорь, переход) — без лучей через весь экран
      vel += (dy / Math.max(dt / 16.7, 0.25) - vel) * 0.3;
      px += (mx - px) * 0.08;
      py += (my - py) * 0.08;
      const sv = Math.abs(vel) < 0.05 ? "0" : Math.max(-40, Math.min(40, vel)).toFixed(2);
      for (const el of leaners) el.style.setProperty("--sv", sv);
      if (!show) return;

      const speed = Math.min(Math.abs(vel), 90);
      const tone = vel >= 0 ? 0 : 1;
      const lvl = Math.min(LEVELS, Math.round(speed / 10));
      const span = h + 120;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.y -= dy * s.z * 0.4;
        if (s.y < -60 || s.y > h + 60) {
          s.y -= Math.sign(s.y) * span;
          s.x = Math.random() * w;
        }
        const x = s.x - px * 16 * s.z;
        const sy = s.y - py * 11 * s.z;
        const len = Math.max(-200, Math.min(200, vel * s.z * 2));
        const col = PALETTE[s.c][tone][Math.round(lvl * s.z)];
        ctx.globalAlpha = 0.22 + 0.62 * s.z;
        if (Math.abs(len) < 1.6) {
          const size = s.r * (0.8 + 0.9 * s.z);
          ctx.fillStyle = col;
          ctx.fillRect(x - size / 2, sy - size / 2, size, size);
        } else {
          // хвост тусклее, голова ярче
          ctx.strokeStyle = col;
          ctx.lineWidth = s.r * (0.7 + 0.8 * s.z);
          ctx.globalAlpha *= 0.55;
          ctx.beginPath();
          ctx.moveTo(x, sy);
          ctx.lineTo(x, sy + len);
          ctx.stroke();
          ctx.globalAlpha /= 0.55;
          ctx.fillStyle = col;
          ctx.fillRect(x - ctx.lineWidth / 2, sy - ctx.lineWidth / 2, ctx.lineWidth, ctx.lineWidth);
        }
      }
      ctx.globalAlpha = 1;

      if (meteor) {
        const m = meteor;
        const k = dt / 1000;
        m.x += m.vx * k;
        m.y += m.vy * k - dy * 0.4;
        m.life -= k * 1.1;
        const tx = m.x - m.vx * 0.16;
        const ty = m.y - m.vy * 0.16;
        const tail = ctx.createLinearGradient(m.x, m.y, tx, ty);
        tail.addColorStop(0, `rgba(255,255,255,${Math.max(m.life, 0).toFixed(3)})`);
        tail.addColorStop(0.3, `rgba(196,181,253,${(Math.max(m.life, 0) * 0.5).toFixed(3)})`);
        tail.addColorStop(1, "rgba(139,123,255,0)");
        ctx.strokeStyle = tail;
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        if (m.life <= 0 || m.y > h + 80 || m.x < -200) meteor = null;
      }

      if (comet) {
        const c = comet;
        const k = dt / 1000;
        c.x += c.vx * k;
        c.y += c.vy * k - dy * 0.4;
        c.life -= k / 6;
        const tx = c.x - c.vx * 0.75;
        const ty = c.y - c.vy * 0.75;
        const tail = ctx.createLinearGradient(c.x, c.y, tx, ty);
        tail.addColorStop(0, "rgba(255,236,170,0.95)");
        tail.addColorStop(0.25, "rgba(255,196,90,0.45)");
        tail.addColorStop(1, "rgba(255,150,60,0)");
        ctx.strokeStyle = tail;
        ctx.lineWidth = 3.4;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        const glow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 24);
        glow.addColorStop(0, "rgba(255,244,200,0.95)");
        glow.addColorStop(0.35, "rgba(255,204,102,0.45)");
        glow.addColorStop(1, "rgba(255,170,60,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 24, 0, Math.PI * 2);
        ctx.fill();
        // голова мерцает четырьмя лучами — видно, что это не просто метеор
        const ray = 9 + 4 * Math.sin(c.life * 40);
        ctx.strokeStyle = "rgba(255,246,214,0.9)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(c.x - ray, c.y);
        ctx.lineTo(c.x + ray, c.y);
        ctx.moveTo(c.x, c.y - ray);
        ctx.lineTo(c.x, c.y + ray);
        ctx.stroke();
        if (c.life <= 0 || c.x < -320 || c.x > w + 320 || c.y > h + 200) comet = null;
      }

      if (burst) {
        // поймали: золотое кольцо и искры разлетаются от места клика
        const b = burst;
        b.t += dt / 1000;
        const p = Math.min(b.t / 0.7, 1);
        const a = 1 - p;
        ctx.strokeStyle = `rgba(255,214,120,${a.toFixed(3)})`;
        ctx.lineWidth = 2 * a + 0.5;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 8 + p * 70, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = `rgba(255,240,190,${a.toFixed(3)})`;
        for (let i = 0; i < 14; i++) {
          const ang = (i / 14) * Math.PI * 2 + 0.3;
          const r = 10 + p * (60 + (i % 3) * 22);
          ctx.fillRect(b.x + Math.cos(ang) * r - 1.5, b.y + Math.sin(ang) * r - 1.5, 3, 3);
        }
        if (p >= 1) burst = null;
      }
    };

    const loop = (now: number) => {
      raf = 0;
      if (!on || document.hidden) return;
      draw(Math.min(now - last, 64));
      last = now;
      const settling =
        !!meteor ||
        !!comet ||
        !!burst ||
        Math.abs(vel) > 0.04 ||
        Math.abs(mx - px) + Math.abs(my - py) > 0.002 ||
        window.scrollY !== prevY;
      if (settling) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (raf || !on || document.hidden) return;
      show = canvas.clientWidth > 0;
      leaners = [...document.querySelectorAll<HTMLElement>("[data-sv]")];
      if (!show && !leaners.length) return;
      last = performance.now() - 16;
      raf = requestAnimationFrame(loop);
    };
    // метеор: из верхней части экрана наискосок вниз-влево
    const launch = () => {
      timer = window.setTimeout(launch, 6000 + Math.random() * 7000);
      if (!on || document.hidden || meteor || !canvas.clientWidth) return;
      const speed = 900 + Math.random() * 500;
      const ang = Math.PI * (0.72 + Math.random() * 0.08);
      meteor = { x: w * (0.35 + Math.random() * 0.6), y: h * (Math.random() * 0.35) - 40, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, life: 1 };
      kick();
    };
    // золотая комета: медленная, из-за левого или правого края, наискосок вниз
    const spawnComet = () => {
      cometTimer = window.setTimeout(spawnComet, 26000 + Math.random() * 22000);
      if (!on || document.hidden || comet || !canvas.clientWidth) return;
      const left = Math.random() < 0.5;
      const speed = 300 + Math.random() * 110;
      const ang = Math.PI * (left ? 0.13 + Math.random() * 0.1 : 0.77 + Math.random() * 0.1);
      comet = { x: left ? -30 : w + 30, y: h * (0.06 + Math.random() * 0.3), vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, life: 1 };
      kick();
    };
    const onDown = (e: PointerEvent) => {
      if (!comet || e.button !== 0 || e.pointerType !== "mouse") return;
      if ((e.target as Element | null)?.closest?.("a, button, input, textarea, select, label, [role='button']")) return;
      if (Math.hypot(e.clientX - comet.x, e.clientY - comet.y) > 70) return;
      burst = { x: comet.x, y: comet.y, t: 0 };
      comet = null;
      window.dispatchEvent(new CustomEvent("utkir:comet", { detail: { x: e.clientX, y: e.clientY } }));
      kick();
    };
    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / w - 0.5) * 2;
      my = (e.clientY / h - 0.5) * 2;
      kick();
    };
    const onResize = () => {
      seed();
      prevY = window.scrollY;
      draw(16);
    };

    const stop = () => {
      on = false;
      cancelAnimationFrame(raf);
      raf = 0;
      clearTimeout(timer);
      clearTimeout(cometTimer);
      meteor = null;
      comet = null;
      burst = null;
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", kick);
    };
    const sync = () => {
      const want = pc.matches && !calm.matches;
      if (want === on) return;
      on = want;
      if (on) {
        onResize();
        timer = window.setTimeout(launch, 4000 + Math.random() * 4000);
        cometTimer = window.setTimeout(spawnComet, 12000 + Math.random() * 8000);
        window.addEventListener("pointerdown", onDown);
        window.addEventListener("scroll", kick, { passive: true });
        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("resize", onResize);
        document.addEventListener("visibilitychange", kick);
      } else {
        stop();
      }
    };
    sync();
    pc.addEventListener("change", sync);
    calm.addEventListener("change", sync);
    return () => {
      pc.removeEventListener("change", sync);
      calm.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return <canvas ref={ref} className="warp" aria-hidden="true" />;
}
