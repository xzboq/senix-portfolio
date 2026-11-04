import type { FlowNode } from "@/content/projects";

export function Flow({ cols, labels }: { cols: FlowNode[][]; labels: string[] }) {
  return (
    <ol className="flow">
      {cols.map((nodes, i) => (
        <li key={i} className="flow-col">
          <span className="label">{labels[i]}</span>
          {nodes.map((n) => (
            <div key={n.t} className="node" data-dashed={n.dashed ? "true" : undefined}>{n.t}</div>
          ))}
        </li>
      ))}
    </ol>
  );
}
