/** Планеты полёта (ПК): пока листаешь главную, мимо проплывают Земля с орбиты МКС (ночная сторона
 *  с огнями городов), Луна в кратерах, Марс с полярной шапкой, пояс астероидов и Юпитер с Большим
 *  красным пятном, а перед финалом — Сатурн с кольцами; у края Земли пролетает МКС. Это те же остановки,
 *  что на рельсе полёта (Flight.tsx). Каждое тело — сфера в шейдере:
 *  поверхность из 3D-шума (без швов), мягкий терминатор, свет склонов кратеров, атмосфера по краю и ореол.
 *  Тела висят у краёв экрана за стеклянными карточками и плывут медленнее страницы; при прокрутке
 *  чуть поворачиваются. Кадры — только при прокрутке, смене размера или темы; в покое не рисует ничего.
 *  Подключается динамически из Planets.tsx — на телефоны этот код не загружается. */

const MAXB = 12;
const MOON = 0;
const MARS = 1;
const JUPITER = 2;
const ROCK = 3;
const EARTH = 4;
const SATURN = 5;

interface Spec {
  id: string; // раздел, к которому привязано тело («foot» — подвал)
  type: number;
  side: 1 | -1; // у правого или левого края
  r: number; // радиус, доля высоты экрана
  k: number; // насколько центр за краем: 0 — на краю, 1 — целиком за ним
  dy: number; // сдвиг по вертикали от середины экрана, доля высоты
  par: number; // параллакс: 1 — едет вместе со страницей, меньше — дальше и медленнее
  tilt: number; // наклон оси
  seed: number;
  spin: number; // скорость поворота при прокрутке
  sun: readonly [number, number, number]; // откуда светит солнце (x вправо, y вверх, z к зрителю)
}

const SPECS: Spec[] = [
  // Земля с орбиты: огромная дуга слева, ночная сторона с огнями, солнце — сзади слева
  { id: "demo", type: EARTH, side: -1, r: 1.0, k: 0.7, dy: 0.18, par: 0.5, tilt: 0.4, seed: 3.1, spin: 0.7, sun: [-0.62, 0.55, -0.18] },
  { id: "works", type: MOON, side: 1, r: 0.3, k: 0.36, dy: -0.14, par: 0.55, tilt: 0.12, seed: 7.7, spin: 0.6, sun: [-0.78, 0.38, 0.5] },
  { id: "method", type: MARS, side: -1, r: 0.25, k: 0.38, dy: -0.1, par: 0.58, tilt: 0.44, seed: 1.9, spin: 0.9, sun: [0.76, 0.42, 0.5] },
  // пояс астероидов: камни разного размера и глубины у обоих краёв
  { id: "play", type: ROCK, side: 1, r: 0.075, k: -0.6, dy: -0.18, par: 0.62, tilt: 0.3, seed: 2.2, spin: 2.4, sun: [-0.7, 0.45, 0.55] },
  { id: "play", type: ROCK, side: 1, r: 0.04, k: -1.9, dy: 0.06, par: 0.5, tilt: 1.1, seed: 4.4, spin: 3.1, sun: [-0.7, 0.45, 0.55] },
  { id: "play", type: ROCK, side: -1, r: 0.055, k: -1.2, dy: -0.06, par: 0.7, tilt: 0.7, seed: 6.6, spin: 2.7, sun: [0.7, 0.45, 0.55] },
  { id: "play", type: ROCK, side: -1, r: 0.03, k: -3.1, dy: 0.2, par: 0.45, tilt: 2.0, seed: 8.8, spin: 3.6, sun: [0.7, 0.45, 0.55] },
  { id: "play", type: ROCK, side: 1, r: 0.022, k: -4.4, dy: -0.3, par: 0.4, tilt: 0.9, seed: 9.9, spin: 4.2, sun: [-0.7, 0.45, 0.55] },
  { id: "play", type: ROCK, side: 1, r: 0.05, k: -0.9, dy: 0.32, par: 0.66, tilt: 1.7, seed: 1.3, spin: 2.2, sun: [-0.7, 0.45, 0.55] },
  { id: "play", type: ROCK, side: -1, r: 0.018, k: -5.8, dy: -0.26, par: 0.38, tilt: 0.4, seed: 3.7, spin: 4.8, sun: [0.7, 0.45, 0.55] },
  { id: "contact", type: JUPITER, side: 1, r: 0.5, k: 0.54, dy: -0.14, par: 0.52, tilt: 0.06, seed: 5.3, spin: 0.5, sun: [-0.8, 0.3, 0.5] },
  // Сатурн: над подвалом слева, кольца наклонены к зрителю; tilt — поворот эллипса колец на экране
  { id: "foot", type: SATURN, side: -1, r: 0.12, k: -0.35, dy: -0.36, par: 0.75, tilt: 0.32, seed: 6.1, spin: 0.4, sun: [0.72, 0.42, 0.55] },
];

