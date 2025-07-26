-- Update ai_assistants table to support more categories for celebrity AI personalities
-- Migration: 20250725000001_update_ai_assistants_categories.sql

-- Drop the existing category constraint
ALTER TABLE public.ai_assistants 
DROP CONSTRAINT IF EXISTS ai_assistants_category_check;

-- Add new category constraint with expanded options
ALTER TABLE public.ai_assistants 
ADD CONSTRAINT ai_assistants_category_check 
CHECK (
    category = ANY (
        ARRAY[
            'education'::text,
            'practice'::text,
            'assessment'::text,
            'utility'::text,
            'business'::text,
            'entertainment'::text,
            'politics'::text,
            'literature'::text,
            'technology'::text,
            'science'::text,
            'arts'::text,
            'sports'::text,
            'lifestyle'::text,
            'culture'::text
        ]
    )
);

-- Update default category description
COMMENT ON COLUMN public.ai_assistants.category IS 'Category of AI assistant: education, practice, assessment, utility, business, entertainment, politics, literature, technology, science, arts, sports, lifestyle, culture';

-- Create index for improved performance on category filtering
CREATE INDEX IF NOT EXISTS idx_ai_assistants_category_extended 
ON public.ai_assistants USING btree (category) 
TABLESPACE pg_default;
