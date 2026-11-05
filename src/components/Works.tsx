import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/content/i18n";
import { fmt, type Dict } from "@/content/dict";
import { DRIFT_CARS, DRIFT_MAX, DRIFT_ZONES, kmh } from "@/content/drift";
import { more, projects, type Project } from "@/content/projects";
import { analyzeText, assess, signalText } from "@/lib/engine";
import shot from "@/assets/wishpool.jpg";
import { SecHead } from "./SecHead";

function Visual({ p, lang, d }: { p: Project; lang: Locale; d: Dict }) {
  if (p.slug === "kiber-yordamchi") {
    const a = assess(analyzeText(d.sample[0]));
    return (
      <div className="viz viz-verdict" aria-hidden="true">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
          <span className="viz-big">{a.verdict}</span>
          <span>{a.score}/100</span>
        </div>
        {a.evidence.slice(0, 3).map((e) => (
          <div key={e.id} className="row">
            <span>{e.id}</span>
            <span>{signalText(e, lang)}</span>
          </div>
        ))}
      </div>
    );
  }
  if (p.slug === "senixsearch") {
    const s = d.lab.search;
    return (
      <div className="viz viz-lines" aria-hidden="true">
        <div className="ln">
          <b>@xznow</b>
          <span>t.me <span className="ok-t">✓</span> · Fragment <span className="ok-t">—</span></span>
          <span className="ok-t">{s.claimable}</span>
        </div>
        <div className="ln">
          <b>@telegram</b>
          <span>t.me <span className="no-t">✗</span></span>
          <span className="no-t">{s.notClaimable}</span>
        </div>
        <div className="ln">
          <b>a?b?c</b>
          <span>mask</span>
          <span>{fmt(s.maskCount, { n: 676 })}</span>
        </div>
      </div>
    );
  }
  if (p.slug === "drift-chirchik") {
    const picks = ["nexia", "gentra", "camaro"].map((id) => DRIFT_CARS.find((c) => c.id === id)!);
    return (
      <div className="viz viz-drift" aria-hidden="true">
        <div className="vd-head">
          <span>GARAGE</span>
          <span>18 cars · 9 zones</span>
        </div>
        {picks.map((c) => (
          <div key={c.id} className="vd-row">
            <span>{c.name}</span>
            <i><b style={{ width: `${(c.v / DRIFT_MAX.v) * 100}%` }} /></i>
            <span>{kmh(c.v)} km/h</span>
          </div>
        ))}
        <div className="vd-zone">◎ {DRIFT_ZONES[0].name[lang]} · {DRIFT_ZONES[0].medals[2].toLocaleString(lang)}</div>
      </div>
    );
  }
  if (p.slug === "fresh-chirchik") {
    return (
      <div className="viz viz-fresh" aria-hidden="true">
        <div className="vf-glasses">
          {["#ff9500", "#a8d608", "#e8456b", "#ffc800"].map((c, i) => (
            <span key={c} className="glass" style={{ ["--c" as string]: c, height: `${i % 2 ? 46 : 64}%` }} />
          ))}
        </div>
        <div className="vf-bar">
          <span><i />08:00–00:00 · UTC+5</span>
          <span>tg ⇄ web</span>
        </div>
      </div>
    );
  }
  if (p.slug === "wishpool") {
    return (
      <div className="viz viz-shot">
        <Image src={shot} alt={d.lab.wish.shot} sizes="(min-width: 1024px) 400px, 100vw" placeholder="blur" />
      </div>
    );
  }
  return (
    <div className="viz viz-flow" aria-hidden="true">
      <div><span>GPS / search →</span> Open-Meteo</div>
      <div><span>→</span> TanStack Query <span>⇄</span> AsyncStorage</div>
      <div><span>→</span> Zustand <span>(units · lang · theme)</span></div>
      <div><span>→</span> Home · Hourly · Daily</div>
    </div>
  );
}

export function Works({ lang, d }: { lang: Locale; d: Dict }) {
  return (
    <section id="works" className="sec" aria-labelledby="works-h">
      <div className="wrap">
        <SecHead id="works-h" n="01" path="works" title={d.works.title} lead={d.works.lead} />
        <ul className="bento">
          {projects.map((p) => {
            const t = p.text[lang];
            return (
              <li key={p.slug} className="rv">
                <Link href={`/${lang}/projects/${p.slug}`} className="card" data-glow>
                  <div className="card-bar">
                    <span className="dots" aria-hidden="true"><i /><i /><i /></span>
                    <span className="card-path">~/projects/<b>{p.slug}</b></span>
                    <span className="card-num">{p.num}</span>
                  </div>
                  <Visual p={p} lang={lang} d={d} />
                  <div className="card-body">
                    <div className="card-meta">
                      <span className="stamp" data-k={p.statusKey}>{d.works.status[p.statusKey]}</span>
                      <span className="label">{t.kind}</span>
                    </div>
                    <h3 className="card-name">
                      {p.name}
                      <span className="arrow" aria-hidden="true">↗</span>
                    </h3>
                    <p className="card-tag">{t.tagline}</p>
                    <ul className="tags" aria-label={d.project.stack}>
                      {p.stack.map((s) => <li key={s}>{s}</li>)}
                    </ul>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="more rv">
          <div className="more-head">
            <h3>{d.more.title}</h3>
            <p>{d.more.lead}</p>
          </div>
          <ul className="more-list">
            {more.map((m) => {
              const t = m.text[lang];
              return (
                <li key={m.name} className="more-item">
                  <div className="more-top">
                    <b>{m.name}</b>
                    <span className="label">{t.kind}</span>
                  </div>
                  <p>{t.about}</p>
                  <div className="more-foot">
                    <ul className="tags">{m.stack.map((s) => <li key={s}>{s}</li>)}</ul>
                    {m.href && (
                      <a className="tlink mono" href={m.href} target="_blank" rel="noopener noreferrer">
                        {d.more.source} <span className="arrow" aria-hidden="true">↗</span>
                        <span className="sr"> ({d.ui.external})</span>
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
