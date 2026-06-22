import type { OutOfStockBehavior, StockMovementReason } from "@prisma/client";

export interface AdjustStockInput {
  variantId: string;
  delta: number;
  reason: StockMovementReason;
  note?: string;
}

export interface InventorySettingsInput {
  minOrderQty?: number;
  stockLocation?: string | null;
  lowStockThreshold?: number | null;
  lowStockAlert?: boolean;
  outOfStockBehavior?: OutOfStockBehavior;
}

export interface VariantStock {
  id: string;
  sku: string | null;
  ean: string | null;
  volume: string | null;
  stock: number;
  minOrderQty: number;
  stockLocation: string | null;
  lowStockThreshold: number | null;
  lowStockAlert: boolean;
  outOfStockBehavior: OutOfStockBehavior;
}

export interface StockMovementRecord {
  id: string;
  delta: number;
  stockAfter: number;
  reason: StockMovementReason;
  note: string | null;
  createdAt: Date;
}

export interface MovementHistoryPage {
  items: StockMovementRecord[];
  total: number;
}

export interface LowStockNotifier {
  notify(
    variant: { id: string; sku: string | null; productName: string },
    stock: number,
    threshold: number,
  ): Promise<void>;
}