/** Что закрывает фон: над этим МКС не показывается. */
const COVER = ".panel, .card, .m-item, .more-item, .stack, .channels, .top, .fab, .np, p, h1, h2, h3, li, dt, dd";

const VS = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#define MAXB ${MAXB}
uniform int uCount;
uniform vec4 uBody[MAXB]; // xy — центр (px холста, от левого нижнего угла), z — радиус (px), w — тип
uniform vec4 uSpin[MAXB]; // x — поворот вокруг оси, y — наклон оси, z — зерно
uniform vec3 uSun[MAXB];  // направление на солнце

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
    mix(mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x), mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x), mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z);
}
float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
    a *= 0.5;
  }
  return v;
}
vec3 rotY(vec3 v, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(c * v.x + s * v.z, v.y, -s * v.x + c * v.z);
}
vec3 rotZ(vec3 v, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(c * v.x - s * v.y, s * v.x + c * v.y, v.z);
}

// кратеры: чаша и вал в случайных ячейках. slope — «свет склонов»: стенка, обращённая к солнцу, светлее
float craters(vec3 p, vec3 Lp, float seed, inout float slope) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  float h = 0.0;
  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      for (int z = -1; z <= 1; z++) {
        vec3 g = vec3(float(x), float(y), float(z));
        vec3 c = i + g;
        if (hash(c + seed) < 0.42) continue;
        vec3 o = vec3(hash(c + seed + 3.1), hash(c + seed + 5.7), hash(c + seed + 9.3));
        float sz = hash(c + seed + 7.0);
        float size = 0.12 + 0.4 * sz * sz;
        vec3 r = g + o - f;
        float len = length(r);
        float k = len / size;
        if (k > 1.6) continue;
        vec3 rn = r / max(len, 1e-4);
        float bowl = smoothstep(1.0, 0.25, k);
        float rim = exp(-pow((k - 1.0) * 4.5, 2.0));
        h += rim * 0.22 - bowl * 0.55;
        slope += dot(rn, Lp) * (bowl * 0.8 - rim * 0.5);
      }
    }
  }
  return h;
}

