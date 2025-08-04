import type { ReactNode } from "react"

export interface User {
  id: number
  name: string
  email: string
  role: string
  lastActive: string
  avatar: string
}

export interface MessageTemplate {
  id: number
  name: string
  subject: string
  content: string
}

export type ScheduledMessage = {
  id: number
  title: string
  type: "email" | "zalo"
  recipients: number
  date: Date
  status: "scheduled" | "sent"
  recurring: string
}

export type NotificationStats = {
  totalSent: number
  openRate: number
  clickRate: number
  deliveryRate: number
}

export interface RecentActivity {
  id: number
  title: string
  type: "email" | "zalo"
  recipients: number
  sentAt: string
  openRate: number
}

export interface AiSuggestion {
  text: string
}

export interface ProgressValues {
  openRate: number
  clickRate: number
  deliveryRate: number
}

export interface TabProps {
  children: ReactNode
}

export interface QuickAction {
  label: string
  icon: ReactNode
  tab: string
  onClick?: () => void
}

export interface MockUser {
  id: number
  name: string
  email: string
  role: string
  lastActive: string
  avatar: string
}

export interface AiAssistantProps {
  messageType: string
  onSuggestionApply: (suggestion: string) => void
  onClose: () => void
}
