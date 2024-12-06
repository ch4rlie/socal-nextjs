-- Create an enum for user roles if it doesn't exist
do $$ 
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('user', 'admin');
  end if;
end $$;

-- Update role column to use the enum type if it exists
do $$
begin
  if exists (
    select 1 
    from information_schema.columns 
    where table_schema = 'auth' 
    and table_name = 'users' 
    and column_name = 'role'
  ) then
    -- Column exists, alter its type if needed
    alter table auth.users 
    alter column role type user_role 
    using role::text::user_role;
  else
    -- Column doesn't exist, add it
    alter table auth.users 
    add column role user_role not null default 'user';
  end if;
end $$;

-- Create a function to set initial admin user
create or replace function set_initial_admin()
returns void
language plpgsql
security definer
as $$
declare
  admin_email text := 'bajagrove@gmail.com'; -- Your email
begin
  update auth.users
  set role = 'admin'
  where email = admin_email;
end;
$$;

-- Create RLS policies for users table if they don't exist
do $$
begin
  if not exists (
    select 1 
    from pg_policies 
    where schemaname = 'auth' 
    and tablename = 'users' 
    and policyname = 'Users can view their own data'
  ) then
    create policy "Users can view their own data"
      on auth.users
      for select
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1 
    from pg_policies 
    where schemaname = 'auth' 
    and tablename = 'users' 
    and policyname = 'Only admins can update user roles'
  ) then
    create policy "Only admins can update user roles"
      on auth.users
      for update
      using (auth.jwt() ->> 'role' = 'admin');
  end if;
end $$;

-- Enable RLS on users table if not already enabled
alter table auth.users force row level security;

-- Set initial admin immediately
select set_initial_admin();
