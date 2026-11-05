import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Flow } from "@/components/Flow";
import { Footer } from "@/components/Footer";
import { Lab } from "@/components/Lab";
import { getDict } from "@/content/dict";
import { isLocale, locales } from "@/content/i18n";
import { bySlug, nextOf, projects } from "@/content/projects";

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

  return (
    <>
      <div className="wrap">
        <header className="pp-head hero-in">
          <Link href={`/${lang}#works`} className="crumb">← {d.ui.back}</Link>
          <p className="pp-path" aria-hidden="true">~/projects/<b>{p.slug}</b><span className="caret" /></p>
          <p className="label" style={{ marginTop: 14 }}>{p.num} · {t.kind}</p>
          <h1 className="pp-title">{p.name}</h1>
          <p className="pp-tag">{t.tagline}</p>
        </header>

        <div className="pp-grid">
          <aside className="spec panel" aria-label={d.project.spec}>
            <div className="panel-bar"><span>{d.project.spec}</span><span>spec.json</span></div>
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
            </div>
          </aside>

          <div>
            <section className="blk">
              <h2><span aria-hidden="true">## </span>{d.project.problem}</h2>
              <p className="body">{t.problem}</p>
            </section>
            <section className="blk">
              <h2><span aria-hidden="true">## </span>{d.project.solution}</h2>
              <p className="body">{t.solution}</p>
            </section>

            <section className="blk" id="lab">
              <h2><span aria-hidden="true">## </span>{d.project.lab}</h2>
              <Lab
                slug={p.slug}
                lang={lang}
                lab={d.lab}
                shared={{ verdicts: d.verdicts, categories: d.categories, sample: d.sample }}
              />
            </section>

            <section className="blk">
              <h2><span aria-hidden="true">## </span>{d.project.how}</h2>
              <p className="body">{t.flowLead}</p>
              <Flow cols={p.flow} labels={t.flow} />
            </section>

            <section className="blk">
              <h2><span aria-hidden="true">## </span>{d.project.features}</h2>
              <ul className="list">{t.features.map((f) => <li key={f}>{f}</li>)}</ul>
            </section>

            <section className="blk">
              <h2><span aria-hidden="true">## </span>{d.project.facts}</h2>
              <div className="facts">
                {t.facts.map((f) => (
                  <div key={f.k}><span className="label">{f.k}</span><b>{f.v}</b></div>
                ))}
              </div>
            </section>

            <section className="blk">
              <h2><span aria-hidden="true">## </span>{d.project.honest}</h2>
              <ul className="list honest">{t.honest.map((f) => <li key={f}>{f}</li>)}</ul>
            </section>
          </div>
        </div>

        <nav className="next" aria-label={d.ui.nextWork}>
          <span className="label">{d.ui.nextWork} · {next.num}</span>
          <Link href={`/${lang}/projects/${next.slug}`}>
            <span className="work-name"><span>{next.name}</span></span>
            <span className="arrow work-name" aria-hidden="true">→</span>
          </Link>
        </nav>
      </div>
      <Footer d={d} lang={lang} />
    </>
  );
}
