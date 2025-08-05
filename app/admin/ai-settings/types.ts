// Define types for our API keys to match Supabase schema
export interface ApiKey {
  id: string // UUID from Supabase
  service_name: "openai" | "gemini" | "anthropic" | "mistral" | "cohere" | "custom"
  key_name: string
  encrypted_key: string
  is_active: boolean
  usage_limit: number | null
  current_usage: number
  expires_at: string | null // ISO string from Supabase
  created_at: string // ISO string from Supabase
  updated_at: string // ISO string from Supabase
}

// Legacy interface for backward compatibility (maps Supabase data to old format)
export interface LegacyApiKey {
  id: string
  name: string
  key: string
  provider: "openai" | "gemini" | "anthropic" | "mistral" | "cohere" | "custom"
  isActive: boolean
  isDefault: boolean
  createdAt: Date
  lastUsed: Date | null
  usageCount: number
  usageLimit: number | null
  expiresAt: Date | null
}
