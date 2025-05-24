export interface User {
  id: string
  name: string
  avatar: string
  status: string
  lastActive: Date
}

export interface Message {
  id: string
  senderId: string
  text: string
  timestamp: Date
  status: "sending" | "sent" | "delivered" | "read"
  attachments: {
    type: string
    url: string
    name?: string
  }[]
  reactions: {
    emoji: string
    count: number
  }[]
}

export interface Conversation {
  id: string
  participants: User[]
  messages: Message[]
  unreadCount: number
  lastMessage: Message | null
  isTyping: boolean
}
