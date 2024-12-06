-- Update product_variants table schema
do $$ 
begin
  -- First, check if we need to modify the product_id column
  if exists (
    select 1
    from information_schema.columns
    where table_name = 'product_variants' 
    and column_name = 'product_id' 
    and data_type != 'uuid'
  ) then
    -- Drop the existing foreign key constraint if it exists
    alter table product_variants drop constraint if exists product_variants_product_id_fkey;
    
    -- Drop any existing data in the column
    update product_variants set product_id = null;
    
    -- Then alter the column type
    alter table product_variants 
    alter column product_id type uuid using product_id::uuid;

    -- Re-add the foreign key constraint
    alter table product_variants
    add constraint product_variants_product_id_fkey
    foreign key (product_id) references products(id) on delete cascade;
  end if;

  -- Ensure all required columns exist with correct types
  -- Add printful_variant_id if it doesn't exist
  if not exists (
    select 1 
    from information_schema.columns 
    where table_name = 'product_variants' and column_name = 'printful_variant_id'
  ) then
    alter table product_variants add column printful_variant_id bigint;
    -- Add unique constraint if it doesn't exist
    if not exists (
      select 1
      from information_schema.constraint_column_usage
      where table_name = 'product_variants' 
      and column_name = 'printful_variant_id'
      and constraint_name = 'product_variants_printful_variant_id_key'
    ) then
      alter table product_variants 
      add constraint product_variants_printful_variant_id_key unique (printful_variant_id);
    end if;
  end if;

  -- Add size if it doesn't exist
  if not exists (
    select 1 
    from information_schema.columns 
    where table_name = 'product_variants' and column_name = 'size'
  ) then
    alter table product_variants add column size text;
  end if;

  -- Add color if it doesn't exist
  if not exists (
    select 1 
    from information_schema.columns 
    where table_name = 'product_variants' and column_name = 'color'
  ) then
    alter table product_variants add column color text;
  end if;

  -- Add price if it doesn't exist
  if not exists (
    select 1 
    from information_schema.columns 
    where table_name = 'product_variants' and column_name = 'price'
  ) then
    alter table product_variants add column price decimal(10,2);
  end if;

  -- Add stock if it doesn't exist
  if not exists (
    select 1 
    from information_schema.columns 
    where table_name = 'product_variants' and column_name = 'stock'
  ) then
    alter table product_variants add column stock integer default 0;
  end if;

end $$;
