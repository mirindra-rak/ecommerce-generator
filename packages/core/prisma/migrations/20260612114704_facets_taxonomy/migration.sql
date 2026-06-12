-- Taxonomie de facettes (filtres produit) : Facet / FacetValue / ProductFacetValue.

-- CreateTable
CREATE TABLE "Facet" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Facet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacetValue" (
    "id" TEXT NOT NULL,
    "facetId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FacetValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductFacetValue" (
    "productId" TEXT NOT NULL,
    "facetValueId" TEXT NOT NULL,

    CONSTRAINT "ProductFacetValue_pkey" PRIMARY KEY ("productId","facetValueId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Facet_code_key" ON "Facet"("code");

-- CreateIndex
CREATE INDEX "FacetValue_facetId_idx" ON "FacetValue"("facetId");

-- CreateIndex
CREATE UNIQUE INDEX "FacetValue_facetId_code_key" ON "FacetValue"("facetId", "code");

-- CreateIndex
CREATE INDEX "ProductFacetValue_facetValueId_idx" ON "ProductFacetValue"("facetValueId");

-- AddForeignKey
ALTER TABLE "FacetValue" ADD CONSTRAINT "FacetValue_facetId_fkey" FOREIGN KEY ("facetId") REFERENCES "Facet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFacetValue" ADD CONSTRAINT "ProductFacetValue_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFacetValue" ADD CONSTRAINT "ProductFacetValue_facetValueId_fkey" FOREIGN KEY ("facetValueId") REFERENCES "FacetValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

