import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Onest, Unbounded } from "next/font/google";
import { notFound } from "next/navigation";
import { Chrome } from "@/components/Chrome";
import { getDict } from "@/content/dict";
import { SITE_URL, isLocale, locales, ogLocale } from "@/content/i18n";
import { projects } from "@/content/projects";
import { bootScript, themeScript } from "@/lib/theme";
import { Boot } from "@/components/Boot";
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
        <div className="page">
          <main id="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
