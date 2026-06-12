// Outil DEV ponctuel (non exécuté en CI) : lit les exports PrestaShop du projet voisin
// `laparaducoin` et produit un dataset curé, autonome et committé
// (`prisma/seed-data/catalog.json`) consommé par `seed.ts`.
//
// Usage : pnpm --filter @pharmacie/core db:seed:generate [chemin/vers/laparaducoin/data]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { slugify } from "../src/utils/slugify";
import { PRODUCT_TYPES, type ProductType } from "../src/modules/catalog/product-attributes";

const scriptDir = dirname(fileURLToPath(import.meta.url));

// ── Cible : ~100 produits répartis sur les univers. ───────────────────────────
const TARGET_PRODUCTS = 100;
const DEFAULT_STOCK = 30;
// Univers virtuels / utilitaires PrestaShop à exclure (en plus des inactifs).
const EXCLUDED_UNIVERSE_IDS = new Set([1, 2, 557, 1269, 1270, 1271]);
const PRESTASHOP_HOME_ID = 2; // « Accueil » : parent des univers réels.

// ── Formes source (export PrestaShop). ────────────────────────────────────────
interface SourceCategory {
  id: number;
  id_parent: number;
  level_depth: number;
  active: string;
  name: string;
}
interface SourceProduct {
  id: number;
  id_category_default: number;
  manufacturer_name: string;
  reference: string;
  ean13: string;
  price: string;
  active: string;
  meta_description: string;
  meta_title: string;
  name: string;
  description: string;
  description_short: string;
  vatRate: number | null;
}

