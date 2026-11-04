"use client";

import Image from "next/image";
import { useState } from "react";
import type { Dict } from "@/content/dict";
import type { LabProps } from "../Lab";
import shot from "@/assets/wishpool.jpg";

const NEEDED = 5;
const ROUTES = ["/", "/wishes", "/wishes/[id]", "/create", "/profile", "/benefactor", "/top", "/notifications", "/settings", "/about", "/admin"];

export default function WishLab({ t }: LabProps<Dict["lab"]["wish"]>) {
  const [helpers, setHelpers] = useState(0);
  const status = helpers === 0 ? 0 : helpers < NEEDED ? 1 : 2;

  return (
    <div className="panel lab">
      <div className="panel-bar label"><span>{t.title}</span><span>simulation</span></div>
      <div className="lab-body">
        <p className="lab-lead">{t.lead}</p>
        <div className="lab-grid">
          <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
            <div className="result-box">
              <span className="label">{t.wish}</span>
              <strong>{t.wishTitle}</strong>
              <div className="pbar" role="progressbar" aria-valuemin={0} aria-valuemax={NEEDED} aria-valuenow={helpers} aria-label={t.helpers}>
                <i style={{ width: `${(helpers / NEEDED) * 100}%` }} />
              </div>
              <span className="mono" style={{ fontSize: "0.8125rem" }}>
                {helpers} / {NEEDED} {t.helpers}
              </span>
            </div>
            <div className="scale" style={{ gridTemplateColumns: "repeat(4, 1fr)" }} aria-live="polite">
              {t.statuses.map((s, i) => (
                <span key={s} data-on={i === status}>{s}</span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" className="btn btn--solid" disabled={helpers >= NEEDED} onClick={() => setHelpers((h) => Math.min(NEEDED, h + 1))}>
                {t.help} +1
              </button>
              <button type="button" className="btn" onClick={() => setHelpers(0)}>{t.reset}</button>
            </div>
            <div>
              <p className="label" style={{ marginBottom: 6 }}>{t.routes}</p>
              <div className="routes">{ROUTES.map((r) => <span key={r}>{r}</span>)}</div>
            </div>
          </div>
          <figure className="shot">
            <Image src={shot} alt={t.shot} sizes="(min-width: 860px) 420px, 100vw" placeholder="blur" />
            <figcaption className="label">{t.shot}</figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
}
