export { inventoryRepository } from "./inventory.repository";
export type { InventoryRepository } from "./inventory.repository";

export {
  adjust,
  isAvailable,
  getMovementHistory,
  updateSettings,
  setLowStockNotifier,
} from "./inventory.service";

export { emailNotifier } from "./email-notifier";

export type {
  AdjustStockInput,
  InventorySettingsInput,
  VariantStock,
  StockMovementRecord,
  MovementHistoryPage,
  LowStockNotifier,
} from "./inventory.types";

export type { OutOfStockBehavior, StockMovementReason } from "@prisma/client";
