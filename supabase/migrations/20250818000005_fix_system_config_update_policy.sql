-- Fix RLS policy to allow authenticated users to update system config
-- This is needed for the upsert operation in the admin panel

-- Add policy to allow authenticated users to update active system configs
CREATE POLICY "authenticated_users_update_active_config" ON public.system_config
    FOR UPDATE USING (is_active = true AND auth.uid() IS NOT NULL)
    WITH CHECK (is_active = true AND auth.uid() IS NOT NULL);

-- Add policy to allow authenticated users to insert system configs
CREATE POLICY "authenticated_users_insert_config" ON public.system_config
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
