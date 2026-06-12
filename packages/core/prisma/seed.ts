import { PrismaClient, type ProductType } from "@prisma/client";

// Jeu de données de démonstration pour le catalogue. Idempotent : on vide les tables
// du catalogue puis on recrée. Prix en CENTIMES HT.
const prisma = new PrismaClient();

const BRANDS = [
  { name: "Avène", slug: "avene" },
  { name: "La Roche-Posay", slug: "la-roche-posay" },
  { name: "Bioderma", slug: "bioderma" },
  { name: "Nuxe", slug: "nuxe" },
  { name: "Nutrisanté", slug: "nutrisante" },
];

const CATEGORIES = [
  { name: "Visage & Soin", slug: "visage-soin", position: 0 },
  { name: "Corps & Bain", slug: "corps-bain", position: 1 },
  { name: "Cheveux", slug: "cheveux", position: 2 },
  { name: "Compléments alimentaires", slug: "complements-alimentaires", position: 3 },
  { name: "Maman & Bébé", slug: "maman-bebe", position: 4 },
  { name: "Solaires", slug: "solaires", position: 5 },
];

interface VariantSpec {
  sku: string;
  priceExclTax: number;
  volume?: string;
  stock: number;
  value?: string; // valeur de l'option « Contenance » associée
}

interface ProductSpec {
  slug: string;
  name: string;
  description: string;
  productType: ProductType;
  brandSlug: string;
  categorySlug: string;
  ean?: string;
  inci?: string;
  precautions?: string;
  optionValues?: string[]; // valeurs de l'axe « Contenance »
  variants: VariantSpec[];
}

const PRODUCTS: ProductSpec[] = [
  {
    slug: "creme-hydratante-visage",
    name: "Crème hydratante apaisante",
    description:
      "Soin hydratant pour peaux sensibles à l'eau thermale. Apaise et protège la barrière cutanée.",
    productType: "COSMETIC",
    brandSlug: "avene",
    categorySlug: "visage-soin",
    ean: "3401590001011",
    inci: "Aqua, Glycerin, Cetearyl Alcohol",
    precautions: "Usage externe. Éviter le contour des yeux.",
    optionValues: ["50 ml", "100 ml"],
    variants: [
      { sku: "AVE-CREME-50", priceExclTax: 1490, volume: "50 ml", stock: 25, value: "50 ml" },
      { sku: "AVE-CREME-100", priceExclTax: 2290, volume: "100 ml", stock: 12, value: "100 ml" },
    ],
  },
  {
    slug: "serum-vitamine-c",
    name: "Sérum éclat vitamine C",
    description: "Sérum antioxydant qui ravive l'éclat et lisse le grain de peau.",
    productType: "COSMETIC",
    brandSlug: "la-roche-posay",
    categorySlug: "visage-soin",
    ean: "3401590002022",
    variants: [{ sku: "LRP-SERUM-30", priceExclTax: 2790, volume: "30 ml", stock: 18 }],
  },
  {
    slug: "eau-micellaire",
    name: "Eau micellaire démaquillante",
    description: "Nettoie et démaquille en douceur, sans rinçage. Peaux normales à mixtes.",
    productType: "COSMETIC",
    brandSlug: "bioderma",
    categorySlug: "visage-soin",
    ean: "3401590003033",
    optionValues: ["250 ml", "500 ml"],
    variants: [
      { sku: "BIO-MICEL-250", priceExclTax: 1090, volume: "250 ml", stock: 40, value: "250 ml" },
      { sku: "BIO-MICEL-500", priceExclTax: 1590, volume: "500 ml", stock: 22, value: "500 ml" },
    ],
  },
  {
    slug: "huile-prodigieuse",
    name: "Huile sèche multi-fonctions",
    description: "Huile sèche pour le visage, le corps et les cheveux. Nourrit et sublime.",
    productType: "COSMETIC",
    brandSlug: "nuxe",
    categorySlug: "corps-bain",
    ean: "3401590004044",
    optionValues: ["50 ml", "100 ml"],
    variants: [
      { sku: "NUX-HUILE-50", priceExclTax: 1990, volume: "50 ml", stock: 15, value: "50 ml" },
      { sku: "NUX-HUILE-100", priceExclTax: 2990, volume: "100 ml", stock: 9, value: "100 ml" },
    ],
  },
  {
    slug: "shampoing-doux-usage-frequent",
    name: "Shampoing doux usage fréquent",
    description: "Formule douce adaptée à un usage quotidien, respecte le cuir chevelu.",
    productType: "COSMETIC",
    brandSlug: "avene",
    categorySlug: "cheveux",
    ean: "3401590005055",
    variants: [{ sku: "AVE-SHP-200", priceExclTax: 990, volume: "200 ml", stock: 30 }],
  },
  {
    slug: "complement-magnesium-b6",
    name: "Magnésium B6 — 60 comprimés",
    description: "Contribue à réduire la fatigue et au fonctionnement normal du système nerveux.",
    productType: "SUPPLEMENT",
    brandSlug: "nutrisante",
    categorySlug: "complements-alimentaires",
    ean: "3401590006066",
    precautions:
      "Complément alimentaire. Ne pas dépasser la dose journalière recommandée. Tenir hors de portée des enfants.",
    variants: [{ sku: "NUT-MAG-60", priceExclTax: 890, stock: 50 }],
  },
  {
    slug: "gel-lavant-bebe",
    name: "Gel lavant surgras bébé",
    description: "Nettoie le corps et les cheveux de bébé en douceur. Sans savon.",
    productType: "COSMETIC",
    brandSlug: "bioderma",
    categorySlug: "maman-bebe",
    ean: "3401590007077",
    variants: [{ sku: "BIO-BB-500", priceExclTax: 1090, volume: "500 ml", stock: 28 }],
  },
  {
    slug: "spf50-solaire-visage",
    name: "Fluide solaire visage SPF 50+",
    description: "Très haute protection UVA/UVB, fini invisible non gras. Peaux sensibles.",
    productType: "COSMETIC",
    brandSlug: "bioderma",
    categorySlug: "solaires",
    ean: "3401590008088",
    precautions: "Ne pas s'exposer trop longtemps. Renouveler l'application fréquemment.",
    variants: [{ sku: "BIO-SPF50-40", priceExclTax: 1690, volume: "40 ml", stock: 33 }],
  },
];

