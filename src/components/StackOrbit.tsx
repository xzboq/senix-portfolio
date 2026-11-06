import type { Dict } from "@/content/dict";

interface Row {
  name: string;
  group: "primary" | "additional";
  cells: number[];
  empty?: boolean;
  note?: Record<number, string>;
}

/** «Орбиты технологий» вместо таблицы: основные инструменты — на ближней орбите, дополнительные — на дальней,
 *  без публичного проекта — приглушены пунктиром. Справа — честная легенда: где каждый инструмент используется.
 *  Вращение — CSS (transform), при «уменьшить движение» планеты стоят. */
export function StackOrbit({ t }: { t: Dict["toolbox"] }) {
  const rows = t.rows as Row[];
  const rings = [rows.filter((r) => r.group === "primary"), rows.filter((r) => r.group === "additional")];

  const usedIn = (r: Row) =>
    r.cells
      .map((c, i) => (c ? `${t.projects[i]}${r.note?.[i] ? ` (${r.note[i]})` : ""}` : null))
      .filter(Boolean)
      .join(" · ");

  return (
    <div className="stack rv">
      <div className="stack-head">
        <h3>{t.title}</h3>
        <p>{t.lead}</p>
      </div>
      <div className="stack-body">
        <div className="orbits" aria-hidden="true">
          <div className="orbit-core">
            <span>UTKIR</span>
          </div>
          {rings.map((ring, ri) => (
            <div key={ri} className={`orbit orbit--${ri + 1}`}>
              {ring.map((r, i) => (
                <span
                  key={r.name}
                  className="planet"
                  data-empty={r.empty || undefined}
                  style={{ ["--a" as string]: `${(360 / ring.length) * i + ri * 24}deg` }}
                >
                  <b>{r.name}</b>
                </span>
              ))}
            </div>
          ))}
        </div>
        <dl className="stack-legend">
          {rows.map((r) => (
            <div key={r.name} data-empty={r.empty || undefined}>
              <dt>
                <i data-group={r.group} />
                {r.name}
                <small>{r.group === "primary" ? t.primary : t.additional}</small>
              </dt>
              <dd>{r.empty ? t.empty : usedIn(r)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
