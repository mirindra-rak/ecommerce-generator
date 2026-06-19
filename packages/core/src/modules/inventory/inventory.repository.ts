import type { Prisma, StockMovementReason } from "@prisma/client";
import { prisma } from "../../db/client";
import type { InventorySettingsInput, VariantStock, StockMovementRecord } from "./inventory.types";

export const inventoryRepository = {
  async getVariantStock(variantId: string): Promise<VariantStock | null> {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: {
        id: true,
        sku: true,
        ean: true,
        volume: true,
        stock: true,
        minOrderQty: true,
        stockLocation: true,
        lowStockThreshold: true,
        lowStockAlert: true,
        outOfStockBehavior: true,
      },
    });
    return variant;
  },

  async getMovements(
    variantId: string,
    opts: { page: number; perPage: number },
  ): Promise<{ items: StockMovementRecord[]; total: number }> {
    const [items, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where: { variantId },
        orderBy: { createdAt: "desc" },
        skip: (opts.page - 1) * opts.perPage,
        take: opts.perPage,
      }),
      prisma.stockMovement.count({ where: { variantId } }),
    ]);
    return { items, total };
  },

  async createMovement(data: {
    variantId: string;
    delta: number;
    stockAfter: number;
    reason: StockMovementReason;
    note?: string;
  }): Promise<StockMovementRecord> {
    const [movement] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          variantId: data.variantId,
          delta: data.delta,
          stockAfter: data.stockAfter,
          reason: data.reason,
          note: data.note ?? null,
        },
      }),
      prisma.productVariant.update({
        where: { id: data.variantId },
        data: { stock: data.stockAfter },
      }),
    ]);
    return movement;
  },

  async updateSettings(variantId: string, settings: InventorySettingsInput): Promise<void> {
    const data: Prisma.ProductVariantUpdateInput = {};
    if (settings.minOrderQty !== undefined) data.minOrderQty = settings.minOrderQty;
    if (settings.stockLocation !== undefined) data.stockLocation = settings.stockLocation;
    if (settings.lowStockThreshold !== undefined)
      data.lowStockThreshold = settings.lowStockThreshold;
    if (settings.lowStockAlert !== undefined) data.lowStockAlert = settings.lowStockAlert;
    if (settings.outOfStockBehavior !== undefined)
      data.outOfStockBehavior = settings.outOfStockBehavior;
    await prisma.productVariant.update({ where: { id: variantId }, data });
  },
};

export type InventoryRepository = typeof inventoryRepository;
