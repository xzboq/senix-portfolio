# Utkir — portfolio

Next.js 16 · React 19 · TypeScript · plain CSS. Три языка (`/ru`, `/uz`, `/en`), Vercel-ready, без БД и своего бэкенда.

- Тексты: `src/content/dict.ts` (UI), `src/content/projects.ts` (проекты), `src/content/game.ts` (игра).
- `src/lib/engine.ts` — порт Risk Engine из Kiber Yordamchi; работает в браузере.
- Форма: FormSubmit (`links.form` в `src/content/i18n.ts`, переопределяется `NEXT_PUBLIC_FORM_ENDPOINT`). При первой отправке на почту придёт письмо с подтверждением адреса.
- `NEXT_PUBLIC_SITE_URL` — адрес сайта для canonical/OG/sitemap.

```bash
npm i && npm run dev
npm run build
```
