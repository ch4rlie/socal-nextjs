-- Create reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_title TEXT,
    verified_purchase BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add review aggregation fields to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS review_average DECIMAL(3,2) DEFAULT 0.00;

-- Add additional product metadata for rich snippets
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS color TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS size TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS material TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_unit TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS manufacturer TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS mpn TEXT; -- Manufacturer Part Number
ALTER TABLE products ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'new';

-- Add breadcrumb data
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_path TEXT[];

-- Add comments
COMMENT ON TABLE product_reviews IS 'Product reviews and ratings';
COMMENT ON COLUMN product_reviews.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN product_reviews.verified_purchase IS 'Whether the reviewer purchased the product';
COMMENT ON COLUMN products.review_count IS 'Total number of reviews';
COMMENT ON COLUMN products.review_average IS 'Average rating (1-5)';
COMMENT ON COLUMN products.brand IS 'Product brand name';
COMMENT ON COLUMN products.color IS 'Available colors';
COMMENT ON COLUMN products.size IS 'Available sizes';
COMMENT ON COLUMN products.material IS 'Product materials';
COMMENT ON COLUMN products.weight IS 'Product weight';
COMMENT ON COLUMN products.weight_unit IS 'Weight unit (e.g., kg, lb)';
COMMENT ON COLUMN products.dimensions IS 'Product dimensions as {length, width, height, unit}';
COMMENT ON COLUMN products.manufacturer IS 'Product manufacturer';
COMMENT ON COLUMN products.mpn IS 'Manufacturer Part Number';
COMMENT ON COLUMN products.condition IS 'Product condition (new, used, refurbished)';
COMMENT ON COLUMN products.category_path IS 'Full category path for breadcrumbs';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_condition ON products(condition);

-- Create function to update review stats
CREATE OR REPLACE FUNCTION update_product_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        UPDATE products
        SET 
            review_count = (
                SELECT COUNT(*)
                FROM product_reviews
                WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
            ),
            review_average = (
                SELECT ROUND(AVG(rating)::numeric, 2)
                FROM product_reviews
                WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
            )
        WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for review stats
DROP TRIGGER IF EXISTS trigger_update_product_review_stats ON product_reviews;
CREATE TRIGGER trigger_update_product_review_stats
    AFTER INSERT OR UPDATE OR DELETE ON product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_product_review_stats();
