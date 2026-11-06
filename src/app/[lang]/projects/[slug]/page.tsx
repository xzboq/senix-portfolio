import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { Flow } from "@/components/Flow";
import { Footer } from "@/components/Footer";
import { Lab } from "@/components/Lab";
import { PageTransition } from "@/components/PageTransition";
import { Toc } from "@/components/Toc";
import { ProjectVisual } from "@/components/Works";
import { getDict } from "@/content/dict";
import { isLocale, locales } from "@/content/i18n";
import { bySlug, nextOf, prevOf, projects } from "@/content/projects";

type Params = Promise<{ lang: string; slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) => projects.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = bySlug(slug);
  if (!isLocale(lang) || !p) return {};
  const t = p.text[lang];
  const path = `/${lang}/projects/${p.slug}`;
  return {
    title: p.name,
    description: t.tagline,
    alternates: {
      canonical: path,
      languages: Object.fromEntries([...locales.map((l) => [l, `/${l}/projects/${p.slug}`]), ["x-default", `/en/projects/${p.slug}`]]),
    },
    openGraph: { title: `${p.name} — Utkir`, description: t.tagline, url: path, type: "article" },
  };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { lang, slug } = await params;
  const p = bySlug(slug);
  if (!isLocale(lang) || !p) notFound();
  const d = getDict(lang);
  const t = p.text[lang];
  const next = nextOf(p.slug);
  const prev = prevOf(p.slug);
  const total = String(projects.length).padStart(2, "0");

  const toc = [
    { id: "problem", label: d.project.problem },
    { id: "solution", label: d.project.solution },
    { id: "lab", label: d.project.lab },
    { id: "how", label: d.project.how },
    { id: "features", label: d.project.features },
    { id: "facts", label: d.project.facts },
    { id: "honest", label: d.project.honest },
  ];

  return (
    <PageTransition>
      <div className="wrap" id="top">
        <header className="pp-head">
          <div className="pp-copy hero-in">
            <Link href={`/${lang}#works`} className="crumb" transitionTypes={["nav-back"]}>← {d.ui.back}</Link>
            <p className="label" style={{ marginTop: 14 }}>{p.num} / {total} · {t.kind}</p>
            <ViewTransition name={`pt-${p.slug}`} share="morph" default="none">
              <h1 className="pp-title">{p.name}</h1>
            </ViewTransition>
            <p className="pp-tag">{t.tagline}</p>
          </div>
          <div className="pp-art" aria-hidden="true">
            <ViewTransition name={`pv-${p.slug}`} share="morph" default="none">
              <ProjectVisual p={p} lang={lang} d={d} />
            </ViewTransition>
          </div>
        </header>

        <div className="pp-grid">
          <aside className="spec panel" aria-label={d.project.spec}>
            <div className="panel-bar"><span>{d.project.spec}</span><span>{p.num} / {total}</span></div>
            <div className="spec-body">
              <dl>
                <div>
                  <dt className="label">{d.project.status}</dt>
                  <dd><span className="stamp" data-k={p.statusKey}>{d.works.status[p.statusKey]}</span></dd>
                </div>
                <div><dt className="label">{d.project.type}</dt><dd>{t.kind}</dd></div>
                <div><dt className="label">{d.project.stack}</dt><dd className="mono" style={{ fontSize: "0.875rem", fontWeight: 400 }}>{p.stack.join(" · ")}</dd></div>
                <div>
                  <dt className="label">{d.project.source}</dt>
                  <dd className={p.github ? undefined : "none"}>{p.github ? p.github.replace("https://", "") : d.project.notPublished}</dd>
                </div>
                <div>
                  <dt className="label">{d.project.live}</dt>
                  <dd className={p.live ? undefined : "none"}>{p.live ? p.live.replace("https://", "") : d.project.noLive}</dd>
                </div>
              </dl>
              {(p.github || p.live) && (
                <div className="btns">
                  {p.github && (
                    <a className="btn" href={p.github} target="_blank" rel="noopener noreferrer">
                      {d.project.sourceOpen} <span className="arrow">↗</span><span className="sr"> ({d.ui.external})</span>
                    </a>
                  )}
                  {p.live && (
                    <a className="btn btn--solid" href={p.live} target="_blank" rel="noopener noreferrer">
                      {d.project.liveOpen} <span className="arrow">↗</span><span className="sr"> ({d.ui.external})</span>
                    </a>
                  )}
                </div>
              )}
              <Toc title={d.project.toc} items={toc} />
            </div>
          </aside>

          <div className="pp-main">
            <section className="blk" id="problem">
              <h2>{d.project.problem}</h2>
              <p className="body">{t.problem}</p>
            </section>
            <section className="blk" id="solution">
              <h2>{d.project.solution}</h2>
              <p className="body">{t.solution}</p>
            </section>

            <section className="blk" id="lab">
              <h2>{d.project.lab}</h2>
              <Lab
                slug={p.slug}
                lang={lang}
                lab={d.lab}
                shared={{ verdicts: d.verdicts, categories: d.categories, sample: d.sample }}
                error={{ message: d.ui.demoError, action: d.ui.reload }}
              />
            </section>

            <section className="blk" id="how">
              <h2>{d.project.how}</h2>
              <p className="body">{t.flowLead}</p>
              <Flow cols={p.flow} labels={t.flow} />
            </section>

            <section className="blk" id="features">
              <h2>{d.project.features}</h2>
              <ul className="list">{t.features.map((f) => <li key={f}>{f}</li>)}</ul>
            </section>

            <section className="blk" id="facts">
              <h2>{d.project.facts}</h2>
              <div className="facts">
                {t.facts.map((f) => (
                  <div key={f.k}><span className="label">{f.k}</span><b>{f.v}</b></div>
                ))}
              </div>
            </section>

            <section className="blk" id="honest">
              <h2>{d.project.honest}</h2>
              <ul className="list honest">{t.honest.map((f) => <li key={f}>{f}</li>)}</ul>
            </section>
          </div>
        </div>

        <nav className="pager" aria-label={d.ui.nextWork}>
          <Link href={`/${lang}/projects/${prev.slug}`} className="pager-link" rel="prev" transitionTypes={["nav-back"]}>
            <span className="label">← {d.ui.prevWork} · {prev.num}</span>
            <span className="pager-name">{prev.name}</span>
          </Link>
          <Link href={`/${lang}/projects/${next.slug}`} className="pager-link pager-next" rel="next" transitionTypes={["nav-forward"]}>
            <span className="label">{d.ui.nextWork} · {next.num} →</span>
            <span className="pager-name">{next.name}</span>
          </Link>
        </nav>
      </div>
      <Footer d={d} lang={lang} />
    </PageTransition>
  );
}
