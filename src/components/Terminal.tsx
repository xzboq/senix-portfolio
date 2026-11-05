"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { fmt, type Dict } from "@/content/dict";
import { links, locales, type Locale } from "@/content/i18n";
import { analyzeText, assess, signalText, verdictTone } from "@/lib/engine";
import { setLocaleCookie, toggleTheme } from "@/lib/theme";

export interface TermProject {
  slug: string;
  num: string;
  name: string;
  status: string;
}

interface Props {
  lang: Locale;
  t: Dict["term"];
  hero: Dict["hero"];
  theme: Dict["theme"];
  verdicts: Dict["verdicts"];
  severity: Dict["lab"]["kiber"]["severity"];
  projects: TermProject[];
  stack: string[];
  sample: string;
}

interface Entry {
  id: number;
  cmd: string;
  out: ReactNode;
}

const COMMANDS = ["help", "whoami", "ls", "open", "scan", "stack", "contact", "lang", "theme", "neofetch", "clear"] as const;
const EXTRA = ["cat", "echo", "date", "projects", "sudo", "exit"];

const TONE = { ok: "t-ok", warn: "t-warn", bad: "t-bad", none: "t-dim" } as const;

function Json({ data }: { data: Record<string, string | number | string[]> }) {
  const keys = Object.keys(data);
  const val = (v: string | number | string[]) =>
    typeof v === "number" ? (
      <span className="t-num">{v}</span>
    ) : Array.isArray(v) ? (
      <>
        [
        {v.map((x, i) => (
          <span key={x}>
            <span className="t-str">&quot;{x}&quot;</span>
            {i < v.length - 1 ? ", " : ""}
          </span>
        ))}
        ]
      </>
    ) : (
      <span className="t-str">&quot;{v}&quot;</span>
    );
  return (
    <div className="t-json">
      <div>{"{"}</div>
      {keys.map((k, i) => (
        <div key={k} className="t-ind">
          <span className="t-key">&quot;{k}&quot;</span>: {val(data[k])}
          {i < keys.length - 1 ? "," : ""}
        </div>
      ))}
      <div>{"}"}</div>
    </div>
  );
}

function Prompt() {
  return (
    <span className="t-prompt" aria-hidden="true">
      <span className="t-user">utkir</span>
      <span className="t-at">@chirchiq</span> <span className="t-path">~</span> <span className="t-arrow">❯</span>
    </span>
  );
}

const ASCII = String.raw`  _   _  _
 | | | || |_
 | |_| ||  _|
  \___/  \__|`;

