/** Две бегущие строки встречным курсом: огромные контурные слова «что я делаю» и под ними стек.
 *  Ленты продублированы и сдвигаются на 50% — бесшовно. Только CSS (transform), без JS. */
function Row({ items, hidden }: { items: string[]; hidden?: boolean }) {
  return (
    <ul className="mq-row" aria-hidden={hidden || undefined}>
      {items.map((s) => (
        <li key={s}>
          <span className="mq-dot" aria-hidden="true">✦</span>
          {s}
        </li>
      ))}
    </ul>
  );
}

export function Marquee({ words, items }: { words: string[]; items: string[] }) {
  return (
    <div className="mq">
      <div className="mq-line mq-line--big">
        <div className="mq-track">
          <Row items={words} />
          <Row items={words} hidden />
        </div>
      </div>
      <div className="mq-line mq-line--small" aria-hidden="true">
        <div className="mq-track">
          <Row items={items} />
          <Row items={items} hidden />
        </div>
      </div>
    </div>
  );
}
