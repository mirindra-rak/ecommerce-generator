-- Search: extensions et index trigram pour fuzzy matching léger.

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION immutable_unaccent(text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT unaccent('unaccent', $1)
$$;

CREATE INDEX IF NOT EXISTS "Product_name_trgm_idx"
  ON "Product" USING GIN (immutable_unaccent(lower("name")) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Brand_name_trgm_idx"
  ON "Brand" USING GIN (immutable_unaccent(lower("name")) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "ProductVariant_sku_trgm_idx"
  ON "ProductVariant" USING GIN (immutable_unaccent(lower(COALESCE("sku", ''))) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "ProductVariant_ean_trgm_idx"
  ON "ProductVariant" USING GIN (immutable_unaccent(lower(COALESCE("ean", ''))) gin_trgm_ops);
