import { inventoryRepository } from "./inventory.repository";
import type {
  AdjustStockInput,
  InventorySettingsInput,
  LowStockNotifier,
  MovementHistoryPage,
  StockMovementRecord,
} from "./inventory.types";

let notifier: LowStockNotifier | null = null;

export function setLowStockNotifier(n: LowStockNotifier): void {
  notifier = n;
}

export async function adjust(input: AdjustStockInput): Promise<StockMovementRecord> {
  if (input.delta === 0) {
    throw new Error("Stock adjustment delta must not be zero");
  }

  const variant = await inventoryRepository.getVariantStock(input.variantId);
  if (!variant) {
    throw new Error(`Variant ${input.variantId} not found`);
  }

  const stockBefore = variant.stock;
  const stockAfter = stockBefore + input.delta;

  const movement = await inventoryRepository.createMovement({
    variantId: input.variantId,
    delta: input.delta,
    stockAfter,
    reason: input.reason,
    note: input.note,
  });

  if (
    notifier &&
    variant.lowStockAlert &&
    variant.lowStockThreshold !== null &&
    stockBefore >= variant.lowStockThreshold &&
    stockAfter < variant.lowStockThreshold
  ) {
    const product = await getProductNameForVariant(input.variantId);
    await notifier.notify(
      { id: variant.id, sku: variant.sku, productName: product },
      stockAfter,
      variant.lowStockThreshold,
    );
  }

  return movement;
}

export async function isAvailable(variantId: string, qty: number): Promise<boolean> {
  const variant = await inventoryRepository.getVariantStock(variantId);
  if (!variant) return false;

  if (qty < variant.minOrderQty) return false;
  if (variant.stock >= qty) return true;

  switch (variant.outOfStockBehavior) {
    case "ALLOW":
      return true;
    case "DENY":
      return false;
    case "DEFAULT":
      return false;
  }
}

export async function getMovementHistory(
  variantId: string,
  opts: { page?: number; perPage?: number } = {},
): Promise<MovementHistoryPage> {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 20;
  return inventoryRepository.getMovements(variantId, { page, perPage });
}

export async function updateSettings(
  variantId: string,
  settings: InventorySettingsInput,
): Promise<void> {
  if (settings.minOrderQty !== undefined && settings.minOrderQty < 1) {
    throw new Error("Minimum order quantity must be at least 1");
  }
  if (
    settings.lowStockThreshold !== undefined &&
    settings.lowStockThreshold !== null &&
    settings.lowStockThreshold < 0
  ) {
    throw new Error("Low stock threshold must be non-negative");
  }
  await inventoryRepository.updateSettings(variantId, settings);
}

async function getProductNameForVariant(variantId: string): Promise<string> {
  const { prisma } = await import("../../db/client");
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { product: { select: { name: true } } },
  });
  return variant?.product.name ?? "Unknown";
}
