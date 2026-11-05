import type { Dict } from "@/content/dict";
import { links } from "@/content/i18n";

export function Channels({ t, external }: { t: Dict["contact"]; external: string }) {
  const rows = [
    { k: t.telegram, v: "@princess_scammer", href: links.telegram },
    { k: t.instagram, v: "@princess_scamer", href: links.instagram },
    { k: t.github, v: "xzboq", href: links.github },
  ];

  return (
    <div className="channels" role="list" aria-label={t.channels}>
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
