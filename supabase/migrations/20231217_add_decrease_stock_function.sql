create or replace function decrease_product_stock(p_id uuid, quantity int)
returns void
language plpgsql
security definer
as $$
begin
  update products
  set in_stock = case
    when (select count(*) from products where id = p_id and in_stock = true) > 0 then true
    else false
  end
  where id = p_id;
end;
$$;
