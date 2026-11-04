"use client";

import { useState } from "react";
import type { Dict } from "@/content/dict";
import { links } from "@/content/i18n";

export function Channels({ t, external }: { t: Dict["contact"]; external: string }) {
  const [copied, setCopied] = useState(false);
  const rows = [
    { k: t.telegram, v: "@princess_scammer", href: links.telegram },
    { k: t.instagram, v: "@senixed", href: links.instagram },
    { k: t.github, v: "SenixDev14yo", href: links.github },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(links.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = `mailto:${links.email}`;
    }
  }

  return (
    <div className="channels" role="list" aria-label={t.channels}>
      <div className="ch" role="listitem">
        <span className="label">{t.email}</span>
        <a href={`mailto:${links.email}`} className="tlink"><b>{links.email}</b></a>
        <button type="button" className="ch-copy" onClick={copy}>
          <span aria-live="polite">{copied ? t.copied : t.copy}</span>
        </button>
      </div>
      {rows.map((r) => (
        <a key={r.k} className="ch" role="listitem" href={r.href} target="_blank" rel="noopener noreferrer">
          <span className="label">{r.k}</span>
          <b>{r.v}<span className="sr"> ({external})</span></b>
          <span className="arrow" aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );
}
