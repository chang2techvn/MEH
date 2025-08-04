export interface Challenge {
  id: string
  title: string
  description: string
  videoUrl?: string
  thumbnailUrl?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  topics: string[]
  duration?: number
  createdAt: Date
  updatedAt: Date
  isPublished: boolean
  category: string
  tags?: string[]
  author: string
  viewCount: number
  likeCount: number
  completionCount: number
  featured: boolean
  embedUrl?: string
}

export const challengeTopics = [
  'Grammar',
  'Vocabulary',
  'Pronunciation',
  'Listening',
  'Speaking',
  'Reading',
  'Writing',
  'Conversation',
  'Business English',
  'IELTS',
  'TOEFL'
] as const

export const fetchAllChallenges = async (): Promise<Challenge[]> => {
  // Mock data for now - in real app this would be an API call
  return []
}

export const formatDuration = (seconds?: number): string => {
  if (!seconds) return "0:00"
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}
