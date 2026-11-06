import { Fragment, type CSSProperties } from "react";

/** Шапка раздела. Заголовок разбит на буквы (--i — порядковый номер): на ПК они по очереди
 *  выезжают при прокрутке. Имя заголовка для скринридеров — целиком из aria-label.
 *  data-n — номер раздела: на ПК он же огромной контурной цифрой плывёт за шапкой. */
export function SecHead({ id, n, path, title, lead }: { id: string; n: string; path: string; title: string; lead?: string }) {
  const words: { ch: string; i: number }[][] = [];
  let i = 0;
  for (const word of title.split(" ")) {
    const letters: { ch: string; i: number }[] = [];
    for (const ch of Array.from(word)) letters.push({ ch, i: i++ });
    words.push(letters);
  }
  return (
    <header className="sec-head" data-n={n}>
      <p className="sec-meta" aria-hidden="true">
        <span className="sec-n">{n}</span>
        <span className="sec-sep">/</span>
        <span className="sec-path">{path}</span>
        <span className="sec-rule" />
      </p>
      <h2 id={id} aria-label={title}>
        {words.map((letters, wi) => (
          <Fragment key={wi}>
            {wi > 0 && " "}
            <span className="sh-w" aria-hidden="true">
              {letters.map((l) => (
                <span key={l.i} className="sh-c" style={{ "--i": l.i } as CSSProperties}>
                  {l.ch}
                </span>
              ))}
            </span>
          </Fragment>
        ))}
      </h2>
      {lead && <p className="sec-lead">{lead}</p>}
    </header>
  );
}
