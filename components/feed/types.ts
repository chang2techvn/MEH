import type { UserSubmission } from "@/app/actions/user-submissions"
import type { VideoEvaluation } from "@/lib/gemini-video-evaluation"
import {
  ThumbsUp,
  Smile,
  Lightbulb,
  Zap,
  Star,
} from "lucide-react"

// Reactions array for the new reaction feature
export const reactions = [
  { emoji: "👍", label: "Like", icon: ThumbsUp },
  { emoji: "😊", label: "Happy", icon: Smile },
  { emoji: "💡", label: "Insightful", icon: Lightbulb },
  { emoji: "⚡", label: "Energetic", icon: Zap },
  { emoji: "⭐", label: "Excellent", icon: Star },
]

export interface FeedPostProps {
  username: string
  userImage: string
  timeAgo: string
  content: string
  mediaType: "video" | "text" | "none" | "ai-submission" | "youtube" | string
  mediaUrl?: string | null
  mediaUrls?: string[]
  youtubeVideoId?: string
  textContent?: string
  likes: number
  comments: number
  submission?: UserSubmission
  videoEvaluation?: VideoEvaluation | null
  isNew?: boolean
  title?: string // Add title prop
}

export interface PostInteractionState {
  liked: boolean
  likeCount: number
  commentCount: number
  showComments: boolean
  newComment: string
  saved: boolean
  showEvaluation: boolean
  showReactions: boolean
  selectedReaction: string | null
  isHovered: boolean
  hasBeenViewed: boolean
}
