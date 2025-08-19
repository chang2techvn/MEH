import { getChallenges } from "./youtube-video"

export interface Challenge {
  id: string
  title: string
  description: string
  videoUrl?: string
  video_url?: string
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
  challenge_type?: 'daily' | 'practice' | 'user_generated'
  date?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
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

// Fetch practice challenges from database
export const fetchPracticeChallenges = async (): Promise<Challenge[]> => {
  try {
    const practiceData = await getChallenges('practice', { limit: 50 })
    
    // Convert to Challenge interface format
    const challenges: Challenge[] = practiceData.map((challenge: any) => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description || '',
      videoUrl: challenge.video_url,
      video_url: challenge.video_url,
      thumbnailUrl: challenge.thumbnail_url,
      difficulty: challenge.difficulty as 'beginner' | 'intermediate' | 'advanced',
      topics: challenge.topics || [],
      duration: challenge.duration,
      createdAt: new Date(challenge.created_at),
      updatedAt: new Date(challenge.updated_at),
      isPublished: challenge.is_active || false,
      category: challenge.category || 'general',
      tags: challenge.tags || [],
      author: challenge.author || 'System',
      viewCount: challenge.view_count || 0,
      likeCount: challenge.like_count || 0,
      completionCount: challenge.completion_count || 0,
      featured: challenge.featured || false,
      embedUrl: challenge.embed_url,
      challenge_type: challenge.challenge_type,
      date: challenge.date,
      is_active: challenge.is_active,
      created_at: challenge.created_at,
      updated_at: challenge.updated_at
    }))
    
    return challenges
  } catch (error) {
    console.error('Error fetching practice challenges:', error)
    return []
  }
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
