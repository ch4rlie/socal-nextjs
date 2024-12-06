-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    category VARCHAR(100),
    stock_status VARCHAR(50) DEFAULT 'in_stock',
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products_categories table
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES product_categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_product_categories_slug ON product_categories(slug);

-- Add RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on products" 
    ON products FOR SELECT 
    TO public 
    USING (true);

CREATE POLICY "Allow public read access on product_categories" 
    ON product_categories FOR SELECT 
    TO public 
    USING (true);

-- Allow authenticated users with admin role to manage products
CREATE POLICY "Allow admin users to manage products" 
    ON products FOR ALL 
    TO authenticated 
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin users to manage product categories" 
    ON product_categories FOR ALL 
    TO authenticated 
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');