async function main(): Promise<void> {
  // Reset (ordre géré par CASCADE).
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE
      "ProductMedia","VariantOptionValue","ProductVariant","ProductOptionValue",
      "ProductOption","Product","Category","Brand"
     RESTART IDENTITY CASCADE`,
  );

  for (const brand of BRANDS) {
    await prisma.brand.create({ data: brand });
  }
  for (const category of CATEGORIES) {
    await prisma.category.create({ data: category });
  }

  for (const spec of PRODUCTS) {
    const brand = await prisma.brand.findUniqueOrThrow({ where: { slug: spec.brandSlug } });
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: spec.categorySlug },
    });

    const product = await prisma.product.create({
      data: {
        name: spec.name,
        slug: spec.slug,
        description: spec.description,
        productType: spec.productType,
        ean: spec.ean ?? null,
        inci: spec.inci ?? null,
        precautions: spec.precautions ?? null,
        brand: { connect: { id: brand.id } },
        category: { connect: { id: category.id } },
        options: spec.optionValues
          ? {
              create: [
                {
                  name: "Contenance",
                  position: 0,
                  values: {
                    create: spec.optionValues.map((value, index) => ({ value, position: index })),
                  },
                },
              ],
            }
          : undefined,
      },
    });

    const valueByLabel = new Map<string, string>();
    if (spec.optionValues) {
      const values = await prisma.productOptionValue.findMany({
        where: { option: { productId: product.id } },
      });
      for (const v of values) valueByLabel.set(v.value, v.id);
    }

    for (const variantSpec of spec.variants) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: variantSpec.sku,
          priceExclTax: variantSpec.priceExclTax,
          volume: variantSpec.volume ?? null,
          stock: variantSpec.stock,
        },
      });
      const valueId = variantSpec.value ? valueByLabel.get(variantSpec.value) : undefined;
      if (valueId) {
        await prisma.variantOptionValue.create({
          data: { variantId: variant.id, optionValueId: valueId },
        });
      }
    }
  }

  const counts = {
    brands: await prisma.brand.count(),
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    variants: await prisma.productVariant.count(),
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
