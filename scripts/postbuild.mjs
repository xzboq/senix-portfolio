// После next build (npm запускает его сам как postbuild):
// 1. OG-картинки Next кладёт файлом без расширения, и GitHub Pages отдаёт их как
//    application/octet-stream — Telegram и соцсети такие превью не показывают.
//    Копируем их в *.png и переписываем ссылки в мета-тегах.
// 2. Корневой index.html (выбор языка) получает абсолютные адреса для превью ссылки.
import { copyFileSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";
// Тот же адрес по умолчанию, что SITE_URL в src/content/i18n.ts.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://xzboq.github.io/senix-portfolio").replace(/\/$/, "");
const IMAGE_FILES = ["opengraph-image", "twitter-image"];

if (!existsSync(OUT)) {
  console.error("postbuild: no out/ folder");
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = walk(OUT);
let images = 0;
for (const f of files) {
  const name = f.split(/[\\/]/).pop();
  if (IMAGE_FILES.includes(name)) {
    copyFileSync(f, `${f}.png`);
    images++;
  }
}

const IMG_URL = new RegExp(`/(${IMAGE_FILES.join("|")})(\\?[^"]*)?"`, "g");
let pages = 0;
for (const f of files.filter((x) => x.endsWith(".html"))) {
  const html = readFileSync(f, "utf8");
  let next = html.replace(IMG_URL, (_, file, query = "") => `/${file}.png${query}"`);
  if (f === join(OUT, "index.html")) next = next.replaceAll("%SITE_URL%", SITE_URL);
  if (next !== html) {
    writeFileSync(f, next);
    pages++;
  }
}

console.log(`postbuild: ${images} OG images → .png, ${pages} pages updated (site ${SITE_URL})`);
