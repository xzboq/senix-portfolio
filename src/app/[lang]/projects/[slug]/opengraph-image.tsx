import { ImageResponse } from "next/og";
import { locales } from "@/content/i18n";
import { bySlug, projects } from "@/content/projects";

export const alt = "Utkir — project";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Статический экспорт: по картинке на каждый язык и проект.
export function generateStaticParams() {
  return locales.flatMap((lang) => projects.map((p) => ({ lang, slug: p.slug })));
}

// Только латиница: шрифт по умолчанию в ImageResponse не содержит кириллицы,
// поэтому подписи берём из английского текста.
export default async function OG({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { slug } = await params;
  const p = bySlug(slug) ?? projects[0];
  const t = p.text.en;

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
            "radial-gradient(700px 420px at 92% 0%, rgba(182,156,255,0.20), transparent 70%), radial-gradient(640px 420px at 0% 0%, rgba(103,212,255,0.14), transparent 70%)",
          color: "#eceef1",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28, color: "#959daa" }}>
          <div style={{ display: "flex", gap: 14 }}>
            <span style={{ color: "#a99cff", letterSpacing: 6 }}>UTKIR</span>
            <span style={{ color: "#959daa" }}>· PROJECT</span>
          </div>
          <span>
            {p.num} / {String(projects.length).padStart(2, "0")}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", fontSize: 26, color: "#a99cff", letterSpacing: 2, textTransform: "uppercase" }}>{t.kind}</div>
          <div style={{ display: "flex", fontSize: 112, fontWeight: 800, letterSpacing: -5, lineHeight: 0.95 }}>{p.name}</div>
          <div style={{ display: "flex", fontSize: 32, lineHeight: 1.35, color: "#c3c8d0", maxWidth: 980 }}>{t.tagline}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 860 }}>
            {p.stack.slice(0, 5).map((s) => (
              <div
                key={s}
                style={{ display: "flex", padding: "6px 14px", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 10, fontSize: 22, color: "#959daa" }}
              >
                {s}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 30, fontWeight: 700 }}>
            utkir
            <div style={{ display: "flex", width: 16, height: 30, background: "#a99cff", borderRadius: 3 }} />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
