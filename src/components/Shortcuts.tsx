"use client";

import { useEffect, useRef } from "react";
import type { Dict } from "@/content/dict";

interface Props {
  t: Dict["keys"];
  nav: Dict["nav"];
  home: string;
  demo: string;
  mod: string;
  onClose: () => void;
}

/** Список горячих клавиш (открывается по «?»). */
export function Shortcuts({ t, nav, home, demo, mod, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      opener?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  const rows: [string[], string][] = [
    [[mod, "K"], t.palette],
    [["/"], t.search],
    [["T"], t.theme],
    [["?"], t.help],
  ];
  const go: [string, string][] = [
    ["H", home],
    ["D", demo],
    ["W", nav.works],
    ["M", nav.method],
    ["P", nav.play],
    ["C", nav.contact],
  ];

  return (
    <div className="pal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pal keys" role="dialog" aria-modal="true" aria-label={t.title} tabIndex={-1} ref={ref}>
        <div className="pal-in">
          <span className="pal-prompt" aria-hidden="true">?</span>
          <b className="keys-title">{t.title}</b>
          <button type="button" className="keys-close" onClick={onClose} aria-label={t.close}>
            <kbd>esc</kbd>
          </button>
        </div>
        <div className="keys-body">
          <dl className="keys-list">
            {rows.map(([k, label]) => (
              <div key={label}>
                <dt>{k.map((x) => <kbd key={x}>{x}</kbd>)}</dt>
                <dd>{label}</dd>
              </div>
            ))}
          </dl>
          <p className="pal-group">{t.goto}</p>
          <dl className="keys-list">
            {go.map(([k, label]) => (
              <div key={k}>
                <dt>
                  <kbd>G</kbd>
                  <span className="keys-then">{t.then}</span>
                  <kbd>{k}</kbd>
                </dt>
                <dd>{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
