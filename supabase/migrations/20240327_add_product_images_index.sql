-- Add index for foreign key relationship
create index if not exists idx_product_images_product_id
  on product_images(product_id);

-- Analyze the table to update statistics
analyze product_images;
