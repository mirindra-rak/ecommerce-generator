import { describe, expect, it } from "vitest";
import { DEFAULT_TAX_RATE_ID, TAX_RATE_REFERENCES } from "./tax-rate.constants";
import { taxRateRepository } from "./tax-rate.repository";

describe("taxRateRepository", () => {
  it("retourne le taux de TVA par défaut", async () => {
    const taxRate = await taxRateRepository.findDefault();
    expect(taxRate?.id).toBe(DEFAULT_TAX_RATE_ID);
  });

  it("retourne les taux actifs dans l'ordre de position", async () => {
    const taxRates = await taxRateRepository.findActive();
    expect(taxRates.map((taxRate) => taxRate.id)).toEqual(
      TAX_RATE_REFERENCES.map((taxRate) => taxRate.id),
    );
  });
});
