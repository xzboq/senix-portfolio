"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { Dict } from "@/content/dict";
import { locales, type Locale } from "@/content/i18n";
import { scrollToSection, useModKey } from "@/lib/platform";
import { getTheme, setLocaleCookie, subscribeTheme, toggleTheme } from "@/lib/theme";
import { CommandPalette, OPEN_PALETTE, type PaletteProject } from "./CommandPalette";
import { Shortcuts } from "./Shortcuts";

interface Props {
  lang: Locale;
  nav: Dict["nav"];
  cmd: Dict["cmd"];
  theme: Dict["theme"];
  keys: Dict["keys"];
  labels: { language: string; mainNav: string; home: string };
  projects: PaletteProject[];
}

const SECTIONS = ["works", "method", "play", "contact"] as const;
/** «G», затем буква — переход к разделу главной. */
const GOTO: Record<string, string> = { h: "top", d: "demo", w: "works", m: "method", p: "play", c: "contact" };

function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string>("");
  useEffect(() => {
    if (!enabled) return;
    const els = SECTIONS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = e.target.id;
          if (e.isIntersecting) setActive(id);
          else setActive((a) => (a === id ? "" : a));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [enabled]);
  return enabled ? active : "";
}

/** Свет за курсором. Переменные пишем на сам слой фона и на карточку под курсором,
 *  а не на :root — иначе каждое движение мыши пересчитывало бы стили всей страницы. */
function usePointerGlow() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const glow = document.querySelector<HTMLElement>(".bg-glow");
    const tiltOn = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tilted: HTMLElement | null = null;
    let magnet: HTMLElement | null = null;
    const unmagnet = () => {
      magnet?.style.removeProperty("--tx");
      magnet?.style.removeProperty("--ty");
      magnet = null;
    };
    let raf = 0;
    let ev: PointerEvent | null = null;
    const untilt = () => {
      tilted?.style.removeProperty("--rx");
      tilted?.style.removeProperty("--ry");
      tilted = null;
    };
    const flush = () => {
      raf = 0;
      if (!ev) return;
      glow?.style.setProperty("--mx", `${ev.clientX}px`);
      glow?.style.setProperty("--my", `${ev.clientY}px`);
      const card = (ev.target as Element | null)?.closest?.("[data-glow]") as HTMLElement | null;
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--gx", `${ev.clientX - r.left}px`);
        card.style.setProperty("--gy", `${ev.clientY - r.top}px`);
      }
      // лёгкий 3D-наклон карточки за курсором (не больше 3°)
      const tilt = tiltOn ? ((ev.target as Element | null)?.closest?.("[data-tilt]") as HTMLElement | null) : null;
      if (tilt !== tilted) untilt();
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const px = (ev.clientX - r.left) / r.width - 0.5;
        const py = (ev.clientY - r.top) / r.height - 0.5;
        tilt.style.setProperty("--rx", `${(-py * 5).toFixed(2)}deg`);
        tilt.style.setProperty("--ry", `${(px * 6).toFixed(2)}deg`);
        tilted = tilt;
      }
      // «магнитные» кнопки чуть тянутся к курсору
      const mag = tiltOn ? ((ev.target as Element | null)?.closest?.("[data-magnet]") as HTMLElement | null) : null;
      if (mag !== magnet) unmagnet();
      if (mag) {
        const r = mag.getBoundingClientRect();
        mag.style.setProperty("--tx", `${((ev.clientX - r.left - r.width / 2) * 0.22).toFixed(1)}px`);
        mag.style.setProperty("--ty", `${((ev.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px`);
        magnet = mag;
      }
      // большое «utkir» в подвале светится под курсором
      const light = (ev.target as Element | null)?.closest?.("[data-light]") as HTMLElement | null;
      if (light) {
        const r = light.getBoundingClientRect();
        light.style.setProperty("--lx", `${ev.clientX - r.left}px`);
        light.style.setProperty("--ly", `${ev.clientY - r.top}px`);
      }
    };
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) {
        untilt();
        unmagnet();
      }
    };
    const onMove = (e: PointerEvent) => {
      ev = e;
      if (!raf) raf = requestAnimationFrame(flush);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onOut);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onOut);
      cancelAnimationFrame(raf);
    };
  }, []);
}

