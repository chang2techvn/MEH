-- Create system_config table for managing default AI assistant settings
CREATE TABLE IF NOT EXISTS public.system_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Admin can manage all configs
CREATE POLICY "Admin can manage system config" ON public.system_config
    FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Authenticated users can read active configs
CREATE POLICY "Users can read active system config" ON public.system_config
    FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');

-- Insert default Hani configuration
INSERT INTO public.system_config (config_key, config_value, description) VALUES 
(
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
  'Default AI assistant configuration for the system'
)
ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  updated_at = NOW();

-- Add comment
COMMENT ON TABLE public.system_config IS 'Stores system-wide configuration settings including default AI assistant';
