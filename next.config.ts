import type { NextConfig } from "next";

// На GitHub Pages проект живёт в подпапке /<репозиторий>; workflow передаёт её сюда.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Статический экспорт: сайт отдаётся с GitHub Pages, без сервера.
  output: "export",
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: true,
  images: { unoptimized: true },
  ...(basePath && { basePath }),
};

export default nextConfig;
