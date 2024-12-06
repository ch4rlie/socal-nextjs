-- Enable RLS
alter table product_images enable row level security;

-- Create policies
create policy "Enable read access for all users"
  on product_images
  for select
  using (true);

create policy "Enable insert for authenticated users only"
  on product_images
  for insert
  with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only"
  on product_images
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users only"
  on product_images
  for delete
  using (auth.role() = 'authenticated');
