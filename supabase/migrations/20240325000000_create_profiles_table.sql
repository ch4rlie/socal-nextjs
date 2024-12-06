-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(full_name) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Create policies
-- Allow users to view their own profile
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Allow users to insert their own profile
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Create a trigger to create a profile entry when a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, updated_at)
  values (new.id, '', now());
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
