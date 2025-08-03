import { useState, useEffect } from 'react'

interface UserPost {
  id: string
  username: string
  userImage: string
  timeAgo: string
  content: string
  mediaType?: 'image' | 'video' | 'youtube' | 'text' | 'ai-submission'
  mediaUrl?: string
  mediaUrls?: string[]
  youtubeVideoId?: string
  textContent?: string
  likes: number
  comments: number
  submission?: any
  videoEvaluation?: any
  isNew?: boolean
  title?: string
  ai_evaluation?: any // Can be JSONB object or string
}

interface UsePostsFilterProps {
  userPosts: UserPost[]
}

export function usePostsFilter({ userPosts }: UsePostsFilterProps) {
  const [filteredPosts, setFilteredPosts] = useState<UserPost[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  // Filter posts whenever searchQuery, activeFilter, or userPosts change
  useEffect(() => {
    if (!userPosts.length) {
      setFilteredPosts([])
      return
    }

    let filtered = [...userPosts]

    // Search by content or title
    if (searchQuery) {
      filtered = filtered.filter(post => {
        const searchLower = searchQuery.toLowerCase()
        // Handle ai_evaluation as object (JSONB) for search
        const aiEvaluationText = post.ai_evaluation && typeof post.ai_evaluation === 'object' 
          ? JSON.stringify(post.ai_evaluation).toLowerCase()
          : (post.ai_evaluation || '').toString().toLowerCase()
        
        return (
          post.content?.toLowerCase().includes(searchLower) ||
          aiEvaluationText.includes(searchLower) ||
          post.title?.toLowerCase().includes(searchLower)
        )
      })
    }

    // Filter by category
    if (activeFilter && activeFilter !== 'All') {
      if (activeFilter === 'With AI') {
        const aiPosts = filtered.filter(post => {
          // Check if ai_evaluation has actual data (not null, not empty string, not empty object)
          const hasAI = post.ai_evaluation && 
                       post.ai_evaluation !== '' &&
                       (typeof post.ai_evaluation === 'object' ? 
                         Object.keys(post.ai_evaluation).length > 0 : 
                         post.ai_evaluation.toString().trim() !== '')
          return hasAI
        })
        filtered = aiPosts
      } else if (activeFilter === 'Videos') {
        const videoPosts = filtered.filter(post => {
          // Filter by post_type = 'video' (from database post_type column)
          const isVideo = post.mediaType === 'video' || post.mediaType === 'youtube'
          return isVideo
        })
        filtered = videoPosts
      } else if (activeFilter === 'Images') {
        const imagePosts = filtered.filter(post => {
          // Filter by post_type = 'image' (from database post_type column) 
          const isImage = post.mediaType === 'image'
          return isImage
        })
        filtered = imagePosts
      } else if (activeFilter === 'Text Only') {
        const textPosts = filtered.filter(post => {
          // Filter by post_type = null or 'text' (from database post_type column)
          const isTextOnly = post.mediaType === 'text'
          return isTextOnly
        })
        filtered = textPosts
      }
    }

    setFilteredPosts(filtered)
  }, [searchQuery, activeFilter, userPosts])

  return {
    filteredPosts,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter
  }
}
