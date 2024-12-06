-- Add columns to products table if they don't exist
do $$ 
begin
  -- Add printful_id column
  if not exists (select 1 
    from information_schema.columns 
    where table_name = 'products' and column_name = 'printful_id') 
  then
    alter table products add column printful_id bigint;
    alter table products add constraint products_printful_id_unique unique (printful_id);
  end if;

  -- Add name column
  if not exists (select 1 
    from information_schema.columns 
    where table_name = 'products' and column_name = 'name') 
  then
    alter table products add column name text;
  end if;

  -- Add description column
  if not exists (select 1 
    from information_schema.columns 
    where table_name = 'products' and column_name = 'description') 
  then
    alter table products add column description text;
  end if;
end $$;

-- Create product_variants table if it doesn't exist
create table if not exists product_variants (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  product_id uuid references products(id) on delete cascade,
  printful_variant_id bigint unique,
  size text,
  color text,
  price decimal(10,2),
  stock integer default 0
);
