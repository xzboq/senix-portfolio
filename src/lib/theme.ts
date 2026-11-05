/** Тема: тёмная по умолчанию, светлая — по выбору. Хранится в localStorage, ставится инлайн-скриптом до отрисовки. */
export type Theme = "dark" | "light";

export const THEME_KEY = "utkir.theme";
const EVENT = "utkir:theme";

/** Выполняется синхронно в <head>, поэтому без вспышки неправильной темы. */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export function getTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export function setTheme(t: Theme) {
  document.documentElement.setAttribute("data-theme", t);
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

export function subscribeTheme(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export function setLocaleCookie(l: string) {
  try {
    document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000; samesite=lax`;
  } catch {}
}
