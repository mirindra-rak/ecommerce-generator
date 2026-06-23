-- Search: colonne tsvector sur Product, fonction de calcul pondéré, index GIN.

-- 1. Colonne tsvector
ALTER TABLE "Product" ADD COLUMN "search_vector" tsvector;

-- 2. Fonction de (re)calcul du vecteur de recherche pour un produit donné.
--    Agrège : name + brand (poids A), SKU/EAN (poids A, dict simple),
--    shortDescription (poids B), description + attributs JSONB (poids C).
CREATE OR REPLACE FUNCTION refresh_product_search_vector(p_id TEXT)
RETURNS void AS $$
DECLARE
  v_name         TEXT;
  v_brand        TEXT;
  v_short_desc   TEXT;
  v_description  TEXT;
  v_attributes   TEXT;
  v_codes        TEXT;
  v_vector       tsvector;
BEGIN
  -- Champs du produit + marque
  SELECT
    p."name",
    COALESCE(b."name", ''),
    COALESCE(p."shortDescription", ''),
    COALESCE(p."description", ''),
    COALESCE((
      SELECT string_agg(val.value, ' ')
      FROM jsonb_each_text(p."attributes") AS val
    ), '')
  INTO v_name, v_brand, v_short_desc, v_description, v_attributes
  FROM "Product" p
  LEFT JOIN "Brand" b ON b."id" = p."brandId"
  WHERE p."id" = p_id;

  -- SKU + EAN des variantes
  SELECT COALESCE(string_agg(
    COALESCE(pv."sku", '') || ' ' || COALESCE(pv."ean", ''), ' '
  ), '')
  INTO v_codes
  FROM "ProductVariant" pv
  WHERE pv."productId" = p_id;

  -- Assemblage pondéré
  v_vector :=
    setweight(to_tsvector('french', v_name), 'A') ||
    setweight(to_tsvector('french', v_brand), 'A') ||
    setweight(to_tsvector('simple', v_codes), 'A') ||
    setweight(to_tsvector('french', v_short_desc), 'B') ||
    setweight(to_tsvector('french', v_description), 'C') ||
    setweight(to_tsvector('french', v_attributes), 'C');

  UPDATE "Product" SET "search_vector" = v_vector WHERE "id" = p_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Index GIN
CREATE INDEX "Product_search_vector_idx" ON "Product" USING GIN ("search_vector");

-- 4. Backfill des produits existants
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT "id" FROM "Product" LOOP
    PERFORM refresh_product_search_vector(r."id");
  END LOOP;
END;
$$;
