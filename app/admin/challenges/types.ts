import type { Challenge } from "@/app/actions/challenge-videos"

export interface ChallengeFilters {
  searchTerm: string
  activeTab: string
  sortOrder: "newest" | "oldest" | "title" | "duration"
  selectedTopics: string[]
}

export interface ChallengeFormState {
  youtubeUrl: string
  title: string
  description: string
  difficulty: string
  duration: number
  videoId: string
  thumbnailUrl: string
  videoUrl: string
  embedUrl: string
  topics: string[]
  featured: boolean
}

export interface ChallengeTableProps {
  challenges: Challenge[]
  formatDuration: (seconds: number) => string
  formatDate: (dateString: string) => string
  onEdit: (challenge: Challenge) => void
  onDelete: (challenge: Challenge) => void
  onView: (challenge: Challenge) => void
  selectedChallenges: string[]
  toggleSelection: (id: string) => void
  toggleSelectAll: () => void
  allSelected: boolean
}

export interface ChallengeGridProps {
  challenges: Challenge[]
  formatDuration: (seconds: number) => string
  onEdit: (challenge: Challenge) => void
  onDelete: (challenge: Challenge) => void
  onView: (challenge: Challenge) => void
  selectedChallenges: string[]
  toggleSelection: (id: string) => void
}

export type ViewMode = "table" | "grid" | "detail"
