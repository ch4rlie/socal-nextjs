-- Create base products table
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    retail_price DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    images TEXT[] DEFAULT '{}',
    thumbnail_url TEXT,
    custom_thumbnail_url TEXT,
    slug TEXT UNIQUE NOT NULL,
    availability_status TEXT DEFAULT 'active',
    is_active BOOLEAN DEFAULT true,
    weight DECIMAL(10,2),
    dimensions JSONB,
    shipping_type TEXT DEFAULT 'flat_rate',
    shipping_rate DECIMAL(10,2) DEFAULT 0.00,
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    brand TEXT,
    color TEXT[],
    size TEXT[],
    material TEXT[],
    category_path TEXT[]
);

-- Create variants table
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    sku TEXT,
    name TEXT,
    retail_price DECIMAL(10,2),
    compare_at_price DECIMAL(10,2),
    inventory_quantity INTEGER DEFAULT 0,
    weight DECIMAL(10,2),
    dimensions JSONB,
    is_active BOOLEAN DEFAULT true,
    preview_image_url TEXT
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_title TEXT,
    verified_purchase BOOLEAN DEFAULT false,
    helpful_votes INTEGER DEFAULT 0,
    images TEXT[],
    metadata JSONB
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_availability ON products(availability_status);
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON product_reviews(product_id);

-- Add some sample products
INSERT INTO products (name, description, retail_price, slug, thumbnail_url, shipping_type)
VALUES 
('Classic Black T-Shirt', 'Premium cotton t-shirt in classic black', 29.99, 'classic-black-tshirt', 'https://example.com/images/black-tshirt.jpg', 'flat_rate'),
('Gray Hoodie', 'Comfortable cotton-blend hoodie', 49.99, 'gray-hoodie', 'https://example.com/images/gray-hoodie.jpg', 'flat_rate'),
('Snapback Cap', 'Adjustable snapback cap with embroidered logo', 24.99, 'snapback-cap', 'https://example.com/images/snapback-cap.jpg', 'flat_rate'),
('All-Over Print Shirt', 'Custom all-over print design shirt', 39.99, 'aop-shirt', 'https://example.com/images/aop-shirt.jpg', 'flat_rate'),
('Premium Windbreaker', 'Lightweight all-over print windbreaker', 79.99, 'premium-windbreaker', 'https://example.com/images/windbreaker.jpg', 'free');

-- Add RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active products
CREATE POLICY "Public products are viewable by everyone" ON products
    FOR SELECT USING (is_active = true);

-- Allow public read access to active variants
CREATE POLICY "Public variants are viewable by everyone" ON product_variants
    FOR SELECT USING (is_active = true);

-- Allow public read access to all reviews
CREATE POLICY "Reviews are viewable by everyone" ON product_reviews
    FOR SELECT USING (true);
