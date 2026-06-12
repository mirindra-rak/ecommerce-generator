-- Le SKU devient optionnel sur la déclinaison (unique conservé sur les valeurs non nulles).

-- AlterTable
ALTER TABLE "ProductVariant" ALTER COLUMN "sku" DROP NOT NULL;

