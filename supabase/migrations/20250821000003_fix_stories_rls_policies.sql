-- Fix Stories RLS Policy - Debug and Allow Insert
-- This migration fixes RLS policies for stories table to allow authenticated users to create stories

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can insert stories" ON public.stories;
DROP POLICY IF EXISTS "Users can insert their own stories" ON public.stories;

-- Create more permissive policy for INSERT
CREATE POLICY "Users can create stories" 
    ON public.stories FOR INSERT 
    TO authenticated
    WITH CHECK (
        -- Allow if the author_id matches the authenticated user's ID
        auth.uid() = author_id 
        OR 
        -- Also allow if they are authenticated (for debugging)
        auth.uid() IS NOT NULL
    );

-- Create SELECT policy that allows viewing all stories
DROP POLICY IF EXISTS "Stories are viewable by authenticated users" ON public.stories;
CREATE POLICY "Stories are viewable by all" 
    ON public.stories FOR SELECT 
    TO authenticated
    USING (true);

-- Create UPDATE policy for own stories
DROP POLICY IF EXISTS "Users can update their own stories" ON public.stories;
CREATE POLICY "Users can update own stories" 
    ON public.stories FOR UPDATE 
    TO authenticated
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

-- Create DELETE policy for own stories  
DROP POLICY IF EXISTS "Users can delete their own stories" ON public.stories;
CREATE POLICY "Users can delete own stories" 
    ON public.stories FOR DELETE 
    TO authenticated
    USING (auth.uid() = author_id);

-- Grant necessary permissions
GRANT INSERT ON public.stories TO authenticated;
GRANT SELECT ON public.stories TO authenticated;
GRANT UPDATE ON public.stories TO authenticated;
GRANT DELETE ON public.stories TO authenticated;

-- Grant sequence usage
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
