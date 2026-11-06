"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};
const isMac = () => /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);

/** «⌘» на Mac и iOS, «Ctrl» на остальных. На сервере и при гидратации — «Ctrl», без рассинхрона. */
export function useModKey(): string {
  return useSyncExternalStore(noop, () => (isMac() ? "⌘" : "Ctrl"), () => "Ctrl");
}

/** Плавно прокручивает к разделу, если он на этой странице; иначе — переход на главную с якорем. */
export function scrollToSection(id: string): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  history.replaceState(null, "", `#${id}`);
  return true;
}
