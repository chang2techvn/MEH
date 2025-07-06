-- Auto-sync auth.users with public.users
-- This migration creates a trigger to automatically create public.users records
-- when new users sign up through authentication

-- Create or replace function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert new user into public.users table
  INSERT INTO public.users (
    id,
    email,
    name,
    avatar,
    created_at,
    updated_at,
    is_active,
    role,
    preferences,
    experience_points,
    level,
    streak_days,
    points
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id::text
    ),
    NEW.created_at,
    NEW.updated_at,
    true,
    'student',
    '{}',
    0,
    1,
    0,
    0
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name),
    avatar = COALESCE(EXCLUDED.avatar, public.users.avatar),
    updated_at = EXCLUDED.updated_at;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also handle updates (when user profile changes)
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (
    OLD.email IS DISTINCT FROM NEW.email OR
    OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data
  )
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.users TO supabase_auth_admin;

-- Test the function with existing auth users (sync existing users)
DO $$
DECLARE
  auth_user RECORD;
BEGIN
  FOR auth_user IN 
    SELECT * FROM auth.users 
    WHERE NOT EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.users.id
    )
  LOOP
    PERFORM public.handle_new_user() FROM (SELECT auth_user.*) AS NEW;
  END LOOP;
END;
$$;

-- Verify sync worked
SELECT 
  'Total auth users:' as info, 
  count(*) as count 
FROM auth.users
UNION ALL
SELECT 
  'Total public users:' as info, 
  count(*) as count 
FROM public.users
UNION ALL
SELECT 
  'Synced users:' as info, 
  count(*) as count 
FROM auth.users a 
INNER JOIN public.users p ON a.id = p.id;
