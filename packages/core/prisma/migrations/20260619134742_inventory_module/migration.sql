-- CreateEnum
CREATE TYPE "OutOfStockBehavior" AS ENUM ('DENY', 'ALLOW', 'DEFAULT');

-- CreateEnum
CREATE TYPE "StockMovementReason" AS ENUM ('MANUAL_ADJUSTMENT', 'RECEPTION', 'SALE', 'RETURN', 'CORRECTION');

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "lowStockAlert" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lowStockThreshold" INTEGER,
ADD COLUMN     "minOrderQty" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "outOfStockBehavior" "OutOfStockBehavior" NOT NULL DEFAULT 'DEFAULT',
ADD COLUMN     "stockLocation" TEXT;

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "stockAfter" INTEGER NOT NULL,
    "reason" "StockMovementReason" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockMovement_variantId_idx" ON "StockMovement"("variantId");

-- CreateIndex
CREATE INDEX "StockMovement_createdAt_idx" ON "StockMovement"("createdAt");

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
