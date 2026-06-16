import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Directives d'exploration (story i18n 04). Le storefront `/[locale]/...` est indexable ;
// le back-office `/admin` et l'API sont exclus (noindex back-office, cf. epic i18n).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
