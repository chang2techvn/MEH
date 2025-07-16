-- Add UPDATE policy for story_views to support upsert operations
-- This is needed for reaction updates and reply updates

-- Add UPDATE policy for story_views
CREATE POLICY "Authenticated users can update their own story views" 
    ON public.story_views FOR UPDATE 
    TO authenticated
    USING (auth.uid() = viewer_id)
    WITH CHECK (auth.uid() = viewer_id);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.story_views TO authenticated;

-- Ensure the constraint exists for upsert to work
-- The constraint should already exist from previous migration
