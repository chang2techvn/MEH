"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, ArrowLeft } from "lucide-react"
import FeedPost from "@/components/feed/feed-post"
import { supabase, dbHelpers } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import SEOMeta from "@/components/optimized/seo-meta"
import SimpleHeader from "@/components/ui/simple-header"
import type { Post } from "@/components/community"
import { extractYouTubeId } from "@/components/community/utils"

interface SharedPost {
  id: string
  title?: string
  content: string
  user_id: string
  post_type: string
  media_url?: string
  media_urls?: string[]
  ai_evaluation?: any
  likes_count: number
  comments_count: number
  created_at: string
  profile?: {
    full_name?: string
    username?: string
    avatar_url?: string
  }
}

export default function SharedPostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const postId = params.id as string

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        setError("Invalid post ID")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // First fetch the post
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select('*')
          .eq('id', postId)
          .eq('is_public', true)
          .single()

        if (postError) {
          console.error('Error fetching post:', postError)
          setError("Post not found or not public")
          setLoading(false)
          return
        }

        if (!postData) {
          setError("Post not found")
          setLoading(false)
          return
        }

        // Then fetch the profile for this post's user
        let profileData = null
        if (postData.user_id) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, username, avatar_url')
            .eq('user_id', postData.user_id)
            .single()
          
          if (profile) {
            profileData = profile
          }
        }

        // Combine post data with profile
        const postWithProfile = {
          ...postData,
          profile: profileData
        }

        // Transform data to match Post interface
        const transformedPost = transformPostData(postWithProfile)
        setPost(transformedPost)

      } catch (err: any) {
        console.error('Error:', err)
        setError("Failed to load post")
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId])

  const transformPostData = (postData: SharedPost): Post => {
    // Parse AI evaluation if it exists
    let videoEvaluation = null
    if (postData.ai_evaluation) {
      try {
        videoEvaluation = typeof postData.ai_evaluation === 'string' 
          ? JSON.parse(postData.ai_evaluation) 
          : postData.ai_evaluation
      } catch (error) {
        console.error('Error parsing AI evaluation:', error)
      }
    }

    // Get media URLs - support both single and multiple media
    const mediaUrls = postData.media_urls && Array.isArray(postData.media_urls) && postData.media_urls.length > 0
      ? postData.media_urls
      : postData.media_url ? [postData.media_url] : []

    // Determine media type
    let mediaType: "video" | "text" | "none" | "ai-submission" | "youtube" | "image" = 'text'
    
    if (mediaUrls.length > 0) {
      const firstMediaUrl = mediaUrls[0]
      if (firstMediaUrl.includes('youtube') || postData.post_type === 'youtube') {
        mediaType = 'youtube'
      } else if (videoEvaluation) {
        mediaType = 'ai-submission'
      } else if (postData.post_type === 'image') {
        mediaType = 'image'
      } else if (postData.post_type === 'video') {
        mediaType = 'video'
      } else {
        const url = firstMediaUrl.toLowerCase()
        if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif') || url.includes('.webp')) {
          mediaType = 'image'
        } else if (url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') || url.includes('.avi')) {
          mediaType = 'video'
        } else {
          mediaType = 'video'
        }
      }
    }

    // Helper function to format time ago
    const formatTimeAgo = (dateString: string) => {
      const now = new Date()
      const date = new Date(dateString)
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

      if (diffInSeconds < 60) return 'Just now'
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
      return date.toLocaleDateString()
    }

    // Extract YouTube ID helper
    const extractYouTubeId = (url: string) => {
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      const match = url.match(regex)
      return match ? match[1] : null
    }

    return {
      id: postData.id,
      username: postData.profile?.full_name || postData.profile?.username || 'Unknown User',
      userImage: postData.profile?.avatar_url || "/placeholder.svg?height=40&width=40",
      timeAgo: formatTimeAgo(postData.created_at),
      content: postData.content || '',
      mediaType,
      mediaUrl: mediaUrls[0],
      mediaUrls: mediaUrls,
      youtubeVideoId: postData.post_type === 'youtube' ? (extractYouTubeId(mediaUrls[0] || '') || undefined) : undefined,
      textContent: postData.post_type === 'text' ? postData.content : undefined,
      likes: postData.likes_count || 0,
      comments: postData.comments_count || 0,
      title: postData.title,
      submission: videoEvaluation ? {
        type: 'video_submission',
        videoUrl: mediaUrls[0],
        content: postData.content,
        evaluation: videoEvaluation
      } : undefined,
      videoEvaluation: videoEvaluation,
      isNew: false
    }
  }

  const handleClose = () => {
    router.back()
  }

  const handleBackToCommunity = () => {
    router.push('/community')
  }

  // Generate meta tags for SEO and social sharing
  const generateMetaTags = () => {
    if (!post) return null

    const title = post.title || post.content.substring(0, 100) || "Check out this post"
    const description = post.content.length > 160 
      ? post.content.substring(0, 157) + "..."
      : post.content || "Shared from EnglishMastery Community"
    
    const imageUrl = post.mediaType === 'image' && post.mediaUrl 
      ? post.mediaUrl 
      : post.userImage || "/placeholder.svg?height=400&width=400"

    return (
      <SEOMeta
        title={`${title} | EnglishMastery Community`}
        description={description}
        keywords={["English learning", "community post", "language practice"]}
        ogImage={imageUrl}
        ogType="article"
      />
    )
  }

  return (
    <>
      {generateMetaTags()}
      
      {/* Simple Header */}
      <SimpleHeader />
      
      {/* Shared Post Modal */}
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" style={{ top: '64px' }}>
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <div className="flex items-center gap-3">
                <h1 className="font-semibold text-lg">Shared Post</h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="max-h-[80vh] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neo-mint mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading post...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <div className="text-red-500 mb-4">
                    <X className="h-16 w-16 mx-auto mb-2" />
                    <h2 className="text-xl font-semibold">Post Not Found</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {error}
                  </p>
                  <div className="space-y-2">
                    <Button onClick={handleBackToCommunity} className="w-full">
                      Go to Community
                    </Button>
                    <Button variant="outline" onClick={handleClose} className="w-full">
                      Close
                    </Button>
                  </div>
                </div>
              ) : post ? (
                <div className="p-4">
                  <FeedPost
                    id={String(post.id)}
                    username={post.username}
                    userImage={post.userImage}
                    timeAgo={post.timeAgo}
                    content={post.content}
                    mediaType={post.mediaType}
                    mediaUrl={post.mediaUrl}
                    mediaUrls={post.mediaUrls}
                    youtubeVideoId={post.youtubeVideoId}
                    textContent={post.textContent}
                    likes={post.likes}
                    comments={post.comments}
                    submission={post.submission}
                    videoEvaluation={post.videoEvaluation}
                    isNew={false}
                    title={post.title}
                  />
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
