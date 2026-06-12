import { prisma } from "../db/client";

// Vide toutes les tables du catalogue entre les tests (ordre géré par CASCADE).
export async function resetDb(): Promise<void> {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE
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
}
