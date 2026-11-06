import Link from "next/link";
import { notFound } from "next/navigation";
import { Channels } from "@/components/Channels";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { LazyGame } from "@/components/LazyGame";
import { Manifesto } from "@/components/Manifesto";
import { Marquee } from "@/components/Marquee";
import { Method } from "@/components/Method";
import { Orb } from "@/components/Orb";
import { PageTransition } from "@/components/PageTransition";
import { Scanner } from "@/components/Scanner";
import { SecHead } from "@/components/SecHead";
import { Starfield } from "@/components/Starfield";
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
    <PageTransition>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <section id="top" className="hero" aria-labelledby="hero-h">
        <Starfield />
        <Orb />
        <div className="wrap hero-copy">
          <p className="kicker">
            <span className="kicker-role">{d.hero.role}</span>
            <span className="status-pill">
              <i aria-hidden="true" />
              {d.hero.open}
            </span>
          </p>
          <h1 id="hero-h" className="mega">
            <span className="mega-l">{d.hero.mega[0]}</span>
            <span className="mega-l">
              {d.hero.mega[1]}
              <span className="mega-dot">.</span>
            </span>
          </h1>
          <p className="hero-lead">
            <b>
              {d.hero.headline[0]} {d.hero.headline[1]}
            </b>{" "}
            {d.hero.lead}
          </p>
          <div className="hero-cta">
            <Link href={`/${lang}#works`} className="btn btn--solid" data-magnet>
              {d.hero.toWorks} <span className="arrow" aria-hidden="true">→</span>
            </Link>
            <Link href={`/${lang}#contact`} className="btn btn--dark" data-magnet>
              {d.hero.write}
            </Link>
          </div>
        </div>
        <a href="#demo" className="scroll-hint">
          {d.hero.scroll}
          <i aria-hidden="true" />
        </a>
      </section>

      <Marquee words={d.hero.services} items={STACK} />
      <Manifesto label={d.manifesto.label} text={d.manifesto.text} />

      <div className="wrap numbers">
        <dl className="stats">
          {stats.map((s) => (
            <div key={s.k}>
              <dt>{s.k}</dt>
              <dd>
                <span className="count" style={{ ["--to" as string]: Number(s.v) }} aria-hidden="true" />
                <span className="sr">{s.v}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

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
          <LazyGame lang={lang} t={d.play} verdicts={d.verdicts} cards={cards[lang]} error={{ message: d.ui.demoError, action: d.ui.reload }} />
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
    </PageTransition>
  );
}
