-- Fix anonymous access to system_config table
-- Ensure anonymous users can read active system configurations
-- Date: 2025-08-19

-- First, let's check and drop all existing policies to start fresh
DROP POLICY IF EXISTS "public_read_active_config" ON public.system_config;
DROP POLICY IF EXISTS "authenticated_users_read_active_config" ON public.system_config;
DROP POLICY IF EXISTS "admin_manage_system_config" ON public.system_config;
DROP POLICY IF EXISTS "Admin can manage system config" ON public.system_config;
DROP POLICY IF EXISTS "Users can read active system config" ON public.system_config;
DROP POLICY IF EXISTS "authenticated_users_update_active_config" ON public.system_config;
DROP POLICY IF EXISTS "authenticated_users_insert_config" ON public.system_config;
DROP POLICY IF EXISTS "authenticated_users_upsert_config" ON public.system_config;
DROP POLICY IF EXISTS "authenticated_users_update_config" ON public.system_config;

-- Create a single, simple policy for anonymous and authenticated users to read active configs
CREATE POLICY "allow_read_active_system_config" ON public.system_config
    FOR SELECT USING (is_active = true);

-- Create policy for admins to manage all configs
CREATE POLICY "admin_full_access_system_config" ON public.system_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Grant explicit permissions
GRANT SELECT ON public.system_config TO anon;
GRANT SELECT ON public.system_config TO authenticated;
GRANT ALL ON public.system_config TO service_role;

-- Ensure the default_assistant config exists
INSERT INTO public.system_config (config_key, config_value, description, is_active) 
VALUES (
  'default_assistant',
  '{
    "id": "hani-default",
    "name": "Hani", 
    "avatar": "https://yvsjynosfwyhvisqhasp.supabase.co/storage/v1/object/public/posts/images/825ef58d-31bc-4ad9-9c99-ed7fb15cf8a1.jfif",
    "role": "Assistant",
    "field": "Assistant",
    "prompt": "You are Hani, a friendly AI assistant specialized in English learning. You help students improve their English skills through conversation, grammar correction, vocabulary building, and providing helpful explanations. Always be encouraging, patient, and provide clear examples.",
    "model": "gemini-2.5-flash"
  }',
  'Default AI assistant configuration used in chatbox and resources pages',
  true
) ON CONFLICT (config_key) 
DO UPDATE SET
  config_value = EXCLUDED.config_value,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Test the permissions by selecting from the table
-- This should work for both anonymous and authenticated users
SELECT 'Testing anonymous access to system_config' as test_message;
SELECT config_key, config_value, is_active FROM public.system_config WHERE config_key = 'default_assistant';

COMMENT ON TABLE public.system_config IS 'System configuration table with public read access for active configs, admin-only write access';
