"use client";

import { useState, type FormEvent } from "react";
import type { Dict } from "@/content/dict";
import { links } from "@/content/i18n";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm({ t }: { t: Dict["contact"] }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fd.get("_honey")) return; // бот
    const name = String(fd.get("name") ?? "").trim();
    const reach = String(fd.get("reach") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();
    const errs = { name: !name, reach: !reach, message: !message };
    setErrors(errs);
    if (errs.name || errs.reach || errs.message) return;

    setStatus("sending");
    try {
      const res = await fetch(links.form, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name,
          contact: reach,
          message,
          _subject: `Portfolio: message from ${name}`,
          _captcha: "false",
          _template: "table",
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const field = (id: "name" | "reach" | "message", label: string, hint?: string) => (
    <div className="field">
      <label htmlFor={`f-${id}`} className="label">
        {label}
        {hint ? <span className="hint"> · {hint}</span> : null}
      </label>
      {id === "message" ? (
        <textarea id={`f-${id}`} name={id} maxLength={3000} aria-invalid={errors[id] || undefined} aria-describedby={errors[id] ? `e-${id}` : undefined} />
      ) : (
        <input id={`f-${id}`} name={id} type="text" maxLength={200} autoComplete={id === "name" ? "name" : "email"} aria-invalid={errors[id] || undefined} aria-describedby={errors[id] ? `e-${id}` : undefined} />
      )}
      {errors[id] && <span className="err" id={`e-${id}`}>{t.required}</span>}
    </div>
  );

  return (
    <form className="form panel" onSubmit={onSubmit} noValidate>
      <div className="form-body">
      {field("name", t.name)}
      {field("reach", t.reach, t.reachHint)}
      {field("message", t.message)}
      <input className="hp" type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="form-actions">
        <button type="submit" className="btn btn--solid" disabled={status === "sending"}>
          {status === "sending" ? t.sending : t.send} <span className="arrow">→</span>
        </button>
        <p className="form-msg" role="status" data-t={status === "sent" ? "ok" : status === "error" ? "err" : undefined}>
          {status === "sent" && t.sent}
          {status === "error" && (
            <>
              {t.fail}{" "}
              <a className="tlink" href={links.telegram} target="_blank" rel="noopener noreferrer">
                @princess_scammer
              </a>
            </>
          )}
        </p>
      </div>
      </div>
    </form>
  );
}
