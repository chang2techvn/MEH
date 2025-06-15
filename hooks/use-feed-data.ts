"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import { dbHelpers, supabase } from "@/lib/supabase"
import { formatNewPost } from "@/utils/post-helpers"

// Helper function to format time ago
const formatTimeAgo = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString()
}

// Helper function to extract YouTube video ID
const extractYouTubeId = (url: string): string | undefined => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : undefined
}

export function useFeedData() {
  const [posts, setPosts] = useState<any[]>([])
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0) // Start from 0 for proper pagination
  const [newPostAdded, setNewPostAdded] = useState(false)
  // Load more posts from Supabase
  const loadMorePosts = useCallback(async (isInitialLoad = false) => {
    if (loading) return

    setLoading(true)    
    try {
      console.log('📊 Fetching posts from Supabase...', { page, isInitialLoad })
      
      // Load posts from Supabase with pagination
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          users!user_id(id, name, avatar)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(page * 10, (page + 1) * 10 - 1) // 10 posts per page

      console.log('📊 Supabase query result:', { postsData, error, page })

      if (error) {
        console.error('❌ Error loading posts:', error)
        toast({
          title: "Database Error",
          description: `Failed to load posts: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      console.log('✅ Posts loaded successfully:', postsData?.length || 0)

      // Transform posts to match UI format
      const transformedPosts = postsData?.map(post => {
        console.log('📝 Transforming post:', post)
        return {
          id: post.id,
          username: post.users?.name || "Unknown User",
          userImage: post.users?.avatar || "/placeholder.svg?height=40&width=40",
          title: post.title,
          content: post.content,
          videoUrl: post.media_url,
          youtubeVideoId: post.post_type === 'youtube' ? extractYouTubeId(post.media_url || '') : undefined,
          mediaType: post.post_type === 'video' ? 'video' : 
                    post.post_type === 'youtube' ? 'youtube' : 
                    post.media_url ? 'image' : 'text',
          mediaUrl: post.media_url,
          textContent: post.post_type === 'text' ? post.content : undefined,
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          createdAt: post.created_at,
          timeAgo: formatTimeAgo(post.created_at)
        }
      }) || []

      console.log('🔄 Transformed posts:', transformedPosts)

      if (isInitialLoad) {
        setPosts(transformedPosts) // Replace posts for initial load
      } else {
        setPosts((prev) => [...prev, ...transformedPosts]) // Append for pagination
      }
      
      setPage((prev) => prev + 1)

      // Check if we have more posts
      if (!postsData || postsData.length < 10) {
        setHasMore(false)
      }
    } catch (error) {
      console.error("❌ Error loading posts:", error)
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [loading, page])

  // Filter posts based on active filters
  const filteredPosts = useMemo(() => {
    if (activeFilters.length === 0) return posts

    return posts.filter((post) => {
      const formattedPost = formatNewPost(post)
      const mediaType = formattedPost.mediaType

      if (activeFilters.includes("video") && (mediaType === "video" || mediaType === "youtube")) {
        return true
      }

      if (activeFilters.includes("text") && mediaType === "text") {
        return true
      }

      if (activeFilters.includes("discussion") && mediaType === "none") {
        return true
      }

      return false
    })  }, [posts, activeFilters])  // Load initial posts when hook is first used
  useEffect(() => {
    if (posts.length === 0 && !loading) {
      console.log('🏠 Loading initial posts for homepage...')
      loadMorePosts(true) // Pass true for initial load
    }
  }, [posts.length, loading]) // Remove loadMorePosts from dependencies

  return {
    posts,
    setPosts,
    filteredPosts,
    activeFilters,
    setActiveFilters,
    loading,
    hasMore,
    newPostAdded,
    setNewPostAdded,
    loadMorePosts,
  }
}
