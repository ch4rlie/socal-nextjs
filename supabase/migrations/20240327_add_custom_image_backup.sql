-- Create custom_image_backup table
create table if not exists custom_image_backup (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade,
  custom_images jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add custom_images column to products if it doesn't exist
do $$ 
begin
  if not exists (select 1 
    from information_schema.columns 
    where table_name = 'products' and column_name = 'custom_images') 
  then
    alter table products add column custom_images jsonb;
  end if;
end $$;
