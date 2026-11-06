import Link from "next/link";
import type { Dict } from "@/content/dict";
import { links, type Locale } from "@/content/i18n";

export function Footer({ d, lang }: { d: Dict; lang: Locale }) {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-cta">
            <p className="foot-kicker">{d.hero.open}</p>
            <Link href={`/${lang}#contact`} className="foot-big" data-magnet>
              {d.contact.title}
              <span className="arrow" aria-hidden="true">→</span>
            </Link>
            <p className="note">{d.footer.colophon}</p>
          </div>
          <ul className="foot-links">
            <li><a href={links.github} target="_blank" rel="noopener noreferrer">GitHub · xzboq<span className="sr"> ({d.ui.external})</span></a></li>
            <li><a href={links.telegram} target="_blank" rel="noopener noreferrer">Telegram · @princess_scammer<span className="sr"> ({d.ui.external})</span></a></li>
            <li><a href={links.instagram} target="_blank" rel="noopener noreferrer">Instagram · @princess_scamer<span className="sr"> ({d.ui.external})</span></a></li>
            <li><a href={links.repo} target="_blank" rel="noopener noreferrer">{d.footer.source} · senix-portfolio<span className="sr"> ({d.ui.external})</span></a></li>
          </ul>
        </div>
        <p className="wordmark" aria-hidden="true" data-light>utkir</p>
      </div>
    </footer>
  );
}
