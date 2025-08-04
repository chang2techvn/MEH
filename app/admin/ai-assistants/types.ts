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
