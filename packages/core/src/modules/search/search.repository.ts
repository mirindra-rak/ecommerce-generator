import { prisma } from "../../db/client";

export const searchRepository = {
  refreshSearchVector(productId: string): Promise<void> {
    return prisma.$executeRaw`
      SELECT refresh_product_search_vector(${productId}::text)
    `.then(() => undefined);
  },

  refreshAll(): Promise<void> {
    return prisma.$executeRaw`
      DO $$
      DECLARE r RECORD;
      BEGIN
        FOR r IN SELECT "id" FROM "Product" LOOP
          PERFORM refresh_product_search_vector(r."id");
        END LOOP;
      END;
      $$
    `.then(() => undefined);
  },
};
