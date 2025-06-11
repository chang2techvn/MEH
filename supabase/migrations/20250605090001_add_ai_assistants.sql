-- AI Assistants table for managing AI teaching assistants
-- This migration adds the ai_assistants table to support the AI assistants feature

-- AI Assistants table
CREATE TABLE IF NOT EXISTS public.ai_assistants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    avatar TEXT,
    model TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    capabilities TEXT[] DEFAULT '{}',
    category TEXT DEFAULT 'education' CHECK (category IN ('education', 'practice', 'assessment', 'utility')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    
    -- Usage tracking
    conversation_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    token_consumption BIGINT DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_assistants_is_active ON public.ai_assistants(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_assistants_category ON public.ai_assistants(category);
CREATE INDEX IF NOT EXISTS idx_ai_assistants_created_by ON public.ai_assistants(created_by);
CREATE INDEX IF NOT EXISTS idx_ai_assistants_created_at ON public.ai_assistants(created_at);

-- Enable RLS
ALTER TABLE public.ai_assistants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow all users to read active assistants
CREATE POLICY "Allow read access to active assistants" ON public.ai_assistants
    FOR SELECT USING (is_active = true);

-- Allow admins to manage all assistants
CREATE POLICY "Allow admin full access" ON public.ai_assistants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Allow teachers to read all assistants
CREATE POLICY "Allow teacher read access" ON public.ai_assistants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('teacher', 'admin')
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_assistants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER ai_assistants_updated_at
    BEFORE UPDATE ON public.ai_assistants
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_assistants_updated_at();

-- Insert some sample AI assistants
INSERT INTO public.ai_assistants (
    name, 
    description, 
    avatar, 
    model, 
    system_prompt, 
    capabilities, 
    category,
    is_active,
    conversation_count,
    message_count,
    token_consumption
) VALUES 
(
    'English Tutor',
    'Helps with grammar, vocabulary, and language learning',
    '/placeholder.svg?height=80&width=80',
    'GPT-4o',
    'You are an English language tutor. Help users improve their English skills through conversation, grammar correction, and vocabulary building.',
    ARRAY['grammar', 'vocabulary', 'conversation'],
    'education',
    true,
    1250,
    15780,
    3200000
),
(
    'Pronunciation Coach',
    'Provides feedback on pronunciation and speaking',
    '/placeholder.svg?height=80&width=80',
    'Gemini Pro',
    'You are a pronunciation coach. Help users improve their English pronunciation by providing feedback, tips, and exercises.',
    ARRAY['pronunciation', 'speaking', 'feedback'],
    'education',
    true,
    890,
    10250,
    1800000
),
(
    'Writing Assistant',
    'Helps with essay writing and composition',
    '/placeholder.svg?height=80&width=80',
    'Claude 3',
    'You are a writing assistant. Help users improve their writing skills by providing feedback on essays, compositions, and other written work.',
    ARRAY['writing', 'grammar', 'style'],
    'education',
    false,
    520,
    6800,
    950000
),
(
    'Conversation Partner',
    'Practice everyday conversations in English',
    '/placeholder.svg?height=80&width=80',
    'GPT-3.5 Turbo',
    'You are a conversation partner. Engage users in natural English conversations on various topics to help them practice their speaking and listening skills.',
    ARRAY['conversation', 'roleplay', 'vocabulary'],
    'practice',
    true,
    1750,
    21500,
    2800000
),
(
    'Test Preparation',
    'Helps prepare for IELTS, TOEFL, and other exams',
    '/placeholder.svg?height=80&width=80',
    'GPT-4o',
    'You are a test preparation assistant. Help users prepare for English proficiency exams like IELTS, TOEFL, and Cambridge exams with practice questions, tips, and strategies.',
    ARRAY['test-prep', 'practice-questions', 'strategies'],
    'education',
    true,
    980,
    12500,
    2100000
);
