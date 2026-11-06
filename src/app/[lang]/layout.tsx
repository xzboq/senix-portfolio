import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Onest, Unbounded } from "next/font/google";
import { notFound } from "next/navigation";
import { Chrome } from "@/components/Chrome";
import { getDict } from "@/content/dict";
import { SITE_URL, isLocale, locales, ogLocale } from "@/content/i18n";
import { projects } from "@/content/projects";
import { bootScript, themeScript } from "@/lib/theme";
import { Boot } from "@/components/Boot";
import { Cursor } from "@/components/Cursor";
import { Extras } from "@/components/Extras";
import { Nebula } from "@/components/Nebula";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Stardust } from "@/components/Stardust";
import { Warp } from "@/components/Warp";
import "../globals.css";

const onest = Onest({ subsets: ["latin", "cyrillic"], variable: "--font-onest", display: "swap" });
// широкий дисплейный шрифт для крупных заголовков (вариативный, 200–900)
const display = Unbounded({ subsets: ["latin", "cyrillic"], variable: "--font-display-src", display: "swap" });
const mono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  variable: "--font-mono-src",
  display: "swap",
  preload: false,
});

/** Яркие звёзды фона: левый край, правый край, низ — подальше от колонки текста. [x, y, размер] */
const FLARES: [string, string, number][] = [
  ["4.5%", "22%", 1],
  ["95.5%", "33%", 0.8],
  ["7.5%", "72%", 0.7],
  ["92%", "61%", 1.05],
  ["38%", "94%", 0.5],
  ["97.5%", "50%", 0.55],
];

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#07070c" },
    { media: "(prefers-color-scheme: dark)", color: "#07070c" },
  ],
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = getDict(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: d.meta.title, template: "%s — Utkir" },
    description: d.meta.description,
    applicationName: "Utkir",
    authors: [{ name: "Utkir", url: "https://github.com/xzboq" }],
    alternates: {
      canonical: `/${lang}`,
      languages: { ru: "/ru", uz: "/uz", en: "/en", "x-default": "/en" },
    },
    openGraph: {
      type: "website",
      siteName: "Utkir",
      title: d.meta.title,
      description: d.meta.description,
      url: `/${lang}`,
      locale: ogLocale[lang],
      alternateLocale: locales.filter((l) => l !== lang).map((l) => ogLocale[l]),
    },
    twitter: { card: "summary_large_image", title: d.meta.title, description: d.meta.description },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDict(lang);

  return (
    <html lang={lang} className={`${onest.variable} ${mono.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <Boot />
        <div className="bg" aria-hidden="true">
          <div className="bg-stars" />
          {/* ПК: несколько ярких далёких звёзд с лучами-«крестами» по краям экрана, мерцают.
              Лежат под туманностью: как и мелкие звёзды, они дальше её — пыль их приглушает */}
          <div className="bg-flares">
            {FLARES.map((f, i) => (
              <i key={i} style={{ "--x": f[0], "--y": f[1], "--s": f[2], "--d": `${-i * 1.7}s` } as React.CSSProperties} />
            ))}
          </div>
          <Nebula />
          <Warp />
          <div className="bg-glow" />
          <div className="bg-noise" />
        </div>
        <a href="#main" className="skip">{d.ui.skip}</a>
        <Chrome
          lang={lang}
          nav={d.nav}
          cmd={d.cmd}
          theme={d.theme}
          keys={d.keys}
          labels={{ language: d.ui.language, mainNav: d.ui.mainNav, home: d.ui.home }}
          projects={projects.map((p) => ({ slug: p.slug, num: p.num, name: p.name, kind: p.text[lang].kind }))}
        />
        <Cursor />
        <Stardust />
        <SmoothScroll />
        <Extras t={d.fun} />
        <div className="page">
          <main id="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
