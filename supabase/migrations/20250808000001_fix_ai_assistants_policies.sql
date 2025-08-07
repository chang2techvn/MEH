-- Fix ai_assistants table policies to allow INSERT for authenticated users

-- Enable RLS on ai_assistants table
ALTER TABLE public.ai_assistants ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert ai_assistants
CREATE POLICY "Users can create ai_assistants" ON public.ai_assistants
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to read all ai_assistants
CREATE POLICY "Users can view ai_assistants" ON public.ai_assistants
FOR SELECT USING (true);

-- Allow users to update their own ai_assistants
CREATE POLICY "Users can update own ai_assistants" ON public.ai_assistants
FOR UPDATE USING (auth.uid() = created_by);

-- Allow users to delete their own ai_assistants
CREATE POLICY "Users can delete own ai_assistants" ON public.ai_assistants
FOR DELETE USING (auth.uid() = created_by);

-- Grant necessary permissions
GRANT INSERT ON public.ai_assistants TO authenticated;
GRANT SELECT ON public.ai_assistants TO authenticated;
GRANT UPDATE ON public.ai_assistants TO authenticated;
GRANT DELETE ON public.ai_assistants TO authenticated;
