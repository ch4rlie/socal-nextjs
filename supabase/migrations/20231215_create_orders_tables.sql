-- Create orders table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  email text not null,
  session_id text unique not null,
  amount_total numeric(10,2) not null,
  currency text not null,
  status text not null check (status in ('complete', 'canceled', 'processing')),
  shipping_address jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create order_items table
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) not null,
  product_id text not null,
  variant_id text not null,
  name text not null,
  price numeric(10,2) not null,
  quantity integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Allow users to view their own orders
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- Allow users to view their own order items
create policy "Users can view own order items"
  on public.order_items for select
  using (
    order_id in (
      select id from public.orders where user_id = auth.uid()
    )
  );

-- Allow service role to insert orders
create policy "Service role can insert orders"
  on public.orders for insert
  with check (true);

-- Allow service role to insert order items
create policy "Service role can insert order items"
  on public.order_items for insert
  with check (true);

-- Create index for faster lookups
create index orders_user_id_idx on public.orders(user_id);
create index orders_email_idx on public.orders(email);
create index orders_session_id_idx on public.orders(session_id);
create index order_items_order_id_idx on public.order_items(order_id);
