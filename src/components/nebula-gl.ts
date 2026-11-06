/** Живая туманность за всей страницей (только ПК): цветной газ с волокнами и тёмными прожилками.
 *  Узор — fbm-шум с двойным искажением пространства, считается в шейдере на холсте в ~⅓ разрешения
 *  экрана (туманность мягкая, CSS растягивает её без потерь). Медленнее страницы плывёт при прокрутке
 *  и чуть уходит от курсора; у каждого раздела своя палитра, между разделами цвета перетекают.
 *  Клик по шару, пойманная комета и гиперпрыжок на миг зажигают её ярче.
 *  Кадры — только по делу: прокрутка, мышь, вспышка, смена темы или размера. В покое не рисует ничего.
 *  Подключается динамически из Nebula.tsx — на телефоны этот код не загружается. */

type RGB = readonly [number, number, number];
type Palette = readonly [RGB, RGB, RGB]; // основной газ, второй газ, горячие волокна

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
const pal = (a: string, b: string, c: string): Palette => [hex(a), hex(b), hex(c)];

/** Палитры разделов главной (по id); на других страницах — по кругу из CYCLE. */
const BY_ID: Record<string, Palette> = {
  top: pal("#6a4cff", "#2f6bff", "#ff8ee8"),
  demo: pal("#1e8fff", "#5b4bff", "#6ff0ff"),
  works: pal("#9b3dff", "#ff3d9a", "#ffb0f0"),
  method: pal("#4a5bff", "#8a4dff", "#b9c4ff"),
  play: pal("#a63dff", "#ff4fb8", "#ffcf9e"),
  contact: pal("#3d7bff", "#8a4dff", "#9ff0ff"),
};
const CYCLE: Palette[] = [BY_ID.top, BY_ID.demo, BY_ID.works, BY_ID.method, BY_ID.contact];
const FOOT = pal("#7a4dff", "#ff4d8a", "#ffc29e"); // рассвет над планетой в подвале

/** Для светлой темы — те же оттенки, но чистые и светлые: поверх белого дают пастель, а не грязь. */
const lighten = (c: RGB): RGB => {
  const m = Math.max(c[0], c[1], c[2], 0.001);
  return [0.78 * (c[0] / m) + 0.22, 0.78 * (c[1] / m) + 0.22, 0.78 * (c[2] / m) + 0.22];
};

const VS = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform vec2 uOff;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;
uniform float uGain;
uniform float uLight; // 1 — светлая тема: пастель поверх белого вместо свечения
uniform float uFlash; // 0…1 — короткая вспышка: клик по шару, пойманная комета, гиперпрыжок

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p * 2.02 + vec2(11.3, 7.1);
    a *= 0.5;
  }
  return v;
}

