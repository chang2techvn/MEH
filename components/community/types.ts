import type { VideoEvaluation } from "@/lib/gemini-video-evaluation"
import type { LucideIcon } from "lucide-react"

export interface Story {
  id: number
  user: string
  userImage: string
  storyImage: string
  time: string
  viewed: boolean
  isAddStory?: boolean
}

export interface Post {
  id: number | string
  username: string
  userImage: string
  timeAgo: string
  content: string
  mediaType: "video" | "text" | "none" | "ai-submission" | "youtube" | "image"
  mediaUrl?: string | null
  youtubeVideoId?: string
  textContent?: string
  likes: number
  comments: number
  submission?: any
  isNew?: boolean
  aiEvaluation?: any
  videoEvaluation?: VideoEvaluation | null
}

export interface Contact {
  id: string | number
  name: string
  image: string
  online: boolean
  lastActive?: string
}

export interface Event {
  id: number
  title: string
  date: string
  time: string
  location: string
  attendees: number
  badge: "today" | "tomorrow" | "upcoming"
}

export interface Group {
  id: number
  name: string
  image: string
  members: number
  privacy: "public" | "private"
  active: boolean
}

export interface StoryViewer {
  id: number
  name: string
  image: string
  timeViewed: string
}

export interface NavItemProps {
  icon: LucideIcon
  label: string
  href: string
  active?: boolean
}

export interface GroupNavItemProps {
  name: string
  image: string
  active: boolean
}

export interface StoryCardProps {
  story: Story
  onClick: () => void
}

export interface ContactItemProps {
  name: string
  image: string
  online: boolean
  lastActive?: string
}

export interface EventCardProps {
  title: string
  date: string
  time: string
  location: string
  attendees: number
  badge: "today" | "tomorrow" | "upcoming"
}

export interface EnhancedStoryCreatorProps {
  isOpen: boolean
  onClose: () => void
}
