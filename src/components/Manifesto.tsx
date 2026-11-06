import { Fragment } from "react";

/** Манифест между бегущей строкой и цифрами — только на ПК (на телефоне скрыт).
 *  Пока блок прокручивается, текст стоит на месте, а слова по очереди загораются:
 *  CSS view-timeline, без JS. Слова в *звёздочках* загораются акцентным цветом. */
export function Manifesto({ label, text }: { label: string; text: string }) {
  const words: { text: string; accent: boolean }[] = [];
  let accent = false;
  for (const raw of text.split(/\s+/)) {
    if (raw.startsWith("*")) accent = true;
    words.push({ text: raw.replace(/\*/g, ""), accent });
    if (/\*[.,!?…]*$/.test(raw)) accent = false;
  }
  const n = words.length;
  const span = 84 / n; // слова загораются на отрезке 6%–90% «стоянки» блока

  return (
    <div className="mf">
      <div className="mf-pin">
        <div className="wrap">
          <p className="sec-meta" aria-hidden="true">
            <span className="sec-n">✦</span>
            <span className="sec-sep">/</span>
            <span className="sec-path">{label}</span>
            <span className="sec-rule" />
          </p>
          <p className="mf-text">
            {words.map((w, i) => (
              <Fragment key={i}>
                {i > 0 && " "}
                <span
                  className={w.accent ? "mf-w mf-w--accent" : "mf-w"}
                  style={{ animationRange: `contain ${(6 + i * span).toFixed(2)}% contain ${(6 + (i + 1.6) * span).toFixed(2)}%` }}
                >
                  {w.text}
                </span>
              </Fragment>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}
