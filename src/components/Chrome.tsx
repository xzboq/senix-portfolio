"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { Dict } from "@/content/dict";
import { locales, type Locale } from "@/content/i18n";
import { getTheme, setLocaleCookie, subscribeTheme, toggleTheme } from "@/lib/theme";
import { CommandPalette, OPEN_PALETTE, type PaletteProject } from "./CommandPalette";
import { Logo } from "./Logo";

interface Props {
  lang: Locale;
  nav: Dict["nav"];
  cmd: Dict["cmd"];
  theme: Dict["theme"];
  labels: { language: string; mainNav: string; home: string };
  projects: PaletteProject[];
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

/** Свет за курсором: фон страницы и карточки с [data-glow]. Один слушатель, один кадр. */
function usePointerGlow() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    let ev: PointerEvent | null = null;
    const root = document.documentElement;
    const flush = () => {
      raf = 0;
      if (!ev) return;
      root.style.setProperty("--mx", `${ev.clientX}px`);
      root.style.setProperty("--my", `${ev.clientY}px`);
      const card = (ev.target as Element | null)?.closest?.("[data-glow]") as HTMLElement | null;
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--gx", `${ev.clientX - r.left}px`);
        card.style.setProperty("--gy", `${ev.clientY - r.top}px`);
      }
    };
    const onMove = (e: PointerEvent) => {
      ev = e;
      if (!raf) raf = requestAnimationFrame(flush);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
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
          onClick={() => setLocaleCookie(l)}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}

function ThemeToggle({ t }: { t: Dict["theme"] }) {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, () => "dark" as const);
  return (
    <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={`${t.toggle}: ${t[theme]}`} title={t.toggle}>
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
    </button>
  );
}

export function Chrome({ lang, nav, cmd, theme, labels, projects }: Props) {
  const pathname = usePathname();
  const isHome = pathname === `/${lang}` || pathname === `/${lang}/`;
  const active = useActiveSection(isHome);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const items = SECTIONS.map((id, i) => ({ id, n: `0${i + 1}`, label: nav[id] }));
  usePointerGlow();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE, onOpen);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE, onOpen);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <header className="top" data-scrolled={scrolled || undefined}>
        <div className="top-in">
          <Link href={`/${lang}`} className="logo" aria-label={labels.home}>
            <Logo />
          </Link>

          <nav className="tabs" aria-label={labels.mainNav}>
            {items.map((it) => (
              <Link key={it.id} href={`/${lang}#${it.id}`} className="tab" aria-current={active === it.id ? "true" : undefined}>
                <i>{it.n}</i>
                {it.label}
              </Link>
            ))}
          </nav>

          <div className="top-tools">
            <button type="button" className="kbd-btn" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={cmd.title}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
              <span className="kbd-label">{cmd.button}</span>
              <kbd>Ctrl K</kbd>
            </button>
            <ThemeToggle t={theme} />
            <LangSwitch lang={lang} label={labels.language} />
          </div>
        </div>
      </header>

      <nav className="dock" aria-label={labels.mainNav}>
        {items.map((it) => (
          <Link key={it.id} href={`/${lang}#${it.id}`} aria-current={active === it.id ? "true" : undefined}>
            <i>{it.n}</i>
            {it.label}
          </Link>
        ))}
      </nav>

      {open && <CommandPalette lang={lang} t={cmd} nav={nav} projects={projects} onClose={close} />}
    </>
  );
}
