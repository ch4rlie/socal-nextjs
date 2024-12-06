-- Function to generate slug from name
create or replace function generate_slug(name text)
returns text as $$
begin
  -- Convert to lowercase, replace spaces with hyphens, remove special characters
  return lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
end;
$$ language plpgsql;

-- Add slug column if it doesn't exist, or make it nullable
do $$ 
begin
  -- First check if the column exists
  if not exists (select 1 
    from information_schema.columns 
    where table_name = 'products' and column_name = 'slug') 
  then
    -- Add the column if it doesn't exist
    alter table products add column slug text;
  end if;

  -- Update existing products without a slug
  update products
  set slug = generate_slug(name)
  where slug is null and name is not null;

  -- Add not null constraint with a default value based on name
  alter table products 
  alter column slug set default '',
  alter column slug set not null;
end $$;
