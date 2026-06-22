-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('ALL', 'CATEGORY', 'PRODUCT', 'BRAND');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateTable
CREATE TABLE "CatalogPriceRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "targetType" "TargetType" NOT NULL,
    "discountType" "DiscountType" NOT NULL,
    "discountValue" INTEGER NOT NULL,
    "floorPrice" INTEGER,
    "customerLabel" TEXT,
    "showStrikethrough" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogPriceRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogPriceRuleTarget" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,

    CONSTRAINT "CatalogPriceRuleTarget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CatalogPriceRule_active_startDate_endDate_idx" ON "CatalogPriceRule"("active", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "CatalogPriceRuleTarget_targetId_idx" ON "CatalogPriceRuleTarget"("targetId");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogPriceRuleTarget_ruleId_targetId_key" ON "CatalogPriceRuleTarget"("ruleId", "targetId");

-- AddForeignKey
ALTER TABLE "CatalogPriceRuleTarget" ADD CONSTRAINT "CatalogPriceRuleTarget_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "CatalogPriceRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
