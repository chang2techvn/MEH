-- Fix account status to be 'pending' by default for new registrations
-- Date: 2025-08-08

-- First, update any existing users with 'approved' status to 'pending' 
-- (only if they were just created and not manually approved)
UPDATE public.users 
SET 
    account_status = 'pending',
    updated_at = NOW()
WHERE 
    account_status = 'approved' 
    AND approved_by IS NULL 
    AND approved_at IS NULL
    AND created_at > NOW() - INTERVAL '1 hour'; -- Only recent registrations

-- Update the trigger function to ensure account_status is always 'pending'
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
            account_status,  -- This should ALWAYS be 'pending' for new users
            joined_at,
            created_at, 
            updated_at
        )
        VALUES (
            NEW.id,
            NEW.email,
            user_name,
            'student',
            true,  -- Keep active but pending approval
            0,
            1,
            0,
            0,
            'pending',  -- Explicitly set to pending
            NEW.created_at,
            NEW.created_at,
            NOW()
        );
        
        RAISE NOTICE 'Successfully created user record for: % with status: pending', NEW.email;
        
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

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Fixed account status to always be pending for new user registrations';
END $$;
