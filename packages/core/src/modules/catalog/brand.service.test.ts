import { describe, expect, it } from "vitest";
import { brandRepository } from "./brand.repository";
import { createBrand, deleteBrand, updateBrand } from "./brand.service";

describe("brand.service (intégration)", () => {
  it("crée une marque avec slug auto et déduplique les noms identiques", async () => {
    const first = await createBrand({ name: "Avène" });
    const second = await createBrand({ name: "Avène" });
    expect(first.slug).toBe("avene");
    expect(second.slug).toBe("avene-2");
  });

  it("met à jour puis supprime une marque", async () => {
    const brand = await createBrand({ name: "Nuxe" });

    const updated = await updateBrand(brand.id, { name: "Nuxe Paris" });
    expect(updated.name).toBe("Nuxe Paris");

    await deleteBrand(brand.id);
    expect(await brandRepository.findById(brand.id)).toBeNull();
  });
});
