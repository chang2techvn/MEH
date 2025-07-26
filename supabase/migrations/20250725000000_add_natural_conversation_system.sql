-- Natural Conversation System for Multi-AI Chat
-- This migration adds support for natural group conversations with AI personalities

-- Enhance ai_assistants table for natural conversation support
ALTER TABLE public.ai_assistants 
ADD COLUMN IF NOT EXISTS personality_traits TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS response_threshold DECIMAL(3,2) DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS field TEXT DEFAULT 'General',
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Assistant',
ADD COLUMN IF NOT EXISTS experience TEXT DEFAULT 'Professional',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create natural conversation sessions table
CREATE TABLE IF NOT EXISTS public.natural_conversation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT,
    conversation_mode TEXT DEFAULT 'natural_group' CHECK (conversation_mode IN ('natural_group', 'structured', 'mixed')),
    session_settings JSONB DEFAULT '{
        "allow_ai_interruptions": true,
        "allow_ai_questions": true,
        "topic_drift_allowed": true,
        "max_ai_participants": 4,
        "response_timing": "natural"
    }'::jsonb,
    active_ai_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Create natural conversation messages table (enhanced messages system)
CREATE TABLE IF NOT EXISTS public.natural_conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.natural_conversation_sessions(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    ai_assistant_id UUID REFERENCES public.ai_assistants(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'ai_response', 'ai_question', 'ai_interaction')),
    response_type TEXT CHECK (response_type IN ('direct_answer', 'ai_to_ai_question', 'question_user', 'agreement', 'disagreement', 'interrupt', 'topic_shift', 'build_on_previous', 'natural_response')),
    conversation_intent TEXT CHECK (conversation_intent IN ('answer', 'clarify', 'engage', 'challenge', 'support', 'redirect')),
    interaction_type TEXT CHECK (interaction_type IN ('user_to_ai', 'ai_to_user', 'ai_to_ai', 'system')),
    target_ai_id UUID REFERENCES public.ai_assistants(id),
    vocabulary JSONB DEFAULT '[]'::jsonb,
    confidence_score DECIMAL(3,2),
    naturalness_score DECIMAL(3,2),
    processing_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_sender CHECK (
        (sender_id IS NOT NULL AND ai_assistant_id IS NULL) OR 
        (sender_id IS NULL AND ai_assistant_id IS NOT NULL)
    )
);

