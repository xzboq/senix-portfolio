import Link from "next/link";
import { notFound } from "next/navigation";
import { Channels } from "@/components/Channels";
import { PaletteButton } from "@/components/CommandPalette";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { LazyGame } from "@/components/LazyGame";
import { Marquee } from "@/components/Marquee";
import { Method } from "@/components/Method";
import { Scanner } from "@/components/Scanner";
import { SecHead } from "@/components/SecHead";
import { Terminal } from "@/components/Terminal";
import { Works } from "@/components/Works";
import { getDict } from "@/content/dict";
import { cards } from "@/content/game";
import { SITE_URL, isLocale, links } from "@/content/i18n";
import { projects } from "@/content/projects";

/** Уникальный стек всех проектов без номеров версий — для бегущей строки и команды `stack`. */
const STACK = [...new Set(projects.flatMap((p) => p.stack).map((s) => s.replace(/\s+\d[\d.+]*$/, "")))];

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDict(lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Utkir",
    jobTitle: d.hero.role,
    url: `${SITE_URL}/${lang}`,
    address: { "@type": "PostalAddress", addressLocality: "Chirchiq", addressCountry: "UZ" },
    sameAs: [links.github, links.telegram, links.instagram],
  };

  const stats = [
    { v: String(projects.length).padStart(2, "0"), k: d.stats.projects },
    { v: "24", k: d.stats.tests },
    { v: "03", k: d.stats.langs },
    { v: d.hero.ageValue, k: d.stats.age },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <section id="top" className="wrap hero" aria-labelledby="hero-h">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="kicker">
              <span className="pulse" aria-hidden="true" />
              <b>Utkir</b>
              <span className="kicker-sep" aria-hidden="true">/</span>
              <span>{d.hero.role}</span>
              <span className="kicker-sep" aria-hidden="true">/</span>
              <span>{d.hero.baseValue}</span>
            </p>
            <h1 id="hero-h">
              <span className="h1-a">{d.hero.headline[0]}</span>{" "}
              <span className="h1-b">{d.hero.headline[1]}</span>
              <span className="caret" aria-hidden="true" />
            </h1>
            <p className="hero-lead">{d.hero.lead}</p>
            <div className="hero-cta">
              <Link href={`/${lang}#works`} className="btn btn--solid">
                {d.hero.toWorks} <span className="arrow" aria-hidden="true">↓</span>
              </Link>
              <PaletteButton label={d.cmd.button} className="btn btn--ghost" />
            </div>
            <dl className="stats">
              {stats.map((s) => (
                <div key={s.k}>
                  <dt>{s.k}</dt>
                  <dd>{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <Terminal
            lang={lang}
            t={d.term}
            hero={d.hero}
            theme={d.theme}
            verdicts={d.verdicts}
            severity={d.lab.kiber.severity}
            projects={projects.map((p) => ({ slug: p.slug, num: p.num, name: p.name, status: d.works.status[p.statusKey] }))}
            stack={STACK}
            sample={d.sample[0]}
          />
        </div>
      </section>

      <Marquee items={STACK} />

      <section id="demo" className="sec" aria-labelledby="demo-h">
        <div className="wrap">
          <SecHead id="demo-h" n="00" path="demo" title={d.demo.title} lead={d.demo.lead} />
          <Scanner
            lang={lang}
            t={d.scanner}
            verdicts={d.verdicts}
            categories={d.categories}
            samples={d.sample}
            severity={d.lab.kiber.severity}
            labHref={`/${lang}/projects/kiber-yordamchi#lab`}
          />
        </div>
      </section>

      <Works lang={lang} d={d} />
      <Method lang={lang} d={d} />

      <section id="play" className="sec" aria-labelledby="play-h">
        <div className="wrap">
          <SecHead id="play-h" n="03" path="play" title={d.play.title} lead={d.play.lead} />
          <LazyGame lang={lang} t={d.play} verdicts={d.verdicts} cards={cards[lang]} />
        </div>
      </section>

      <section id="contact" className="sec" aria-labelledby="contact-h">
        <div className="wrap">
          <SecHead id="contact-h" n="04" path="contact" title={d.contact.title} lead={d.contact.lead} />
          <div className="contact-grid">
            <ContactForm t={d.contact} />
            <Channels t={d.contact} external={d.ui.external} />
          </div>
        </div>
      </section>

      <Footer d={d} lang={lang} />
    </>
  );
}
