"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import type { Dict } from "@/content/dict";
import { links, localeNames, locales, type Locale } from "@/content/i18n";
import { useModKey } from "@/lib/platform";
import { SOUND_TOGGLE } from "@/lib/sound";
import { setLocaleCookie, toggleTheme } from "@/lib/theme";

export const OPEN_PALETTE = "utkir:palette";
export const openPalette = () => window.dispatchEvent(new Event(OPEN_PALETTE));

export interface PaletteProject {
  slug: string;
  num: string;
  name: string;
  kind: string;
}

interface Item {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon: ReactNode;
  run: () => void;
}

interface Props {
  lang: Locale;
  t: Dict["cmd"];
  nav: Dict["nav"];
  projects: PaletteProject[];
  /** Подпись пункта «Горячие клавиши». */
  shortcuts: string;
  onShortcuts: () => void;
  /** Переход к разделу главной (плавная прокрутка, если он на этой странице). */
  onSection: (id: string) => void;
  onClose: () => void;
}

const I = {
  hash: <span className="pi">#</span>,
  file: <span className="pi">◇</span>,
  act: <span className="pi">›</span>,
  lang: <span className="pi">⌘</span>,
};

export function CommandPalette({ lang, t, nav, projects, shortcuts, onShortcuts, onSection, onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const items = useMemo<Item[]>(() => {
    const go = (href: string) => () => {
      onClose();
      router.push(href);
    };
    const section = (id: string) => () => {
      onClose();
      onSection(id);
    };
    const ext = (href: string) => () => {
      onClose();
      window.open(href, "_blank", "noopener,noreferrer");
    };
    const rest = pathname.replace(/^\/(ru|uz|en)(?=\/|$)/, "");
    const emit = (name: string) => () => {
      onClose();
      window.dispatchEvent(new Event(name));
    };
    // звук и гиперпрыжок есть только на ПК (палитра открывается лишь в браузере — window есть)
    const pc = window.matchMedia("(min-width: 1024px)").matches;
    const fun: Item[] = pc
      ? [
          { id: "sound", group: t.actions, label: t.sound, hint: "♪", icon: I.act, run: emit(SOUND_TOGGLE) },
          {
            id: "jump",
            group: t.actions,
            label: t.jump,
            hint: "✦",
            icon: I.act,
            run: () => {
              onClose();
              void import("@/lib/hyperjump").then((m) => m.hyperjump());
              void import("@/lib/sound").then((m) => m.sfx("jump"));
            },
          },
        ]
      : [];
    return [
      { id: "top", group: t.sections, label: t.home, hint: "~/", icon: I.hash, run: section("top") },
      { id: "demo", group: t.sections, label: t.demo, hint: "#demo", icon: I.hash, run: section("demo") },
      ...(["works", "method", "play", "contact"] as const).map((id) => ({
        id,
        group: t.sections,
        label: nav[id],
        hint: `#${id}`,
        icon: I.hash,
        run: section(id),
      })),
      ...projects.map((p) => ({
        id: `p-${p.slug}`,
        group: t.projects,
        label: p.name,
        hint: `${p.num} · ${p.kind}`,
        icon: I.file,
        run: go(`/${lang}/projects/${p.slug}`),
      })),
      {
        id: "theme",
        group: t.actions,
        label: t.theme,
        icon: I.act,
        run: () => {
          toggleTheme();
          onClose();
        },
      },
      ...fun,
      { id: "keys", group: t.actions, label: shortcuts, hint: "?", icon: I.act, run: onShortcuts },
      { id: "gh", group: t.actions, label: t.github, hint: "xzboq", icon: I.act, run: ext(links.github) },
      { id: "tg", group: t.actions, label: t.telegram, hint: "@princess_scammer", icon: I.act, run: ext(links.telegram) },
      { id: "ig", group: t.actions, label: t.instagram, hint: "@princess_scamer", icon: I.act, run: ext(links.instagram) },
      ...locales.map((l) => ({
        id: `l-${l}`,
        group: t.language,
        label: localeNames[l],
        hint: l === lang ? "●" : l,
        icon: I.lang,
        run: () => {
          setLocaleCookie(l);
          onClose();
          router.push(`/${l}${rest}`, { scroll: false });
        },
      })),
    ];
  }, [lang, t, nav, projects, pathname, router, onClose, onSection, onShortcuts, shortcuts]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) => `${it.label} ${it.hint ?? ""} ${it.group} ${it.id}`.toLowerCase().includes(s));
  }, [items, q]);

  const current = Math.min(sel, Math.max(filtered.length - 1, 0));

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      opener?.focus?.({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-i="${current}"]`)?.scrollIntoView({ block: "nearest" });
  }, [current]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((current + 1) % Math.max(filtered.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((current - 1 + filtered.length) % Math.max(filtered.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[current]?.run();
    } else if (e.key === "Tab") {
      e.preventDefault(); // фокус остаётся внутри диалога
    }
  };

  const heads = filtered.map((it, i) => (i === 0 || filtered[i - 1].group !== it.group ? it.group : null));

  return (
    <div className="pal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pal" role="dialog" aria-modal="true" aria-label={t.title} onKeyDown={onKey}>
        <div className="pal-in">
          <span className="pal-prompt" aria-hidden="true">❯</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            placeholder={t.placeholder}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={filtered[current] ? `${listId}-${filtered[current].id}` : undefined}
            aria-autocomplete="list"
            spellCheck={false}
            autoComplete="off"
          />
          <kbd>esc</kbd>
        </div>
        <ul className="pal-list" id={listId} role="listbox" ref={listRef} aria-label={t.title}>
          {filtered.length === 0 && <li className="pal-empty">{t.empty}</li>}
          {filtered.map((it, i) => {
            const head = heads[i];
            return (
              <li key={it.id} role="presentation">
                {head && <div className="pal-group" aria-hidden="true">{head}</div>}
                <div
                  id={`${listId}-${it.id}`}
                  role="option"
                  aria-selected={i === current}
                  data-i={i}
                  className="pal-item"
                  onMouseMove={() => i !== current && setSel(i)}
                  onClick={() => it.run()}
                >
                  {it.icon}
                  <span className="pal-label">{it.label}</span>
                  {it.hint && <span className="pal-hint">{it.hint}</span>}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="pal-foot">
          <span>{t.hint}</span>
          <span className="pal-brand">utkir.dev</span>
        </div>
      </div>
    </div>
  );
}

/** Кнопка, открывающая палитру из серверных компонентов. */
export function PaletteButton({ label, className }: { label: string; className?: string }) {
  const mod = useModKey();
  return (
    <button type="button" className={className} onClick={openPalette} aria-haspopup="dialog">
      {label} <kbd>{mod} K</kbd>
    </button>
  );
}
