-- Pricing: référentiel TVA + rattachement explicite des produits.

CREATE TABLE "TaxRate" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rateBps" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxRate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TaxRate_code_key" ON "TaxRate"("code");

INSERT INTO "TaxRate" ("id", "code", "name", "rateBps", "position", "updatedAt")
VALUES
    ('tax-fr-normal-20', 'FR_STANDARD_20', 'TVA standard 20 %', 2000, 0, CURRENT_TIMESTAMP),
    ('tax-fr-intermediate-10', 'FR_INTERMEDIATE_10', 'TVA intermédiaire 10 %', 1000, 1, CURRENT_TIMESTAMP),
    ('tax-fr-reduced-5_5', 'FR_REDUCED_5_5', 'TVA réduite 5,5 %', 550, 2, CURRENT_TIMESTAMP),
    ('tax-fr-reduced-2_1', 'FR_REDUCED_2_1', 'TVA réduite 2,1 %', 210, 3, CURRENT_TIMESTAMP),
    ('tax-fr-exempt-0', 'FR_EXEMPT_0', 'Exonéré 0 %', 0, 4, CURRENT_TIMESTAMP);

ALTER TABLE "Product" ADD COLUMN "taxRateId" TEXT;

UPDATE "Product" AS "p"
SET "taxRateId" = "tr"."id"
FROM "TaxRate" AS "tr"
WHERE "tr"."rateBps" = "p"."vatRate";

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Product" WHERE "taxRateId" IS NULL) THEN
    RAISE EXCEPTION 'TaxRate mapping failed for at least one Product.vatRate value';
  END IF;
END $$;

ALTER TABLE "Product" ALTER COLUMN "taxRateId" SET NOT NULL;

ALTER TABLE "Product"
ADD CONSTRAINT "Product_taxRateId_fkey"
FOREIGN KEY ("taxRateId") REFERENCES "TaxRate"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

CREATE INDEX "Product_taxRateId_idx" ON "Product"("taxRateId");

ALTER TABLE "Product" DROP COLUMN "vatRate";