vec3 moonColor(vec3 p, vec3 Lp, float seed, inout float slope) {
  float mare = smoothstep(0.5, 0.64, fbm(p * 1.4 + seed));
  float h = craters(p * 3.0, Lp, seed, slope) + craters(p * 7.0, Lp, seed + 11.0, slope) * 0.6;
  vec3 c = mix(vec3(0.74, 0.73, 0.72), vec3(0.36, 0.36, 0.38), mare);
  return c * (0.86 + 0.28 * fbm(p * 16.0) + h * 0.18);
}
vec3 rockColor(vec3 p, vec3 Lp, float seed, inout float slope) {
  float h = craters(p * 3.5, Lp, seed, slope);
  vec3 c = mix(vec3(0.27, 0.23, 0.21), vec3(0.55, 0.48, 0.41), fbm(p * 5.0 + seed));
  return c * (0.85 + h * 0.25);
}
vec3 marsColor(vec3 p, float seed) {
  float h = fbm(p * 2.0 + seed);
  float d = fbm(p * 5.5 + h * 2.0);
  vec3 c = mix(vec3(0.40, 0.14, 0.07), vec3(0.80, 0.38, 0.18), smoothstep(0.32, 0.66, h));
  c = mix(c, vec3(0.92, 0.60, 0.38), smoothstep(0.56, 0.8, d) * 0.45);
  c = mix(c, vec3(0.20, 0.08, 0.05), smoothstep(0.56, 0.68, fbm(p * 1.2 + seed + 9.0)) * 0.55);
  float cap = smoothstep(0.8, 0.88, abs(p.y) + (fbm(p * 4.0) - 0.5) * 0.14);
  return mix(c, vec3(0.96, 0.95, 0.94), cap);
}
vec3 jupiterColor(vec3 p, float seed) {
  float lat = p.y;
  float lon = atan(p.z, p.x);
  float w = fbm(vec3(p.x * 1.6, p.y * 7.0, p.z * 1.6) + seed);
  float b = lat * 9.0 + (w - 0.5) * 2.2;
  vec3 c = mix(vec3(0.86, 0.76, 0.62), vec3(0.64, 0.43, 0.30), 0.5 + 0.5 * sin(b * 2.6));
  c = mix(c, vec3(0.95, 0.91, 0.84), smoothstep(0.55, 1.0, sin(b * 1.3 + 1.2)) * 0.55);
  c = mix(c, vec3(0.45, 0.30, 0.22), smoothstep(0.6, 1.0, sin(b * 4.1 + 0.4)) * 0.25);
  vec2 q = vec2((lon + 2.2) * 1.15, (lat + 0.34) * 3.0); // Большое красное пятно
  return mix(c, vec3(0.78, 0.36, 0.22), smoothstep(0.42, 0.16, length(q)) * 0.85);
}
vec3 saturnColor(vec3 p, float seed) {
  float lat = p.y;
  float w = fbm(vec3(p.x * 1.4, p.y * 6.0, p.z * 1.4) + seed);
  float b = lat * 7.0 + (w - 0.5) * 1.2;
  vec3 c = mix(vec3(0.90, 0.82, 0.62), vec3(0.76, 0.64, 0.44), 0.5 + 0.5 * sin(b * 2.2));
  c = mix(c, vec3(0.96, 0.92, 0.80), smoothstep(0.6, 1.0, sin(b * 1.1 + 0.7)) * 0.4);
  return mix(c, vec3(0.60, 0.66, 0.72), smoothstep(0.72, 0.95, abs(lat)) * 0.55); // голубоватые полюса
}

// Сатурн: шар и кольца в наклонённой плоскости. Где кольцо ближе к зрителю, чем поверхность, — оно спереди;
// тень шара ложится на кольца, тень колец — на шар; в кольцах щель Кассини
vec4 saturn(vec2 d, vec4 S, vec3 L, float aa) {
  float r = length(d);
  float ca = cos(0.42);
  float sa = sin(0.42);
  vec3 N = vec3(-sin(S.y) * ca, cos(S.y) * ca, sa);
  float zr = -(N.x * d.x + N.y * d.y) / N.z;
  vec3 P = vec3(d, zr);
  float t = (length(P) - 1.28) / 1.0;
  float dens = 0.0;
  float bright = 0.0;
  if (t > 0.0 && t < 1.0) {
    float cr = smoothstep(0.0, 0.03, t) * (1.0 - smoothstep(0.17, 0.22, t)) * 0.32;   // кольцо C — тусклое
    float br = smoothstep(0.17, 0.24, t) * (1.0 - smoothstep(0.545, 0.565, t));       // кольцо B — самое яркое
    float ar = smoothstep(0.62, 0.65, t) * smoothstep(1.0, 0.95, t) * 0.72;           // кольцо A; между B и A — щель Кассини
    dens = max(cr, max(br, ar));
    dens *= 1.0 - 0.85 * exp(-pow((t - 0.9) * 120.0, 2.0));                           // щель Энке
    dens *= 0.76 + 0.24 * noise(vec3(t * 46.0, 0.5, S.z));                            // неровные дорожки
    bright = br;
    float along = dot(P, L);
    if (along < 0.0 && length(P - along * L) < 1.0) dens *= 0.22;
  }
  vec3 rc = mix(vec3(0.62, 0.57, 0.5), vec3(0.97, 0.91, 0.78), 0.35 + 0.65 * bright);
  rc *= 0.35 + 0.75 * abs(dot(N, L));
  float ra = clamp(dens, 0.0, 1.0) * 0.92;
  vec4 ring = vec4(rc * ra, ra);
  vec4 ball = vec4(0.0);
  float zs = -2.0;
  if (r < 1.0 + aa) {
    float inside = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, r);
    vec3 n = vec3(d, sqrt(max(1.0 - r * r, 0.0)));
    zs = n.z;
    vec3 p = rotY(n, S.x);
    float day = smoothstep(-0.12, 0.45, dot(n, L));
    vec3 c = saturnColor(p, S.z) * day;
    float tr = -dot(n, N) / dot(L, N);
    float qr = length(n + L * tr);
    if (tr > 0.0 && qr > 1.28 && qr < 2.28) c *= 0.55;
    c += vec3(1.0, 0.92, 0.75) * pow(1.0 - n.z, 2.6) * 0.25 * day;
    ball = vec4(c * inside, inside);
  }
  if (ra <= 0.0) return ball;
  if (zr > zs) return ring + ball * (1.0 - ring.a);
  return ball + ring * (1.0 - ball.a);
}

