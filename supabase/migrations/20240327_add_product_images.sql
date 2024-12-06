-- Create product_images table if it doesn't exist
create table if not exists product_images (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  position integer default 0,
  constraint product_images_product_id_fkey
    foreign key (product_id)
    references products(id)
    on delete cascade
);
