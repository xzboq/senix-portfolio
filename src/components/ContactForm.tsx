"use client";

import { useState, type FormEvent } from "react";
import type { Dict } from "@/content/dict";
import { links } from "@/content/i18n";
import { launchSignal } from "@/lib/signal";

/** Связь без бэкенда и без секретов в бандле: форма собирает текст и открывает чат со мной
 *  в Telegram — t.me/<username>?text=… подставляет его в поле ввода, остаётся нажать «Отправить».
 *  Текст ещё и копируется в буфер: на случай клиента, который не подставит его сам.
 *  На ПК перед открытием чата от кнопки уходит «сигнал» (lib/signal.ts) — Telegram открывается через ~0,6 с. */
type Opened = { url: string; copied: boolean } | null;

export function ContactForm({ t }: { t: Dict["contact"] }) {
  const [opened, setOpened] = useState<Opened>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const topic = String(fd.get("topic") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();
    const errs = { name: !name, message: !message };
    setErrors(errs);
    if (errs.name || errs.message) {
      (form.elements.namedItem(errs.name ? "name" : "message") as HTMLElement | null)?.focus();
      return;
    }

    const lines = [t.hi.replace("{name}", name)];
    if (topic) lines.push(`${t.about}: ${topic}`);
    lines.push("", message, "", t.via);
    const text = lines.join("\n");
    const url = `${links.telegram}?text=${encodeURIComponent(text)}`;

    setOpened({ url, copied: false });
    // копируем до открытия вкладки, пока страница ещё в фокусе
    navigator.clipboard
      ?.writeText(text)
      .then(() => setOpened((o) => (o ? { ...o, copied: true } : o)))
      .catch(() => {});
    const btn = form.querySelector<HTMLElement>("button[type='submit']");
    const wait = btn ? launchSignal(btn) : 0;
    const open = () => window.open(url, "_blank", "noopener,noreferrer");
    if (wait) window.setTimeout(open, wait);
    else open();
  }

  const field = (id: "name" | "message", label: string) => (
    <div className="field">
      <label htmlFor={`f-${id}`} className="label">
        {label}
      </label>
      {id === "message" ? (
        <textarea id={`f-${id}`} name={id} maxLength={1000} aria-invalid={errors[id] || undefined} aria-describedby={errors[id] ? `e-${id}` : undefined} />
      ) : (
        <input id={`f-${id}`} name={id} type="text" maxLength={80} autoComplete="name" aria-invalid={errors[id] || undefined} aria-describedby={errors[id] ? `e-${id}` : undefined} />
      )}
      {errors[id] && <span className="err" id={`e-${id}`}>{t.required}</span>}
    </div>
  );

  return (
    <form className="form panel" onSubmit={onSubmit} noValidate>
      <div className="form-body">
        {field("name", t.name)}
        <fieldset className="field">
          <legend className="label">
            {t.topic}
            <span className="hint"> · {t.optional}</span>
          </legend>
          <div className="chips">
            {t.topics.map((tp) => (
              <label key={tp} className="chip chip-opt">
                <input type="radio" name="topic" value={tp} />
                {tp}
              </label>
            ))}
          </div>
        </fieldset>
        {field("message", t.message)}
        <div className="form-actions">
          <button type="submit" className="btn btn--solid">
            {t.send} <span className="arrow" aria-hidden="true">→</span>
          </button>
          <p className="form-msg" role="status" data-t={opened ? "ok" : undefined}>
            {opened && (
              <>
                {t.opened}
                {opened.copied && <> {t.copied}</>}{" "}
                <span className="form-retry">
                  {t.notOpened}{" "}
                  <a className="tlink" href={opened.url} target="_blank" rel="noopener noreferrer">
                    {t.openChat}
                  </a>
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </form>
  );
}
