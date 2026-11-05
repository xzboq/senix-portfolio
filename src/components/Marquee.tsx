/** Бегущая строка стека: две одинаковые ленты, сдвиг на 50% — бесшовно. Без JS. */
export function Marquee({ items }: { items: string[] }) {
  const row = (hidden: boolean) => (
    <ul className="mq-row" aria-hidden={hidden || undefined}>
      {items.map((s) => (
        <li key={s}>
          <span className="mq-dot" aria-hidden="true">◆</span>
          {s}
        </li>
      ))}
    </ul>
  );
  return (
    <div className="mq">
      <div className="mq-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
