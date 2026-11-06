"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isLocale, type L } from "@/content/i18n";

const text: L<{ title: string; retry: string; home: string }> = {
  en: { title: "Something broke on this page", retry: "Try again", home: "To the home page" },
  ru: { title: "На этой странице что-то сломалось", retry: "Попробовать снова", home: "На главную" },
  uz: { title: "Bu sahifada nimadir buzildi", retry: "Qayta urinish", home: "Bosh sahifaga" },
};

// Next 16: проп `retry` перезапрашивает и перерисовывает сегмент.
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const seg = usePathname()?.split("/")[1] ?? "";
  const lang = isLocale(seg) ? seg : "en";
  const t = text[lang];

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="wrap nf">
      <p className="nf-code" aria-hidden="true">!</p>
      <h1>{t.title}</h1>
      <p style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <button type="button" className="btn btn--solid" onClick={() => retry()}>
          {t.retry} <span className="arrow">↻</span>
        </button>
        <Link href={`/${lang}`} className="btn">{t.home}</Link>
      </p>
    </div>
  );
}
