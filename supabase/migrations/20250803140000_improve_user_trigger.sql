-- Improve handle_new_user function to prevent 409 conflicts
-- This fixes the user creation trigger to be more robust

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    user_exists BOOLEAN := false;
    profile_exists BOOLEAN := false;
BEGIN
    RAISE NOTICE 'Handling user creation/update for: %', NEW.email;
    
    -- Check if user already exists
    SELECT EXISTS(SELECT 1 FROM public.users WHERE id = NEW.id) INTO user_exists;
    
    -- Handle public.users record
    IF NOT user_exists THEN
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
                joined_at,
                created_at, 
                updated_at
            )
            VALUES (
                NEW.id,
                NEW.email,
                COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
                'student',
                true,
                0,
                1,
                0,
                0,
                NEW.created_at,
                NEW.created_at,
                NOW()
            );
            RAISE NOTICE 'Created new user record for: %', NEW.email;
        EXCEPTION
            WHEN unique_violation THEN
                -- User was created by another process, just update non-conflicting fields
                UPDATE public.users 
                SET 
                    name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', name),
                    updated_at = NOW()
                WHERE id = NEW.id;
                RAISE NOTICE 'User already exists, updated record for: %', NEW.email;
            WHEN OTHERS THEN
                RAISE WARNING 'Error creating user record for %: %', NEW.email, SQLERRM;
        END;
    ELSE
        -- Update existing user (only safe fields, not email to avoid constraint violation)
        UPDATE public.users 
        SET 
            name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', name),
            updated_at = NOW()
        WHERE id = NEW.id;
        RAISE NOTICE 'Updated existing user record for: %', NEW.email;
    END IF;

    -- Check if profile already exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE user_id = NEW.id) INTO profile_exists;
    
    -- Handle profiles record
    IF NOT profile_exists THEN
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
                level,
                streak_days,
                experience_points,
                total_posts,
                total_likes,
                total_comments,
                completed_challenges,
                role,
                created_at,
                updated_at
            )
            VALUES (
                NEW.id,
                LOWER(SPLIT_PART(NEW.email, '@', 1)),
                COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', INITCAP(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', ' '))),
                COALESCE(NEW.raw_user_meta_data->>'avatar_url', '/placeholder-user.jpg'),
                'Learning English together!',
                'English',
                'English',
                'beginner',
                'UTC',
                1,
                0,
                0,
                0,
                0,
                0,
                0,
                'student',
                NEW.created_at,
                NOW()
            );
            RAISE NOTICE 'Created new profile record for: %', NEW.email;
        EXCEPTION
            WHEN unique_violation THEN
                -- Profile was created by another process, just update basic info safely
                UPDATE profiles 
                SET 
                    full_name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', full_name),
                    avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', avatar_url),
                    updated_at = NOW()
                WHERE user_id = NEW.id;
                RAISE NOTICE 'Profile already exists, updated record for: %', NEW.email;
            WHEN OTHERS THEN
                RAISE WARNING 'Error creating profile record for %: %', NEW.email, SQLERRM;
        END;
    ELSE
        -- Update existing profile basic info only (don't overwrite user preferences)
        UPDATE profiles 
        SET 
            full_name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', full_name),
            avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', avatar_url),
            updated_at = NOW()
        WHERE user_id = NEW.id;
        RAISE NOTICE 'Updated existing profile record for: %', NEW.email;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also create a more robust user update function
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger AS $$
BEGIN
    -- Only update if email actually changed
    IF OLD.email IS DISTINCT FROM NEW.email THEN
        -- Don't update email in users table due to unique constraint - Supabase handles this
        -- Just update name if metadata changed
        UPDATE public.users 
        SET 
            name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', name),
            updated_at = NOW()
        WHERE id = NEW.id;
        
        -- Update profile info if available
        UPDATE profiles 
        SET 
            full_name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', full_name),
            avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', avatar_url),
            updated_at = NOW()
        WHERE user_id = NEW.id;
        
        RAISE NOTICE 'Updated user metadata for: %', NEW.email;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate triggers to ensure they use the improved functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW 
    WHEN (OLD.email IS DISTINCT FROM NEW.email OR OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
    EXECUTE FUNCTION public.handle_user_update();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.users TO supabase_auth_admin;
GRANT ALL ON profiles TO supabase_auth_admin;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Improved user creation triggers have been deployed';
END $$;
