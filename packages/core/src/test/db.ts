import { prisma } from "../db/client";
import { TAX_RATE_REFERENCES } from "../modules/pricing";

// Vide toutes les tables du catalogue entre les tests (ordre géré par CASCADE).
export async function resetDb(): Promise<void> {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE
      "CatalogPriceRuleTarget",
      "CatalogPriceRule",
      "TaxRate",
      "ProductFacetValue",
      "FacetValue",
      "Facet",
      "ProductMedia",
      "VariantOptionValue",
      "ProductVariant",
      "ProductOptionValue",
      "ProductOption",
      "Product",
      "Category",
      "Brand",
      "Session",
      "Account",
      "Verification",
      "User"
     RESTART IDENTITY CASCADE`,
  );

  await prisma.taxRate.createMany({
    data: TAX_RATE_REFERENCES.map((taxRate) => ({
      id: taxRate.id,
      code: taxRate.code,
      name: taxRate.name,
      rateBps: taxRate.rateBps,
      position: taxRate.position,
    })),
  });
}
