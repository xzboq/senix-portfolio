"use client";

import { useMemo, useState } from "react";
import type { Dict } from "@/content/dict";
import type { Locale } from "@/content/i18n";
import { MANUAL_SIGNALS, analyzeText, assess, signalText, verdictTone, type Verdict } from "@/lib/engine";
import type { LabProps } from "../Lab";

const SCALE: { v: Verdict; from: number }[] = [
  { v: "SAFE", from: 0 },
  { v: "LOW_RISK", from: 10 },
  { v: "SUSPICIOUS", from: 30 },
  { v: "HIGH_RISK", from: 60 },
  { v: "DANGEROUS", from: 80 },
];
const TONE_VAR = { ok: "--ok", warn: "--warn", bad: "--bad", none: "--mute" } as const;

export default function KiberLab({ lang, t, shared }: LabProps<Dict["lab"]["kiber"]> & { lang: Locale }) {
  const [text, setText] = useState(shared.sample[0]);
  const [manual, setManual] = useState<Set<string>>(new Set());
  const [known, setKnown] = useState(false);

  const signals = useMemo(
    () => [...analyzeText(text), ...MANUAL_SIGNALS.filter((s) => manual.has(s.type))],
    [text, manual],
  );
  const a = useMemo(() => assess(signals, known), [signals, known]);
  const tone = verdictTone(a.verdict);
  const allLow = signals.length > 0 && signals.every((s) => s.severity === "low");

  const toggle = (type: string) =>
    setManual((m) => {
      const n = new Set(m);
      if (n.has(type)) n.delete(type);
      else n.add(type);
      return n;
    });

  return (
    <div className="panel lab">
      <div className="panel-bar label">
        <span>{t.title}</span>
        <span className="live">TypeScript port · risk_engine.py</span>
      </div>
      <div className="lab-body">
        <p className="lab-lead">{t.lead}</p>
        <div className="lab-grid">
          <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
            <div className="field">
              <label className="label" htmlFor="lab-text">{t.text}</label>
              <textarea id="lab-text" value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} spellCheck={false} />
            </div>
            <div>
              <p className="label" title={t.manualHint}>{t.manual}</p>
              <div className="tog" style={{ marginTop: 8 }}>
                {MANUAL_SIGNALS.map((s) => (
                  <label key={s.type}>
                    <input type="checkbox" checked={manual.has(s.type)} onChange={() => toggle(s.type)} />
                    <span>{signalText(s, lang)}</span>
                    <span className="sev" data-s={s.severity}>{t.severity[s.severity]}</span>
                  </label>
                ))}
                <label>
                  <input type="checkbox" checked={known} onChange={(e) => setKnown(e.target.checked)} />
                  <span>{t.known}</span>
                  <span className="sev" data-s="high">+50</span>
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 18, alignContent: "start" }} aria-live="polite">
            <div>
              <div className="label" style={{ marginBottom: 6 }}>{t.verdict}</div>
              <div className="verdict" data-tone={tone}>
                <strong>{shared.verdicts[a.verdict]}</strong>
                <span className="score">{a.score}/100</span>
              </div>
            </div>
            <div className="meter" style={{ color: `var(${TONE_VAR[tone]})` }} aria-hidden="true">
              <i style={{ ["--v" as string]: a.score }} />
            </div>
            <div>
              <div className="label" style={{ marginBottom: 4 }}>{t.ruleTitle}</div>
              <div className="scale" aria-hidden="true">
                {SCALE.map((s) => (
                  <span key={s.v} data-on={a.verdict === s.v || (a.capped && a.verdict === s.v)}>
                    {s.from}+
                  </span>
                ))}
              </div>
            </div>
            <div className="meta-row">
              <div><span className="label">{t.confidence}</span><b>{a.confidence}%</b></div>
              {a.category && (
                <div><span className="label">{t.category}</span><b>{shared.categories[a.category] ?? a.category}</b></div>
              )}
              <div>
                <span className="label">{a.corroborated ? t.corroborated : t.notCorroborated}</span>
              </div>
            </div>
            {a.capped && <p className="note" style={{ color: "var(--warn)" }}>{t.capped}</p>}
            {allLow && <p className="note">{t.unknownWhy}</p>}

            {a.trace.length ? (
              <div>
                <div className="label" style={{ marginBottom: 6 }}>{t.breakdown}</div>
                <table className="tbl">
                  <thead><tr><th>{t.type}</th><th>{t.weight}</th></tr></thead>
                  <tbody>
                    {a.trace.map((r) => (
                      <tr key={r.type}>
                        <td>{signalText(signals.find((x) => x.type === r.type) ?? { type: r.type, severity: "low", confidence: 0 }, lang)}{r.count > 1 ? ` ×${r.count}` : ""}</td>
                        <td>+{r.contribution.toFixed(1)}</td>
                      </tr>
                    ))}
                    {known && (
                      <tr><td>threat feed</td><td>+50</td></tr>
                    )}
                  </tbody>
                </table>
                <p className="note" style={{ marginTop: 8 }}>{t.decay}</p>
              </div>
            ) : (
              <p className="note">{t.empty}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
