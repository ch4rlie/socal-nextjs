-- Add Google Product Category fields
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS google_product_category text,
ADD COLUMN IF NOT EXISTS google_product_category_id integer;

-- Add comment to explain the fields
COMMENT ON COLUMN public.products.google_product_category IS 'Google Shopping category taxonomy string';
COMMENT ON COLUMN public.products.google_product_category_id IS 'Google Shopping category numeric ID';

-- Create an index on google_product_category_id for better query performance
CREATE INDEX IF NOT EXISTS idx_products_google_category_id ON public.products(google_product_category_id);
