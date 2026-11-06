"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isLocale, type L } from "@/content/i18n";

const text: L<{ title: string; back: string }> = {
  en: { title: "Lost in space: nothing at this address", back: "Back to Earth" },
  ru: { title: "Потерялись в космосе: здесь ничего нет", back: "Вернуться на Землю" },
  uz: { title: "Koinotda adashdik: bu yerda hech narsa yoʻq", back: "Yerga qaytish" },
};

// not-found не получает params, поэтому язык читаем из адреса на клиенте.
export default function NotFound() {
  const seg = (usePathname() ?? "/").split("/")[1] ?? "";
  const lang = isLocale(seg) ? seg : "en";
  return (
    <div className="wrap nf">
      <p className="nf-code" aria-hidden="true">404</p>
      <h1>{text[lang].title}</h1>
      <p>
        <Link href={`/${lang}`} className="btn btn--solid">{text[lang].back} <span className="arrow">→</span></Link>
      </p>
    </div>
  );
}
