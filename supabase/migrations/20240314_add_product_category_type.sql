-- Drop existing type if it exists
DROP TYPE IF EXISTS product_category CASCADE;

-- Create product category enum
CREATE TYPE product_category AS ENUM (
    'BASIC_SHIRT',
    'HEAVY_OUTERWEAR',
    'AOP_LIGHT',
    'AOP_HEAVY',
    'AOP_PREMIUM',
    'HEADWEAR',
    'DEFAULT'
);

-- Add product_type column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS product_type product_category NOT NULL DEFAULT 'DEFAULT'::product_category;

-- Update existing products based on their names
UPDATE products
SET product_type = (
    CASE 
        WHEN name ILIKE '%hoodie%' OR name ILIKE '%sweatshirt%' OR name ILIKE '%jacket%' 
        THEN 'HEAVY_OUTERWEAR'::product_category
        
        WHEN name ILIKE '%hat%' OR name ILIKE '%cap%' OR name ILIKE '%beanie%' 
        THEN 'HEADWEAR'::product_category
        
        WHEN name ILIKE '%all over%' AND (name ILIKE '%hoodie%' OR name ILIKE '%sweatshirt%') 
        THEN 'AOP_HEAVY'::product_category
        
        WHEN name ILIKE '%all over%' AND (name ILIKE '%shirt%' OR name ILIKE '%tee%') 
        THEN 'AOP_LIGHT'::product_category
        
        WHEN name ILIKE '%shirt%' OR name ILIKE '%tee%' 
        THEN 'BASIC_SHIRT'::product_category
        
        ELSE 'DEFAULT'::product_category
    END
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
