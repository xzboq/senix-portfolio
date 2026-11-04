/**
 * Порт эвристик и Risk Engine из Kiber Yordamchi (Python → TypeScript).
 * Работает целиком в браузере: ничего не отправляется по сети, поэтому
 * доступны только проверки текста и адреса — без загрузки страницы/APK.
 * Веса, пороги и правило арбитража — те же, что в engine/risk_engine.py.
 */
import type { Locale } from "@/content/i18n";

export type Severity = "low" | "medium" | "high";
export interface Signal {
  type: string;
  severity: Severity;
  confidence: number;
  params?: Record<string, string>;
}
export type Verdict =
  | "SAFE"
  | "LOW_RISK"
  | "SUSPICIOUS"
  | "HIGH_RISK"
  | "DANGEROUS"
  | "UNKNOWN";

export interface Evidence extends Signal {
  id: string;
}
export interface TraceRow {
  type: string;
  count: number;
  contribution: number;
}
export interface Assessment {
  verdict: Verdict;
  score: number;
  confidence: number;
  category: string | null;
  evidence: Evidence[];
  trace: TraceRow[];
  corroborated: boolean;
  capped: boolean;
}

const SEVERITY_WEIGHTS: Record<Severity, number> = { low: 12, medium: 28, high: 45 };
const THRESHOLDS: [number, Verdict][] = [
  [80, "DANGEROUS"],
  [60, "HIGH_RISK"],
  [30, "SUSPICIOUS"],
  [10, "LOW_RISK"],
  [0, "SAFE"],
];
const MIN_SIGNALS_FOR_VERDICT = 2;
const UNKNOWN_CONFIDENCE_THRESHOLD = 40;

const CATEGORY_MAP: Record<string, string> = {
  telegram_otp_harvest: "ACCOUNT_TAKEOVER",
  otp_harvest: "ACCOUNT_TAKEOVER",
  otp_solicitation: "ACCOUNT_TAKEOVER",
  fake_voting: "ACCOUNT_TAKEOVER",
  fake_support: "IDENTITY_IMPERSONATION",
  brand_impersonation: "PHISHING",
  brand_homoglyph: "PHISHING",
  homoglyph_domain: "PHISHING",
  credential_form: "PHISHING",
  card_collection: "PAYMENT_FRAUD",
  investment_scam: "INVESTMENT_SCAM",
  fake_giveaway: "FAKE_GIVEAWAY",
  fake_login: "PHISHING",
  otp_interception_chain: "ACCOUNT_TAKEOVER",
  telegram_bot_token: "APK_MALWARE",
  decompression_ratio: "APK_MALWARE",
  too_many_files: "APK_MALWARE",
  ip_url: "APK_MALWARE",
  app_impersonation: "IDENTITY_IMPERSONATION",
};
const CATEGORY_PRIORITY = [
  "ACCOUNT_TAKEOVER",
  "APK_MALWARE",
  "PAYMENT_FRAUD",
  "PHISHING",
  "IDENTITY_IMPERSONATION",
  "INVESTMENT_SCAM",
  "FAKE_GIVEAWAY",
];

function corroborated(signals: Signal[]): boolean {
  const high = signals.filter((s) => s.severity === "high" || s.severity === "medium");
  return (
    new Set(high.map((s) => s.type)).size >= 2 ||
    (high.length === 1 && high[0].confidence >= 0.85)
  );
}

/** Однотипные сигналы суммируются с затуханием: максимум + 8 за каждый повтор. */
function weighted(signals: Signal[]): { total: number; trace: TraceRow[] } {
  const groups = new Map<string, Signal[]>();
  for (const s of signals) groups.set(s.type, [...(groups.get(s.type) ?? []), s]);
  let total = 0;
  const trace: TraceRow[] = [];
  for (const [type, group] of groups) {
    const c = group
      .map((s) => SEVERITY_WEIGHTS[s.severity] * s.confidence)
      .sort((a, b) => b - a);
    const contribution = c[0] + 8 * (c.length - 1);
    total += contribution;
    trace.push({ type, count: group.length, contribution });
  }
  trace.sort((a, b) => b.contribution - a.contribution);
  return { total, trace };
}

function evidenceOf(signals: Signal[]): Evidence[] {
  const order: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
  return [...signals]
    .sort((a, b) => order[a.severity] - order[b.severity])
    .map((s, i) => ({ ...s, id: `E${String(i + 1).padStart(2, "0")}` }));
}

