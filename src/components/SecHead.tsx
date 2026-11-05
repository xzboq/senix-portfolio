export function SecHead({ id, n, path, title, lead }: { id: string; n: string; path: string; title: string; lead?: string }) {
  return (
    <header className="sec-head">
      <p className="sec-meta" aria-hidden="true">
        <span className="sec-n">{n}</span>
        <span className="sec-path">~/{path}</span>
        <span className="sec-rule" />
      </p>
      <h2 id={id}>{title}</h2>
      {lead && <p className="sec-lead">{lead}</p>}
    </header>
  );
}
