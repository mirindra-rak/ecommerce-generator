// Point d'entrée public de @pharmacie/core.

export { prisma } from "./db/client";
export type { Repository } from "./repositories/base-repository";
export { slugify } from "./utils/slugify";
export {
  defineSiteConfig,
  type SiteConfig,
  type FeatureFlags,
  type BrandConfig,
  type LocaleConfig,
} from "./config/site-config";
