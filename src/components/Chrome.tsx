"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { locales, type Locale } from "@/content/i18n";
import { Logo } from "./Logo";

interface Props {
  lang: Locale;
  nav: { works: string; method: string; play: string; contact: string };
  labels: { language: string; mainNav: string; home: string };
}

const SECTIONS = ["works", "method", "play", "contact"] as const;

function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string>("");
  useEffect(() => {
    if (!enabled) return;
    const els = SECTIONS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [enabled]);
  return enabled ? active : "";
}

function LangSwitch({ lang, label }: { lang: Locale; label: string }) {
  const pathname = usePathname();
  const rest = pathname.replace(/^\/(ru|uz|en)(?=\/|$)/, "");
  return (
    <div className="langs" role="group" aria-label={label}>
      {locales.map((l) => (
        <Link
          key={l}
          href={`/${l}${rest}`}
          scroll={false}
          lang={l}
          hrefLang={l}
          className="lang"
          aria-current={l === lang ? "true" : undefined}
          onClick={() => {
            try {
              document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000; samesite=lax`;
            } catch {}
          }}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}

export function Chrome({ lang, nav, labels }: Props) {
  const pathname = usePathname();
  const isHome = pathname === `/${lang}`;
  const active = useActiveSection(isHome);
  const items = SECTIONS.map((id, i) => ({ id, n: `0${i + 1}`, label: nav[id] }));

  return (
    <>
      <aside className="rail">
        <Link href={`/${lang}`} className="logo" aria-label={labels.home}>
          <Logo />
        </Link>
        <nav aria-label={labels.mainNav}>
          {items.map((it) => (
            <Link
              key={it.id}
              href={`/${lang}#${it.id}`}
              className="rail-link"
              aria-current={active === it.id ? "true" : undefined}
            >
              <i>{it.n}</i> {it.label}
            </Link>
          ))}
        </nav>
        <LangSwitch lang={lang} label={labels.language} />
      </aside>

      <header className="top">
        <Link href={`/${lang}`} className="logo" aria-label={labels.home}>
          <Logo />
        </Link>
        <LangSwitch lang={lang} label={labels.language} />
      </header>

      <nav className="dock" aria-label={labels.mainNav}>
        {items.map((it) => (
          <Link key={it.id} href={`/${lang}#${it.id}`} aria-current={active === it.id ? "true" : undefined}>
            {it.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
