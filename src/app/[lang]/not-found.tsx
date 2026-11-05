"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isLocale, type L } from "@/content/i18n";

const text: L<{ title: string; back: string }> = {
  en: { title: "Nothing at this address", back: "Back to the index" },
  ru: { title: "По этому адресу ничего нет", back: "К списку работ" },
  uz: { title: "Bu manzilda hech narsa yoʻq", back: "Ishlar roʻyxatiga" },
};

// not-found не получает params, поэтому язык читаем из адреса на клиенте.
export default function NotFound() {
  const path = usePathname() ?? "/";
  const seg = path.split("/")[1] ?? "";
  const lang = isLocale(seg) ? seg : "en";
  return (
    <div className="wrap nf">
      <div className="panel nf-term" aria-hidden="true">
        <div className="panel-bar"><span>zsh</span><span>404</span></div>
        <pre>
          <span className="t-p">~ ❯</span> cd {path}
          {"\n"}
          <span className="no-t">cd: no such file or directory: {path}</span>
        </pre>
      </div>
      <h1>{text[lang].title}</h1>
      <p>
        <Link href={`/${lang}`} className="btn btn--solid">{text[lang].back} <span className="arrow">→</span></Link>
      </p>
    </div>
  );
}
