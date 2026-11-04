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
          background: "#ece9e0",
          color: "#131311",
          padding: 72,
          border: "14px solid #131311",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 4, textTransform: "uppercase" }}>
          Full-Stack Developer · Chirchiq, Uzbekistan
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 200, fontWeight: 800, letterSpacing: -10, lineHeight: 0.9 }}>utkir</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", fontSize: 30, gap: 8 }}>
            <span>Kiber Yordamchi</span>
            <span>SenixSearch</span>
            <span>WishPool</span>
            <span>Weather</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
