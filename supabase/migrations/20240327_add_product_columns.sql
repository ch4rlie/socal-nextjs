-- Create products table if it doesn't exist
create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  printful_id bigint unique not null,
  active boolean default true,
  custom_images jsonb
);

-- Create product_variants table if it doesn't exist
create table if not exists product_variants (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  product_id bigint references products(printful_id) on delete cascade,
  printful_variant_id bigint unique not null,
  size text,
  color text,
  price decimal(10,2) not null,
  stock integer default 0
);
