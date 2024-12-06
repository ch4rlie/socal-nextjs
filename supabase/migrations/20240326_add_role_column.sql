-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Set default role as 'user' for existing profiles
UPDATE profiles 
SET role = 'user' 
WHERE role IS NULL;