const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

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
    <button type="button" className="theme-pill" onClick={toggleTheme} aria-label={`${t.toggle}: ${t[theme]}`} title={`${t.toggle} (T)`}>
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
      <span className="theme-label" aria-hidden="true">{t[theme]}</span>
    </button>
  );
}

export function Chrome({ lang, nav, cmd, theme, keys, labels, projects }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === `/${lang}` || pathname === `/${lang}/`;
  const active = useActiveSection(isHome);
  const mod = useModKey();
  const [open, setOpen] = useState(false);
  const [help, setHelp] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const items = SECTIONS.map((id, i) => ({ id, n: `0${i + 1}`, label: nav[id] }));
  usePointerGlow();

  const close = useCallback(() => setOpen(false), []);
  const closeHelp = useCallback(() => setHelp(false), []);
  const openHelp = useCallback(() => {
    setOpen(false);
    setHelp(true);
  }, []);

  const goSection = useCallback(
    (id: string) => {
      if (isHome && scrollToSection(id)) return;
      router.push(id === "top" ? `/${lang}` : `/${lang}#${id}`);
    },
    [isHome, lang, router],
  );

  useEffect(() => {
    let gAt = 0;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setHelp(false);
        setOpen((o) => !o);
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented || isTyping(e.target) || open) return;
      const k = e.key.toLowerCase();
      if (e.key === "?") {
        e.preventDefault();
        setHelp((h) => !h);
        return;
      }
      if (help) return;
      if (k === "/") {
        e.preventDefault();
        setOpen(true);
      } else if (k === "t") {
        toggleTheme();
      } else if (k === "g") {
        gAt = performance.now();
      } else if (gAt && performance.now() - gAt < 1200 && GOTO[k]) {
        e.preventDefault();
        gAt = 0;
        goSection(GOTO[k]);
      } else {
        gAt = 0;
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE, onOpen);
    };
  }, [open, help, goSection]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="top" data-scrolled={scrolled || undefined} style={{ viewTransitionName: "site-header" }}>
        <div className="top-in">
          <Link href={`/${lang}`} className="brand" transitionTypes={isHome ? undefined : ["nav-back"]}>
            UTKIR<i className="brand-dot" aria-hidden="true" />
            <span className="sr"> — {labels.home}</span>
          </Link>

          <nav className="tabs" aria-label={labels.mainNav}>
            {items.slice(0, 3).map((it) => (
              <Link key={it.id} href={`/${lang}#${it.id}`} className="tab" aria-current={active === it.id ? "true" : undefined}>
                <i>{it.n}</i>
                {it.label}
              </Link>
            ))}
          </nav>

          <div className="top-tools">
            <button type="button" className="kbd-btn" onClick={() => setOpen(true)} aria-haspopup="dialog" title={cmd.title}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
              <span className="kbd-label">{cmd.button}</span>
              <kbd>{mod} K</kbd>
            </button>
            <ThemeToggle t={theme} />
            <LangSwitch lang={lang} label={labels.language} />
            <Link href={`/${lang}#contact`} className="nav-cta" data-magnet>
              {nav.contact}
            </Link>
          </div>
        </div>
      </header>

      <nav className="dock" aria-label={labels.mainNav} style={{ viewTransitionName: "site-dock" }}>
        {items.map((it) => (
          <Link key={it.id} href={`/${lang}#${it.id}`} aria-current={active === it.id ? "true" : undefined}>
            <i>{it.n}</i>
            {it.label}
          </Link>
        ))}
      </nav>

      {open && (
        <CommandPalette
          lang={lang}
          t={cmd}
          nav={nav}
          projects={projects}
          shortcuts={keys.title}
          onShortcuts={openHelp}
          onSection={goSection}
          onClose={close}
        />
      )}
      {help && <Shortcuts t={keys} nav={nav} home={cmd.home} demo={cmd.demo} mod={mod} onClose={closeHelp} />}
    </>
  );
}
