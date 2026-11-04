import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Onest } from "next/font/google";
import { notFound } from "next/navigation";
import { Chrome } from "@/components/Chrome";
import { getDict } from "@/content/dict";
import { SITE_URL, isLocale, locales, ogLocale } from "@/content/i18n";
import "../globals.css";

const onest = Onest({ subsets: ["latin", "cyrillic"], variable: "--font-onest", display: "swap" });
const plex = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-plex",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ece9e0" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e0c" },
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
    authors: [{ name: "Utkir", url: "https://github.com/SenixDev14yo" }],
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
    <html lang={lang} className={`${onest.variable} ${plex.variable}`}>
      <body>
        <a href="#main" className="skip">{d.ui.skip}</a>
        <Chrome
          lang={lang}
          nav={d.nav}
          labels={{ language: d.ui.language, mainNav: d.ui.mainNav, home: d.ui.home }}
        />
        <div className="page">
          <main id="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