// ── Formes cible (dataset curé). ──────────────────────────────────────────────
interface SeedCategory {
  externalId: number;
  name: string;
  slug: string;
  parentExternalId: number | null;
  position: number;
}
interface SeedBrand {
  externalId: number;
  name: string;
  slug: string;
}
interface SeedVariant {
  sku: string;
  ean?: string;
  priceExclTax: number;
  stock: number;
}
interface SeedProduct {
  externalId: number;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  vatRate: number;
  productType: ProductType;
  brandExternalId: number;
  categoryExternalId: number;
  variant: SeedVariant;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

// Les exports PrestaShop typent parfois un champ « texte » en nombre/null : on normalise.
function asText(value: unknown): string {
  return value == null ? "" : String(value).trim();
}

function uniqueSlug(name: string, taken: Set<string>): string {
  const base = slugify(name) || "element";
  let candidate = base;
  let suffix = 2;
  while (taken.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  taken.add(candidate);
  return candidate;
}

function productTypeForUniverse(universeSlug: string): ProductType {
  const map: Record<string, ProductType> = {
    beaute: "COSMETIC",
    hygiene: "COSMETIC",
    sante: "DEVICE",
    "naturel-et-bio": "SUPPLEMENT",
  };
  return map[universeSlug] ?? "OTHER";
}

function main(): void {
  const dataDir = resolve(scriptDir, process.argv[2] ?? "../../../../laparaducoin/data");
  if (!existsSync(dataDir)) {
    throw new Error(
      `Exports laparaducoin introuvables : ${dataDir}\n` +
        `Passez le chemin en argument : db:seed:generate <chemin/vers/laparaducoin/data>`,
    );
  }

  const categories = readJson<SourceCategory[]>(resolve(dataDir, "categories-prestashop.json"));
  const catalogue = readJson<{ products: SourceProduct[] }>(
    resolve(dataDir, "catalogue-prestashop.json"),
  );

  const catById = new Map<number, SourceCategory>(categories.map((c) => [c.id, c]));

  // Univers réels (niveau 2, enfants d'Accueil, actifs, non utilitaires).
  const universes = categories
    .filter(
      (c) =>
        c.level_depth === 2 &&
        c.id_parent === PRESTASHOP_HOME_ID &&
        c.active === "1" &&
        !EXCLUDED_UNIVERSE_IDS.has(c.id),
    )
    .sort((a, b) => a.id - b.id);
  const universeIds = new Set(universes.map((c) => c.id));

  // Sous-catégories (niveau 3, enfant d'un univers réel, actives).
  const subcategories = categories
    .filter((c) => c.level_depth === 3 && universeIds.has(c.id_parent) && c.active === "1")
    .sort((a, b) => a.id - b.id);
  const seededIds = new Set<number>([...universeIds, ...subcategories.map((c) => c.id)]);

  // Remonte vers la catégorie seedée la plus proche (sous-cat niveau 3, sinon univers).
  function nearestSeeded(categoryId: number): number | null {
    let current: SourceCategory | undefined = catById.get(categoryId);
    while (current) {
      if (seededIds.has(current.id)) return current.id;
      if (current.id_parent === 0 || current.id_parent === PRESTASHOP_HOME_ID) return null;
      current = catById.get(current.id_parent);
    }
    return null;
  }

  // Univers (niveau 2) d'une catégorie seedée donnée.
  function universeOf(seededId: number): number {
    if (universeIds.has(seededId)) return seededId;
    return catById.get(seededId)?.id_parent ?? seededId;
  }

  // ── Catégories du dataset : arbre complet à 2 niveaux. ──────────────────────
  const categorySlugs = new Set<string>();
  const seedCategories: SeedCategory[] = [];
  universes.forEach((u, index) => {
    seedCategories.push({
      externalId: u.id,
      name: asText(u.name),
      slug: uniqueSlug(asText(u.name), categorySlugs),
      parentExternalId: null,
      position: index,
    });
  });
  const universeSlugById = new Map(seedCategories.map((c) => [c.externalId, c.slug]));
  for (const u of universes) {
    const children = subcategories.filter((c) => c.id_parent === u.id);
    children.forEach((c, index) => {
      seedCategories.push({
        externalId: c.id,
        name: asText(c.name),
        slug: uniqueSlug(asText(c.name), categorySlugs),
        parentExternalId: u.id,
        position: index,
      });
    });
  }

  // ── Sélection des produits éligibles. ───────────────────────────────────────
  interface Eligible {
    source: SourceProduct;
    categoryExternalId: number;
    universeId: number;
    priceExclTax: number;
  }
  const eligible: Eligible[] = [];
  for (const p of catalogue.products) {
    if (asText(p.active) !== "1") continue;
    if (!asText(p.manufacturer_name)) continue;
    const price = Number.parseFloat(asText(p.price));
    if (!Number.isFinite(price) || price <= 0) continue;
    const categoryExternalId = nearestSeeded(p.id_category_default);
    if (categoryExternalId === null) continue;
    eligible.push({
      source: p,
      categoryExternalId,
      universeId: universeOf(categoryExternalId),
      priceExclTax: Math.round(price * 100),
    });
  }

  // Répartition proportionnelle par univers (déterministe : tri par id).
  const byUniverse = new Map<number, Eligible[]>();
  for (const e of eligible) {
    const list = byUniverse.get(e.universeId) ?? [];
    list.push(e);
    byUniverse.set(e.universeId, list);
  }
  const total = eligible.length;
  const selected: Eligible[] = [];
  for (const u of universes) {
    const list = (byUniverse.get(u.id) ?? []).sort((a, b) => a.source.id - b.source.id);
    const quota = Math.min(list.length, Math.round((TARGET_PRODUCTS * list.length) / total));
    // Échantillonnage à pas régulier : déterministe ET réparti sur tout l'éventail des ids
    // (les petits ids se concentrent sur 2-3 marques ; on évite ce biais).
    const stride = quota > 0 ? list.length / quota : 1;
    for (let i = 0; i < quota; i += 1) selected.push(list[Math.floor(i * stride)]);
  }
  selected.sort((a, b) => a.source.id - b.source.id);

  // ── Marques (uniquement celles référencées par les produits retenus). ───────
  const brandSlugs = new Set<string>();
  const brandIdByName = new Map<string, number>();
  const seedBrands: SeedBrand[] = [];
  let nextBrandId = 1;
  function brandExternalId(name: string): number {
    const key = name.trim();
    const existing = brandIdByName.get(key);
    if (existing !== undefined) return existing;
    const externalId = nextBrandId;
    nextBrandId += 1;
    brandIdByName.set(key, externalId);
    seedBrands.push({ externalId, name: key, slug: uniqueSlug(key, brandSlugs) });
    return externalId;
  }

  // ── Produits du dataset. ────────────────────────────────────────────────────
  const productSlugs = new Set<string>();
  const usedSkus = new Set<string>();
  const usedEans = new Set<string>();
  const seedProducts: SeedProduct[] = [];
  for (const e of selected) {
    const p = e.source;
    const ref = asText(p.reference);
    let sku = ref && !usedSkus.has(ref) ? ref : `LPC-${p.id}`;
    if (usedSkus.has(sku)) sku = `LPC-${p.id}`;
    usedSkus.add(sku);

    const eanRaw = asText(p.ean13);
    const ean = eanRaw && !usedEans.has(eanRaw) ? eanRaw : undefined;
    if (ean) usedEans.add(ean);

    const universeSlug = universeSlugById.get(e.universeId) ?? "";
    const vatRate = p.vatRate != null ? Math.round(p.vatRate * 10000) : 2000;

    seedProducts.push({
      externalId: p.id,
      name: asText(p.name),
      slug: uniqueSlug(asText(p.name), productSlugs),
      description: asText(p.description) || null,
      shortDescription: asText(p.description_short) || null,
      metaTitle: asText(p.meta_title) || null,
      metaDescription: asText(p.meta_description) || null,
      vatRate,
      productType: productTypeForUniverse(universeSlug),
      brandExternalId: brandExternalId(asText(p.manufacturer_name)),
      categoryExternalId: e.categoryExternalId,
      variant: { sku, ...(ean ? { ean } : {}), priceExclTax: e.priceExclTax, stock: DEFAULT_STOCK },
    });
  }

  const dataset = {
    generatedFrom: "laparaducoin PrestaShop export",
    counts: {
      categories: seedCategories.length,
      brands: seedBrands.length,
      products: seedProducts.length,
    },
    categories: seedCategories,
    brands: seedBrands.sort((a, b) => a.externalId - b.externalId),
    products: seedProducts,
  };

  const outDir = resolve(scriptDir, "../prisma/seed-data");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "catalog.json");
  writeFileSync(outPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");

  // Garde-fou : tous les productType produits doivent être connus.
  const unknownType = seedProducts.find((p) => !PRODUCT_TYPES.includes(p.productType));
  if (unknownType) throw new Error(`productType inconnu : ${unknownType.productType}`);

  console.warn("Dataset écrit :", outPath, dataset.counts);
}

main();
