-- Better fix: Add proper error handling and logging to handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    RAISE NOTICE 'Creating public records for new user: %', NEW.email;
    
    -- Insert into public.users with better error handling
    BEGIN
        INSERT INTO public.users (id, email, role, created_at, updated_at)
        VALUES (
            NEW.id,
            NEW.email,
            'student',
            NEW.created_at,
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            updated_at = NOW();
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Error inserting into users table: %', SQLERRM;
            -- Don't fail the entire function, continue to profiles
    END;

    -- Insert into profiles with conflict handling and error handling
    BEGIN
        INSERT INTO profiles (
            user_id,
            username,
            full_name,
            avatar_url,
            bio,
            native_language,
            target_language,
            proficiency_level,
            timezone,
            created_at,
            updated_at
        )
        VALUES (
            NEW.id,
            LOWER(SPLIT_PART(NEW.email, '@', 1)),
            INITCAP(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', ' ')),
            '/placeholder-user.jpg',
            'Learning English together!',
            'English',
            'English',
            'beginner',
            'UTC',
            NEW.created_at,
            NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            username = EXCLUDED.username,
            full_name = EXCLUDED.full_name,
            updated_at = NOW();
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Error inserting into profiles table: %', SQLERRM;
            -- Don't fail the entire function
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
