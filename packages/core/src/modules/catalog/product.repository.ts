import type { Prisma, Product, ProductVariant } from "@prisma/client";
import { prisma } from "../../db/client";

// Repository des produits. Encapsule toutes les requêtes Prisma liées aux produits,
// y compris les écritures imbriquées (options/valeurs, variantes, médias).

// Include canonique pour charger un produit avec toutes ses relations, médias et
// valeurs d'options triés par `position`.
const productInclude = {
  brand: true,
  categories: true,
  primaryCategory: true,
  options: {
    orderBy: { position: "asc" },
    include: { values: { orderBy: { position: "asc" } } },
  },
  variants: {
    include: { optionValues: { include: { optionValue: true } } },
  },
  media: { orderBy: { position: "asc" } },
  facetValues: { select: { facetValueId: true } },
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

// Include allégé pour les vignettes de liste : marque, prix des variantes, 1er média.
const cardInclude = {
  brand: true,
  variants: { select: { priceExclTax: true } },
  media: { orderBy: { position: "asc" }, take: 1 },
} satisfies Prisma.ProductInclude;

export type ProductCard = Prisma.ProductGetPayload<{ include: typeof cardInclude }>;

// Include pour la liste back-office : marque + nombre de déclinaisons (badge « simple » /
// « N décl. »).
const listInclude = {
  brand: true,
  _count: { select: { variants: true } },
} satisfies Prisma.ProductInclude;

export type ProductListItem = Prisma.ProductGetPayload<{ include: typeof listInclude }>;

// Champs persistables d'une déclinaison (le vendable). `id` présent = existante.
export interface VariantWriteInput {
  id?: string;
  sku?: string | null;
  ean?: string | null;
  priceExclTax: number;
  stock?: number;
  volume?: string | null;
}

function toVariantData(variant: VariantWriteInput) {
  return {
    sku: variant.sku ?? null,
    ean: variant.ean ?? null,
    priceExclTax: variant.priceExclTax,
    stock: variant.stock ?? 0,
    volume: variant.volume ?? null,
  };
}

export const productRepository = {
  findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  },

  findBySlug(slug: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { slug } });
  },

  /**
   * Recherche par code-barres. L'EAN/CIP vit sur la déclinaison (le vendable) : on
   * remonte donc le produit regroupeur parent depuis la variante correspondante.
   */
  async findByEan(ean: string): Promise<ProductWithRelations | null> {
    const variant = await prisma.productVariant.findUnique({
      where: { ean },
      select: { productId: true },
    });
    if (!variant) return null;
    return this.findByIdWithRelations(variant.productId);
  },

  findActive(): Promise<Product[]> {
    return prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
  },

  /** Slugs + date de mise à jour des produits ACTIFS, pour le sitemap (URLs indexables). */
  findActiveSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
    return prisma.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
      orderBy: { createdAt: "desc" },
    });
  },

  /** Tous les produits (actifs ET inactifs) pour le back-office : marque + nb déclinaisons. */
  findMany(): Promise<ProductListItem[]> {
    return prisma.product.findMany({
      include: listInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  /** Produits actifs en vue « carte » (marque + prix variantes + 1er média). */
  findActiveCards(limit?: number): Promise<ProductCard[]> {
    return prisma.product.findMany({
      where: { active: true },
      include: cardInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  /**
   * Produits actifs d'une catégorie (par slug), en vue « carte », avec filtrage par
   * facettes : ET entre facettes, OU à l'intérieur d'une facette (`filters` = code de
   * facette → codes de valeurs). Un filtre vide ne contraint rien.
   */
  findCardsByCategorySlug(
    slug: string,
    filters: Record<string, string[]> = {},
  ): Promise<ProductCard[]> {
    const facetClauses = Object.entries(filters)
      .filter(([, codes]) => codes.length > 0)
      .map(([facetCode, codes]) => ({
        facetValues: {
          some: { facetValue: { facet: { code: facetCode }, code: { in: codes } } },
        },
      }));
    return prisma.product.findMany({
      where: { active: true, categories: { some: { slug } }, AND: facetClauses },
      include: cardInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  findByIdWithRelations(id: string): Promise<ProductWithRelations | null> {
    return prisma.product.findUnique({ where: { id }, include: productInclude });
  },

  findBySlugWithRelations(slug: string): Promise<ProductWithRelations | null> {
    return prisma.product.findUnique({ where: { slug }, include: productInclude });
  },

  create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({ data });
  },

  /**
   * Création « métier » conforme à l'invariant « tout est déclinaison » : crée le produit
   * regroupeur ET sa déclinaison par défaut (le vendable : SKU/EAN/prix/stock) dans une
   * seule écriture atomique (nested write Prisma). Un produit ne peut donc jamais naître
   * sans déclinaison. Un produit « simple » = ce produit + cette unique déclinaison.
   */
  createWithDefaultVariant(input: {
    product: Omit<Prisma.ProductCreateInput, "variants" | "options" | "media">;
    defaultVariant: {
      sku: string;
      priceExclTax: number;
      ean?: string | null;
      stock?: number;
      volume?: string | null;
    };
  }): Promise<ProductWithRelations> {
    const { sku, priceExclTax, ean, stock, volume } = input.defaultVariant;
    return prisma.product.create({
      data: {
        ...input.product,
        variants: {
          create: {
            sku,
            ean: ean ?? null,
            priceExclTax,
            stock: stock ?? 0,
            volume: volume ?? null,
          },
        },
      },
      include: productInclude,
    });
  },

  /** Création « métier » avec N déclinaisons (≥ 1), en une écriture atomique. */
  createWithVariants(input: {
    product: Omit<Prisma.ProductCreateInput, "variants" | "options" | "media">;
    variants: ReadonlyArray<VariantWriteInput>;
  }): Promise<ProductWithRelations> {
    return prisma.product.create({
      data: {
        ...input.product,
        variants: { create: input.variants.map(toVariantData) },
      },
      include: productInclude,
    });
  },

  update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({ where: { id }, data });
  },

  /** Met à jour une déclinaison (le vendable : SKU/EAN/prix/stock). */
  updateVariant(id: string, data: Prisma.ProductVariantUpdateInput): Promise<ProductVariant> {
    return prisma.productVariant.update({ where: { id }, data });
  },

  /**
   * Réconcilie l'ensemble des déclinaisons d'un produit en une transaction : supprime les
   * absentes (existantes non présentes dans `variants`), met à jour celles portant un `id`,
   * crée les nouvelles. La suppression passe en premier (libère SKU/EAN avant recréation).
   */
  async reconcileVariants(
    productId: string,
    variants: ReadonlyArray<VariantWriteInput>,
  ): Promise<void> {
    const existing = await prisma.productVariant.findMany({
      where: { productId },
      select: { id: true },
    });
    const incomingIds = new Set<string>();
    for (const variant of variants) if (variant.id) incomingIds.add(variant.id);
    const toDelete = existing.filter((row) => !incomingIds.has(row.id)).map((row) => row.id);

    const ops: Prisma.PrismaPromise<unknown>[] = [];
    if (toDelete.length > 0) {
      ops.push(prisma.productVariant.deleteMany({ where: { id: { in: toDelete } } }));
    }
    for (const variant of variants) {
      const data = toVariantData(variant);
      ops.push(
        variant.id
          ? prisma.productVariant.update({ where: { id: variant.id }, data })
          : prisma.productVariant.create({ data: { productId, ...data } }),
      );
    }
    await prisma.$transaction(ops);
  },

  /**
   * Remplace l'ensemble des valeurs de facettes d'un produit (idempotent) : on purge puis
   * on recrée la liaison M:N. Atomique via transaction.
   */
  async setFacetValues(productId: string, facetValueIds: readonly string[]): Promise<void> {
    await prisma.$transaction([
      prisma.productFacetValue.deleteMany({ where: { productId } }),
      prisma.productFacetValue.createMany({
        data: facetValueIds.map((facetValueId) => ({ productId, facetValueId })),
        skipDuplicates: true,
      }),
    ]);
  },

  async reconcileMedia(
    productId: string,
    media: ReadonlyArray<{ storageKey: string; alt?: string | null; position: number }>,
  ): Promise<void> {
    const existing = await prisma.productMedia.findMany({
      where: { productId },
      select: { id: true, storageKey: true },
    });
    const incomingKeys = new Set(media.map((m) => m.storageKey));
    const toDelete = existing
      .filter((row) => !incomingKeys.has(row.storageKey))
      .map((row) => row.id);
    const existingByKey = new Map(existing.map((row) => [row.storageKey, row.id]));

    const ops: Prisma.PrismaPromise<unknown>[] = [];
    if (toDelete.length > 0) {
      ops.push(prisma.productMedia.deleteMany({ where: { id: { in: toDelete } } }));
    }
    for (const m of media) {
      const existingId = existingByKey.get(m.storageKey);
      if (existingId) {
        ops.push(
          prisma.productMedia.update({
            where: { id: existingId },
            data: { alt: m.alt ?? null, position: m.position },
          }),
        );
      } else {
        ops.push(
          prisma.productMedia.create({
            data: { productId, storageKey: m.storageKey, alt: m.alt ?? null, position: m.position },
          }),
        );
      }
    }
    await prisma.$transaction(ops);
  },

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  },
};

export type ProductRepository = typeof productRepository;
