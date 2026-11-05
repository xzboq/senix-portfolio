import Link from "next/link";
import type { Dict } from "@/content/dict";
import { links, type Locale } from "@/content/i18n";

export function Footer({ d, lang }: { d: Dict; lang: Locale }) {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-cta">
            <p className="foot-cmt" aria-hidden="true">{"// EOF"}</p>
            <Link href={`/${lang}#contact`} className="foot-big">
              {d.contact.title}
              <span className="arrow" aria-hidden="true">→</span>
            </Link>
            <p className="note">{d.footer.colophon}</p>
          </div>
          <ul className="foot-links">
            <li><a href={links.github} target="_blank" rel="noopener noreferrer">github/xzboq<span className="sr"> ({d.ui.external})</span></a></li>
            <li><a href={links.telegram} target="_blank" rel="noopener noreferrer">telegram/@princess_scammer<span className="sr"> ({d.ui.external})</span></a></li>
            <li><a href={links.instagram} target="_blank" rel="noopener noreferrer">instagram/@princess_scamer<span className="sr"> ({d.ui.external})</span></a></li>
          </ul>
        </div>
        <p className="wordmark" aria-hidden="true">utkir</p>
      </div>
      <div className="status">
        <div className="wrap status-in">
          <span className="st-branch"><i aria-hidden="true" />main</span>
          <span>{d.footer.place}</span>
          <span className="st-hide">UTF-8</span>
          <span className="st-hide">TypeScript React</span>
          <span className="st-lang">{lang}</span>
          <a href="#top" className="st-top">{d.footer.top} ↑</a>
        </div>
      </div>
    </footer>
  );
}
