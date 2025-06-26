-- Create stories table for user stories feature
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT,
    media_url TEXT,
    media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
    background_color TEXT DEFAULT '#000000',
    text_color TEXT DEFAULT '#ffffff',
    duration INTEGER DEFAULT 24, -- Duration in hours
    is_active BOOLEAN DEFAULT true,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stories_author_id ON public.stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON public.stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_is_active ON public.stories(is_active);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON public.stories(expires_at);

-- Enable Row Level Security
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Create policies for stories
CREATE POLICY "Stories are viewable by everyone" 
    ON public.stories FOR SELECT 
    USING (is_active = true AND expires_at > NOW());

CREATE POLICY "Users can insert their own stories" 
    ON public.stories FOR INSERT 
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own stories" 
    ON public.stories FOR UPDATE 
    USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own stories" 
    ON public.stories FOR DELETE 
    USING (auth.uid() = author_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_stories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stories_updated_at
    BEFORE UPDATE ON public.stories
    FOR EACH ROW
    EXECUTE FUNCTION update_stories_updated_at();

-- Add stories table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;

-- Create story_views table to track who viewed which stories
CREATE TABLE IF NOT EXISTS public.story_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, viewer_id)
);

-- Create indexes for story_views
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON public.story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_viewer_id ON public.story_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_story_views_viewed_at ON public.story_views(viewed_at DESC);

-- Enable RLS for story_views
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

-- Policies for story_views
CREATE POLICY "Story views are viewable by story author and viewer" 
    ON public.story_views FOR SELECT 
    USING (
        auth.uid() = viewer_id OR 
        auth.uid() IN (SELECT author_id FROM public.stories WHERE id = story_id)
    );

CREATE POLICY "Users can insert their own story views" 
    ON public.story_views FOR INSERT 
    WITH CHECK (auth.uid() = viewer_id);

-- Add story_views table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.story_views;
