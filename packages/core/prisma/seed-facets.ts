interface SeedFacetInferenceInput {
  name: string;
  description: string | null;
  shortDescription: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  categorySlug: string | null;
}

function normalize(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function containsAny(haystack: string, needles: readonly string[]): boolean {
  return needles.some((needle) => haystack.includes(needle));
}

function firstMatch(
  haystack: string,
  rules: ReadonlyArray<readonly [code: string, needles: readonly string[]]>,
): string | null {
  for (const [code, needles] of rules) {
    if (containsAny(haystack, needles)) return code;
  }
  return null;
}

const NATURE_RULES = [
  ["collyre", ["collyre"]],
  ["suppositoire", ["suppositoire"]],
  ["collutoire", ["collutoire"]],
  ["solution-buvable", ["solution buvable", "sol buvable"]],
  ["sirop", ["sirop"]],
  ["gelule", ["gelule", "capsule"]],
  ["comprime", ["comprime"]],
  ["shampoing", ["shampoing", "shampooing"]],
  ["serum", ["serum"]],
  ["pommade", ["pommade"]],
  ["huile", ["huile"]],
  ["lotion", ["lotion", "eau micellaire"]],
  ["spray", ["spray", "brume"]],
  ["gel", ["gel moussant", "gel douche", "gel lavant", "gel"]],
  ["creme", ["baume", "creme", "lait", "masque", "soin", "cc cream"]],
] as const;

const CONDITIONNEMENT_RULES = [
  ["flacon-pompe", ["flacon pompe", "flacon-pompe", "pompe"]],
  ["roll-on", ["roll-on", "roll on"]],
  ["aerosol", ["aerosol"]],
  ["ampoule", ["ampoule"]],
  ["sachet", ["sachet"]],
  ["stick", ["stick"]],
  ["pot", ["pot"]],
  ["tube", ["tube"]],
  ["boite", ["boite", "etui", "coffret"]],
  ["flacon", ["flacon", "vaporisateur"]],
] as const;

const SPECIFICITE_RULES = [
  ["sans-conservateur", ["sans conservateur"]],
  ["sans-gaz-propulseur", ["sans gaz propulseur"]],
  ["sans-sucre", ["sans sucre"]],
  ["sans-gluten", ["sans gluten"]],
  ["sans-paraben", ["sans paraben"]],
  ["sans-parfum", ["sans parfum"]],
  ["vegan", ["vegan"]],
  ["hypoallergenique", ["hypoallergenique"]],
  ["non-teste-animaux", ["non teste sur les animaux", "cruelty free"]],
] as const;

const INDICATION_RULES = [
  ["sur-ordonnance", ["sur ordonnance"]],
  ["femmes-enceintes", ["femme enceinte", "femmes enceintes", "allaitante", "allaitantes"]],
  ["hors-portee-enfants", ["hors de portee des enfants"]],
  ["usage-externe", ["usage externe"]],
  ["des-6-ans", ["a partir de 6 ans", "des 6 ans", "dès 6 ans"]],
  ["des-3-ans", ["a partir de 3 ans", "des 3 ans", "dès 3 ans"]],
  ["adulte", ["reserve a l adulte", "adulte"]],
] as const;

export function inferFacetValueCodes(input: SeedFacetInferenceInput): string[] {
  const search = normalize(
    [
      input.name,
      input.description,
      input.shortDescription,
      input.metaTitle,
      input.metaDescription,
    ].join(" "),
  );
  const categorySlug = normalize(input.categorySlug);

  const codes = new Set<string>();

  const nature = firstMatch(search, NATURE_RULES);
  if (nature) codes.add(nature);

  const conditionnement = firstMatch(search, CONDITIONNEMENT_RULES);
  if (conditionnement) codes.add(conditionnement);

  for (const [code, needles] of SPECIFICITE_RULES) {
    if (containsAny(search, needles)) codes.add(code);
  }

  if (categorySlug.includes("bio") || search.includes(" bio ")) {
    codes.add("bio");
  }

  for (const [code, needles] of INDICATION_RULES) {
    if (containsAny(search, needles)) codes.add(code);
  }

  return [...codes];
}
