export const locales = ["ru", "uz", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export type L<T> = Record<Locale, T>;

export const isLocale = (v: string): v is Locale =>
  (locales as readonly string[]).includes(v);

export const localeNames: L<string> = {
  ru: "Русский",
  uz: "Oʻzbekcha",
  en: "English",
};

export const ogLocale: L<string> = { ru: "ru_RU", uz: "uz_UZ", en: "en_US" };

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://senix-portfolio.vercel.app"
).replace(/\/$/, "");

export const links = {
  github: "https://github.com/xzboq",
  telegram: "https://t.me/princess_scammer",
  instagram: "https://instagram.com/princess_scamer",
  // FormSubmit: без БД и собственного бэкенда. Адрес можно заменить на алиас из письма FormSubmit,
  // тогда почта не попадёт даже в JS-бандл.
  form:
    process.env.NEXT_PUBLIC_FORM_ENDPOINT ??
    "https://formsubmit.co/ajax/senixsteaam@gmail.com",
} as const;
