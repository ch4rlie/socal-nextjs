-- Create shipping regions enum
CREATE TYPE shipping_region AS ENUM (
  'USA',
  'Europe',
  'UK',
  'EFTA',
  'Canada',
  'Australia_NZ',
  'Japan',
  'Brazil',
  'Worldwide'
);

-- Create product categories enum
CREATE TYPE product_category AS ENUM (
  'BASIC_SHIRT',      -- T-shirts, tank tops, etc
  'HEAVY_OUTERWEAR',  -- Hoodies, sweatshirts, jackets
  'AOP_LIGHT',        -- All-over print shirts, leggings, etc
  'AOP_HEAVY',        -- All-over print hoodies, sweatshirts
  'AOP_PREMIUM',      -- All-over print windbreakers, track pants
  'HEADWEAR',         -- Hats, beanies, visors
  'DEFAULT'
);

-- Create shipping rates table
CREATE TABLE shipping_rates (
  id SERIAL PRIMARY KEY,
  product_category product_category NOT NULL,
  region shipping_region NOT NULL,
  base_rate DECIMAL(10,2) NOT NULL,
  additional_item_rate DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(product_category, region)
);

-- Insert shipping rates for BASIC_SHIRT (T-shirts, tank tops, etc)
INSERT INTO shipping_rates (product_category, region, base_rate, additional_item_rate) VALUES
('BASIC_SHIRT', 'USA', 4.69, 2.20),
('BASIC_SHIRT', 'Europe', 4.79, 1.45),
('BASIC_SHIRT', 'UK', 4.59, 1.50),
('BASIC_SHIRT', 'EFTA', 9.99, 1.10),
('BASIC_SHIRT', 'Canada', 8.29, 1.95),
('BASIC_SHIRT', 'Australia_NZ', 7.19, 1.30),
('BASIC_SHIRT', 'Japan', 4.39, 1.50),
('BASIC_SHIRT', 'Brazil', 4.49, 2.50),
('BASIC_SHIRT', 'Worldwide', 11.99, 6.00);

-- Insert shipping rates for HEAVY_OUTERWEAR (Hoodies, sweatshirts, etc)
INSERT INTO shipping_rates (product_category, region, base_rate, additional_item_rate) VALUES
('HEAVY_OUTERWEAR', 'USA', 8.49, 2.50),
('HEAVY_OUTERWEAR', 'Europe', 6.99, 2.40),
('HEAVY_OUTERWEAR', 'UK', 6.99, 2.40),
('HEAVY_OUTERWEAR', 'EFTA', 10.99, 2.20),
('HEAVY_OUTERWEAR', 'Canada', 10.19, 2.35),
('HEAVY_OUTERWEAR', 'Australia_NZ', 11.29, 2.05),
('HEAVY_OUTERWEAR', 'Japan', 6.99, 2.40),
('HEAVY_OUTERWEAR', 'Brazil', 5.99, 3.00),
('HEAVY_OUTERWEAR', 'Worldwide', 16.99, 8.00);

-- Insert shipping rates for AOP_LIGHT (All-over print light items)
INSERT INTO shipping_rates (product_category, region, base_rate, additional_item_rate) VALUES
('AOP_LIGHT', 'USA', 3.99, 2.00),
('AOP_LIGHT', 'Europe', 4.59, 1.45),
('AOP_LIGHT', 'UK', 4.39, 1.50),
('AOP_LIGHT', 'EFTA', 9.99, 1.10),
('AOP_LIGHT', 'Canada', 6.99, 1.95),
('AOP_LIGHT', 'Australia_NZ', 7.19, 1.30),
('AOP_LIGHT', 'Japan', 4.39, 1.50),
('AOP_LIGHT', 'Brazil', 4.49, 2.50),
('AOP_LIGHT', 'Worldwide', 11.99, 6.00);

-- Insert shipping rates for AOP_HEAVY (All-over print heavy items)
INSERT INTO shipping_rates (product_category, region, base_rate, additional_item_rate) VALUES
('AOP_HEAVY', 'USA', 7.99, 2.50),
('AOP_HEAVY', 'Europe', 6.99, 2.40),
('AOP_HEAVY', 'UK', 6.99, 2.40),
('AOP_HEAVY', 'EFTA', 10.99, 2.20),
('AOP_HEAVY', 'Canada', 9.39, 2.35),
('AOP_HEAVY', 'Australia_NZ', 11.29, 2.05),
('AOP_HEAVY', 'Japan', 6.99, 2.40),
('AOP_HEAVY', 'Brazil', 5.99, 3.00),
('AOP_HEAVY', 'Worldwide', 16.99, 8.00);

-- Insert shipping rates for AOP_PREMIUM (Windbreakers, track pants)
INSERT INTO shipping_rates (product_category, region, base_rate, additional_item_rate) VALUES
('AOP_PREMIUM', 'USA', 7.99, 7.99),
('AOP_PREMIUM', 'Europe', 8.99, 8.99),
('AOP_PREMIUM', 'UK', 8.99, 8.99),
('AOP_PREMIUM', 'EFTA', 8.99, 8.99),
('AOP_PREMIUM', 'Canada', 7.99, 7.99),
('AOP_PREMIUM', 'Australia_NZ', 7.99, 7.99),
('AOP_PREMIUM', 'Japan', 7.99, 7.99),
('AOP_PREMIUM', 'Worldwide', 8.99, 8.99);

-- Insert shipping rates for HEADWEAR (Hats, beanies, etc)
INSERT INTO shipping_rates (product_category, region, base_rate, additional_item_rate) VALUES
('HEADWEAR', 'USA', 3.99, 2.00),
('HEADWEAR', 'Europe', 4.59, 1.45),
('HEADWEAR', 'UK', 4.39, 1.50),
('HEADWEAR', 'EFTA', 9.99, 1.10),
('HEADWEAR', 'Canada', 6.99, 1.95),
('HEADWEAR', 'Australia_NZ', 7.19, 1.30),
('HEADWEAR', 'Japan', 4.39, 1.50),
('HEADWEAR', 'Brazil', 4.49, 2.50),
('HEADWEAR', 'Worldwide', 11.99, 6.00);

-- Add default rates (using BASIC_SHIRT rates as default)
INSERT INTO shipping_rates (product_category, region, base_rate, additional_item_rate) VALUES
('DEFAULT', 'USA', 4.69, 2.20),
('DEFAULT', 'Europe', 4.79, 1.45),
('DEFAULT', 'UK', 4.59, 1.50),
('DEFAULT', 'EFTA', 9.99, 1.10),
('DEFAULT', 'Canada', 8.29, 1.95),
('DEFAULT', 'Australia_NZ', 7.19, 1.30),
('DEFAULT', 'Japan', 4.39, 1.50),
('DEFAULT', 'Brazil', 4.49, 2.50),
('DEFAULT', 'Worldwide', 11.99, 6.00);

-- Add product_category to products table
ALTER TABLE products
ADD COLUMN product_category product_category NOT NULL DEFAULT 'DEFAULT';
