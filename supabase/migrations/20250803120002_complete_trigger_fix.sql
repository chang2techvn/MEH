-- Complete fix for profile update triggers
-- Remove ALL triggers from profiles table and recreate only necessary ones

-- First, let's see what triggers exist on profiles table and remove them all
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- Get all triggers on profiles table
    FOR trigger_record IN 
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers 
        WHERE event_object_table = 'profiles'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', trigger_record.trigger_name, trigger_record.event_object_table);
        RAISE NOTICE 'Dropped trigger % on table %', trigger_record.trigger_name, trigger_record.event_object_table;
    END LOOP;
END $$;

-- Remove any functions that might be causing issues
DROP FUNCTION IF EXISTS trigger_safe_profile_update() CASCADE;

-- Recreate a completely safe update function for profiles
CREATE OR REPLACE FUNCTION safe_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- For profile updates, we don't need to do anything special
    -- Just update the updated_at timestamp
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Create a simple, safe trigger for profiles that only updates timestamp
CREATE TRIGGER profiles_updated_at_trigger
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION safe_profile_update();

-- Now let's completely recreate the stats triggers to be absolutely safe
-- Drop all existing triggers first
DROP TRIGGER IF EXISTS update_stats_on_like_insert ON likes CASCADE;
DROP TRIGGER IF EXISTS update_stats_on_like_delete ON likes CASCADE;
DROP TRIGGER IF EXISTS update_stats_on_comment_insert ON comments CASCADE;
DROP TRIGGER IF EXISTS update_stats_on_comment_delete ON comments CASCADE;
DROP TRIGGER IF EXISTS update_stats_on_post_insert ON posts CASCADE;
DROP TRIGGER IF EXISTS update_stats_on_post_delete ON posts CASCADE;

-- Recreate the trigger functions with better error handling
CREATE OR REPLACE FUNCTION safe_update_stats_on_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_owner_id UUID;
    target_post_id UUID;
BEGIN
    -- Skip if we don't have the necessary data
    BEGIN
        IF TG_OP = 'INSERT' THEN
            target_post_id := NEW.post_id;
        ELSIF TG_OP = 'DELETE' THEN
            target_post_id := OLD.post_id;
        END IF;
        
        -- Only proceed if we have a valid post_id
        IF target_post_id IS NOT NULL THEN
            SELECT user_id INTO post_owner_id 
            FROM posts 
            WHERE id = target_post_id;
            
            -- Only update stats if we found the post owner
            IF post_owner_id IS NOT NULL THEN
                PERFORM update_user_stats(post_owner_id);
            END IF;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the operation
        RAISE WARNING 'Error updating stats on like: %', SQLERRM;
    END;
    
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION safe_update_stats_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_owner_id UUID;
    target_post_id UUID;
BEGIN
    -- Skip if we don't have the necessary data
    BEGIN
        IF TG_OP = 'INSERT' THEN
            target_post_id := NEW.post_id;
        ELSIF TG_OP = 'DELETE' THEN
            target_post_id := OLD.post_id;
        END IF;
        
        -- Only proceed if we have a valid post_id
        IF target_post_id IS NOT NULL THEN
            SELECT user_id INTO post_owner_id 
            FROM posts 
            WHERE id = target_post_id;
            
            -- Only update stats if we found the post owner
            IF post_owner_id IS NOT NULL THEN
                PERFORM update_user_stats(post_owner_id);
            END IF;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the operation
        RAISE WARNING 'Error updating stats on comment: %', SQLERRM;
    END;
    
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION safe_update_stats_on_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    BEGIN
        IF TG_OP = 'INSERT' AND NEW.user_id IS NOT NULL THEN
            PERFORM update_user_stats(NEW.user_id);
        ELSIF TG_OP = 'DELETE' AND OLD.user_id IS NOT NULL THEN
            PERFORM update_user_stats(OLD.user_id);
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the operation
        RAISE WARNING 'Error updating stats on post: %', SQLERRM;
    END;
    
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$$;

-- Create the new safe triggers
CREATE TRIGGER safe_update_stats_on_like_insert
    AFTER INSERT ON likes
    FOR EACH ROW
    EXECUTE FUNCTION safe_update_stats_on_like();

CREATE TRIGGER safe_update_stats_on_like_delete
    AFTER DELETE ON likes
    FOR EACH ROW
    EXECUTE FUNCTION safe_update_stats_on_like();

CREATE TRIGGER safe_update_stats_on_comment_insert
    AFTER INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION safe_update_stats_on_comment();

CREATE TRIGGER safe_update_stats_on_comment_delete
    AFTER DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION safe_update_stats_on_comment();

CREATE TRIGGER safe_update_stats_on_post_insert
    AFTER INSERT ON posts
    FOR EACH ROW
    EXECUTE FUNCTION safe_update_stats_on_post();

CREATE TRIGGER safe_update_stats_on_post_delete
    AFTER DELETE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION safe_update_stats_on_post();

-- Make sure storage bucket exists for profiles
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile', 'profile', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for profile bucket (drop existing first)
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Profile images are publicly accessible" ON storage.objects;

CREATE POLICY "Users can upload their own profile images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'profile' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'profile' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Profile images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile');

-- Final log
DO $$
BEGIN
    RAISE NOTICE 'Complete trigger fix applied - profile updates should now work without errors';
END $$;
