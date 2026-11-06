import Link from "next/link";
import type { Locale } from "@/content/i18n";
import type { Dict } from "@/content/dict";
import { bySlug } from "@/content/projects";
import { SecHead } from "./SecHead";
import { StackOrbit } from "./StackOrbit";


export function Method({ lang, d }: { lang: Locale; d: Dict }) {
  return (
    <section id="method" className="sec" aria-labelledby="method-h">
      <div className="wrap">
        <SecHead id="method-h" n="02" path="method" title={d.method.title} lead={d.method.lead} />
        <ol className="method-grid">
          {d.method.items.map((it, i) => (
            <li key={it.h} className="m-item rv" data-glow>
              <span className="k" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <h3>{it.h}</h3>
              <p>{it.p}</p>
              <Link href={`/${lang}/projects/${it.slug}`} className="tlink mono" style={{ fontSize: "0.8125rem" }}>
                {d.method.proof}: {bySlug(it.slug)?.name} <span className="arrow">→</span>
              </Link>
            </li>
          ))}
        </ol>

        <StackOrbit t={d.toolbox} />
      </div>
    </section>
  );
}
