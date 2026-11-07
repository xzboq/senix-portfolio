/** Звук сайта (ПК, по желанию): песня на кнопке звука (официальный плеер YouTube — Music.tsx) и короткие
 *  звуки интерфейса, синтезированные Web Audio на лету. По умолчанию выключен и не запоминается — песня
 *  не заиграет сама при следующем визите. Если песня не загрузилась, вместо неё звучит синтезированный
 *  космический эмбиент. AudioContext создаётся только после жеста пользователя (политика автоплея). */

export type Sfx = "hover" | "click" | "whoosh" | "comet" | "jump";

const EVENT = "utkir:sound";
export const SOUND_TOGGLE = "utkir:sound-toggle";

let on = false;
let fallback = false; // песня недоступна — кнопка включает эмбиент
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let verb: ConvolverNode | null = null;
let noise: AudioBuffer | null = null;
let ambient: { stop: () => void } | null = null;
let armed = false;

export const soundEnabled = (): boolean => on;

export function subscribeSound(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

function ensure(): AudioContext | null {
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  const ac = new AC();
  ctx = ac;
  master = ac.createGain();
  master.gain.value = 0;
  master.connect(ac.destination);
  // реверберация: импульс из затухающего шума — «пустота космоса»
  const len = Math.round(ac.sampleRate * 3);
  const ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
  }
  verb = ac.createConvolver();
  verb.buffer = ir;
  const wet = ac.createGain();
  wet.gain.value = 0.6;
  verb.connect(wet);
  wet.connect(master);
  noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  const nd = noise.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  return ac;
}

/** Нота с огибающей: быстрая атака, экспоненциальное затухание; по желанию — в реверберацию. */
function tone(freq: number, dur: number, vol: number, type: OscillatorType, at = 0, wet = false, to?: number) {
  if (!ctx || !master) return;
  const t = ctx.currentTime + at;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(master);
  if (wet && verb) g.connect(verb);
  o.start(t);
  o.stop(t + dur + 0.05);
}

/** Шумовой «вжух»: полосовой фильтр проезжает от from до to. */
function sweep(from: number, to: number, dur: number, vol: number) {
  if (!ctx || !master || !noise) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.2;
  bp.frequency.setValueAtTime(from, t);
  bp.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp);
  bp.connect(g);
  g.connect(master);
  if (verb) g.connect(verb);
  src.start(t);
  src.stop(t + dur + 0.05);
}

/** Эмбиент (запасной, если песня не загрузилась): тёплый гул — пила через медленно «дышащий» фильтр —
 *  и редкие звёздные искры. */
function startAmbient(ac: AudioContext): { stop: () => void } {
  const out = ac.createGain();
  out.gain.setValueAtTime(0, ac.currentTime);
  out.gain.linearRampToValueAtTime(0.055, ac.currentTime + 3);
  out.connect(master!);
  if (verb) out.connect(verb);
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 420;
  lp.Q.value = 0.7;
  lp.connect(out);
  const lfo = ac.createOscillator();
  lfo.frequency.value = 0.045;
  const depth = ac.createGain();
  depth.gain.value = 190;
  lfo.connect(depth);
  depth.connect(lp.frequency);
  lfo.start();
  const voices = [
    { f: 55, type: "sawtooth" as const, v: 0.5 },
    { f: 82.41, type: "sawtooth" as const, v: 0.32 },
    { f: 110, type: "sine" as const, v: 0.3 },
    { f: 164.81, type: "sine" as const, v: 0.12 },
  ].map(({ f, type, v }, i) => {
    const o = ac.createOscillator();
    o.type = type;
    o.frequency.value = f;
    o.detune.value = i % 2 ? 7 : -7;
    const g = ac.createGain();
    g.gain.value = v;
    o.connect(g);
    g.connect(lp);
    o.start();
    return o;
  });
  // искры: пентатоника в высоком регистре, случайная панорама
  const notes = [880, 987.77, 1174.66, 1318.51, 1567.98, 1760, 2349.32];
  let timer = 0;
  const spark = () => {
    timer = window.setTimeout(spark, 1600 + Math.random() * 4200);
    if (!ctx || ctx.state !== "running") return;
    const t = ac.currentTime;
    const o = ac.createOscillator();
    const g = ac.createGain();
    const p = ac.createStereoPanner();
    o.type = "sine";
    o.frequency.value = notes[(Math.random() * notes.length) | 0];
    p.pan.value = Math.random() * 1.6 - 0.8;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.022, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    o.connect(g);
    g.connect(p);
    p.connect(master!);
    if (verb) p.connect(verb);
    o.start(t);
    o.stop(t + 1.7);
  };
  timer = window.setTimeout(spark, 1200);
  return {
    stop: () => {
      clearTimeout(timer);
      const t = ac.currentTime;
      out.gain.cancelScheduledValues(t);
      out.gain.setTargetAtTime(0, t, 0.35);
      window.setTimeout(() => {
        voices.forEach((o) => o.stop());
        lfo.stop();
        out.disconnect();
      }, 2000);
    },
  };
}

function apply() {
  if (on) {
    const ac = ensure();
    if (!ac || !master) return;
    void ac
      .resume()
      .then(() => {
        if (!on || !master) return;
        if (fallback && !ambient) ambient = startAmbient(ac);
        master.gain.cancelScheduledValues(ac.currentTime);
        master.gain.setTargetAtTime(0.9, ac.currentTime, 0.3);
      })
      .catch(() => {});
  } else if (ctx && master) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
    ambient?.stop();
    ambient = null;
    window.setTimeout(() => {
      if (!on) void ctx?.suspend().catch(() => {});
    }, 1600);
  }
}

export function setSound(next: boolean) {
  on = next;
  apply();
  window.dispatchEvent(new Event(EVENT));
}

/** Песня недоступна (YouTube заблокирован, нет сети): кнопка звука включает космический эмбиент. */
export function setAmbientFallback(next: boolean) {
  fallback = next;
  apply();
}

/** На скрытой вкладке звуки интерфейса засыпают. */
export function initSound() {
  if (armed) return;
  armed = true;
  document.addEventListener("visibilitychange", () => {
    if (!ctx || !on) return;
    if (document.hidden) void ctx.suspend().catch(() => {});
    else void ctx.resume().catch(() => {});
  });
}

/** Короткий звук интерфейса; молчит, пока звук выключен или контекст не запущен. */
export function sfx(kind: Sfx) {
  if (!on || !ctx || ctx.state !== "running") return;
  switch (kind) {
    case "hover":
      tone(2400, 0.035, 0.012, "sine");
      break;
    case "click":
      tone(520, 0.09, 0.045, "triangle", 0, false, 880);
      break;
    case "whoosh":
      sweep(260, 2600, 0.6, 0.12);
      tone(220, 0.7, 0.09, "sine", 0, true, 48);
      break;
    case "comet":
      [1567.98, 1975.53, 2349.32, 2637.02, 3135.96].forEach((f, i) => tone(f, 0.6, 0.032, "sine", i * 0.055, true));
      tone(392, 0.5, 0.05, "triangle", 0, true, 784);
      break;
    case "jump":
      sweep(160, 6000, 1.3, 0.16);
      tone(150, 1.5, 0.12, "sine", 0, true, 28);
      break;
  }
}
