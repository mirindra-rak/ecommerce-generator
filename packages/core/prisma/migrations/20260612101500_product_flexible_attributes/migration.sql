-- Attributs produit flexibles : productType ouvert (TEXT) + attributes jsonb.
-- Migration destructive (drop inci/precautions/enum) : assumée en dev (re-seed).
-- En prod réelle, copier inci/precautions dans attributes AVANT le drop.

-- Drop des colonnes descriptives (migrées dans attributes) et de la colonne enum.
ALTER TABLE "Product" DROP COLUMN "inci";
ALTER TABLE "Product" DROP COLUMN "precautions";
ALTER TABLE "Product" DROP COLUMN "productType";

-- Suppression du type enum (plus aucune colonne ne l'utilise).
DROP TYPE "ProductType";

-- productType ouvert + attributes jsonb.
ALTER TABLE "Product" ADD COLUMN "productType" TEXT NOT NULL DEFAULT 'OTHER';
ALTER TABLE "Product" ADD COLUMN "attributes" JSONB NOT NULL DEFAULT '{}';
