-- Drop existing table and policies if they exist
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    billing_address JSONB,
    shipping_address JSONB,
    email TEXT,
    phone TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    last_sign_in TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Anyone can view active profiles" ON profiles;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Drop existing foreign key constraint if it exists
ALTER TABLE product_reviews DROP CONSTRAINT IF EXISTS fk_product_reviews_user;

-- Add foreign key to product_reviews
ALTER TABLE product_reviews
ADD CONSTRAINT fk_product_reviews_user
FOREIGN KEY (user_id) REFERENCES profiles(id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
