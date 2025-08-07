-- Fix profile foreign key constraint issue during user registration
-- Date: 2025-08-08

-- First, let's completely redesign the trigger to handle the foreign key constraint properly

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_update() CASCADE;

-- Create a simpler, more robust user creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    user_name TEXT;
    user_exists BOOLEAN := false;
BEGIN
    RAISE NOTICE 'Processing user registration for: % (ID: %)', NEW.email, NEW.id;
    
    -- Check if user already exists
    SELECT EXISTS(SELECT 1 FROM public.users WHERE id = NEW.id) INTO user_exists;
    
    IF user_exists THEN
        RAISE NOTICE 'User % already exists, skipping creation', NEW.email;
        RETURN NEW;
    END IF;
    
    -- Extract name from metadata
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'name', 
        NEW.raw_user_meta_data->>'full_name', 
        SPLIT_PART(NEW.email, '@', 1)
    );
    
    -- First, create the user record (this MUST succeed for profiles to work)
    BEGIN
        INSERT INTO public.users (
            id, 
            email, 
            name,
            role, 
            is_active,
            experience_points,
            level,
            points,
            streak_days,
            account_status,
            joined_at,
            created_at, 
            updated_at
        )
        VALUES (
            NEW.id,
            NEW.email,
            user_name,
            'student',
            true,
            0,
            1,
            0,
            0,
            'pending',
            NEW.created_at,
            NEW.created_at,
            NOW()
        );
        
        RAISE NOTICE 'Successfully created user record for: %', NEW.email;
        
    EXCEPTION
        WHEN unique_violation THEN
            RAISE WARNING 'User % already exists (race condition), updating instead', NEW.email;
            UPDATE public.users 
            SET 
                name = user_name,
                updated_at = NOW()
            WHERE id = NEW.id;
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Failed to create user record for %: % (SQLSTATE: %)', NEW.email, SQLERRM, SQLSTATE;
    END;
    
    -- Now create the profile record (only after user exists)
    BEGIN
        INSERT INTO public.profiles (
            user_id,
            full_name,
            avatar_url,
            role,
            created_at,
            updated_at
        )
        VALUES (
            NEW.id,
            user_name,
            NEW.raw_user_meta_data->>'avatar_url',
            'student',
            NEW.created_at,
            NOW()
        );
        
        RAISE NOTICE 'Successfully created profile record for: %', NEW.email;
        
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE 'Profile already exists for: %, updating instead', NEW.email;
            UPDATE public.profiles 
            SET 
                full_name = user_name,
                avatar_url = NEW.raw_user_meta_data->>'avatar_url',
                updated_at = NOW()
            WHERE user_id = NEW.id;
        WHEN foreign_key_violation THEN
            RAISE WARNING 'Foreign key violation for profile %: %', NEW.email, SQLERRM;
            -- This should not happen since we just created the user, but log it
        WHEN OTHERS THEN
            RAISE WARNING 'Error creating profile for %: % (SQLSTATE: %)', NEW.email, SQLERRM, SQLSTATE;
            -- Don't fail the entire registration process for profile issues
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a simple update function
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger AS $$
DECLARE
    user_name TEXT;
BEGIN
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'name', 
        NEW.raw_user_meta_data->>'full_name', 
        SPLIT_PART(NEW.email, '@', 1)
    );
    
    -- Update users table
    UPDATE public.users 
    SET 
        email = NEW.email,
        name = user_name,
        updated_at = NOW()
    WHERE id = NEW.id;
    
    -- Update profiles table
    UPDATE public.profiles 
    SET 
        full_name = user_name,
        avatar_url = NEW.raw_user_meta_data->>'avatar_url',
        updated_at = NOW()
    WHERE user_id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW 
    WHEN (OLD.email IS DISTINCT FROM NEW.email OR OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
    EXECUTE FUNCTION public.handle_user_update();

-- Ensure proper permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.users TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;

-- Make sure RLS policies are correct for profiles as well
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing profile policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow trigger operations" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;

-- Create new profile policies
CREATE POLICY "Allow trigger operations on profiles" 
ON public.profiles 
FOR ALL 
TO supabase_auth_admin
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated, anon
USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role full access on profiles" 
ON public.profiles 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Grant permissions for profiles
GRANT ALL ON public.profiles TO authenticated, anon, service_role;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Fixed profile foreign key constraint issue for user registration';
END $$;
