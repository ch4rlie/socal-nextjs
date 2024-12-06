-- Add active column to products if it doesn't exist
do $$ 
begin
  if not exists (select 1 
    from information_schema.columns 
    where table_name = 'products' and column_name = 'active') 
  then
    alter table products add column active boolean default true;
  end if;
end $$;
