"use client";

import { useState } from "react";
import type { Dict } from "@/content/dict";
import { fmt } from "@/content/dict";
import type { Locale } from "@/content/i18n";
import type { LabProps } from "../Lab";

export default function SearchLab({ lang, t }: LabProps<Dict["lab"]["search"]> & { lang: Locale }) {
  const [tmeFree, setTmeFree] = useState(true);
  const [listed, setListed] = useState(true);
  const [text, setText] = useState("hi 👋 ты");
  const [mask, setMask] = useState("a?b?c");

  const ok = tmeFree && !listed;
  const why = !tmeFree ? t.whyTaken : listed ? t.whyFragment : t.claimableWhy;

  const chars = [...text];
  let off = 0;
  const cells = chars.slice(0, 40).map((c) => {
    const cell = { c, u: c.length, off };
    off += c.length;
    return cell;
  });
  const totalUnits = chars.reduce((n, c) => n + c.length, 0);

  const maskOk = /^[a-z?]{2,32}$/i.test(mask);
  const q = (mask.match(/\?/g) ?? []).length;
  const count = maskOk ? BigInt(26) ** BigInt(q) : null;

  return (
    <div className="panel lab">
      <div className="panel-bar label"><span>{t.title}</span><span>t.me × Fragment</span></div>
      <div className="lab-body">
        <p className="lab-lead">{t.lead}</p>
        <div className="lab-grid">
          <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
            <div>
              <p className="label" style={{ marginBottom: 6 }}>{t.tme}</p>
              <div className="seg" role="group" aria-label={t.tme}>
                <button type="button" aria-pressed={tmeFree} onClick={() => setTmeFree(true)}>{t.tmeFree}</button>
                <button type="button" aria-pressed={!tmeFree} onClick={() => setTmeFree(false)}>{t.tmeTaken}</button>
              </div>
            </div>
            <div>
              <p className="label" style={{ marginBottom: 6 }}>{t.frag}</p>
              <div className="seg" role="group" aria-label={t.frag}>
                <button type="button" aria-pressed={!listed} onClick={() => setListed(false)}>{t.fragAbsent}</button>
                <button type="button" aria-pressed={listed} onClick={() => setListed(true)}>{t.fragListed}</button>
              </div>
            </div>
          </div>
          <div className="result-box" data-ok={ok} aria-live="polite">
            <strong className={ok ? "ok-t" : "no-t"}>{ok ? t.claimable : t.notClaimable}</strong>
            <p style={{ fontSize: "0.9375rem" }}>{why}</p>
          </div>
        </div>

        <div className="lab-grid">
          <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
            <h3 className="label">{t.utfTitle}</h3>
            <p className="lab-lead">{t.utfLead}</p>
            <div className="field">
              <label className="sr" htmlFor="utf-in">{t.utfInput}</label>
              <input id="utf-in" type="text" value={text} maxLength={40} onChange={(e) => setText(e.target.value)} />
            </div>
            <p className="mono" style={{ fontSize: "0.8125rem" }}>
              {chars.length} {t.codePoints} · {totalUnits} {t.totalUnits}
            </p>
          </div>
          <div className="utf" aria-label={t.utfTitle}>
            {cells.map((x, k) => (
              <div key={k} data-w={x.u} title={`${t.offset} ${x.off}`}>
                <b>{x.c === " " ? "␣" : x.c}</b>
                <span>{x.off}{x.u > 1 ? `–${x.off + x.u - 1}` : ""}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lab-grid">
          <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
            <h3 className="label">{t.maskTitle}</h3>
            <p className="lab-lead">{t.maskLead}</p>
            <div className="field">
              <label className="sr" htmlFor="mask-in">{t.maskTitle}</label>
              <input id="mask-in" type="text" value={mask} maxLength={32} onChange={(e) => setMask(e.target.value)} spellCheck={false} />
            </div>
          </div>
          <div className="result-box" aria-live="polite">
            <strong className="mono">{count !== null ? fmt(t.maskCount, { n: count.toLocaleString(lang) }) : t.maskBad}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
