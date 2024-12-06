-- Create products table
create table public.products (
  id text primary key, -- Using Printful's product ID as primary key
  name text not null,
  description text,
  thumbnail_url text,
  custom_thumbnail_url text, -- For storing our custom image URL
  retail_price numeric(10,2),
  currency text default 'USD',
  is_active boolean default true,
  -- SEO fields
  meta_title text,
  meta_description text,
  meta_keywords text[],
  canonical_url text,
  og_title text,
  og_description text,
  og_image_url text,
  structured_data jsonb,
  google_product_category text, -- Google Shopping category taxonomy
  google_product_category_id integer, -- Google Shopping category ID
  slug text unique,
  printful_sync_timestamp timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create product variants table
create table public.product_variants (
  id text primary key, -- Using Printful's variant ID as primary key
  product_id text references public.products(id) on delete cascade,
  name text not null,
  size text,
  color text,
  thumbnail_url text,
  custom_thumbnail_url text, -- For storing our custom image URL
  retail_price numeric(10,2) not null,
  currency text default 'USD',
  is_active boolean default true,
  printful_sync_timestamp timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create product images table for additional product images
create table public.product_images (
  id uuid default gen_random_uuid() primary key,
  product_id text references public.products(id) on delete cascade,
  variant_id text references public.product_variants(id) on delete cascade,
  image_url text not null,
  custom_image_url text, -- For storing our custom image URL
  position integer default 0,
  is_thumbnail boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add RLS policies
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;

-- Allow public read access to products and variants
create policy "Allow public read access to products"
  on public.products for select
  using (true);

create policy "Allow public read access to product variants"
  on public.product_variants for select
  using (true);

create policy "Allow public read access to product images"
  on public.product_images for select
  using (true);

-- Allow authenticated users with admin role to modify products
create policy "Allow admin users to modify products"
  on public.products for all
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Allow admin users to modify product variants"
  on public.product_variants for all
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Allow admin users to modify product images"
  on public.product_images for all
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- Create indexes
create index products_is_active_idx on public.products(is_active);
create index product_variants_product_id_idx on public.product_variants(product_id);
create index product_variants_is_active_idx on public.product_variants(is_active);
create index product_images_product_id_idx on public.product_images(product_id);
create index product_images_variant_id_idx on public.product_images(variant_id);

-- Create function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updating updated_at
create trigger update_products_updated_at
  before update on public.products
  for each row
  execute function public.update_updated_at_column();

create trigger update_product_variants_updated_at
  before update on public.product_variants
  for each row
  execute function public.update_updated_at_column();

create trigger update_product_images_updated_at
  before update on public.product_images
  for each row
  execute function public.update_updated_at_column();
