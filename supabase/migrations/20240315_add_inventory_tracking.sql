-- Create inventory transactions table to track all inventory changes
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity_change INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'adjustment', 'return')),
    reference_id UUID, -- Can link to order_id or other source
    notes TEXT,
    created_by UUID REFERENCES auth.users(id)
);

-- Add inventory alerts table
CREATE TABLE inventory_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'reorder')),
    threshold INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    notification_email TEXT[]
);

-- Create function to update product variant inventory
CREATE OR REPLACE FUNCTION update_variant_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the inventory quantity in product_variants
    UPDATE product_variants
    SET inventory_quantity = inventory_quantity + NEW.quantity_change
    WHERE id = NEW.variant_id;
    
    -- Check for inventory alerts
    WITH variant_inventory AS (
        SELECT v.id, v.inventory_quantity, a.threshold, a.alert_type, a.id as alert_id
        FROM product_variants v
        JOIN inventory_alerts a ON v.id = a.variant_id
        WHERE v.id = NEW.variant_id
        AND a.is_active = true
    )
    UPDATE inventory_alerts
    SET last_triggered_at = NOW()
    FROM variant_inventory vi
    WHERE inventory_alerts.id = vi.alert_id
    AND (
        (vi.alert_type = 'low_stock' AND vi.inventory_quantity <= vi.threshold)
        OR (vi.alert_type = 'out_of_stock' AND vi.inventory_quantity <= 0)
        OR (vi.alert_type = 'reorder' AND vi.inventory_quantity <= vi.threshold)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for inventory updates
CREATE TRIGGER on_inventory_transaction
    AFTER INSERT ON inventory_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_variant_inventory();

-- Add indexes for performance
CREATE INDEX idx_inventory_transactions_variant ON inventory_transactions(variant_id);
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_inventory_alerts_variant ON inventory_alerts(variant_id);
CREATE INDEX idx_inventory_alerts_active ON inventory_alerts(is_active);

-- Enable RLS
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Staff can manage inventory transactions" ON inventory_transactions
    FOR ALL USING (auth.jwt() ->> 'role' = 'staff');

CREATE POLICY "Staff can manage inventory alerts" ON inventory_alerts
    FOR ALL USING (auth.jwt() ->> 'role' = 'staff');
