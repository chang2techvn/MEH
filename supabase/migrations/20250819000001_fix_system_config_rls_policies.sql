-- Fix system_config RLS policies to allow public read access for active configs
-- Only admins can insert/update/delete configs
-- Date: 2025-08-19

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can manage system config" ON public.system_config;
DROP POLICY IF EXISTS "Users can read active system config" ON public.system_config;
DROP POLICY IF EXISTS "authenticated_users_update_active_config" ON public.system_config;
DROP POLICY IF EXISTS "authenticated_users_insert_config" ON public.system_config;
DROP POLICY IF EXISTS "authenticated_users_read_active_config" ON public.system_config;
DROP POLICY IF EXISTS "admin_manage_system_config" ON public.system_config;
DROP POLICY IF EXISTS "public_read_active_config" ON public.system_config;
DROP POLICY IF EXISTS "authenticated_users_upsert_config" ON public.system_config;
DROP POLICY IF EXISTS "authenticated_users_update_config" ON public.system_config;

-- Create new, more permissive policies
-- Allow everyone (including anonymous users) to read active system configs
CREATE POLICY "public_read_active_config" ON public.system_config
    FOR SELECT USING (is_active = true);

-- Allow admins to manage all system configs (using profiles table for role check)
CREATE POLICY "admin_manage_system_config" ON public.system_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- No insert/update policies for regular users - only admins can modify configs

-- Ensure the default_assistant config exists and is active
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

-- Grant permissions
-- Allow everyone to read (including anonymous users)
GRANT SELECT ON public.system_config TO anon;
GRANT SELECT ON public.system_config TO authenticated;

-- Only service_role can insert/update (for admin operations)
GRANT INSERT, UPDATE, DELETE ON public.system_config TO service_role;

-- Add comment
COMMENT ON TABLE public.system_config IS 'System configuration table - Public read access for active configs, only admins can modify';
