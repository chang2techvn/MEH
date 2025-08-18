-- Insert default system configuration for Hani AI assistant
-- This will be used as fallback when no custom configuration is set

INSERT INTO public.system_config (config_key, config_value, description, is_active) 
VALUES (
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
  'Default AI assistant configuration used in chatbox and resources pages',
  true
) ON CONFLICT (config_key) 
DO UPDATE SET
  config_value = EXCLUDED.config_value,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verify the insertion
SELECT 
  config_key,
  config_value,
  description,
  is_active,
  created_at,
  updated_at
FROM public.system_config 
WHERE config_key = 'default_assistant';
