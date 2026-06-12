-- L'EAN/CIP descend du produit (regroupeur) vers la déclinaison (le vendable).

-- DropIndex
DROP INDEX "Product_ean_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "ean";

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN "ean" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_ean_key" ON "ProductVariant"("ean");
