-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "externalId" INTEGER;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "externalId" INTEGER;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "externalId" INTEGER,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "vatRate" INTEGER NOT NULL DEFAULT 2000;

-- CreateIndex
CREATE UNIQUE INDEX "Brand_externalId_key" ON "Brand"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_externalId_key" ON "Category"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_externalId_key" ON "Product"("externalId");