// «гребни» шума — тонкие светящиеся волокна, как у остатков сверхновых
float ridged(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    float k = 1.0 - abs(noise(p) * 2.0 - 1.0);
    v += a * k * k;
    p = m * p * 2.03 + vec2(3.1, 1.7);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 p = uv * 1.25 + uOff;

  // двойное искажение пространства — отсюда завихрения и рваные края облаков
  vec2 q = vec2(fbm(p), fbm(p + vec2(5.2, 1.3)));
  vec2 r = vec2(fbm(p + 2.2 * q + vec2(1.7, 9.2)), fbm(p + 2.2 * q + vec2(8.3, 2.8)));
  float f = fbm(p + 1.8 * r);

  float bn = fbm(p * 0.26 + vec2(4.1, 2.3));
  float big = 0.06 + 0.94 * smoothstep(0.36, 0.66, bn);               // где облака гуще
  float n = clamp((f - 0.3) / 0.42, 0.0, 1.0);                         // fbm почти всегда в 0.3…0.7
  float gas = pow(n, 2.4) * big;                                       // мягкий газ
  float fil = pow(ridged(p * 1.6 + r * 1.2), 3.0) * big;               // волокна
  float haze = big * big * 0.18;                                       // зарево вокруг облаков
  float dust = smoothstep(0.56, 0.74, fbm(p * 2.4 + r * 2.2 + 6.0)) * big; // тёмные прожилки

  // у разных облаков свой оттенок — по крупному полю, а не по мелкой ряби
  vec3 tint = mix(uA, uB, smoothstep(0.35, 0.65, bn + 0.25 * (q.x - 0.5)));

  // середина, где текст, заметно спокойнее краёв
  float side = abs(uv.x) / (0.5 * uRes.x / uRes.y);
  float calm = mix(0.25, 1.0, smoothstep(0.45, 1.05, side));

  vec3 e = tint * (gas * 0.9 + haze * 0.5) + mix(tint, uC, 0.6) * fil * 1.6 + uC * gas * gas * 1.2;
  e *= (1.0 - 0.7 * dust) * calm;
  // мягкие блики без плоских пятен: сжимаем яркость, а не каналы — цвет не выцветает в белый
  float L = max(e.r, max(e.g, e.b));
  e *= (1.0 - exp(-L * 1.8)) / max(L, 1e-4);

  if (uLight > 0.5) {
    float a = clamp(max(e.r, max(e.g, e.b)) * uGain * (1.0 + uFlash * 0.7), 0.0, 1.0);
    gl_FragColor = vec4(mix(tint, uC, 0.4) * a, a);
    return;
  }
  // свечение складывается с фоном, пыль — поглощает (гасит звёзды за собой)
  gl_FragColor = vec4(e * uGain * (1.0 + uFlash * 1.1), clamp(dust * 0.5 + gas * 0.2, 0.0, 0.8) * calm);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (gl.getShaderParameter(sh, gl.COMPILE_STATUS)) return sh;
  console.warn("nebula-gl:", gl.getShaderInfoLog(sh));
  gl.deleteShader(sh);
  return null;
}

function link(gl: WebGLRenderingContext) {
  const v = compile(gl, gl.VERTEX_SHADER, VS);
  const f = compile(gl, gl.FRAGMENT_SHADER, FS);
  const prog = v && f ? gl.createProgram() : null;
  if (!prog || !v || !f) return null;
  gl.attachShader(prog, v);
  gl.attachShader(prog, f);
  gl.linkProgram(prog);
  if (gl.getProgramParameter(prog, gl.LINK_STATUS)) return prog;
  console.warn("nebula-gl:", gl.getProgramInfoLog(prog));
  return null;
}

