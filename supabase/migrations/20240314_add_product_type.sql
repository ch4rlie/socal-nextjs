-- Add product_type column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS product_type product_category NOT NULL DEFAULT 'DEFAULT';

-- Update existing products based on their categories
UPDATE products
SET product_type = 'BASIC_SHIRT'
WHERE name ILIKE '%shirt%' OR name ILIKE '%tee%';

UPDATE products
SET product_type = 'HEAVY_OUTERWEAR'
WHERE name ILIKE '%hoodie%' OR name ILIKE '%sweatshirt%' OR name ILIKE '%jacket%';

UPDATE products
SET product_type = 'HEADWEAR'
WHERE name ILIKE '%hat%' OR name ILIKE '%cap%' OR name ILIKE '%beanie%';

UPDATE products
SET product_type = 'AOP_LIGHT'
WHERE name ILIKE '%all over%' AND (name ILIKE '%shirt%' OR name ILIKE '%tee%');

UPDATE products
SET product_type = 'AOP_HEAVY'
WHERE name ILIKE '%all over%' AND (name ILIKE '%hoodie%' OR name ILIKE '%sweatshirt%');

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_shipping_type ON products(shipping_type);