-- Create AI interactions tracking table
CREATE TABLE IF NOT EXISTS public.ai_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.natural_conversation_sessions(id) ON DELETE CASCADE,
    initiating_ai_id UUID NOT NULL REFERENCES public.ai_assistants(id) ON DELETE CASCADE,
    target_ai_id UUID NOT NULL REFERENCES public.ai_assistants(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('question', 'agreement', 'disagreement', 'clarification', 'build_on', 'interrupt')),
    trigger_message_id UUID REFERENCES public.natural_conversation_messages(id),
    response_message_id UUID REFERENCES public.natural_conversation_messages(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation flow tracking table
CREATE TABLE IF NOT EXISTS public.conversation_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.natural_conversation_sessions(id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES public.natural_conversation_messages(id) ON DELETE CASCADE,
    current_topic TEXT,
    topic_stability DECIMAL(3,2),
    engagement_level DECIMAL(3,2),
    naturalness_score DECIMAL(3,2),
    active_participants TEXT[] DEFAULT '{}',
    conversation_flow_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI relationship matrix table (for learning interaction patterns)
CREATE TABLE IF NOT EXISTS public.ai_relationship_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ai1_id UUID NOT NULL REFERENCES public.ai_assistants(id) ON DELETE CASCADE,
    ai2_id UUID NOT NULL REFERENCES public.ai_assistants(id) ON DELETE CASCADE,
    interaction_count INTEGER DEFAULT 0,
    agreement_ratio DECIMAL(3,2) DEFAULT 0.5,
    collaboration_score DECIMAL(3,2) DEFAULT 0.5,
    topic_overlap DECIMAL(3,2) DEFAULT 0.0,
    communication_style TEXT DEFAULT 'neutral',
    last_interaction_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure no self-relationships and unique pairs
    CONSTRAINT no_self_relationship CHECK (ai1_id != ai2_id)
);

-- Create vocabulary learning tracking table
CREATE TABLE IF NOT EXISTS public.vocabulary_learning (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.natural_conversation_sessions(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.natural_conversation_messages(id) ON DELETE CASCADE,
    term TEXT NOT NULL,
    pronunciation TEXT,
    meaning TEXT NOT NULL,
    example TEXT,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    category TEXT,
    source_ai_id UUID REFERENCES public.ai_assistants(id),
    is_learned BOOLEAN DEFAULT false,
    learning_count INTEGER DEFAULT 1,
    last_reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_term UNIQUE (user_id, term)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_natural_conversation_sessions_user_id ON public.natural_conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_natural_conversation_sessions_active ON public.natural_conversation_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_natural_conversation_messages_session_id ON public.natural_conversation_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_natural_conversation_messages_sender ON public.natural_conversation_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_natural_conversation_messages_ai ON public.natural_conversation_messages(ai_assistant_id);
CREATE INDEX IF NOT EXISTS idx_natural_conversation_messages_created_at ON public.natural_conversation_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_session ON public.ai_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_initiating_ai ON public.ai_interactions(initiating_ai_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_target_ai ON public.ai_interactions(target_ai_id);
CREATE INDEX IF NOT EXISTS idx_conversation_flows_session ON public.conversation_flows(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_flows_message ON public.conversation_flows(message_id);
CREATE INDEX IF NOT EXISTS idx_ai_relationship_matrix_ai1 ON public.ai_relationship_matrix(ai1_id);
CREATE INDEX IF NOT EXISTS idx_ai_relationship_matrix_ai2 ON public.ai_relationship_matrix(ai2_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_ai_pair ON public.ai_relationship_matrix(LEAST(ai1_id, ai2_id), GREATEST(ai1_id, ai2_id));
CREATE INDEX IF NOT EXISTS idx_vocabulary_learning_user ON public.vocabulary_learning(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_learning_session ON public.vocabulary_learning(session_id);

-- Create triggers to update timestamps
CREATE OR REPLACE FUNCTION update_natural_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_natural_conversation_sessions_updated_at
    BEFORE UPDATE ON public.natural_conversation_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_natural_conversation_updated_at();

CREATE TRIGGER trigger_update_ai_relationship_matrix_updated_at
    BEFORE UPDATE ON public.ai_relationship_matrix
    FOR EACH ROW
    EXECUTE FUNCTION update_natural_conversation_updated_at();

-- Enable RLS on all tables
ALTER TABLE public.natural_conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.natural_conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_relationship_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_learning ENABLE ROW LEVEL SECURITY;

-- RLS Policies for natural conversation sessions
CREATE POLICY "Users can read their own conversation sessions" ON public.natural_conversation_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversation sessions" ON public.natural_conversation_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation sessions" ON public.natural_conversation_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for natural conversation messages
CREATE POLICY "Users can read messages in their sessions" ON public.natural_conversation_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.natural_conversation_sessions 
            WHERE natural_conversation_sessions.id = session_id 
            AND natural_conversation_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in their sessions" ON public.natural_conversation_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.natural_conversation_sessions 
            WHERE natural_conversation_sessions.id = session_id 
            AND natural_conversation_sessions.user_id = auth.uid()
        )
    );

-- RLS Policies for AI interactions (read-only for users)
CREATE POLICY "Users can read AI interactions in their sessions" ON public.ai_interactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.natural_conversation_sessions 
            WHERE natural_conversation_sessions.id = session_id 
            AND natural_conversation_sessions.user_id = auth.uid()
        )
    );

-- RLS Policies for conversation flows (read-only for users)
CREATE POLICY "Users can read conversation flows in their sessions" ON public.conversation_flows
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.natural_conversation_sessions 
            WHERE natural_conversation_sessions.id = session_id 
            AND natural_conversation_sessions.user_id = auth.uid()
        )
    );

-- RLS Policies for AI relationship matrix (read-only for users)
CREATE POLICY "Users can read AI relationship matrix" ON public.ai_relationship_matrix
    FOR SELECT USING (true);

-- RLS Policies for vocabulary learning
CREATE POLICY "Users can read their own vocabulary" ON public.vocabulary_learning
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vocabulary" ON public.vocabulary_learning
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vocabulary" ON public.vocabulary_learning
    FOR UPDATE USING (auth.uid() = user_id);

-- Migration completed successfully for Natural Conversation System
