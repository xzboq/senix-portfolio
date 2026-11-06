"use client";

import { useEffect, useState } from "react";

/** Оглавление страницы проекта: подсвечивает раздел, который сейчас в середине экрана. */
export function Toc({ title, items }: { title: string; items: { id: string; label: string }[] }) {
  const [active, setActive] = useState("");
  const ids = items.map((i) => i.id).join(",");

  useEffect(() => {
    const els = ids
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = e.target.id;
          if (e.isIntersecting) setActive(id);
          else setActive((a) => (a === id ? "" : a));
        }
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  return (
    <nav className="toc" aria-label={title}>
      <p className="label">{title}</p>
      <ol>
        {items.map((it, i) => (
          <li key={it.id}>
            <a href={`#${it.id}`} aria-current={active === it.id ? "true" : undefined}>
              <i aria-hidden="true">{String(i + 1).padStart(2, "0")}</i>
              {it.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
