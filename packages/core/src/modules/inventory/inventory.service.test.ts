import { describe, it, expect, vi, beforeEach } from "vitest";
import type { OutOfStockBehavior, StockMovementReason } from "@prisma/client";
import type { VariantStock, StockMovementRecord, LowStockNotifier } from "./inventory.types";

const mockVariant: VariantStock = {
  id: "variant-1",
  sku: "SKU-001",
  ean: null,
  volume: "50 ml",
  stock: 50,
  minOrderQty: 1,
  stockLocation: null,
  lowStockThreshold: null,
  lowStockAlert: false,
  outOfStockBehavior: "DENY" as OutOfStockBehavior,
};

const mockMovement: StockMovementRecord = {
  id: "mov-1",
  delta: 10,
  stockAfter: 60,
  reason: "MANUAL_ADJUSTMENT" as StockMovementReason,
  note: null,
  createdAt: new Date(),
};

const mockRepo = {
  getVariantStock: vi.fn<(id: string) => Promise<VariantStock | null>>(),
  getMovements: vi.fn(),
  createMovement: vi.fn<(data: Record<string, unknown>) => Promise<StockMovementRecord>>(),
  updateSettings: vi.fn<(id: string, s: Record<string, unknown>) => Promise<void>>(),
};

vi.mock("./inventory.repository", () => ({
  inventoryRepository: mockRepo,
}));

vi.mock("../../db/client", () => ({
  prisma: {
    productVariant: {
      findUnique: vi.fn().mockResolvedValue({ product: { name: "Test Product" } }),
    },
  },
}));

const { adjust, isAvailable, getMovementHistory, updateSettings, setLowStockNotifier } =
  await import("./inventory.service");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("adjust", () => {
  it("adjusts stock positively", async () => {
    mockRepo.getVariantStock.mockResolvedValue({ ...mockVariant, stock: 50 });
    mockRepo.createMovement.mockResolvedValue({ ...mockMovement, delta: 10, stockAfter: 60 });

    const result = await adjust({
      variantId: "variant-1",
      delta: 10,
      reason: "MANUAL_ADJUSTMENT" as StockMovementReason,
    });

    expect(mockRepo.createMovement).toHaveBeenCalledWith({
      variantId: "variant-1",
      delta: 10,
      stockAfter: 60,
      reason: "MANUAL_ADJUSTMENT",
      note: undefined,
    });
    expect(result.stockAfter).toBe(60);
  });

  it("adjusts stock negatively", async () => {
    mockRepo.getVariantStock.mockResolvedValue({ ...mockVariant, stock: 50 });
    mockRepo.createMovement.mockResolvedValue({ ...mockMovement, delta: -10, stockAfter: 40 });

    const result = await adjust({
      variantId: "variant-1",
      delta: -10,
      reason: "SALE" as StockMovementReason,
    });

    expect(mockRepo.createMovement).toHaveBeenCalledWith(
      expect.objectContaining({ delta: -10, stockAfter: 40 }),
    );
    expect(result.stockAfter).toBe(40);
  });

  it("allows negative stock", async () => {
    mockRepo.getVariantStock.mockResolvedValue({ ...mockVariant, stock: 5 });
    mockRepo.createMovement.mockResolvedValue({ ...mockMovement, delta: -10, stockAfter: -5 });

    const result = await adjust({
      variantId: "variant-1",
      delta: -10,
      reason: "SALE" as StockMovementReason,
    });

    expect(result.stockAfter).toBe(-5);
  });

  it("rejects delta zero", async () => {
    await expect(
      adjust({
        variantId: "variant-1",
        delta: 0,
        reason: "MANUAL_ADJUSTMENT" as StockMovementReason,
      }),
    ).rejects.toThrow("delta must not be zero");
  });

  it("rejects unknown variant", async () => {
    mockRepo.getVariantStock.mockResolvedValue(null);

    await expect(
      adjust({
        variantId: "unknown",
        delta: 5,
        reason: "MANUAL_ADJUSTMENT" as StockMovementReason,
      }),
    ).rejects.toThrow("not found");
  });
});

