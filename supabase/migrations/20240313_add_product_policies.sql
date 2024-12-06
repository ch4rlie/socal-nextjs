-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to active products" ON products;
DROP POLICY IF EXISTS "Allow public read access to product variants" ON product_variants;

-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to active products
CREATE POLICY "Allow public read access to active products"
  ON products
  FOR SELECT
  TO public
  USING (is_active = true);

-- Enable RLS on product_variants table
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to variants of active products
CREATE POLICY "Allow public read access to product variants"
  ON product_variants
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_variants.product_id
      AND products.is_active = true
    )
  );
