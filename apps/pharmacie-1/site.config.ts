import { defineSiteConfig } from "@pharmacie/core/config";

// Configuration de CE site (pharmacie n°1). Décliner une autre pharmacie = copier
// cette app, changer cette config et le thème. Aucune logique multi-site.
export default defineSiteConfig({
  brand: {
    name: "Parapharmacie Exemple",
    legalName: "Parapharmacie Exemple SARL",
    domain: "parapharmacie-exemple.fr",
    logoPath: "/logo.svg",
    theme: "default",
  },
  locale: {
    locale: "fr-FR",
    currency: "EUR",
    supportedLocales: ["fr", "en"],
    defaultLocale: "fr",
    legalMentions: [
      "Les produits proposés sont des produits de parapharmacie et ne se substituent pas à un avis médical.",
    ],
  },
  features: {
    blog: true,
    wishlist: true,
    comparator: true,
    reviews: true,
    loyalty: false,
  },
  search: {
    dictionary: {
      entries: [
        {
          canonicalTerm: "avene",
          aliases: ["avene", "avène"],
          entity: { kind: "brand", code: "avene" },
        },
        {
          canonicalTerm: "solaire",
          aliases: ["spf", "ecran solaire"],
          entity: { kind: "category", code: "solaire" },
        },
      ],
    },
    ranking: {
      textRank: 1,
      fuzzyRank: 0.35,
      exactNameMatch: 3,
      exactBrandMatch: 2,
      tokenCoverage: 1.5,
      dictionaryMatch: 0.75,
    },
  },
});
