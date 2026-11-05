"use client";

import { useState } from "react";
import type { Dict } from "@/content/dict";
import { DRIFT_CARS, DRIFT_MAX, DRIFT_ZONES, kmh } from "@/content/drift";
import type { Locale } from "@/content/i18n";
import type { LabProps } from "../Lab";

const BASE = DRIFT_CARS.find((c) => c.id === "nexia")!;

export default function DriftLab({ lang, t }: LabProps<Dict["lab"]["drift"]> & { lang: Locale }) {
  const [id, setId] = useState("camaro");
  const car = DRIFT_CARS.find((c) => c.id === id) ?? BASE;
  const num = (n: number) => n.toLocaleString(lang);

  const stats = [
    { k: t.speed, v: car.v, b: BASE.v, max: DRIFT_MAX.v, show: `${kmh(car.v)} km/h` },
    { k: t.accel, v: car.acc, b: BASE.acc, max: DRIFT_MAX.acc, show: car.acc.toFixed(1) },
    { k: t.grip, v: car.grip, b: BASE.grip, max: DRIFT_MAX.grip, show: car.grip.toFixed(1) },
    { k: t.steer, v: car.steer, b: BASE.steer, max: DRIFT_MAX.steer, show: car.steer.toFixed(2) },
  ];

  return (
    <div className="panel lab">
      <div className="panel-bar"><span>{t.title}</span><span>CARS · 18</span></div>
      <div className="lab-body">
        <p className="lab-lead">{t.lead}</p>
        <div className="lab-grid">
          <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
            <p className="label">{t.car}</p>
            <div className="cars" role="group" aria-label={t.car}>
              {DRIFT_CARS.map((c) => (
                <button key={c.id} type="button" className="chip" aria-pressed={c.id === id} onClick={() => setId(c.id)}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="result-box drift-card" aria-live="polite">
            <div className="drift-head">
              <strong>{car.name}</strong>
              <span className="mono">
                {car.price ? `$${num(car.price)}` : t.starter}
                {car.ev ? ` · ${t.ev}` : ""}
              </span>
            </div>
            {stats.map((s) => {
              const d = s.v - s.b;
              return (
                <div key={s.k} className="stat">
                  <div className="stat-top">
                    <span className="label">{s.k}</span>
                    <span className="mono">
                      {s.show}
                      {car.id !== BASE.id && (
                        <span className={d > 0 ? "ok-t" : d < 0 ? "no-t" : undefined}>
                          {" "}
                          {d > 0 ? "▲" : d < 0 ? "▼" : "="}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="stat-bar" aria-hidden="true">
                    <i style={{ width: `${(s.v / s.max) * 100}%` }} />
                    <b style={{ left: `${(s.b / s.max) * 100}%` }} title={t.vs} />
                  </div>
                </div>
              );
            })}
            <p className="note">│ = Nexia · {t.vs}</p>
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <h3 className="label">{t.zones}</h3>
          <p className="lab-lead">{t.zonesLead}</p>
          <div className="matrix-scroll" style={{ marginTop: 0 }}>
            <table className="tbl zones">
              <thead>
                <tr>
                  <th>{t.zone}</th>
                  {t.medals.map((m, i) => (
                    <th key={m}><span className="medal" data-m={i} />{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DRIFT_ZONES.map((z) => (
                  <tr key={z.id}>
                    <td>{z.name[lang]}</td>
                    {z.medals.map((m, i) => <td key={i}>{num(m)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
