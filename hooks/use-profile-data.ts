import { useState, useCallback } from 'react'
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

// Helper function to extract YouTube ID
const extractYouTubeId = (content: string): string | undefined => {
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  const match = content.match(youtubeRegex)
  return match ? match[1] : undefined
}

// Helper function to format time ago
const formatTimeAgo = (date: string): string => {
  const createdAt = new Date(date)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - createdAt.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 1) {
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
    return diffHours < 1 ? 'Just now' : `${diffHours}h ago`
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  } else {
    return createdAt.toLocaleDateString()
  }
}

interface UserStats {
  level: number
  experiencePoints: number
  joinedAt: string
}

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

interface User {
  id: string
  name?: string
  avatar?: string
  bio?: string
  background_url?: string
  joinedAt?: Date | string
}

interface UseProfileDataProps {
  user: User | null
  updateUser?: (updates: any) => void
}

export function useProfileData({ user, updateUser }: UseProfileDataProps) {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [userPosts, setUserPosts] = useState<UserPost[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)

  // Fetch user statistics - wrapped in useCallback to prevent recreation
  const fetchUserStats = useCallback(async () => {
    if (!user?.id) return

    try {
            
      // Get user profile data with pre-calculated stats
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (profileError) {
        console.error('Error fetching profile data:', profileError)
        // Fallback to real-time calculation if profile doesn't exist
        await calculateStatsRealtime()
        return
      }
      
      // Use pre-calculated stats from database
      const stats = {
        level: profileData.level || 1,
        experiencePoints: profileData.experience_points || 0,
        joinedAt: profileData.created_at || new Date().toISOString()
      }

      setUserStats(stats)      
      // Update user context with fresh data to ensure consistency
      if (updateUser && profileData) {
        updateUser({
          level: profileData.level || 1,
          experiencePoints: profileData.experience_points || 0,
          name: profileData.full_name || user.name,
          bio: profileData.bio || user.bio,
          avatar: profileData.avatar_url || user.avatar,
          background_url: profileData.background_url || user.background_url
        })
      }

    } catch (error) {
      console.error('Error fetching user stats:', error)
      // Fallback to real-time calculation
      await calculateStatsRealtime()
    }
  }, [user?.id]) // Remove updateUser dependency to avoid infinite loop

  // Fallback function for real-time stats calculation
  const calculateStatsRealtime = useCallback(async () => {
    if (!user?.id) return

    try {
      
      // Get posts count for XP calculation
      const { count: postsCount, error: postsError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      
      if (postsError) {
        console.error('Error fetching posts count:', postsError)
      }

      // Get total likes on user's posts for XP calculation
      const { data: userPostsForLikes, error: postsForLikesError } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', user.id)
      
      let totalLikes = 0
      if (userPostsForLikes && userPostsForLikes.length > 0) {
        const { count: likesCount } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .in('post_id', userPostsForLikes.map(p => p.id))
        
        totalLikes = likesCount || 0
      }

      // Get total comments on user's posts for XP calculation
      let totalComments = 0
      if (userPostsForLikes && userPostsForLikes.length > 0) {
        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .in('post_id', userPostsForLikes.map(p => p.id))
        
        totalComments = commentsCount || 0
      }

      // Calculate experience points and level
      const experiencePoints = (postsCount || 0) * 10 + totalLikes * 2 + totalComments * 1
      const level = Math.max(1, Math.floor(experiencePoints / 100) + 1)
      
      const stats = {
        level: level,
        experiencePoints: experiencePoints,
        joinedAt: user.joinedAt?.toString() || new Date().toISOString()
      }

      setUserStats(stats)

      // Trigger stats update in database for future use
      try {
        await supabase.rpc('update_user_stats', { user_id_param: user.id })
      } catch (err: any) {
      }

    } catch (error) {
      console.error('Error calculating real-time stats:', error)
      toast({
        title: "Error",
        description: "Failed to load user statistics",
        variant: "destructive"
      })
    }
  }, [user?.id]) // Minimal dependencies

  // Fetch user posts - wrapped in useCallback to prevent recreation
  const fetchUserPosts = useCallback(async () => {
    if (!user?.id) return

    try {
      setIsLoadingPosts(true)
      
      // Use RPC function for better performance and timeout avoidance
      const { data: posts, error: postsError } = await supabase
        .rpc('get_user_posts', { 
          user_id_param: user.id, 
          posts_limit: 50 
        })

      if (postsError) throw postsError

      // Transform data to match FeedPost interface
      setUserPosts(posts?.map((post: any) => {
        // Calculate time ago using helper function
        const timeAgo = formatTimeAgo(post.created_at)

        // Determine media type based on post_type and content
        let mediaType: 'image' | 'video' | 'youtube' | 'text' | 'ai-submission' = 'text'
        
        // Parse media_urls if it exists (from database it might be JSON string)
        let mediaUrlsArray: string[] = []
        if (post.media_urls) {
          try {
            mediaUrlsArray = typeof post.media_urls === 'string' 
              ? JSON.parse(post.media_urls) 
              : post.media_urls
          } catch (e) {
            console.warn('Failed to parse media_urls:', post.media_urls)
            mediaUrlsArray = []
          }
        } else if (post.media_url) {
          mediaUrlsArray = [post.media_url]
        }
        
        // Check for YouTube first
        const youtubeId = extractYouTubeId(post.content || "")
        if (youtubeId) {
          mediaType = 'youtube'
        } else if (post.post_type === 'image') {
          // Image posts - use post_type as definitive source
          mediaType = 'image'
        } else if (post.post_type === 'video') {
          // Video posts - use post_type as definitive source
          mediaType = 'video'
        } else if (post.post_type === 'challenge' || post.post_type === 'submission') {
          mediaType = 'ai-submission'
        } else if (post.post_type === null || post.post_type === undefined || post.post_type === 'text' || post.post_type === 'null') {
          // Text posts - when post_type is null, undefined, 'text', or string 'null'
          mediaType = 'text'
        } else {
          // Fallback to text for other unknown post_types
          mediaType = 'text'
        }

        return {
          id: post.id,
          username: user.name || 'Unknown User',
          userImage: user.avatar || '/placeholder.svg',
          timeAgo,
          content: post.content || '',
          mediaType,
          mediaUrl: post.media_url,
          mediaUrls: mediaUrlsArray, // Use the parsed array
          youtubeVideoId: youtubeId,
          textContent: mediaType === "text" ? post.content : undefined,
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          title: post.title,
          ai_evaluation: post.ai_evaluation, // Now available from RPC function
          submission: post.ai_evaluation || post.score ? {
            type: mediaType === 'video' ? 'video' : 'text',
            content: post.content || "",
            difficulty: "intermediate",
            topic: "pronunciation"
          } : undefined,
          videoEvaluation: post.ai_evaluation ? (
            typeof post.ai_evaluation === 'string' 
              ? JSON.parse(post.ai_evaluation)
              : post.ai_evaluation
          ) : undefined,
          isNew: false
        }
      }) || [])
    } catch (error) {
      console.error('Error fetching user posts:', error)
      toast({
        title: "Error",
        description: "Failed to load your posts",
        variant: "destructive"
      })
    } finally {
      setIsLoadingPosts(false)
    }
  }, [user?.id]) // Minimal dependencies

  return {
    userStats,
    userPosts,
    isLoadingPosts,
    fetchUserStats,
    fetchUserPosts
  }
}
