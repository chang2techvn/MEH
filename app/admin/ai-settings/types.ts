// Define types for our API keys and models
export interface ApiKey {
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

export interface AIModel {
  id: string
  name: string
  provider: "openai" | "gemini" | "anthropic" | "mistral" | "cohere" | "custom"
  description: string
  capabilities: string[]
  isEnabled: boolean
  contextLength: number
  costPer1kTokens: number
  strengths: string[]
  apiEndpoint?: string
}

export interface UsageData {
  date: string
  requests: number
  tokens: number
  cost: number
}
