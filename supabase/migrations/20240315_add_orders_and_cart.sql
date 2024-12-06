-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_history CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS shopping_carts CASCADE;

-- Create shopping cart table
CREATE TABLE shopping_carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'converted', 'abandoned')),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    metadata JSONB
);

-- Create cart items table
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES shopping_carts(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    custom_options JSONB,
    UNIQUE(cart_id, variant_id)
);

-- Create orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
    ),
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    shipping_method TEXT NOT NULL,
    shipping_cost DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
        payment_status IN ('pending', 'paid', 'failed', 'refunded')
    ),
    payment_method TEXT,
    tracking_number TEXT,
    notes TEXT,
    metadata JSONB
);

-- Create order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    custom_options JSONB,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
    )
);

-- Create order history table
CREATE TABLE order_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    notes TEXT,
    metadata JSONB
);

-- Add indexes for performance
CREATE INDEX idx_shopping_carts_user ON shopping_carts(user_id);
CREATE INDEX idx_shopping_carts_status ON shopping_carts(status);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_variant ON cart_items(variant_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_history_order ON order_history(order_id);

-- Enable RLS
ALTER TABLE shopping_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own cart" ON shopping_carts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their cart items" ON cart_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM shopping_carts
            WHERE id = cart_items.cart_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Staff can manage all orders" ON orders
    FOR ALL USING (auth.jwt() ->> 'role' = 'staff');

CREATE POLICY "Users can view their order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE id = order_items.order_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can manage all order items" ON order_items
    FOR ALL USING (auth.jwt() ->> 'role' = 'staff');

CREATE POLICY "Users can view their order history" ON order_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE id = order_history.order_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can manage order history" ON order_history
    FOR ALL USING (auth.jwt() ->> 'role' = 'staff');

-- Function to cleanup expired carts
CREATE OR REPLACE FUNCTION cleanup_expired_carts()
RETURNS void AS $$
BEGIN
    UPDATE shopping_carts
    SET status = 'abandoned'
    WHERE status = 'active'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate order totals
CREATE OR REPLACE FUNCTION calculate_order_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate subtotal from order items
    SELECT SUM(subtotal) INTO NEW.subtotal
    FROM order_items
    WHERE order_id = NEW.id;
    
    -- Calculate tax (example: 10%)
    NEW.tax := COALESCE(NEW.subtotal * 0.10, 0);
    
    -- Calculate total
    NEW.total := COALESCE(NEW.subtotal, 0) + COALESCE(NEW.tax, 0) + COALESCE(NEW.shipping_cost, 0);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for order totals
CREATE TRIGGER before_order_update
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION calculate_order_totals();
