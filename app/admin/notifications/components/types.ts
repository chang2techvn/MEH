export interface ScheduledMessage {
  id: number
  title: string
  type: 'email' | 'zalo'
  recipients: number
  date: Date
  status: 'scheduled' | 'sent'
  recurring: string
}

export interface MessageTemplate {
  id: number
  name: string
  subject: string
  content: string
  type: 'email' | 'zalo'
  category: string
  usage: number
  lastUsed: Date
  isActive: boolean
}

export interface RecentActivity {
  id: number
  type: 'email' | 'zalo' | 'notification'
  title: string
  recipients: number
  status: 'sent' | 'pending' | 'failed'
  timestamp: Date
  details?: string
}

export interface CalendarTabProps {
  scheduledMessages: ScheduledMessage[]
}

export interface AiAssistantProps {
  onSuggestionApply: (suggestion: string) => void
  messageType: string
  selectedUsers?: number[]
  aiSuggestionPrompts: string[]
  messageContent: string
  setMessageContent: React.Dispatch<React.SetStateAction<string>>
  showAiAssistant: boolean
  setShowAiAssistant: React.Dispatch<React.SetStateAction<boolean>>
}

export interface RecipientSelectionProps {
  selectedUsers: number[]
  setSelectedUsers: (users: number[]) => void
  handleSelectUser: (userId: number) => void
  mockUsers: {
    id: number
    name: string
    email: string
    role: string
    lastActive: string
    avatar: string
  }[]
  setShowUserSelector: React.Dispatch<React.SetStateAction<boolean>>
}