export function assess(signals: Signal[], knownMalicious = false): Assessment {
  const base = { trace: [] as TraceRow[], corroborated: false, capped: false };
  const meaningful = signals.filter((s) => s.type !== "unreachable" && s.type !== "ssrf_blocked");
  const { total, trace } = weighted(meaningful);
  const score = Math.min(100, Math.floor(total) + (knownMalicious ? 50 : 0));

  if (!meaningful.length) {
    return { ...base, verdict: knownMalicious ? "DANGEROUS" : "UNKNOWN", score, confidence: 0, category: null, evidence: [] };
  }
  if (meaningful.every((s) => s.severity === "low")) {
    // fail-closed: по одним слабым сигналам вердикт не выдаём
    const nonLow = new Set(meaningful.filter((s) => s.severity !== "low").map((s) => s.type)).size;
    if (nonLow < MIN_SIGNALS_FOR_VERDICT - 1) {
      const confidence = 30;
      return {
        ...base,
        trace,
        verdict: confidence < UNKNOWN_CONFIDENCE_THRESHOLD ? "UNKNOWN" : "LOW_RISK",
        score,
        confidence,
        category: null,
        evidence: evidenceOf(signals),
      };
    }
  }

  let confidence = Math.min(97, 40 + 12 * meaningful.length);
  let verdict: Verdict = "SAFE";
  for (const [t, name] of THRESHOLDS) {
    if (score >= t) {
      verdict = name;
      break;
    }
  }
  const corr = corroborated(meaningful);
  let capped = false;
  if ((verdict === "HIGH_RISK" || verdict === "DANGEROUS") && !corr && !knownMalicious) {
    verdict = "SUSPICIOUS";
    confidence = Math.min(confidence, 60);
    capped = true;
  }
  let category: string | null = null;
  if (meaningful.some((s) => s.severity === "high")) {
    const cats = new Set(meaningful.map((s) => CATEGORY_MAP[s.type]).filter(Boolean));
    category = CATEGORY_PRIORITY.find((c) => cats.has(c)) ?? null;
  }
  return { verdict, score, confidence, category, evidence: evidenceOf(signals), trace, corroborated: corr, capped };
}

/* ───────────── эвристики сообщений и адресов (engine/message_analyzer.py, url_scanner.py) ───────────── */

