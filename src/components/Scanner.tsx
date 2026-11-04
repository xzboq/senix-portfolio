"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Locale } from "@/content/i18n";
import type { Dict } from "@/content/dict";
import { analyzeText, assess, signalText, verdictTone } from "@/lib/engine";

interface Props {
  lang: Locale;
  t: Dict["scanner"];
  verdicts: Dict["verdicts"];
  categories: Dict["categories"];
  samples: string[];
  severity: Dict["lab"]["kiber"]["severity"];
  labHref: string;
}

const TONE_VAR = { ok: "--ok", warn: "--warn", bad: "--accent", none: "--mute" } as const;

export function Scanner({ lang, t, verdicts, categories, samples, severity, labHref }: Props) {
  const [text, setText] = useState(samples[0]);
  const a = useMemo(() => assess(analyzeText(text)), [text]);
  const tone = verdictTone(a.verdict);

  return (
    <section className="scan panel" aria-labelledby="scan-title">
      <div className="panel-bar label">
        <span id="scan-title">{t.tag}</span>
        <span className="live">{t.where}</span>
      </div>
      <div className="scan-grid">
        <div className="scan-in">
          <label htmlFor="scan-text" className="label" style={{ display: "block", marginBottom: 8 }}>
            {t.label}
          </label>
          <textarea
            id="scan-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.placeholder}
            spellCheck={false}
            maxLength={2000}
          />
          <div className="chips">
            {t.samples.map((label, i) => (
              <button
                key={label}
                type="button"
                className="chip"
                aria-pressed={text === samples[i]}
                onClick={() => setText(samples[i])}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="scan-out" aria-live="polite" aria-label={t.live}>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>{t.verdict}</div>
            <div className="verdict" data-tone={tone}>
              <strong>{verdicts[a.verdict]}</strong>
              <span className="score">{a.score}/100</span>
            </div>
          </div>
          <div className="meter" style={{ color: `var(${TONE_VAR[tone]})` }} aria-hidden="true">
            <i style={{ ["--v" as string]: a.score }} />
          </div>
          <div className="meta-row">
            <div>
              <span className="label">{t.confidence}</span>
              <b>{a.confidence}%</b>
            </div>
            {a.category && (
              <div>
                <span className="label">{t.category}</span>
                <b>{categories[a.category] ?? a.category}</b>
              </div>
            )}
          </div>
          {a.evidence.length ? (
            <div>
              <div className="label" style={{ marginBottom: 6 }}>{t.evidence}</div>
              <ol className="evid">
                {a.evidence.map((e) => (
                  <li key={e.id}>
                    <span className="id">{e.id}</span>
                    <span>{signalText(e, lang)}</span>
                    <span className="sev" data-s={e.severity}>{severity[e.severity]}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <p className="note">{t.none}</p>
          )}
          <p className="note">{t.note}</p>
          <Link href={labHref} className="tlink mono" style={{ fontSize: "0.8125rem" }}>
            {t.lab} <span className="arrow">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
