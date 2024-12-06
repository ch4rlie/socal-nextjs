DO $$ 
DECLARE 
BEGIN
    -- Set admin role for specific user
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id IN (
        SELECT id 
        FROM auth.users 
        WHERE email = 'bajagrove@gmail.com'
    );
END $$;
