// Configuration d'un site (= une pharmacie). En modèle Silo, le site est une
// CONFIGURATION, jamais une donnée en base. Chaque app (`apps/<pharmacie>`) fournit
// une instance de `SiteConfig` dans son `site.config.ts`.

/** Drapeaux de fonctionnalités activables par site. */
export interface FeatureFlags {
  blog: boolean;
  wishlist: boolean;
  comparator: boolean;
  reviews: boolean;
  loyalty: boolean;
}

/** Identité de marque (le theming visuel détaillé vit dans `themes/`). */
export interface BrandConfig {
  name: string;
  legalName: string;
  /** Domaine de production, ex: "parapharmacie-durand.fr". */
  domain: string;
  logoPath: string;
  /** Clé du thème dans `apps/<app>/themes/`. */
  theme: string;
}

/** Paramètres régionaux / conformité parapharmacie. */
export interface LocaleConfig {
  /** Locale régionale de référence (formats monétaires, dates). */
  locale: "fr-FR";
  currency: "EUR";
  /**
   * Locales d'UI supportées par CE site (codes courts BCP-47 : "fr", "en"…).
   * Pilote le routing par locale et la liste du sélecteur de langue. En modèle Silo,
   * c'est une CONFIGURATION du site, jamais une donnée en base.
   */
  supportedLocales: string[];
  /** Locale d'UI par défaut (doit figurer dans `supportedLocales`). */
  defaultLocale: string;
  /** Mentions légales spécifiques parapharmacie (allégations, etc.). */
  legalMentions: string[];
}

export interface SiteConfig {
  brand: BrandConfig;
  locale: LocaleConfig;
  features: FeatureFlags;
}

/**
 * Helper de définition (typage + autocomplétion) pour les `site.config.ts`.
 */
export function defineSiteConfig(config: SiteConfig): SiteConfig {
  return config;
}
