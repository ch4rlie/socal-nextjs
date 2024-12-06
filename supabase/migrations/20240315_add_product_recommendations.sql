-- Create product categories table for better organization
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES product_categories(id),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    metadata JSONB
);

-- Create product-category relationships
CREATE TABLE product_categories_map (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- Create related products table
CREATE TABLE related_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    related_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (
        relationship_type IN ('similar', 'accessory', 'upsell', 'cross_sell')
    ),
    score DECIMAL(5,4), -- For automated recommendations
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(product_id, related_product_id)
);

-- Create product views table for personalization
CREATE TABLE product_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    view_duration INTEGER, -- in seconds
    source TEXT, -- where the view came from (search, category, recommendation, etc.)
    session_id TEXT
);

-- Create user preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_categories UUID[] DEFAULT '{}',
    preferred_sizes TEXT[] DEFAULT '{}',
    preferred_colors TEXT[] DEFAULT '{}',
    price_range NUMRANGE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- Add indexes for performance
CREATE INDEX idx_product_categories_slug ON product_categories(slug);
CREATE INDEX idx_product_categories_parent ON product_categories(parent_id);
CREATE INDEX idx_product_categories_active ON product_categories(is_active);
CREATE INDEX idx_related_products_product ON related_products(product_id);
CREATE INDEX idx_related_products_related ON related_products(related_product_id);
CREATE INDEX idx_product_views_user ON product_views(user_id);
CREATE INDEX idx_product_views_product ON product_views(product_id);
CREATE INDEX idx_product_views_viewed_at ON product_views(viewed_at);

-- Enable RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE related_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active categories" ON product_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Staff can manage categories" ON product_categories
    FOR ALL USING (auth.jwt() ->> 'role' = 'staff');

CREATE POLICY "Anyone can view category mappings" ON product_categories_map
    FOR SELECT USING (true);

CREATE POLICY "Staff can manage category mappings" ON product_categories_map
    FOR ALL USING (auth.jwt() ->> 'role' = 'staff');

CREATE POLICY "Anyone can view related products" ON related_products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Staff can manage related products" ON related_products
    FOR ALL USING (auth.jwt() ->> 'role' = 'staff');

CREATE POLICY "Record product views" ON product_views
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their product views" ON product_views
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Function to update product view statistics
CREATE OR REPLACE FUNCTION update_product_views()
RETURNS TRIGGER AS $$
BEGIN
    -- Update product popularity score based on views
    UPDATE products
    SET metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{popularity_score}',
        (
            COALESCE((metadata->>'popularity_score')::numeric, 0) +
            CASE
                WHEN NEW.view_duration > 60 THEN 2  -- Long view
                ELSE 1                              -- Short view
            END
        )::text::jsonb
    )
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for product views
CREATE TRIGGER after_product_view
    AFTER INSERT ON product_views
    FOR EACH ROW
    EXECUTE FUNCTION update_product_views();

-- Function to generate product recommendations
CREATE OR REPLACE FUNCTION generate_product_recommendations(p_user_id UUID)
RETURNS TABLE (
    product_id UUID,
    score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH user_views AS (
        -- Get user's recent product views
        SELECT product_id, COUNT(*) as view_count
        FROM product_views
        WHERE user_id = p_user_id
        AND viewed_at > NOW() - INTERVAL '30 days'
        GROUP BY product_id
    ),
    user_prefs AS (
        -- Get user's preferences
        SELECT preferred_categories, preferred_sizes, preferred_colors, price_range
        FROM user_preferences
        WHERE user_id = p_user_id
    ),
    category_products AS (
        -- Get products from preferred categories
        SELECT DISTINCT p.id
        FROM products p
        JOIN product_categories_map pcm ON p.id = pcm.product_id
        JOIN user_prefs up ON pcm.category_id = ANY(up.preferred_categories)
        WHERE p.is_active = true
    )
    SELECT 
        p.id as product_id,
        (
            COALESCE((p.metadata->>'popularity_score')::decimal, 0) * 0.3 +
            COALESCE(uv.view_count, 0) * 0.2 +
            CASE WHEN cp.id IS NOT NULL THEN 0.5 ELSE 0 END
        )::decimal(5,4) as score
    FROM products p
    LEFT JOIN user_views uv ON p.id = uv.product_id
    LEFT JOIN category_products cp ON p.id = cp.id
    WHERE p.is_active = true
    AND p.id NOT IN (SELECT product_id FROM user_views)
    ORDER BY score DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
