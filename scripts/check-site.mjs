// Проверка собранного сайта (out/): битые внутренние ссылки и якоря, заголовки страниц, мусор в разметке.
// Запуск: node scripts/check-site.mjs (после next build). Выход с кодом 1, если что-то не так.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = "out";
const BASE = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const JUNK = [">undefined<", ">NaN<", "[object Object]"];

if (!existsSync(OUT)) {
  console.error("check-site: no out/ folder — run next build first");
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const pages = walk(OUT).filter((f) => f.endsWith(".html"));
const cache = new Map();
const read = (file) => {
  if (!cache.has(file)) cache.set(file, readFileSync(file, "utf8"));
  return cache.get(file);
};

/** URL-путь сайта → файл в out/ (или null). */
function resolve(path) {
  const clean = decodeURIComponent(path);
  const candidates = clean.endsWith("/")
    ? [join(OUT, clean, "index.html")]
    : [join(OUT, clean), join(OUT, clean, "index.html"), join(OUT, `${clean}.html`)];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile()) ?? null;
}

const hasId = (html, id) => html.includes(`id="${id}"`);
const problems = [];
let checked = 0;

for (const file of pages) {
  const html = read(file);
  const where = relative(OUT, file).split(sep).join("/");
  const isPage = !where.startsWith("_next/") && !/(^|\/)(404|_not-found)(\/|\.html)/.test(where);

  if (isPage) {
    if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${where}: empty or missing <title>`);
    if (!/<meta name="description" content="[^"]+"/.test(html)) problems.push(`${where}: missing meta description`);
  }
  for (const junk of JUNK) if (html.includes(junk)) problems.push(`${where}: contains ${junk}`);

  for (const [, attr, raw] of html.matchAll(/\s(href|src)="([^"]+)"/g)) {
    const value = raw.replace(/&amp;/g, "&");
    if (value.startsWith("#")) {
      const id = value.slice(1);
      checked++;
      if (id && !hasId(html, id)) problems.push(`${where}: ${attr}="${value}" — no element with this id`);
      continue;
    }
    if (!value.startsWith("/") || value.startsWith("//")) continue;

    let path = value;
    if (BASE) {
      if (!path.startsWith(`${BASE}/`) && path !== BASE) {
        problems.push(`${where}: ${attr}="${value}" — missing base path ${BASE}`);
        continue;
      }
      path = path.slice(BASE.length) || "/";
    }
    const [noHash, hash] = path.split("#");
    const target = resolve(noHash.split("?")[0]);
    checked++;
    if (!target) {
      problems.push(`${where}: ${attr}="${value}" — not found in out/`);
      continue;
    }
    if (hash && target.endsWith(".html") && !hasId(read(target), hash)) {
      problems.push(`${where}: ${attr}="${value}" — no #${hash} on that page`);
    }
  }
}

if (problems.length) {
  console.error(`check-site: ${problems.length} problem(s) in ${pages.length} pages`);
  for (const p of problems.slice(0, 50)) console.error(`  ✗ ${p}`);
  process.exit(1);
}
console.log(`check-site: ${pages.length} pages, ${checked} links and anchors — all good`);
