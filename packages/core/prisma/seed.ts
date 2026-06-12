import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

// Seed du catalogue. Idempotent : on vide les tables du catalogue puis on recrée. Le
// catalogue (catégories, marques, produits) provient d'un dataset curé committé
// (`seed-data/catalog.json`, généré depuis l'export laparaducoin). Prix en CENTIMES HT.
const prisma = new PrismaClient();

interface CatalogCategory {
  externalId: number;
  name: string;
  slug: string;
  parentExternalId: number | null;
  position: number;
}
interface CatalogBrand {
  externalId: number;
  name: string;
  slug: string;
}
interface CatalogProduct {
  externalId: number;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  vatRate: number;
  productType: string;
  brandExternalId: number;
  categoryExternalId: number;
  variant: { sku: string; ean?: string; priceExclTax: number; stock: number };
}
interface Catalog {
  categories: CatalogCategory[];
  brands: CatalogBrand[];
  products: CatalogProduct[];
}

const catalog = JSON.parse(
  readFileSync(new URL("./seed-data/catalog.json", import.meta.url), "utf8"),
) as Catalog;

// Taxonomie de facettes (filtres produit) — domaine pharma + parapharma. Les `code` de
// valeur sont uniques sur tout le seed (lookup simplifié à l'assignation).
interface FacetSpec {
  code: string;
  name: string;
  values: { code: string; label: string }[];
}

const FACETS: FacetSpec[] = [
  {
    code: "nature",
    name: "Nature de produit",
    values: [
      { code: "comprime", label: "Comprimé" },
      { code: "gelule", label: "Gélule" },
      { code: "sirop", label: "Sirop" },
      { code: "solution-buvable", label: "Solution buvable" },
      { code: "collutoire", label: "Collutoire" },
      { code: "spray", label: "Spray" },
      { code: "collyre", label: "Collyre" },
      { code: "pommade", label: "Pommade" },
      { code: "creme", label: "Crème" },
      { code: "gel", label: "Gel" },
      { code: "serum", label: "Sérum" },
      { code: "huile", label: "Huile" },
      { code: "lotion", label: "Lotion" },
      { code: "shampoing", label: "Shampoing" },
      { code: "pastille", label: "Pastille" },
      { code: "suppositoire", label: "Suppositoire" },
    ],
  },
  {
    code: "conditionnement",
    name: "Conditionnement",
    values: [
      { code: "flacon", label: "Flacon" },
      { code: "flacon-pompe", label: "Flacon-pompe" },
      { code: "tube", label: "Tube" },
      { code: "boite", label: "Boîte" },
      { code: "sachet", label: "Sachet" },
      { code: "stick", label: "Stick" },
      { code: "pot", label: "Pot" },
      { code: "ampoule", label: "Ampoule" },
      { code: "roll-on", label: "Roll-on" },
      { code: "aerosol", label: "Aérosol" },
    ],
  },
  {
    code: "specificite",
    name: "Spécificité",
    values: [
      { code: "sans-conservateur", label: "Sans conservateur" },
      { code: "sans-gaz-propulseur", label: "Sans gaz propulseur" },
      { code: "sans-sucre", label: "Sans sucre" },
      { code: "sans-gluten", label: "Sans gluten" },
      { code: "sans-paraben", label: "Sans paraben" },
      { code: "sans-parfum", label: "Sans parfum" },
      { code: "bio", label: "Bio" },
      { code: "vegan", label: "Vegan" },
      { code: "hypoallergenique", label: "Hypoallergénique" },
      { code: "non-teste-animaux", label: "Non testé sur les animaux" },
    ],
  },
  {
    code: "indication",
    name: "Indication / Contre-indication",
    values: [
      { code: "femmes-enceintes", label: "Déconseillé aux femmes enceintes et allaitantes" },
      { code: "hors-portee-enfants", label: "Tenir hors de portée des enfants" },
      { code: "usage-externe", label: "Usage externe" },
      { code: "des-3-ans", label: "À partir de 3 ans" },
      { code: "des-6-ans", label: "À partir de 6 ans" },
      { code: "adulte", label: "Réservé à l'adulte" },
      { code: "sur-ordonnance", label: "Sur ordonnance" },
    ],
  },
];

async function main(): Promise<void> {
  // Reset (ordre géré par CASCADE).
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE
      "ProductFacetValue","FacetValue","Facet",
      "ProductMedia","VariantOptionValue","ProductVariant","ProductOptionValue",
      "ProductOption","Product","Category","Brand"
     RESTART IDENTITY CASCADE`,
  );

  // Marques — externalId conservé pour le ré-import idempotent.
  const brandIdByExternal = new Map<number, string>();
  for (const brand of catalog.brands) {
    const created = await prisma.brand.create({
      data: { name: brand.name, slug: brand.slug, externalId: brand.externalId },
    });
    brandIdByExternal.set(brand.externalId, created.id);
  }

  // Catégories — univers (racines) d'abord, puis sous-catégories (rattachées par externalId).
  const categoryIdByExternal = new Map<number, string>();
  const roots = catalog.categories.filter((c) => c.parentExternalId === null);
  const children = catalog.categories.filter((c) => c.parentExternalId !== null);
  for (const category of roots) {
    const created = await prisma.category.create({
      data: {
        name: category.name,
        slug: category.slug,
        position: category.position,
        externalId: category.externalId,
      },
    });
    categoryIdByExternal.set(category.externalId, created.id);
  }
  for (const category of children) {
    const parentId = categoryIdByExternal.get(category.parentExternalId as number);
    const created = await prisma.category.create({
      data: {
        name: category.name,
        slug: category.slug,
        position: category.position,
        externalId: category.externalId,
        parent: parentId ? { connect: { id: parentId } } : undefined,
      },
    });
    categoryIdByExternal.set(category.externalId, created.id);
  }

  // Facettes (filtres) + valeurs. Taxonomie seedée ; les produits importés ne portent
  // pas encore de liaison facette (cf. non-objectif de la story).
  for (const [position, facet] of FACETS.entries()) {
    await prisma.facet.create({
      data: {
        code: facet.code,
        name: facet.name,
        position,
        values: {
          create: facet.values.map((value, index) => ({
            code: value.code,
            label: value.label,
            position: index,
          })),
        },
      },
    });
  }

  // Produits — 1 variante chacune (catalogue source plat). Connexions par externalId.
  for (const product of catalog.products) {
    const brandId = brandIdByExternal.get(product.brandExternalId);
    const categoryId = categoryIdByExternal.get(product.categoryExternalId);
    await prisma.product.create({
      data: {
        externalId: product.externalId,
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        vatRate: product.vatRate,
        productType: product.productType,
        brand: brandId ? { connect: { id: brandId } } : undefined,
        // La source ne fournit qu'une catégorie : on la pose en M2M ET comme principale.
        categories: categoryId ? { connect: [{ id: categoryId }] } : undefined,
        primaryCategory: categoryId ? { connect: { id: categoryId } } : undefined,
        variants: {
          create: [
            {
              sku: product.variant.sku,
              ean: product.variant.ean ?? null,
              priceExclTax: product.variant.priceExclTax,
              stock: product.variant.stock,
            },
          ],
        },
      },
    });
  }

  const counts = {
    brands: await prisma.brand.count(),
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    variants: await prisma.productVariant.count(),
    facets: await prisma.facet.count(),
    facetValues: await prisma.facetValue.count(),
  };
  console.warn("Seed terminé :", counts);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
