-- Enhance products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS external_id text,
ADD COLUMN IF NOT EXISTS sync_product_id bigint,
ADD COLUMN IF NOT EXISTS variant_id bigint,
ADD COLUMN IF NOT EXISTS main_category_id integer,
ADD COLUMN IF NOT EXISTS embroidery_type text,
ADD COLUMN IF NOT EXISTS thread_colors text[],
ADD COLUMN IF NOT EXISTS availability_status text,
ADD COLUMN IF NOT EXISTS last_sync_error text;

-- Enhance product_variants table
ALTER TABLE product_variants
ADD COLUMN IF NOT EXISTS external_id text,
ADD COLUMN IF NOT EXISTS sync_variant_id bigint,
ADD COLUMN IF NOT EXISTS variant_id bigint,
ADD COLUMN IF NOT EXISTS sku text,
ADD COLUMN IF NOT EXISTS main_category_id integer,
ADD COLUMN IF NOT EXISTS availability_status text,
ADD COLUMN IF NOT EXISTS embroidery_type text,
ADD COLUMN IF NOT EXISTS thread_colors text[],
ADD COLUMN IF NOT EXISTS preview_image_url text,
ADD COLUMN IF NOT EXISTS last_sync_error text;