// Земля: альбедо; ocean — доля океана (блеск), lights — ночные города, cloud — облака
vec3 earthColor(vec3 p, float seed, out float ocean, out float lights, out float cloud) {
  float h = fbm(p * 1.7 + seed);
  float land = smoothstep(0.465, 0.495, h);
  ocean = 1.0 - land;
  float lat = abs(p.y);
  vec3 sea = mix(vec3(0.015, 0.07, 0.2), vec3(0.03, 0.17, 0.36), fbm(p * 3.0 + 4.0));
  vec3 ground = mix(vec3(0.13, 0.26, 0.10), vec3(0.50, 0.42, 0.27), smoothstep(0.54, 0.72, h + (0.6 - lat) * 0.08));
  vec3 c = mix(sea, ground, land);
  float ice = smoothstep(0.8, 0.86, lat + (fbm(p * 5.0) - 0.5) * 0.08);
  c = mix(c, vec3(0.9, 0.93, 0.96), ice);
  cloud = smoothstep(0.52, 0.78, fbm(p * 3.2 + vec3(seed * 1.3, 0.0, 2.0) + 0.6 * fbm(p * 7.0)));
  // огни городов: мелкие точки, собранные в скопления
  lights = land * (1.0 - ice) * smoothstep(0.72, 0.98, noise(p * 340.0)) * smoothstep(0.46, 0.62, fbm(p * 9.0 + 2.0));
  return c;
}

