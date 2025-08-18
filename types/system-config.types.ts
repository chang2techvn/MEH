export interface DefaultAssistantConfig {
  id: string
  name: string
  avatar: string
  role: string
  field: string
  prompt: string
  model: string
}

export interface SystemConfig {
  id: string
  config_key: string
  config_value: any
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SystemConfigResponse {
  default_assistant: DefaultAssistantConfig
}

export type SystemConfigKey = 'default_assistant'
