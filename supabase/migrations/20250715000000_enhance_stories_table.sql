-- Enhance stories table to support advanced story editing features
-- Add columns for text elements, media transforms, background images, and multiple images

-- Add new columns to stories table
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS text_elements JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS media_transform JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS background_image TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Add comments to describe the new columns
COMMENT ON COLUMN public.stories.text_elements IS 'JSON array containing text elements with styling and positioning data';
COMMENT ON COLUMN public.stories.media_transform IS 'JSON object containing media transformation data (scale, position, rotation)';
COMMENT ON COLUMN public.stories.background_image IS 'URL of the background image if used instead of background color';
COMMENT ON COLUMN public.stories.images IS 'JSON array containing multiple image URLs for image-based stories';

-- Create indexes for better JSON query performance
CREATE INDEX IF NOT EXISTS idx_stories_text_elements ON public.stories USING GIN (text_elements);
CREATE INDEX IF NOT EXISTS idx_stories_media_transform ON public.stories USING GIN (media_transform);
CREATE INDEX IF NOT EXISTS idx_stories_images ON public.stories USING GIN (images);

-- Update the get_stories_with_user_data function to include new columns
CREATE OR REPLACE FUNCTION get_stories_with_user_data()
RETURNS TABLE (
    id UUID,
    author_id UUID,
    content TEXT,
    media_url TEXT,
    media_type TEXT,
    background_color TEXT,
    text_color TEXT,
    background_image TEXT,
    text_elements JSONB,
    media_transform JSONB,
    images JSONB,
    duration INTEGER,
    is_active BOOLEAN,
    views_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    user_id UUID,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT
) LANGUAGE sql SECURITY DEFINER AS $$
    SELECT 
        s.id,
        s.author_id,
        s.content,
        s.media_url,
        s.media_type,
        s.background_color,
        s.text_color,
        s.background_image,
        s.text_elements,
        s.media_transform,
        s.images,
        s.duration,
        s.is_active,
        s.views_count,
        s.created_at,
        s.updated_at,
        s.expires_at,
        p.user_id,
        p.username,
        p.full_name,
        p.avatar_url
    FROM public.stories s
    LEFT JOIN public.profiles p ON s.author_id = p.user_id
    WHERE s.is_active = true 
    AND s.expires_at > NOW()
    ORDER BY s.created_at DESC;
$$;