vec4 body(vec4 B, vec4 S, vec3 L) {
  vec2 d = (gl_FragCoord.xy - B.xy) / B.z;
  float type = B.w;
  float aa = 1.2 / B.z;
  if (type > 4.5) return saturn(d, S, L, aa);
  float r = length(d);
  float edge = 1.0;
  if (type > 2.5 && type < 3.5) {
    // астероид: неровный край
    float a = atan(d.y, d.x);
    vec3 ring = vec3(cos(a), sin(a), S.z);
    edge = 1.0 + 0.28 * (noise(ring * vec3(1.5, 1.5, 1.0)) - 0.5) + 0.1 * (noise(ring * vec3(4.0, 4.0, 1.0) + 5.0) - 0.5);
  }
  float rr = r / edge;
  vec3 atmo = vec3(0.0);
  float atm = 0.0;
  if (type > 0.5 && type < 1.5) {
    atmo = vec3(1.0, 0.56, 0.4);
    atm = 0.45;
  } else if (type > 1.5 && type < 2.5) {
    atmo = vec3(1.0, 0.88, 0.74);
    atm = 0.3;
  } else if (type > 3.5) {
    atmo = vec3(0.36, 0.62, 1.0);
    atm = 1.0;
  }
  float lit = smoothstep(-0.35, 0.6, dot(vec3(d / max(r, 1e-4), 0.0), L));
  if (rr > 1.0) {
    // ореол атмосферы; у Земли виден и на ночной стороне, плюс тонкое зелёное свечение верхних слоёв
    float base = type > 3.5 ? 0.35 : 0.2;
    float halo = atm * exp(-(rr - 1.0) * (type > 3.5 ? 11.0 : 16.0)) * (base + (1.0 - base) * lit);
    vec3 col = atmo * halo;
    if (type > 3.5) col += vec3(0.3, 0.85, 0.55) * exp(-pow((rr - 1.012) * 140.0, 2.0)) * 0.35;
    return vec4(col, halo * 0.75);
  }
  float inside = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, rr);
  vec3 n = vec3(d / edge, sqrt(max(1.0 - rr * rr, 0.0)));
  vec3 p = rotY(rotZ(n, -S.y), S.x);
  vec3 Lp = rotY(rotZ(L, -S.y), S.x);
  float ndl = dot(n, L);
  float day = smoothstep(-0.12, 0.45, ndl);
  float slope = 0.0;
  vec3 col;
  if (type < 0.5) {
    col = moonColor(p, Lp, S.z, slope);
    col *= day * clamp(1.0 + slope * 0.9, 0.2, 1.8);
  } else if (type < 1.5) {
    col = marsColor(p, S.z) * day;
  } else if (type < 2.5) {
    col = jupiterColor(p, S.z) * day;
  } else if (type < 3.5) {
    col = rockColor(p, Lp, S.z, slope);
    col *= day * clamp(1.0 + slope * 0.9, 0.2, 1.8);
  } else {
    float ocean;
    float lights;
    float cloud;
    vec3 a = earthColor(p, S.z, ocean, lights, cloud);
    vec3 hv = normalize(L + vec3(0.0, 0.0, 1.0));
    float spec = pow(max(dot(n, hv), 0.0), 60.0) * ocean * (1.0 - cloud) * 0.45;
    col = (a * (1.0 - cloud) + vec3(0.95) * cloud) * day + vec3(1.0, 0.92, 0.8) * spec * day;
    col += vec3(1.0, 0.78, 0.46) * lights * (1.0 - day) * (1.0 - cloud * 0.8) * 1.3;
  }
  float fres = pow(1.0 - n.z, 2.6);
  col += atmo * fres * atm * (0.15 + 0.85 * smoothstep(-0.25, 0.4, ndl)) * 0.9;
  col += vec3(0.012, 0.012, 0.022) * (1.0 - day);
  return vec4(col * inside, inside);
}

void main() {
  vec4 acc = vec4(0.0);
  for (int i = 0; i < MAXB; i++) {
    if (i >= uCount) break;
    vec4 B = uBody[i];
    vec2 d = (gl_FragCoord.xy - B.xy) / B.z;
    if (dot(d, d) > (B.w > 4.5 ? 5.4 : 1.96)) continue; // у Сатурна кольца шире шара
    vec4 c = body(B, uSpin[i], uSun[i]);
    acc = c + acc * (1.0 - c.a);
  }
  gl_FragColor = acc;
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (gl.getShaderParameter(sh, gl.COMPILE_STATUS)) return sh;
  console.warn("planets-gl:", gl.getShaderInfoLog(sh));
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
  console.warn("planets-gl:", gl.getProgramInfoLog(prog));
  return null;
}

const norm = (v: readonly [number, number, number]) => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};

/** Запускает планеты на холсте; iss — силуэт станции, который летит вдоль края Земли.
 *  Возвращает функцию остановки или null, если WebGL недоступен. */
