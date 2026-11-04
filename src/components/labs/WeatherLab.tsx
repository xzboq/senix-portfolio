"use client";

import { useEffect, useState } from "react";
import type { Dict } from "@/content/dict";
import type { LabProps } from "../Lab";

interface Data {
  temp: number;
  code: number;
  wind: number;
  hours: { time: string; temp: number }[];
}
type State = { s: "loading" } | { s: "error" } | { s: "ok"; d: Data };

const URL =
  "https://api.open-meteo.com/v1/forecast?latitude=41.47&longitude=69.58" +
  "&current=temperature_2m,weather_code,wind_speed_10m&hourly=temperature_2m&forecast_hours=6&timezone=auto";

function kind(code: number): keyof Dict["lab"]["weather"]["codes"] {
  if (code === 0) return "clear";
  if (code <= 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code >= 61 && code <= 67) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 80 && code <= 82) return "showers";
  return "storm";
}

export default function WeatherLab({ t }: LabProps<Dict["lab"]["weather"]>) {
  const [state, setState] = useState<State>({ s: "loading" });
  const [tick, setTick] = useState(0);
  const [f, setF] = useState(false);

  useEffect(() => {
    const ctl = new AbortController();
    fetch(URL, { signal: ctl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j) => {
        setState({
          s: "ok",
          d: {
            temp: j.current.temperature_2m,
            code: j.current.weather_code,
            wind: j.current.wind_speed_10m,
            hours: (j.hourly.time as string[]).map((time, i) => ({ time: time.slice(11, 16), temp: j.hourly.temperature_2m[i] })),
          },
        });
      })
      .catch((e) => {
        if (e?.name !== "AbortError") setState({ s: "error" });
      });
    return () => ctl.abort();
  }, [tick]);

  const conv = (c: number) => Math.round(f ? (c * 9) / 5 + 32 : c);
  const unit = f ? "°F" : "°C";

  return (
    <div className="panel lab">
      <div className="panel-bar label"><span>{t.title}</span><span className="live">api.open-meteo.com</span></div>
      <div className="lab-body">
        <p className="lab-lead">{t.lead}</p>
        {state.s === "loading" && <p className="mono" role="status">{t.loading}</p>}
        {state.s === "error" && (
          <div className="result-box" data-ok="false" role="alert">
            <p>{t.error}</p>
            <div>
              <button type="button" className="btn" onClick={() => { setState({ s: "loading" }); setTick((n) => n + 1); }}>{t.retry}</button>
            </div>
          </div>
        )}
        {state.s === "ok" && (() => {
          const d = state.d;
          const min = Math.min(...d.hours.map((h) => h.temp));
          const max = Math.max(...d.hours.map((h) => h.temp));
          return (
            <div className="wx">
              <div className="wx-now">
                <div>
                  <span className="label">{t.city} · {t.now}</span>
                  <div><b>{conv(d.temp)}{unit}</b></div>
                </div>
                <div>
                  <p>{t.codes[kind(d.code)]}</p>
                  <p className="mono" style={{ fontSize: "0.8125rem", color: "var(--mute)" }}>{t.wind}: {Math.round(d.wind)} km/h</p>
                </div>
                <div className="seg" role="group" aria-label={t.unit} style={{ marginLeft: "auto" }}>
                  <button type="button" aria-pressed={!f} onClick={() => setF(false)}>°C</button>
                  <button type="button" aria-pressed={f} onClick={() => setF(true)}>°F</button>
                </div>
              </div>
              <div>
                <p className="label" style={{ marginBottom: 8 }}>{t.hourly}</p>
                <div className="wx-hours">
                  {d.hours.map((h) => (
                    <div key={h.time}>
                      <span>{conv(h.temp)}°</span>
                      <i style={{ height: `${20 + ((h.temp - min) / Math.max(max - min, 1)) * 70}%` }} />
                      <span style={{ color: "var(--mute)" }}>{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
