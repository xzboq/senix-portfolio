import Link from "next/link";
import type { Locale } from "@/content/i18n";
import type { Dict } from "@/content/dict";
import { bySlug } from "@/content/projects";

interface Row {
  name: string;
  group: "primary" | "additional";
  cells: number[];
  empty?: boolean;
  note?: Record<number, string>;
}

export function Method({ lang, d }: { lang: Locale; d: Dict }) {
  const rows = d.toolbox.rows as Row[];
  return (
    <section id="method" className="sec" aria-labelledby="method-h">
      <div className="wrap">
        <div className="sec-head">
          <span className="n">02</span>
          <h2 id="method-h">{d.method.title}</h2>
          <p>{d.method.lead}</p>
        </div>
        <ol className="method-grid">
          {d.method.items.map((it, i) => (
            <li key={it.h} className="m-item rv">
              <span className="k">M{i + 1}</span>
              <h3>{it.h}</h3>
              <p>{it.p}</p>
              <Link href={`/${lang}/projects/${it.slug}`} className="tlink mono" style={{ fontSize: "0.8125rem" }}>
                {d.method.proof}: {bySlug(it.slug)?.name} <span className="arrow">→</span>
              </Link>
            </li>
          ))}
        </ol>

        <div className="matrix-wrap rv">
          <h3>{d.toolbox.title}</h3>
          <p>{d.toolbox.lead}</p>
          <table className="matrix">
            <thead>
              <tr>
                <td />
                {d.toolbox.projects.map((n) => (
                  <th key={n} scope="col"><span>{n}</span></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name}>
                  <th scope="row">
                    {r.name}
                    <small>{r.group === "primary" ? d.toolbox.primary : d.toolbox.additional}</small>
                  </th>
                  {r.empty ? (
                    <td colSpan={5} className="hatch">{d.toolbox.empty}</td>
                  ) : (
                    r.cells.map((c, i) => (
                      <td key={i}>
                        {c ? <span className="mk" /> : <span className="mk-o" />}
                        <span className="sr">{c ? d.toolbox.used : d.toolbox.notUsed}</span>
                        {c && r.note?.[i] ? <span className="sub">{r.note[i]}</span> : null}
                      </td>
                    ))
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