export function startPlanets(canvas: HTMLCanvasElement, iss?: SVGElement | null): (() => void) | null {
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
  gl.useProgram(prog);
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  gl.disable(gl.BLEND);
  const uCount = gl.getUniformLocation(prog, "uCount");
  const uBody = gl.getUniformLocation(prog, "uBody");
  const uSpin = gl.getUniformLocation(prog, "uSpin");
  const uSun = gl.getUniformLocation(prog, "uSun");
  const body = new Float32Array(MAXB * 4);
  const spin = new Float32Array(MAXB * 4);
  const sun = new Float32Array(MAXB * 3);
  const suns = SPECS.map((s) => norm(s.sun));

  const root = document.documentElement;
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = 0;
  let dead = false;
  let empty = false; // в прошлом кадре ничего не было — холст уже чистый
  let dpr = 1;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      empty = false;
    }
  };

  const frame = () => {
    raf = 0;
    if (dead) return;
    resize();
    const vw = canvas.clientWidth;
    const vh = canvas.clientHeight;
    let n = 0;
    let station: string | null = null; // положение МКС, если Земля в кадре
    if (root.dataset.theme !== "light") {
      const tops = new Map<string, number>();
      for (let i = 0; i < SPECS.length && n < MAXB; i++) {
        const s = SPECS[i];
        let top = tops.get(s.id);
        if (top === undefined) {
          const el = s.id === "foot" ? document.querySelector("footer") : document.getElementById(s.id);
          top = el ? el.getBoundingClientRect().top : Number.NaN;
          tops.set(s.id, top);
        }
        if (Number.isNaN(top)) continue;
        const R = s.r * vh;
        const par = calm ? 1 : s.par;
        // когда верх раздела посреди экрана — тело на своём месте; дальше плывёт медленнее страницы
        const cy = vh * (0.5 + s.dy) + (top - vh * 0.5) * par;
        const cx = s.side > 0 ? vw + R * s.k : -R * s.k;
        const reach = R * (s.type === SATURN ? 2.4 : 1.4);
        if (cy + reach < 0 || cy - reach > vh || cx + reach < 0 || cx - reach > vw) continue;
        body.set([cx * dpr, (vh - cy) * dpr, R * dpr, s.type], n * 4);
        if (s.type === EARTH) {
          // МКС — чуть выше атмосферы, на видимом (правом) краю; при прокрутке поднимается по дуге.
          // Ферма с панелями перпендикулярна направлению полёта — то есть смотрит от центра Земли
          const f = Math.min(Math.max((vh * 0.5 - top) / vh, -1.2), 1.2);
          const phi = 0.45 + f * 0.5; // выше заголовка раздела — в промежутке над ним
          const x = cx + Math.cos(phi) * R * 1.035;
          const y = cy - Math.sin(phi) * R * 1.035;
          // за карточкой или текстом станцию не показываем — сквозь стекло она выглядела бы пятном
          const under = x > 0 && x < vw && y > 0 && y < vh ? document.elementFromPoint(x, y) : null;
          const open = !under || !under.closest(COVER);
          if (open && x > -40 && x < vw + 40 && y > -40 && y < vh + 40) station = `translate(${(x - 22).toFixed(1)}px, ${(y - 11).toFixed(1)}px) rotate(${((-phi * 180) / Math.PI).toFixed(1)}deg)`;
        }
        const a = calm ? 0 : -top * 0.0006 * s.spin;
        spin.set([a + s.seed, s.tilt, s.seed, 0], n * 4);
        sun.set(suns[i], n * 3);
        n++;
      }
    }
    if (iss) {
      if (station) {
        iss.style.transform = station;
        iss.dataset.on = "";
      } else delete iss.dataset.on;
    }
    if (!n) {
      if (!empty) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        empty = true;
      }
      return;
    }
    empty = false;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1i(uCount, n);
    gl.uniform4fv(uBody, body);
    gl.uniform4fv(uSpin, spin);
    gl.uniform3fv(uSun, sun);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    canvas.dataset.on = "";
  };
  const request = () => {
    if (!raf && !dead) raf = requestAnimationFrame(frame);
  };
  const onLost = (e: Event) => {
    e.preventDefault();
    stop();
  };
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  window.addEventListener("utkir:theme", request);
  canvas.addEventListener("webglcontextlost", onLost);
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
    canvas.removeEventListener("webglcontextlost", onLost);
    ro.disconnect();
    delete canvas.dataset.on;
  }
  return stop;
}
