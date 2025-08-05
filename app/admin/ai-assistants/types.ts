// Database types for Supabase
export interface SupabaseAssistant {
  id: string
  name: string
  description: string
  avatar: string | null
  model: string
  system_prompt: string
  capabilities: string[] | null
  category: string | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
  created_by: string | null
  conversation_count: number | null
  message_count: number | null
  token_consumption: number | null
  personality_traits: string[] | null
  response_threshold: number | null
  field: string | null
  role: string | null
  experience: string | null
  tags: string[] | null
}

// Frontend types (converted from Supabase)
export interface Assistant {
  id: string
  name: string
  description: string
  avatar: string
  model: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  systemPrompt: string
  capabilities: string[]
  category: string
  conversationCount: number
  messageCount: number
  tokenConsumption: number
  personalityTraits: string[]
  responseThreshold: number
  field: string
  role: string
  experience: string
  tags: string[]
  createdBy?: string
  usage?: {
    conversations: number
    messages: number
    tokensConsumed: number
  }
}

export interface AssistantFormData {
  name: string
  description: string
  model: string
  systemPrompt: string
  capabilities: string[]
  category: string
  isActive: boolean
  avatar?: string
  personalityTraits: string[]
  responseThreshold: number
  field: string
  role: string
  experience: string
  tags: string[]
}

export interface AssistantFilters {
  searchQuery: string
  activeTab: string
  sortField: keyof Assistant
  sortDirection: "asc" | "desc"
  currentPage: number
  itemsPerPage: number
}

export interface FormErrors {
  name?: string
  description?: string
  systemPrompt?: string
}