const SCALE = 0.34; // доля разрешения экрана
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/** Запускает туманность на холсте. Возвращает функцию остановки или null, если WebGL недоступен. */
export function startNebula(canvas: HTMLCanvasElement): (() => void) | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;
  const prog = link(gl);
  if (!prog) return null;

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  const u = (n: string) => gl.getUniformLocation(prog, n);
  const U = { res: u("uRes"), off: u("uOff"), a: u("uA"), b: u("uB"), c: u("uC"), gain: u("uGain"), light: u("uLight"), flash: u("uFlash") };
  gl.useProgram(prog);
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  gl.disable(gl.BLEND);

  const root = document.documentElement;
  const light = () => root.dataset.theme === "light";
  const cur = new Float32Array(10); // 3 цвета + яркость
  const tgt = new Float32Array(10);
  let first = true;
  let raf = 0;
  let prev = 0;
  let dead = false;
  let mx = 0;
  let my = 0;
  let px = 0;
  let py = 0;
  let flashAt = -1e9;
  let flashLen = 1;

  const paletteOf = (el: Element, i: number): Palette =>
    el.tagName === "FOOTER" ? FOOT : (BY_ID[el.id] ?? CYCLE[i % CYCLE.length]);

  // цвет — по разделу, который сейчас посередине экрана; к концу раздела перетекает в следующий
  const target = () => {
    const els = document.querySelectorAll("main section[id], footer");
    const mid = window.innerHeight * 0.5;
    let k = -1;
    const tops: number[] = [];
    els.forEach((el, i) => {
      const top = el.getBoundingClientRect().top;
      tops.push(top);
      if (top <= mid) k = i;
    });
    let p: Palette = BY_ID.top;
    let q: Palette = p;
    let s = 0;
    if (els.length) {
      const i = Math.max(k, 0);
      p = paletteOf(els[i], i);
      if (k >= 0 && k < els.length - 1) {
        q = paletteOf(els[k + 1], k + 1);
        s = smooth(0.55, 1, (mid - tops[k]) / Math.max(tops[k + 1] - tops[k], 1));
      } else q = p;
    }
    const lt = light();
    for (let c = 0; c < 3; c++) {
      const a = lt ? lighten(p[c]) : p[c];
      const b = lt ? lighten(q[c]) : q[c];
      for (let j = 0; j < 3; j++) tgt[c * 3 + j] = a[j] + (b[j] - a[j]) * s;
    }
    tgt[9] = lt ? 0.5 : 0.46;
  };

  const resize = () => {
    const w = Math.max(1, Math.round(canvas.clientWidth * SCALE));
    const h = Math.max(1, Math.round(canvas.clientHeight * SCALE));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  };

  const frame = (now: number) => {
    raf = 0;
    if (dead) return;
    const dt = prev ? Math.min((now - prev) / 1000, 0.1) : 1 / 60;
    prev = now;
    resize();
    target();
    let busy = false;
    if (first) cur.set(tgt);
    else {
      const k = 1 - Math.exp(-dt / 0.22);
      for (let i = 0; i < 10; i++) {
        const d = tgt[i] - cur[i];
        if (Math.abs(d) > 0.002) {
          cur[i] += d * k;
          busy = true;
        } else cur[i] = tgt[i];
      }
    }
    const km = 1 - Math.exp(-dt / 0.7);
    px += (mx - px) * km;
    py += (my - py) * km;
    if (Math.abs(mx - px) + Math.abs(my - py) > 0.0005) busy = true;
    const fl = Math.max(0, 1 - (now - flashAt) / (flashLen * 1000));
    if (fl > 0) busy = true;

    const sy = window.scrollY / Math.max(window.innerHeight, 1);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U.res, canvas.width, canvas.height);
    gl.uniform2f(U.off, 3.7 + px * 0.06, 1.3 - sy * drift - py * 0.045);
    gl.uniform3f(U.a, cur[0], cur[1], cur[2]);
    gl.uniform3f(U.b, cur[3], cur[4], cur[5]);
    gl.uniform3f(U.c, cur[6], cur[7], cur[8]);
    gl.uniform1f(U.gain, cur[9]);
    gl.uniform1f(U.light, light() ? 1 : 0);
    gl.uniform1f(U.flash, fl * fl);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (first) {
      first = false;
      canvas.dataset.on = "";
    }
    if (busy) request();
    else prev = 0;
  };
  const request = () => {
    if (!raf && !dead) raf = requestAnimationFrame(frame);
  };

  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const onMove = (e: PointerEvent) => {
    mx = e.clientX / window.innerWidth - 0.5;
    my = e.clientY / window.innerHeight - 0.5;
    request();
  };
  // при «уменьшить движение» туманность не плывёт за прокруткой и не вспыхивает — меняются только цвета
  const drift = calm ? 0 : 0.2;
  const flash = (len: number) => () => {
    if (calm) return;
    flashAt = performance.now();
    flashLen = len;
    request();
  };
  const onOrb = flash(1.1);
  const onJump = flash(1.8);
  const onLost = (e: Event) => {
    e.preventDefault();
    stop();
  };
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  window.addEventListener("utkir:theme", request);
  window.addEventListener("utkir:orb", onOrb);
  window.addEventListener("utkir:comet", onOrb);
  window.addEventListener("utkir:jump", onJump);
  if (fine && !calm) window.addEventListener("pointermove", onMove, { passive: true });
  canvas.addEventListener("webglcontextlost", onLost);
  // страница могла смениться без прокрутки (переход по ссылке) — разделы и цвета другие
  const ro = new ResizeObserver(request);
  const main = document.getElementById("main");
  if (main) ro.observe(main);
  request();

  function stop() {
    if (dead) return;
    dead = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", request);
    window.removeEventListener("resize", request);
    window.removeEventListener("utkir:theme", request);
    window.removeEventListener("utkir:orb", onOrb);
    window.removeEventListener("utkir:comet", onOrb);
    window.removeEventListener("utkir:jump", onJump);
    window.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("webglcontextlost", onLost);
    ro.disconnect();
    delete canvas.dataset.on;
  }
  return stop;
}