export function Terminal({ lang, t, hero, theme, verdicts, severity, projects, stack, sample }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [input, setInput] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const nextId = useRef(1);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const profile = (
    <Json
      data={{
        name: "Utkir",
        role: hero.role,
        age: Number(hero.ageValue),
        base: hero.baseValue,
        focus: hero.focusValue.split(" · "),
        github: "xzboq",
      }}
    />
  );

  const [log, setLog] = useState<Entry[]>(() => [
    { id: 0, cmd: "cat utkir.json", out: profile },
  ]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el && log.length > 1) el.scrollTop = el.scrollHeight;
  }, [log]);

  const findProject = (arg: string) => {
    const a = arg.toLowerCase().replace(/^0+/, "");
    return projects.find(
      (p) => p.num.replace(/^0+/, "") === a || p.slug.startsWith(a) || p.name.toLowerCase().startsWith(a),
    );
  };

  function exec(raw: string): ReactNode | "clear" {
    const line = raw.trim();
    if (!line) return null;
    const [c0, ...rest] = line.split(/\s+/);
    const c = c0.toLowerCase();
    const arg = line.slice(c0.length).trim();

    switch (c) {
      case "help":
        return (
          <div className="t-grid">
            <div className="t-dim t-span">{t.help}</div>
            {COMMANDS.map((k) => (
              <div key={k} className="t-row">
                <span className="t-cmd">{k}</span>
                <span className="t-dim">{t.cmds[k]}</span>
              </div>
            ))}
          </div>
        );
      case "whoami":
        return (
          <div>
            <span className="t-acc">utkir</span> — {hero.role} · {hero.baseValue} · {hero.ageValue}
          </div>
        );
      case "cat":
        return arg === "utkir.json" || arg === "" ? profile : <div className="t-bad">cat: {arg}: No such file or directory</div>;
      case "ls":
      case "projects":
        return (
          <div className="t-grid">
            {projects.map((p) => (
              <div key={p.slug} className="t-row t-row3">
                <span className="t-dim">{p.num}</span>
                <Link href={`/${lang}/projects/${p.slug}`} className="t-link">{p.slug}/</Link>
                <span className="t-dim">{p.status}</span>
              </div>
            ))}
          </div>
        );
      case "open": {
        if (!arg) return <div className="t-warn">{t.openUsage}</div>;
        const p = findProject(arg);
        if (!p) return <div className="t-warn">{t.openUsage}</div>;
        setTimeout(() => router.push(`/${lang}/projects/${p.slug}`), 350);
        return <div className="t-acc">{fmt(t.opening, { p: p.name })}</div>;
      }
      case "scan": {
        if (!arg) return <div className="t-warn">{t.scanUsage}</div>;
        const a = assess(analyzeText(arg));
        const tone = TONE[verdictTone(a.verdict)];
        return (
          <div className="t-grid">
            <div>
              <span className={`t-badge ${tone}`}>{verdicts[a.verdict]}</span> <span className="t-num">{a.score}</span>
              <span className="t-dim">/100 · conf {a.confidence}%</span>
            </div>
            {a.evidence.map((e) => (
              <div key={e.id} className="t-row t-row3">
                <span className="t-dim">{e.id}</span>
                <span>{signalText(e, lang)}</span>
                <span className={e.severity === "high" ? "t-bad" : e.severity === "medium" ? "t-warn" : "t-dim"}>{severity[e.severity]}</span>
              </div>
            ))}
          </div>
        );
      }
      case "stack":
        return (
          <div className="t-chips">
            {stack.map((s) => (
              <span key={s} className="t-chip">{s}</span>
            ))}
          </div>
        );
      case "contact":
        return (
          <div className="t-grid">
            {[
              ["telegram", "@princess_scammer", links.telegram],
              ["github", "xzboq", links.github],
              ["instagram", "@princess_scamer", links.instagram],
            ].map(([k, v, href]) => (
              <div key={k} className="t-row">
                <span className="t-key">{k}</span>
                <a href={href} className="t-link" target="_blank" rel="noopener noreferrer">{v}</a>
              </div>
            ))}
          </div>
        );
      case "lang": {
        const l = rest[0]?.toLowerCase();
        if (!l || !(locales as readonly string[]).includes(l)) return <div className="t-warn">{t.langUsage}</div>;
        const tail = pathname.replace(/^\/(ru|uz|en)(?=\/|$)/, "");
        setLocaleCookie(l);
        setTimeout(() => router.push(`/${l}${tail}`, { scroll: false }), 250);
        return <div className="t-acc">→ /{l}</div>;
      }
      case "theme": {
        const next = toggleTheme();
        return <div className="t-acc">{fmt(t.themeSet, { t: theme[next] })}</div>;
      }
      case "neofetch":
        return (
          <div className="t-neo">
            <pre className="t-acc" aria-hidden="true">{ASCII}</pre>
            <div className="t-grid">
              <div><span className="t-acc">utkir</span>@<span className="t-acc">chirchiq</span></div>
              <div className="t-dim">─────────────────</div>
              {[
                ["role", hero.role],
                ["age", hero.ageValue],
                ["base", hero.baseValue],
                ["shell", "next 16 · react 19"],
                ["projects", String(projects.length)],
                ["uptime", "since 2013"],
              ].map(([k, v]) => (
                <div key={k}><span className="t-key">{k}</span>: {v}</div>
              ))}
              <div className="t-swatch" aria-hidden="true">
                <i /><i /><i /><i /><i /><i />
              </div>
            </div>
          </div>
        );
      case "echo":
        return <div>{arg}</div>;
      case "date":
        return <div>{new Date().toLocaleString(lang)}</div>;
      case "sudo":
      case "rm":
        return <div className="t-bad">{t.sudo}</div>;
      case "exit":
        return <div className="t-dim">logout? there is no escape from a good portfolio.</div>;
      case "clear":
        return "clear";
      default:
        return <div className="t-bad">{fmt(t.notFound, { c: c0.slice(0, 40) })}</div>;
    }
  }

  function submit(line: string) {
    setInput("");
    setHi(-1);
    if (line.trim()) setHist((h) => [...h.slice(-49), line]);
    const out = exec(line);
    if (out === "clear") {
      setLog([]);
      return;
    }
    setLog((l) => [...l.slice(-30), { id: nextId.current++, cmd: line, out }]);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit(input);
    } else if (e.key === "ArrowUp") {
      if (!hist.length) return;
      e.preventDefault();
      const n = hi === -1 ? hist.length - 1 : Math.max(0, hi - 1);
      setHi(n);
      setInput(hist[n]);
    } else if (e.key === "ArrowDown") {
      if (hi === -1) return;
      e.preventDefault();
      const n = hi + 1;
      if (n >= hist.length) {
        setHi(-1);
        setInput("");
      } else {
        setHi(n);
        setInput(hist[n]);
      }
    } else if (e.key === "Tab" && input && !input.includes(" ")) {
      const m = [...COMMANDS, ...EXTRA].filter((k) => k.startsWith(input.toLowerCase()));
      if (m.length === 1) {
        e.preventDefault();
        setInput(`${m[0]} `);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLog([]);
    }
  }

  return (
    <section className="term" aria-label={t.label} data-glow>
      <div className="term-bar">
        <span className="dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="term-title">utkir@chirchiq: ~</span>
        <span className="term-sh">zsh</span>
      </div>
      <div
        className="term-body"
        ref={bodyRef}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) return;
          if (window.getSelection()?.toString()) return;
          inputRef.current?.focus({ preventScroll: true });
        }}
      >
        <div className="t-welcome t-dim">
          utkir-sh 2.0 — <span className="t-acc">{t.hint}</span>
        </div>
        {log.map((e) => (
          <div key={e.id} className="t-entry">
            <div className="t-line">
              <Prompt />
              <span className="t-typed">{e.cmd}</span>
            </div>
            {e.out && <div className="t-out">{e.out}</div>}
          </div>
        ))}
        <div className="t-line t-live">
          <Prompt />
          <label htmlFor="term-in" className="sr">{t.input}</label>
          <input
            id="term-in"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="help"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            enterKeyHint="send"
            maxLength={300}
          />
        </div>
      </div>
      <div className="term-keys">
        {["help", "ls", "whoami", "neofetch", "scan", "stack"].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              submit(k === "scan" ? `scan ${sample}` : k);
              inputRef.current?.focus({ preventScroll: true });
            }}
          >
            {k}
          </button>
        ))}
      </div>
    </section>
  );
}
