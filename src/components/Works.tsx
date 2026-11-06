import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import type { Locale } from "@/content/i18n";
import { fmt, type Dict } from "@/content/dict";
import { DRIFT_ZONES } from "@/content/drift";
import { more, projects, type Project } from "@/content/projects";
import { analyzeText, assess, signalText } from "@/lib/engine";
import shot from "@/assets/wishpool.jpg";
import { SecHead } from "./SecHead";

/** Превью проекта: на карточке и в шапке страницы проекта (между ними — «перелёт» view transition).
 *  Каждое превью — маленькая живая сцена на CSS/SVG, без JS. */
export function ProjectVisual({ p, lang, d }: { p: Project; lang: Locale; d: Dict }) {
  if (p.slug === "kiber-yordamchi") {
    const a = assess(analyzeText(d.sample[0]));
    return (
      <div className="viz viz-verdict" aria-hidden="true">
        <i className="scanline" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
          <span className="viz-big">{a.verdict}</span>
          <span>{a.score}/100</span>
        </div>
        {a.evidence.slice(0, 3).map((e, i) => (
          <div key={e.id} className="row" style={{ ["--i" as string]: i }}>
            <span>{e.id}</span>
            <span>{signalText(e, lang)}</span>
          </div>
        ))}
      </div>
    );
  }
  if (p.slug === "senixsearch") {
    const s = d.lab.search;
    const rows = [
      { name: "@xznow", src: <>t.me <span className="ok-t">✓</span> · Fragment <span className="ok-t">—</span></>, res: <span className="ok-t">{s.claimable}</span> },
      { name: "@telegram", src: <>t.me <span className="no-t">✗</span></>, res: <span className="no-t">{s.notClaimable}</span> },
      { name: "a?b?c", src: <>mask</>, res: <span>{fmt(s.maskCount, { n: 676 })}</span> },
    ];
    return (
      <div className="viz viz-lines viz-hunt" aria-hidden="true">
        <div className="hunt-head">
          <span>username hunter · t.me × Fragment</span>
          <span className="hunt-live">live</span>
        </div>
        {rows.map((r, i) => (
          <div key={r.name} className="ln" style={{ ["--i" as string]: i }}>
            <b>{r.name}</b>
            <span>{r.src}</span>
            <span className="res">
              <i className="spin" />
              <span className="out">{r.res}</span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  if (p.slug === "drift-chirchik") {
    const zone = DRIFT_ZONES[0];
    const track =
      "M160 75 C185 38 210 30 232 32 C262 35 280 55 280 75 C280 95 262 115 232 118 C210 120 185 112 160 75 C135 38 110 30 88 32 C58 35 40 55 40 75 C40 95 58 115 88 118 C110 120 135 112 160 75 Z";
    return (
      <div className="viz viz-drift2" aria-hidden="true">
        <svg viewBox="0 0 320 150" preserveAspectRatio="xMidYMid meet">
          <defs>
            <path id="drift-track" d={track} />
            <radialGradient id="drift-smoke">
              <stop offset="0" stopColor="#d7dde6" stopOpacity="0.55" />
              <stop offset="1" stopColor="#d7dde6" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="drift-beam" x1="0" x2="1">
              <stop offset="0" stopColor="#fff6c9" stopOpacity="0.55" />
              <stop offset="1" stopColor="#fff6c9" stopOpacity="0" />
            </linearGradient>
          </defs>
          <use href="#drift-track" className="trk-glow" />
          <use href="#drift-track" className="trk-asphalt" />
          <use href="#drift-track" className="trk-skid" />
          <use href="#drift-track" className="trk-mid" />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} r={5 + i * 2.6} className="smoke" fill="url(#drift-smoke)" opacity={0.9 - i * 0.16}>
              <animateMotion dur="4.8s" repeatCount="indefinite" begin={`${-0.5 + (i + 1) * 0.07}s`}>
                <mpath href="#drift-track" />
              </animateMotion>
            </circle>
          ))}
          <g className="car">
            <animateMotion dur="4.8s" repeatCount="indefinite" rotate="auto" begin="-0.5s">
              <mpath href="#drift-track" />
            </animateMotion>
            <path d="M8 -4 L30 -13 L30 5 L8 2 Z" fill="url(#drift-beam)" />
            <rect x="-10" y="-5.5" width="20" height="11" rx="3.5" className="car-body" />
            <rect x="1" y="-4.5" width="5.5" height="9" rx="1.6" className="car-glass" />
            <rect x="-10" y="-5" width="2" height="3" rx="0.8" className="car-tail" />
            <rect x="-10" y="2" width="2" height="3" rx="0.8" className="car-tail" />
          </g>
          <g className="car-static" transform="translate(232 32) rotate(8)">
            <rect x="-10" y="-5.5" width="20" height="11" rx="3.5" className="car-body" />
            <rect x="1" y="-4.5" width="5.5" height="9" rx="1.6" className="car-glass" />
          </g>
        </svg>
        <div className="vd2-hud">
          <span>DRIFT</span>
          <b className="vd2-score" />
        </div>
        <span className="vd2-combo">×3 COMBO</span>
        <span className="vd2-zone">◎ {zone.name[lang]} · Nexia</span>
      </div>
    );
  }
  if (p.slug === "fresh-chirchik") {
    const glasses = [
      { c: "#ff9500", h: 64 },
      { c: "#a8d608", h: 46 },
      { c: "#e8456b", h: 64 },
      { c: "#ffc800", h: 46 },
    ];
    return (
      <div className="viz viz-fresh" aria-hidden="true">
        <div className="vf-glasses">
          {glasses.map((g, i) => (
            <span key={g.c} className="glass" style={{ ["--c" as string]: g.c, ["--i" as string]: i, height: `${g.h}%` }}>
              <i className="liq" />
              <b />
              <b />
              <b />
            </span>
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
  const line = "M0 52 C24 48 42 36 66 34 S112 46 138 40 S188 16 214 18 S262 30 300 24";
  return (
    <div className="viz viz-wx2" aria-hidden="true">
      <div className="wx2-top">
        <span className="wx2-sun"><i /></span>
        <div className="wx2-now">
          <b>+21°</b>
          <span>{d.lab.weather.city} · Open-Meteo</span>
        </div>
        <span className="wx2-cloud" />
      </div>
      <svg viewBox="0 0 300 70" preserveAspectRatio="none" className="wx2-chart">
        <defs>
          <linearGradient id="wx-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.32" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="wx2-area" d={`${line} L300 70 L0 70 Z`} fill="url(#wx-fill)" />
        <path className="wx2-line" d={line} pathLength={1} />
      </svg>
      <div className="wx2-hours">
        {["06", "09", "12", "15", "18", "21"].map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
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
                <Link href={`/${lang}/projects/${p.slug}`} className="card" data-glow data-tilt data-cursor={d.ui.open} transitionTypes={["nav-forward"]}>
                  <ViewTransition name={`pv-${p.slug}`} share="morph" default="none">
                    <ProjectVisual p={p} lang={lang} d={d} />
                  </ViewTransition>
                  <div className="card-body">
                    <div className="card-meta">
                      <span className="card-num">{p.num}</span>
                      <span className="stamp" data-k={p.statusKey}>{d.works.status[p.statusKey]}</span>
                      <span className="label">{t.kind}</span>
                    </div>
                    <h3 className="card-name">
                      <ViewTransition name={`pt-${p.slug}`} share="morph" default="none">
                        <span className="vt-name">{p.name}</span>
                      </ViewTransition>
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
