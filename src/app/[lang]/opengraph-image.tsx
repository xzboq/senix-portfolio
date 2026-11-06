import { locales } from "@/content/i18n";
import { ImageResponse } from "next/og";

export const alt = "Utkir — Full-Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Статический экспорт: картинку надо отрендерить для каждого языка заранее.
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// Только латиница: шрифт по умолчанию в ImageResponse не содержит кириллицы.
export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#07070c",
          backgroundImage:
            "radial-gradient(700px 400px at 90% 0%, rgba(182,156,255,0.18), transparent 70%), radial-gradient(600px 400px at 0% 0%, rgba(103,212,255,0.12), transparent 70%)",
          color: "#eceef1",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 28, color: "#959daa" }}>
          <div style={{ display: "flex", width: 14, height: 14, borderRadius: 7, background: "#4ade80" }} />
          <span style={{ color: "#a99cff", letterSpacing: 6 }}>UTKIR</span>
          <span>Full-Stack Developer · Chirchiq, Uzbekistan</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "flex-end", fontSize: 210, fontWeight: 800, letterSpacing: -12, lineHeight: 0.9 }}>
            utkir
            <div style={{ display: "flex", width: 26, height: 150, marginLeft: 14, marginBottom: 12, background: "#a99cff", borderRadius: 4 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", fontSize: 26, gap: 6, color: "#959daa" }}>
            <span>Kiber Yordamchi</span>
            <span>SenixSearch</span>
            <span>WishPool</span>
            <span>Weather</span>
            <span>Drift Chirchik</span>
            <span>Fresh Chirchik</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
