import type { Dict } from "@/content/dict";
import { links } from "@/content/i18n";

export function Footer({ d }: { d: Dict }) {
  return (
    <footer className="wrap foot">
      <div className="foot-row">
        <span className="label">{d.footer.place}</span>
        <a href="#top" className="tlink mono" style={{ fontSize: "0.8125rem" }}>{d.footer.top} ↑</a>
      </div>
      <p className="note">{d.footer.colophon}</p>
      <div className="foot-row">
        <a className="tlink mono" style={{ fontSize: "0.8125rem" }} href={links.github} target="_blank" rel="noopener noreferrer">
          github.com/SenixDev14yo
        </a>
      </div>
    </footer>
  );
}
