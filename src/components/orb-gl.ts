/** WebGL-шар для ПК: тёмное стекло с туманностью внутри, глянцевый блик идёт за курсором,
 *  ореол и орбита из ~5,6 тысячи частиц (задняя половина прячется за шаром).
 *  Живое поведение: при первом показе за сессию шар «рождается» из точки, а частицы слетаются
 *  на орбиту по спирали; курсор раздвигает частицы; клик по шару пускает ударную волну;
 *  при прокрутке орбита раскручивается быстрее.
 *  Один полноэкранный проход для сферы и один вызов отрисовки точек. Цикл стоит, пока холст
 *  не виден (в том числе display: none) или вкладка скрыта; не чаще ~60 кадров в секунду.
 *  Подключается динамически из Orb.tsx — на телефоны этот код не загружается. */

/** Холст на 60% больше обёртки шара: координаты [-1, 1] по холсту. */
const R = 0.4875; // радиус шара — как у CSS-версии (inset 11% внутри обёртки)
const RING = 0.609; // радиус главного кольца — как у SVG-эллипса (rx 292 из 600)

const QUAD_VS = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const SPHERE_FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPtr;
uniform float uR;
uniform float uPulse; // секунды с клика по шару (много — волны нет)
uniform float uBirth; // 0…1 — вспышка, пока шар растёт из точки

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}
float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.02 + vec3(1.7, 9.2, 3.1);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 p = vUv;
  float r = length(p);
  float px = 2.0 / uRes.y;
  vec3 L = normalize(vec3(-0.55 + uPtr.x * 0.5, 0.6 + uPtr.y * 0.45, 0.72));
  vec2 dir = p / max(r, 1e-4);
  float lit = 0.5 + 0.5 * dot(dir, normalize(L.xy));

  // ореол вокруг шара — ярче со стороны света
  float d = max(r - uR, 0.0);
  float halo = exp(-d * 13.0) * (0.15 + 0.42 * lit) + exp(-d * 3.4) * 0.06;
  // ударная волна от клика: светлое кольцо уходит от края шара и гаснет
  float wave = exp(-pow((r - uR - uPulse * 0.62) * 26.0, 2.0)) * exp(-uPulse * 2.4);
  halo += wave * 0.85 + uBirth * exp(-d * 6.0) * 0.9 + exp(-uPulse * 5.0) * exp(-d * 7.0) * 0.5;
  vec3 haloCol = mix(vec3(0.42, 0.33, 1.0), vec3(0.68, 0.62, 1.0), lit);
  haloCol = mix(haloCol, vec3(0.62, 0.9, 1.0), clamp(wave, 0.0, 1.0) * 0.6);
  // к краям холста свечение сходит на нет — без резкой границы
  float edge = smoothstep(1.0, 0.72, max(abs(p.x), abs(p.y)));
  float ha = clamp(halo, 0.0, 1.0) * 0.75 * edge;
  vec3 rgb = haloCol * ha;
  float alpha = ha;

  if (r < uR + px) {
    vec3 n = vec3(p / uR, 0.0);
    n.z = sqrt(max(1.0 - dot(n.xy, n.xy), 0.0));
    float ndl = dot(n, L);
    float diff = max(ndl, 0.0);
    vec3 col = mix(vec3(0.012, 0.01, 0.024), vec3(0.34, 0.31, 0.47), pow(diff, 2.2));

    // туманность внутри стекла медленно вращается
    float t = uTime;
    float ca = cos(t * 0.05);
    float sa = sin(t * 0.05);
    vec3 q = vec3(ca * n.x + sa * n.z, n.y, -sa * n.x + ca * n.z) * 2.2;
    vec2 w = vec2(fbm(q + vec3(0.0, 0.0, t * 0.025)), fbm(q + vec3(5.2, 1.3, 2.8) - t * 0.02));
    float neb = smoothstep(0.4, 0.84, fbm(q + vec3(w, 0.0) * 2.0));
    vec3 nebCol = mix(vec3(0.44, 0.32, 1.0), vec3(0.36, 0.78, 1.0), smoothstep(0.35, 0.75, w.y));
    col += nebCol * neb * pow(n.z, 0.8) * (0.22 + 0.62 * (1.0 - diff)) * (1.0 + 2.2 * exp(-uPulse * 3.0) + uBirth * 1.5);

    // глянцевый блик
    vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
    float nh = max(dot(n, H), 0.0);
    col += vec3(1.0, 0.98, 1.0) * (pow(nh, 700.0) * 1.3 + pow(nh, 40.0) * 0.24 + pow(nh, 6.0) * 0.06);

    // контровой свет по краю — сильнее с теневой стороны
    float fres = pow(1.0 - n.z, 3.0);
    float back = 0.35 + 0.65 * clamp(0.5 - 0.5 * dot(dir, normalize(L.xy)), 0.0, 1.0);
    col += vec3(0.69, 0.62, 1.0) * fres * back * 0.9;

    col *= mix(0.5, 1.0, smoothstep(-0.55, 0.35, ndl));
    float a = smoothstep(uR + px, uR - px, r);
    rgb = col * a + rgb * (1.0 - a);
    alpha = a + alpha * (1.0 - a);
  }
  gl_FragColor = vec4(rgb, alpha);
}`;

const POINTS_VS = `
attribute vec4 aA; // угол, радиус, высота над плоскостью, множитель скорости
attribute vec4 aB; // размер, яркость, доля голубого, вид (0 — кольцо и пояс, 1 — второе кольцо, 2 — спутник)
uniform float uTime;
uniform float uPhase; // накопленный угол орбиты: при прокрутке растёт быстрее
uniform float uIntro; // секунды с начала появления (много — частицы уже на месте)
uniform float uPulse; // секунды с клика по шару
uniform vec3 uCur; // курсор в координатах холста и сила его влияния 0…1
uniform vec2 uPtr;
uniform float uR;
uniform float uDpr;
uniform float uLight;
varying vec3 vCol;
varying float vB;
varying float vKind;
void main() {
  float kind = aB.w;
  float h1 = fract(sin(aA.x * 91.7 + aA.y * 47.3 + aB.x * 3.1) * 43758.5453);
  float h2 = fract(sin(aA.x * 12.9 + aA.z * 78.2 + aB.y * 5.7) * 24634.6345);
  // появление: каждая частица со своей задержкой слетается издалека по спирали
  float k = clamp((uIntro - h1 * 1.1) / 1.7, 0.0, 1.0);
  float e = 1.0 - pow(1.0 - k, 3.0);
  float om = 0.13 * aA.w * pow(${RING.toFixed(4)} / aA.y, 1.5); // дальние частицы медленнее, как у планет
  float th = aA.x + uPhase * om - (1.0 - e) * (3.0 + h2 * 3.0);
  float rad = aA.y * mix(2.4 + h2 * 2.6, 1.0, e);
  // волна от клика: орбита вздрагивает — сначала наружу, потом затухающие колебания
  rad *= 1.0 + 0.085 * sin(uPulse * 10.0) * exp(-uPulse * 2.6) * (0.5 + h1);
  vec3 P = vec3(rad * cos(th), rad * sin(th), mix(aA.z + (h1 - 0.5) * 0.9, aA.z, e));
  bool alt = kind > 0.5 && kind < 1.5;
  float al = alt ? -1.22 : -1.344 + uPtr.y * 0.06; // наклон плоскости орбиты: -70° / -77°
  float be = alt ? 0.54 : -0.323 + 0.06 * sin(uTime * 0.2) + uPtr.x * 0.05; // поворот: 31° / -18.5°
  float y1 = P.y * cos(al) - P.z * sin(al);
  float z1 = P.y * sin(al) + P.z * cos(al);
  vec2 s = vec2(P.x * cos(be) - y1 * sin(be), P.x * sin(be) + y1 * cos(be));
  if (z1 < 0.0 && length(s) < uR * 0.995) {
    // задняя половина орбиты за шаром не видна
    gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
    gl_PointSize = 0.0;
    return;
  }
  // курсор раздвигает частицы, а ближние к нему подсвечиваются
  vec2 dv = s - uCur.xy;
  float dd = dot(dv, dv);
  float near = uCur.z * exp(-dd / 0.014);
  s += dv * inversesqrt(max(dd, 1e-6)) * near * 0.085;
  gl_Position = vec4(s, 0.0, 1.0);
  gl_PointSize = aB.x * uDpr * (1.0 + z1 * 0.5) * (1.0 + (1.0 - e) * 0.9);
  float b = aB.y * (z1 < 0.0 ? 0.55 : 1.0) * (0.75 + 0.25 * sin(uTime * 1.7 + aA.x * 13.0));
  b *= smoothstep(0.0, 0.3, k) * (1.0 + (1.0 - e) * 1.4) * (1.0 + 1.5 * exp(-uPulse * 3.2)) * (1.0 + near * 1.8);
  vec3 lav = uLight > 0.5 ? vec3(0.42, 0.34, 0.95) : vec3(0.8, 0.76, 1.0);
  vec3 cyan = uLight > 0.5 ? vec3(0.1, 0.55, 0.85) : vec3(0.5, 0.86, 1.0);
  vCol = kind > 1.5 ? vec3(1.0, 0.97, 1.0) : mix(lav, cyan, aB.z);
  vB = min(b, 1.0);
  vKind = kind;
}`;

const POINTS_FS = `
precision mediump float;
varying vec3 vCol;
varying float vB;
varying float vKind;
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float a = vKind > 1.5 ? exp(-r * r * 5.0) + 0.6 * smoothstep(0.35, 0.0, r) : smoothstep(1.0, 0.0, r);
  if (vKind < 1.5) a *= a;
  a = min(a, 1.0) * vB;
  gl_FragColor = vec4(vCol * a, a);
}`;

/** Частицы орбиты: тонкая яркая линия, мягкое свечение вокруг неё, разреженный внешний пояс,
 *  пыль, второе голубое кольцо и спутник. Детерминированный генератор — каждый раз одна картина. */
function particles(): Float32Array {
  let seed = 20260611;
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd());
  const TAU = Math.PI * 2;
  const out: number[] = [];
  const add = (n: number, make: () => number[]) => {
    for (let i = 0; i < n; i++) out.push(...make());
  };
  add(2400, () => [rnd() * TAU, RING * (1 + gauss() * 0.003), gauss() * 0.002, 1, 1.6 + rnd() * 1, 0.55 + rnd() * 0.35, rnd() * 0.2, 0]);
  add(1800, () => [rnd() * TAU, RING * (1 + gauss() * 0.03), gauss() * 0.01, 1, 2.5 + rnd() * 2.5, 0.07 + rnd() * 0.09, rnd() * 0.4, 0]);
  add(1300, () => [rnd() * TAU, RING * (1.12 + rnd() * 0.32), gauss() * 0.02, 1, 1 + rnd() * 1.4, 0.12 + rnd() * 0.26, 0.3 + rnd() * 0.7, 0]);
  add(400, () => [rnd() * TAU, RING * (0.85 + rnd() * 0.85), gauss() * 0.08, 1, 1.2 + rnd() * 2, 0.15 + rnd() * 0.35, rnd(), 0]);
  add(1100, () => [rnd() * TAU, RING * 1.1 * (1 + gauss() * 0.004), gauss() * 0.003, 0.7, 1.3 + rnd() * 0.8, 0.25 + rnd() * 0.25, 1, 1]);
  out.push(0.6, RING, 0, 3.45, 16, 1, 0, 2);
  return new Float32Array(out);
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (gl.getShaderParameter(sh, gl.COMPILE_STATUS)) return sh;
  console.warn("orb-gl:", gl.getShaderInfoLog(sh));
  gl.deleteShader(sh);
  return null;
}

function link(gl: WebGLRenderingContext, vs: string, fs: string) {
  const v = compile(gl, gl.VERTEX_SHADER, vs);
  const f = compile(gl, gl.FRAGMENT_SHADER, fs);
  const prog = v && f ? gl.createProgram() : null;
  if (!prog || !v || !f) return null;
  gl.attachShader(prog, v);
  gl.attachShader(prog, f);
  gl.linkProgram(prog);
  if (gl.getProgramParameter(prog, gl.LINK_STATUS)) return prog;
  console.warn("orb-gl:", gl.getProgramInfoLog(prog));
  return null;
}

/** Запускает шар на холсте. ptr — сглаженный курсор в [-1, 1] (y вниз), его обновляет Orb.tsx.
 *  Возвращает функцию остановки или null, если WebGL недоступен (тогда остаётся CSS-шар). */
export function startOrbGL(canvas: HTMLCanvasElement, ptr: { x: number; y: number }, onLost: () => void): (() => void) | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;
  const sphere = link(gl, QUAD_VS, SPHERE_FS);
  const points = link(gl, POINTS_VS, POINTS_FS);
  if (!sphere || !points) return null;

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const data = particles();
  const count = data.length / 8;
  const pbuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(sphere, "aPos");
  const aA = gl.getAttribLocation(points, "aA");
  const aB = gl.getAttribLocation(points, "aB");
  const su = (n: string) => gl.getUniformLocation(sphere, n);
  const pu = (n: string) => gl.getUniformLocation(points, n);
  const S = { res: su("uRes"), time: su("uTime"), ptr: su("uPtr"), r: su("uR"), pulse: su("uPulse"), birth: su("uBirth") };
  const P = {
    time: pu("uTime"),
    phase: pu("uPhase"),
    intro: pu("uIntro"),
    pulse: pu("uPulse"),
    cur: pu("uCur"),
    ptr: pu("uPtr"),
    r: pu("uR"),
    dpr: pu("uDpr"),
    light: pu("uLight"),
  };

  let raf = 0;
  let last = 0;
  let visible = false;
  let dead = false;
  let dpr = 1;
  const t0 = performance.now();

  // появление — один раз за сессию; если идёт заставка, ждём, пока она растворится
  let introAt = -1e9;
  try {
    if (!sessionStorage.getItem("utkir.orb")) {
      sessionStorage.setItem("utkir.orb", "1");
      introAt = document.documentElement.hasAttribute("data-boot") ? Math.max(t0 + 60, 1150) : t0 + 120;
    }
  } catch {
    /* без sessionStorage — без заставки */
  }

  // прокрутка раскручивает орбиту: копим угол сами, а не берём чистое время
  let phase = 0;
  let spin = 0;
  let prevNow = 0;
  let prevY = window.scrollY;

  // курсор и клик — только для мыши
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  let mx = -1e5;
  let my = -1e5;
  let cx = 0;
  let cy = 0;
  let cs = 0;
  let pulseAt = -1e9;
  const toCanvas = (x: number, y: number) => {
    const r = canvas.getBoundingClientRect();
    return { x: ((x - r.left) / r.width) * 2 - 1, y: 1 - ((y - r.top) / r.height) * 2 };
  };
  const onMove = (e: PointerEvent) => {
    mx = e.clientX;
    my = e.clientY;
  };
  const onOut = (e: PointerEvent) => {
    if (!e.relatedTarget) mx = my = -1e5;
  };
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0 || !visible) return;
    if ((e.target as Element | null)?.closest?.("a, button, input, textarea, select, label, [role='button']")) return;
    const c = toCanvas(e.clientX, e.clientY);
    if (Math.hypot(c.x, c.y) < R * 1.3) {
      pulseAt = performance.now();
      window.dispatchEvent(new Event("utkir:orb")); // звук — в Extras.tsx, вспышка туманности — в nebula-gl.ts
    }
  };
  if (fine) {
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onOut);
    window.addEventListener("pointerdown", onDown);
  }
  const ease = (x: number) => {
    // easeOutBack: шар чуть «перерастает» и встаёт на место
    const c = 1.5;
    const y = x - 1;
    return 1 + (c + 1) * y * y * y + c * y * y;
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (w && h && (canvas.width !== w || canvas.height !== h)) {
      canvas.width = w;
      canvas.height = h;
    }
  };

  const draw = (now: number) => {
    resize();
    const t = (now - t0) / 1000;
    gl.viewport(0, 0, canvas.width, canvas.height);

    const it = (now - introAt) / 1000;
    if (it < 0) {
      // ждём конца заставки: холст пуст
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }
    const grow = it > 1.5 ? 1 : ease(Math.min(Math.max((it - 0.05) / 1.35, 0), 1));
    const rad = Math.max(R * grow, 0.002);
    const birth = it > 2.2 ? 0 : Math.min(it / 0.12, 1) * (1 - Math.min(Math.max((it - 0.25) / 1.6, 0), 1));

    const dt = prevNow ? Math.min((now - prevNow) / 1000, 0.05) : 0.016;
    prevNow = now;
    const y = window.scrollY;
    const v = Math.abs(y - prevY) / Math.max(dt * 60, 0.5);
    prevY = y;
    spin += (Math.min(v * 0.16, 6) - spin) * 0.08;
    phase += dt * (1 + spin);

    const pulse = Math.min((now - pulseAt) / 1000, 30);
    let target = 0;
    if (mx > -1e4) {
      const c = toCanvas(mx, my);
      if (Math.abs(c.x) < 1.1 && Math.abs(c.y) < 1.1) {
        target = 1;
        cx += (c.x - cx) * 0.3;
        cy += (c.y - cy) * 0.3;
      }
    }
    cs += (target - cs) * 0.08;

    gl.disable(gl.BLEND);
    gl.useProgram(sphere);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.disableVertexAttribArray(aB);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(S.res, canvas.width, canvas.height);
    gl.uniform1f(S.time, t);
    gl.uniform2f(S.ptr, ptr.x, -ptr.y);
    gl.uniform1f(S.r, rad);
    gl.uniform1f(S.pulse, pulse);
    gl.uniform1f(S.birth, birth);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(points);
    gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
    gl.enableVertexAttribArray(aA);
    gl.enableVertexAttribArray(aB);
    gl.vertexAttribPointer(aA, 4, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(aB, 4, gl.FLOAT, false, 32, 16);
    gl.uniform1f(P.time, t);
    gl.uniform1f(P.phase, phase);
    gl.uniform1f(P.intro, it - 0.3);
    gl.uniform1f(P.pulse, pulse);
    gl.uniform3f(P.cur, cx, cy, cs);
    gl.uniform2f(P.ptr, ptr.x, -ptr.y);
    gl.uniform1f(P.r, rad);
    gl.uniform1f(P.dpr, dpr);
    gl.uniform1f(P.light, document.documentElement.dataset.theme === "light" ? 1 : 0);
    gl.drawArrays(gl.POINTS, 0, count);
  };

  const frame = (now: number) => {
    raf = 0;
    if (dead || !visible || document.hidden) return;
    raf = requestAnimationFrame(frame);
    if (now - last < 15) return;
    last = now;
    draw(now);
  };
  const kick = () => {
    if (!raf && !dead && visible && !document.hidden) raf = requestAnimationFrame(frame);
  };

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    kick();
  });
  io.observe(canvas);
  document.addEventListener("visibilitychange", kick);
  const onLostCtx = (e: Event) => {
    e.preventDefault();
    stop();
    onLost();
  };
  canvas.addEventListener("webglcontextlost", onLostCtx);

  function stop() {
    if (dead) return;
    dead = true;
    cancelAnimationFrame(raf);
    io.disconnect();
    document.removeEventListener("visibilitychange", kick);
    canvas.removeEventListener("webglcontextlost", onLostCtx);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerout", onOut);
    window.removeEventListener("pointerdown", onDown);
  }
  return () => {
    stop();
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
}
