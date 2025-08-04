export interface VideoSettingsProps {
  initialDuration?: number
  initialMinDuration?: number
  initialAutoPublish?: boolean
}

export interface Topic {
  id: string
  name: string
  trending: boolean
}

export interface VideoSettingsState {
  maxDuration: number
  minDuration: number
  autoPublish: boolean
  topics: Topic[]
  newTopic: string
  searchTerm: string
  activeTab: string
  loadingTopics: boolean
  saving: boolean
}
