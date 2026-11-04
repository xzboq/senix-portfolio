import Link from "next/link";
import { notFound } from "next/navigation";
import { Channels } from "@/components/Channels";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { LazyGame } from "@/components/LazyGame";
import { Method } from "@/components/Method";
import { Scanner } from "@/components/Scanner";
import { Works } from "@/components/Works";
import { getDict } from "@/content/dict";
import { cards } from "@/content/game";
import { SITE_URL, isLocale, links } from "@/content/i18n";

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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <section id="top" className="wrap hero" aria-labelledby="hero-h">
        <div className="hero-in">
          <p className="hero-id">
            <b>Utkir</b>
            <span>{d.hero.role}</span>
            <span>·</span>
            <span>{d.hero.baseValue}</span>
          </p>
          <h1 id="hero-h">
            {d.hero.headline[0]}
            <em>{d.hero.headline[1]}</em>
          </h1>
          <div className="hero-cols">
            <div>
              <p className="hero-lead">{d.hero.lead}</p>
              <p style={{ marginTop: 20 }}>
                <Link href={`/${lang}#works`} className="btn btn--solid">
                  {d.hero.toWorks} <span className="arrow">↓</span>
                </Link>
              </p>
            </div>
            <dl className="ledger">
              <div><dt className="label">{d.hero.ledger.name}</dt><dd>Utkir</dd></div>
              <div><dt className="label">{d.hero.ledger.age}</dt><dd>{d.hero.ageValue}</dd></div>
              <div><dt className="label">{d.hero.ledger.base}</dt><dd>{d.hero.baseValue}</dd></div>
              <div><dt className="label">{d.hero.ledger.focus}</dt><dd>{d.hero.focusValue}</dd></div>
              <div>
                <dt className="label">{d.hero.ledger.github}</dt>
                <dd>
                  <a href={links.github} target="_blank" rel="noopener noreferrer">
                    SenixDev14yo<span className="sr"> ({d.ui.external})</span>
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <Scanner
          lang={lang}
          t={d.scanner}
          verdicts={d.verdicts}
          categories={d.categories}
          samples={d.sample}
          severity={d.lab.kiber.severity}
          labHref={`/${lang}/projects/kiber-yordamchi#lab`}
        />
      </section>

      <Works lang={lang} d={d} />
      <Method lang={lang} d={d} />

      <section id="play" className="sec" aria-labelledby="play-h">
        <div className="wrap">
          <div className="sec-head">
            <span className="n">03</span>
            <h2 id="play-h">{d.play.title}</h2>
            <p>{d.play.lead}</p>
          </div>
          <LazyGame lang={lang} t={d.play} verdicts={d.verdicts} cards={cards[lang]} />
        </div>
      </section>

      <section id="contact" className="sec" aria-labelledby="contact-h">
        <div className="wrap">
          <div className="sec-head">
            <span className="n">04</span>
            <h2 id="contact-h">{d.contact.title}</h2>
            <p>{d.contact.lead}</p>
          </div>
          <div className="contact-grid">
            <ContactForm t={d.contact} />
            <Channels t={d.contact} external={d.ui.external} />
          </div>
        </div>
      </section>

      <Footer d={d} />
    </>
  );
}
