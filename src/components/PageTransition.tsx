import { ViewTransition, type ReactNode } from "react";

/** Направленный сдвиг страницы при переходах: ссылки помечают себя nav-forward / nav-back (Link transitionTypes).
 *  Переходы без типа (кнопка «Назад» браузера, router.push) идут без анимации. */
const DIR = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" };

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={DIR} exit={DIR} default="none">
      <div className="vt-page">{children}</div>
    </ViewTransition>
  );
}
