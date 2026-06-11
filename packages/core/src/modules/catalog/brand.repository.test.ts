import { describe, expect, it } from "vitest";
import { brandRepository } from "./brand.repository";

describe("brandRepository", () => {
  it("crée une marque et la retrouve par slug", async () => {
    const created = await brandRepository.create({ name: "Avène", slug: "avene" });
    const found = await brandRepository.findBySlug("avene");

    expect(found?.id).toBe(created.id);
    expect(found?.name).toBe("Avène");
  });

  it("refuse un slug dupliqué", async () => {
    await brandRepository.create({ name: "La Roche-Posay", slug: "la-roche-posay" });

    await expect(
      brandRepository.create({ name: "Doublon", slug: "la-roche-posay" }),
    ).rejects.toThrow();
  });

  it("met à jour puis supprime une marque", async () => {
    const created = await brandRepository.create({ name: "Nuxe", slug: "nuxe" });

    const updated = await brandRepository.update(created.id, { name: "Nuxe Paris" });
    expect(updated.name).toBe("Nuxe Paris");

    await brandRepository.delete(created.id);
    expect(await brandRepository.findById(created.id)).toBeNull();
  });
});
