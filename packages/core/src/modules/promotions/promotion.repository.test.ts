import { describe, expect, it } from "vitest";
import { catalogPriceRuleRepository } from "./promotion.repository";

describe("catalogPriceRuleRepository", () => {
  it("crée une règle ALL et la retrouve par id", async () => {
    const created = await catalogPriceRuleRepository.create({
      name: "Promo été",
      targetType: "ALL",
      discountType: "PERCENTAGE",
      discountValue: 1000,
      targetIds: [],
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe("Promo été");
    expect(created.active).toBe(true);
    expect(created.targets).toHaveLength(0);

    const found = await catalogPriceRuleRepository.findById(created.id);
    expect(found?.id).toBe(created.id);
  });

  it("crée une règle CATEGORY avec des targets", async () => {
    const created = await catalogPriceRuleRepository.create({
      name: "Promo hygiène",
      targetType: "CATEGORY",
      discountType: "PERCENTAGE",
      discountValue: 2000,
      targetIds: ["cat-1", "cat-2"],
    });

    expect(created.targets).toHaveLength(2);
    expect(created.targets.map((t) => t.targetId).sort()).toEqual(["cat-1", "cat-2"]);
  });

  it("findMany retourne les règles triées par priorité desc puis createdAt desc", async () => {
    await catalogPriceRuleRepository.create({
      name: "Low prio",
      targetType: "ALL",
      discountType: "PERCENTAGE",
      discountValue: 500,
      priority: 0,
      targetIds: [],
    });
    await catalogPriceRuleRepository.create({
      name: "High prio",
      targetType: "ALL",
      discountType: "PERCENTAGE",
      discountValue: 1000,
      priority: 10,
      targetIds: [],
    });

    const rules = await catalogPriceRuleRepository.findMany();
    expect(rules[0]!.name).toBe("High prio");
    expect(rules[1]!.name).toBe("Low prio");
  });

  it("update modifie la règle et remplace les targets", async () => {
    const created = await catalogPriceRuleRepository.create({
      name: "Old name",
      targetType: "BRAND",
      discountType: "FIXED_AMOUNT",
      discountValue: 300,
      targetIds: ["brand-1"],
    });

    const updated = await catalogPriceRuleRepository.update(created.id, {
      name: "New name",
      targetIds: ["brand-2", "brand-3"],
    });

    expect(updated.name).toBe("New name");
    expect(updated.targets).toHaveLength(2);
    expect(updated.targets.map((t) => t.targetId).sort()).toEqual(["brand-2", "brand-3"]);
  });

  it("remove supprime la règle et ses targets en cascade", async () => {
    const created = await catalogPriceRuleRepository.create({
      name: "To delete",
      targetType: "PRODUCT",
      discountType: "PERCENTAGE",
      discountValue: 500,
      targetIds: ["prod-1"],
    });

    await catalogPriceRuleRepository.remove(created.id);
    expect(await catalogPriceRuleRepository.findById(created.id)).toBeNull();
  });

  describe("findActiveForProduct", () => {
    it("retourne la règle ALL active", async () => {
      await catalogPriceRuleRepository.create({
        name: "All products",
        targetType: "ALL",
        discountType: "PERCENTAGE",
        discountValue: 500,
        targetIds: [],
      });

      const rules = await catalogPriceRuleRepository.findActiveForProduct(
        "any-product",
        ["any-cat"],
        "any-brand",
      );
      expect(rules).toHaveLength(1);
      expect(rules[0]!.name).toBe("All products");
    });

    it("retourne la règle ciblant la catégorie du produit", async () => {
      await catalogPriceRuleRepository.create({
        name: "Promo catégorie",
        targetType: "CATEGORY",
        discountType: "PERCENTAGE",
        discountValue: 1000,
        targetIds: ["cat-hygiene"],
      });

      const rules = await catalogPriceRuleRepository.findActiveForProduct(
        "prod-1",
        ["cat-hygiene", "cat-soin"],
        "brand-1",
      );
      expect(rules).toHaveLength(1);
    });

    it("ignore une règle inactive", async () => {
      await catalogPriceRuleRepository.create({
        name: "Inactive",
        active: false,
        targetType: "ALL",
        discountType: "PERCENTAGE",
        discountValue: 500,
        targetIds: [],
      });

      const rules = await catalogPriceRuleRepository.findActiveForProduct("p", ["c"], "b");
      expect(rules).toHaveLength(0);
    });

    it("ignore une règle dont startDate est dans le futur", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await catalogPriceRuleRepository.create({
        name: "Future",
        startDate: tomorrow,
        targetType: "ALL",
        discountType: "PERCENTAGE",
        discountValue: 500,
        targetIds: [],
      });

      const rules = await catalogPriceRuleRepository.findActiveForProduct("p", ["c"], "b");
      expect(rules).toHaveLength(0);
    });

    it("ignore une règle dont endDate est passée", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await catalogPriceRuleRepository.create({
        name: "Expired",
        endDate: yesterday,
        targetType: "ALL",
        discountType: "PERCENTAGE",
        discountValue: 500,
        targetIds: [],
      });

      const rules = await catalogPriceRuleRepository.findActiveForProduct("p", ["c"], "b");
      expect(rules).toHaveLength(0);
    });

    it("retourne les règles triées par priorité desc", async () => {
      await catalogPriceRuleRepository.create({
        name: "Low",
        priority: 1,
        targetType: "ALL",
        discountType: "PERCENTAGE",
        discountValue: 500,
        targetIds: [],
      });
      await catalogPriceRuleRepository.create({
        name: "High",
        priority: 10,
        targetType: "ALL",
        discountType: "PERCENTAGE",
        discountValue: 1000,
        targetIds: [],
      });

      const rules = await catalogPriceRuleRepository.findActiveForProduct("p", ["c"], "b");
      expect(rules[0]!.name).toBe("High");
    });

    it("ne retourne pas une règle CATEGORY si le produit n'est pas dans la catégorie ciblée", async () => {
      await catalogPriceRuleRepository.create({
        name: "Other cat",
        targetType: "CATEGORY",
        discountType: "PERCENTAGE",
        discountValue: 1000,
        targetIds: ["cat-other"],
      });

      const rules = await catalogPriceRuleRepository.findActiveForProduct(
        "prod-1",
        ["cat-hygiene"],
        "brand-1",
      );
      expect(rules).toHaveLength(0);
    });
  });

  describe("findActiveForProducts", () => {
    it("retourne toutes les règles actives matchant au moins un contexte", async () => {
      await catalogPriceRuleRepository.create({
        name: "All",
        targetType: "ALL",
        discountType: "PERCENTAGE",
        discountValue: 500,
        targetIds: [],
      });
      await catalogPriceRuleRepository.create({
        name: "Cat specific",
        targetType: "CATEGORY",
        discountType: "FIXED_AMOUNT",
        discountValue: 200,
        targetIds: ["cat-a"],
      });

      const rules = await catalogPriceRuleRepository.findActiveForProducts([
        { productId: "p1", categoryIds: ["cat-a"], brandId: null },
        { productId: "p2", categoryIds: ["cat-b"], brandId: "brand-x" },
      ]);

      expect(rules.length).toBeGreaterThanOrEqual(1);
      const names = rules.map((r) => r.name);
      expect(names).toContain("All");
      expect(names).toContain("Cat specific");
    });
  });
});
