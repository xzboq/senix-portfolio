import type { MetadataRoute } from "next";
import { SITE_URL } from "@/content/i18n";

// Статический экспорт: файл генерируется один раз на сборке.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${SITE_URL}/sitemap.xml` };
}