const RX = {
  urgency: /(срочн|остал(ось|ись)\s+\d|последни[ей]\s+(шанс|минут|час)|nekidar|shoshilinch|tezkor|faqat\s+\d)/iu,
  voting: /(гололосуй|голосуй|проголосуй|ovoz\s*ber|ovozing)/iu,
  otp: /(отправ(ь|ьте|ить)\s+код|пришли\s+код|введи\s+код|send\s+(me\s+)?(the\s+)?code|kodni\s*(yubor|jo’nat|jonat))/iu,
  giveaway: /(розыгрыш|подар(ок|ки)|бесплатн|giveaway|free\s+(crypto|bitcoin|prize)|sovr[a’']?ga|bepul)/iu,
  invest: /(инвестиц|заработ(ок|аешь)|x\d+\s+прибыл|доход\s+\d+%|invest|\sdaromad|foyda)/iu,
  support: /(служба\s+поддержк|поддержка\s+telegram|support\s+team|администратор\s+telegram)/iu,
};

const SHORTENERS = new Set(["bit.ly", "t.ly", "cutt.ly", "tinyurl.com", "is.gd", "shorturl.at", "rb.gy", "t.co", "goo.gl", "ow.ly", "vk.cc", "clck.ru", "t.me"]);
const BRANDS = ["telegram", "payme", "click", "uzum", "humo", "uzcard", "nmb", "sqb", "kapitalbank", "anorbank", "tbc", "imvo", "soliq", "gov"];
const BAD_TLDS = new Set(["tk", "ml", "ga", "cf", "gq", "xyz", "top", "buzz", "click", "live", "rest", "sbs", "cyou", "icu", "monster", "zip", "mov"]);
const TRANSLIT: Record<string, string> = {
  а: "a", е: "e", о: "o", р: "p", с: "c", х: "x", у: "y", к: "k", м: "m", т: "t", в: "b", н: "h",
  "@": "a", "0": "o", "1": "i", "3": "e", $: "s", "5": "s", q: "g",
};
const deLookalike = (h: string) => [...h.toLowerCase()].map((c) => TRANSLIT[c] ?? c).join("");

export function analyzeHost(host: string): Signal[] {
  const out: Signal[] = [];
  const tld = host.split(".").pop() ?? "";
  if ([...BAD_TLDS].some((t) => host.endsWith("." + t) || host === t)) {
    out.push({ type: "suspicious_tld", severity: "medium", confidence: 0.7, params: { tld } });
  }
  if (SHORTENERS.has(host)) out.push({ type: "url_shortener", severity: "low", confidence: 0.9 });
  if (host.split(".").length >= 4 && /\d/.test(host)) {
    out.push({ type: "suspicious_domain", severity: "medium", confidence: 0.6 });
  }
  if (/[а-яё]/i.test(host)) out.push({ type: "homoglyph_domain", severity: "high", confidence: 0.75 });

  let brand = BRANDS.find((b) => host.includes(b) && host !== b + ".com" && !host.startsWith(b + "."));
  if (!brand) {
    const norm = deLookalike(host);
    brand = BRANDS.find((b) => norm.includes(b) && !host.startsWith(b + "."));
    if (brand && !host.includes(brand)) out.push({ type: "brand_homoglyph", severity: "high", confidence: 0.8 });
  }
  if (brand) out.push({ type: "brand_impersonation", severity: "high", confidence: 0.7, params: { brand } });
  return out;
}

const URL_RE = /https?:\/\/[^\s<>()"']+|www\.[^\s<>()"']+/gi;
const TG_RE = /t\.me\/[^\s<>()"']+/gi;

export function hostOf(raw: string): string {
  return raw
    .replace(/^https?:\/\//i, "")
    .split(/[/?#:]/)[0]
    .replace(/[.,;!?»”]+$/, "")
    .toLowerCase();
}

export function analyzeText(text: string): Signal[] {
  const sig: Signal[] = [];
  if (RX.urgency.test(text)) sig.push({ type: "urgency", severity: "medium", confidence: 0.8 });
  if (RX.voting.test(text)) sig.push({ type: "fake_voting", severity: "high", confidence: 0.7 });
  if (RX.otp.test(text)) sig.push({ type: "otp_solicitation", severity: "high", confidence: 0.9 });
  if (RX.giveaway.test(text)) sig.push({ type: "fake_giveaway", severity: "medium", confidence: 0.6 });
  if (RX.invest.test(text)) sig.push({ type: "investment_scam", severity: "medium", confidence: 0.6 });
  if (RX.support.test(text)) sig.push({ type: "fake_support", severity: "high", confidence: 0.7 });

  const seen = new Set<string>();
  for (const u of [...(text.match(URL_RE) ?? []), ...(text.match(TG_RE) ?? [])]) {
    const host = hostOf(u);
    if (!host || seen.has(host)) continue;
    seen.add(host);
    sig.push(...analyzeHost(host));
  }
  return sig;
}

/* ───────────── тексты сигналов — из texts.py бота (SIGNAL_TEXT) ───────────── */

const T = (ru: string, uz: string, en: string): Record<Locale, string> => ({ ru, uz, en });

export const SIGNAL_TEXT: Record<string, Record<Locale, string>> = {
  suspicious_tld: T("TLD .{tld} часто используется в мошенничестве", "Domen .{tld} firibgarlikda ko’p ishlatiladi", "The .{tld} TLD is often used in scams"),
  url_shortener: T("Ссылка сокращена — конечный адрес скрыт", "Havola qisqartirilgan — yakuniy manzil yashirilgan", "Link is shortened — final destination hidden"),
  suspicious_domain: T("Многоуровневый домен с цифрами — типичен для фишинга", "Ko’p bosqichli domen raqamlar bilan — fishingga xos", "Multi-level domain with digits — typical for phishing"),
  homoglyph_domain: T("Домен содержит смешанные похожие символы (кириллица/латиница)", "Domenda aralash o’xshash belgilar bor (kirill/lotin)", "Domain mixes lookalike characters (Cyrillic/Latin)"),
  brand_impersonation: T("Домен имитирует известный сервис: «{brand}»", "Domen mashhur xizmatni taqlid qiladi: «{brand}»", "Domain impersonates a well-known service: “{brand}”"),
  brand_homoglyph: T("Домен имитирует бренд похожими символами", "Domen brendni o’xshash belgilar bilan taqlid qiladi", "Domain imitates a brand with lookalike characters"),
  urgency: T("Давление срочностью — типичный приём social engineering", "Shoshilish bosimi — ijtimoiy muhandislikning odatiy usuli", "Urgency pressure — a classic social engineering trick"),
  fake_voting: T("Призыв «проголосовать» — частая схема кражи Telegram-аккаунта", "«Ovoz ber» chaqiruvi — Telegram akkauntini o’g’irlashning odatiy sxemasi", "“Vote for me” call — a common Telegram account theft scheme"),
  otp_solicitation: T("Отправитель просит код подтверждения — так угоняют аккаунты", "Yuboruvchi tasdiqlash kodini so’raydi — shunday akkaunt o’g’irlanadi", "The sender asks for a verification code — this is how accounts get stolen"),
  fake_giveaway: T("Обещание бесплатных денег/призов", "Bepul pul/sovrinlar va’dasi", "Promises of free money/prizes"),
  investment_scam: T("Обещание быстрого заработка/доходности", "Tez daromad va’dasi", "Promises of fast profit/returns"),
  fake_support: T("Выдача себя за поддержку Telegram", "O’zini Telegram qo’llab-quvvatlashidan ko’rsatish", "Impersonating Telegram support"),
  /* сигналы, которые бот видит только после загрузки страницы / разбора APK */
  redirect_chain: T("Цепочка перенаправлений на другой домен", "Boshqa domenga yo’naltirishlar zanjiri", "Redirect chain to another domain"),
  telegram_otp_harvest: T("Страница имитирует Telegram и запрашивает код/пароль", "Sahifa Telegramni taqlid qiladi va kod/parol so’raydi", "Page impersonates Telegram and asks for a code/password"),
  credential_form: T("На странице найдена форма ввода пароля", "Sahifada parol kiritish formasi topildi", "Password input form found on the page"),
  card_collection: T("Страница запрашивает данные банковской карты", "Sahifa bank kartasi ma’lumotlarini so’raydi", "Page asks for bank card details"),
  phone_collection: T("Страница собирает номера телефонов", "Sahifa telefon raqamlarini yig’adi", "Page collects phone numbers"),
  otp_interception_chain: T("Доступ к SMS + интернет — связка для кражи OTP-кодов", "SMS + internet — OTP kodlarini o’g’irlashning odatiy bog’lanishi", "SMS access + internet — classic combination for stealing OTP codes"),
  telegram_bot_token: T("В коде встроен Telegram bot token — типично для кражи данных", "Kodga Telegram bot tokeni joylashtirilgan — ma’lumot o’g’irlashga xos", "Embedded Telegram bot token — typical for data theft"),
  decompression_ratio: T("Аномальная степень сжатия архива (возможна zip-бомба)", "Arxiv siqilish darajasi g’ayrioddiy (zip-bomba bo’lishi mumkin)", "Abnormal archive compression ratio (possible zip bomb)"),
  ip_url: T("Обращение к серверу по голому IP-адресу без домена", "Domensiz, to’g’ridan-to’g’ri IP-manzil orqali ulanish", "Connects to a bare IP address without a domain"),
  plain_http: T("Небезопасные HTTP-соединения без шифрования", "Shifrlanmagan HTTP ulanishlar", "Unencrypted plain HTTP connections"),
  app_impersonation: T("Имя/пакет имитирует известный сервис: «{brand}»", "Nomi/paketi mashhur xizmatni taqlid qiladi: «{brand}»", "Name/package impersonates a well-known service: “{brand}”"),
};

export function signalText(s: Signal, lang: Locale): string {
  const tpl = SIGNAL_TEXT[s.type]?.[lang] ?? s.type;
  return tpl.replace(/\{(\w+)\}/g, (_, k: string) => s.params?.[k] ?? "…");
}

/** Сигналы, которые пользователь может «подмешать» вручную в Engine Lab. */
export const MANUAL_SIGNALS: Signal[] = [
  { type: "redirect_chain", severity: "medium", confidence: 0.6 },
  { type: "telegram_otp_harvest", severity: "high", confidence: 0.9 },
  { type: "credential_form", severity: "high", confidence: 0.8 },
  { type: "card_collection", severity: "high", confidence: 0.8 },
  { type: "phone_collection", severity: "medium", confidence: 0.6 },
  { type: "otp_interception_chain", severity: "high", confidence: 0.9 },
  { type: "telegram_bot_token", severity: "high", confidence: 0.85 },
  { type: "decompression_ratio", severity: "high", confidence: 0.9 },
  { type: "app_impersonation", severity: "medium", confidence: 0.6, params: { brand: "payme" } },
  { type: "ip_url", severity: "low", confidence: 0.65 },
  { type: "plain_http", severity: "low", confidence: 0.6 },
];

export const verdictTone = (v: Verdict): "ok" | "warn" | "bad" | "none" =>
  v === "SAFE" || v === "LOW_RISK" ? "ok" : v === "SUSPICIOUS" ? "warn" : v === "UNKNOWN" ? "none" : "bad";
