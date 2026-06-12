-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "additionalInfo" TEXT,
ADD COLUMN     "countryOfOrigin" TEXT,
ADD COLUMN     "coverImageKey" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "hsCode" TEXT,
ADD COLUMN     "menuThumbnailKey" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "thumbnailKey" TEXT;
