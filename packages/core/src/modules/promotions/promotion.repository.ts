import type { Prisma } from "@prisma/client";
import { prisma } from "../../db/client";
import type {
  CreateCatalogPriceRuleInput,
  ProductContext,
  UpdateCatalogPriceRuleInput,
} from "./promotion.types";

const ruleInclude = { targets: true } satisfies Prisma.CatalogPriceRuleInclude;

type RuleWithTargets = Prisma.CatalogPriceRuleGetPayload<{ include: typeof ruleInclude }>;

export const catalogPriceRuleRepository = {
  create(input: CreateCatalogPriceRuleInput): Promise<RuleWithTargets> {
    const { targetIds, ...data } = input;
    return prisma.catalogPriceRule.create({
      data: {
        ...data,
        targets: {
          createMany: {
            data: targetIds.map((targetId) => ({ targetId })),
          },
        },
      },
      include: ruleInclude,
    });
  },

  findById(id: string): Promise<RuleWithTargets | null> {
    return prisma.catalogPriceRule.findUnique({
      where: { id },
      include: ruleInclude,
    });
  },

  findMany(): Promise<RuleWithTargets[]> {
    return prisma.catalogPriceRule.findMany({
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: ruleInclude,
    });
  },

  async update(id: string, input: UpdateCatalogPriceRuleInput): Promise<RuleWithTargets> {
    const { targetIds, ...data } = input;

    if (targetIds !== undefined) {
      await prisma.catalogPriceRuleTarget.deleteMany({ where: { ruleId: id } });
    }

    return prisma.catalogPriceRule.update({
      where: { id },
      data: {
        ...data,
        ...(targetIds !== undefined && {
          targets: {
            createMany: {
              data: targetIds.map((targetId) => ({ targetId })),
            },
          },
        }),
      },
      include: ruleInclude,
    });
  },

  async remove(id: string): Promise<void> {
    await prisma.catalogPriceRule.delete({ where: { id } });
  },

  async findActiveForProduct(
    productId: string,
    categoryIds: string[],
    brandId: string | null,
  ): Promise<RuleWithTargets[]> {
    const now = new Date();
    const allTargetIds = [productId, ...categoryIds, ...(brandId ? [brandId] : [])];

    return prisma.catalogPriceRule.findMany({
      where: {
        active: true,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
          {
            OR: [{ targetType: "ALL" }, { targets: { some: { targetId: { in: allTargetIds } } } }],
          },
        ],
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: ruleInclude,
    });
  },

  async findActiveForProducts(contexts: ProductContext[]): Promise<RuleWithTargets[]> {
    const now = new Date();
    const allTargetIds = new Set<string>();
    for (const ctx of contexts) {
      allTargetIds.add(ctx.productId);
      for (const catId of ctx.categoryIds) allTargetIds.add(catId);
      if (ctx.brandId) allTargetIds.add(ctx.brandId);
    }

    return prisma.catalogPriceRule.findMany({
      where: {
        active: true,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
          {
            OR: [
              { targetType: "ALL" },
              { targets: { some: { targetId: { in: [...allTargetIds] } } } },
            ],
          },
        ],
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: ruleInclude,
    });
  },
};

export type CatalogPriceRuleRepository = typeof catalogPriceRuleRepository;
export type CatalogPriceRuleWithTargets = RuleWithTargets;