describe("isAvailable", () => {
  it("returns true when stock is sufficient", async () => {
    mockRepo.getVariantStock.mockResolvedValue({ ...mockVariant, stock: 10, minOrderQty: 2 });
    expect(await isAvailable("variant-1", 5)).toBe(true);
  });

  it("returns false when qty below minOrderQty", async () => {
    mockRepo.getVariantStock.mockResolvedValue({ ...mockVariant, stock: 10, minOrderQty: 3 });
    expect(await isAvailable("variant-1", 2)).toBe(false);
  });

  it("returns false when out of stock and DENY", async () => {
    mockRepo.getVariantStock.mockResolvedValue({
      ...mockVariant,
      stock: 0,
      outOfStockBehavior: "DENY" as OutOfStockBehavior,
    });
    expect(await isAvailable("variant-1", 1)).toBe(false);
  });

  it("returns true when out of stock and ALLOW", async () => {
    mockRepo.getVariantStock.mockResolvedValue({
      ...mockVariant,
      stock: 0,
      outOfStockBehavior: "ALLOW" as OutOfStockBehavior,
    });
    expect(await isAvailable("variant-1", 1)).toBe(true);
  });

  it("returns false when out of stock and DEFAULT", async () => {
    mockRepo.getVariantStock.mockResolvedValue({
      ...mockVariant,
      stock: 0,
      outOfStockBehavior: "DEFAULT" as OutOfStockBehavior,
    });
    expect(await isAvailable("variant-1", 1)).toBe(false);
  });

  it("returns false for unknown variant", async () => {
    mockRepo.getVariantStock.mockResolvedValue(null);
    expect(await isAvailable("unknown", 1)).toBe(false);
  });
});

describe("getMovementHistory", () => {
  it("returns paginated movements", async () => {
    const items = [mockMovement];
    mockRepo.getMovements.mockResolvedValue({ items, total: 1 });

    const result = await getMovementHistory("variant-1", { page: 1, perPage: 10 });
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(mockRepo.getMovements).toHaveBeenCalledWith("variant-1", { page: 1, perPage: 10 });
  });

  it("uses defaults when no opts provided", async () => {
    mockRepo.getMovements.mockResolvedValue({ items: [], total: 0 });
    await getMovementHistory("variant-1");
    expect(mockRepo.getMovements).toHaveBeenCalledWith("variant-1", { page: 1, perPage: 20 });
  });
});

describe("updateSettings", () => {
  it("delegates to repository", async () => {
    mockRepo.updateSettings.mockResolvedValue(undefined);
    await updateSettings("variant-1", { minOrderQty: 5, stockLocation: "Rayon B" });
    expect(mockRepo.updateSettings).toHaveBeenCalledWith("variant-1", {
      minOrderQty: 5,
      stockLocation: "Rayon B",
    });
  });

  it("rejects minOrderQty < 1", async () => {
    await expect(updateSettings("variant-1", { minOrderQty: 0 })).rejects.toThrow("at least 1");
  });

  it("rejects negative lowStockThreshold", async () => {
    await expect(updateSettings("variant-1", { lowStockThreshold: -5 })).rejects.toThrow(
      "non-negative",
    );
  });
});

describe("low stock alert", () => {
  const mockNotifier: LowStockNotifier = {
    notify: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    setLowStockNotifier(mockNotifier);
  });

  it("triggers alert when stock crosses threshold", async () => {
    mockRepo.getVariantStock.mockResolvedValue({
      ...mockVariant,
      stock: 12,
      lowStockAlert: true,
      lowStockThreshold: 10,
    });
    mockRepo.createMovement.mockResolvedValue({ ...mockMovement, delta: -5, stockAfter: 7 });

    await adjust({
      variantId: "variant-1",
      delta: -5,
      reason: "SALE" as StockMovementReason,
    });

    expect(mockNotifier.notify).toHaveBeenCalledWith(
      { id: "variant-1", sku: "SKU-001", productName: "Test Product" },
      7,
      10,
    );
  });

  it("does not trigger when already below threshold", async () => {
    mockRepo.getVariantStock.mockResolvedValue({
      ...mockVariant,
      stock: 5,
      lowStockAlert: true,
      lowStockThreshold: 10,
    });
    mockRepo.createMovement.mockResolvedValue({ ...mockMovement, delta: -2, stockAfter: 3 });

    await adjust({
      variantId: "variant-1",
      delta: -2,
      reason: "SALE" as StockMovementReason,
    });

    expect(mockNotifier.notify).not.toHaveBeenCalled();
  });

  it("does not trigger when alert is disabled", async () => {
    mockRepo.getVariantStock.mockResolvedValue({
      ...mockVariant,
      stock: 12,
      lowStockAlert: false,
      lowStockThreshold: 10,
    });
    mockRepo.createMovement.mockResolvedValue({ ...mockMovement, delta: -5, stockAfter: 7 });

    await adjust({
      variantId: "variant-1",
      delta: -5,
      reason: "SALE" as StockMovementReason,
    });

    expect(mockNotifier.notify).not.toHaveBeenCalled();
  });
});
