import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { toast } from '@/hooks/use-toast'

export interface SavedPost {
  id: string
  post_id: string
  created_at: string
  posts: {
    id: string
    title?: string
    content: string
    username: string
    user_image?: string
    media_url?: string
    media_urls?: string[]
    post_type: string
    created_at: string
    likes_count: number
    comments_count: number
    tags?: string[]
    score?: number
    ai_evaluation?: any
  }
}

export function useSavedPosts() {
  const { user } = useAuth()
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([])
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch saved posts for current user
  const fetchSavedPosts = useCallback(async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('saved_posts')
        .select(`
          id,
          post_id,
          created_at,
          posts!inner (
            id,
            title,
            content,
            username,
            user_image,
            media_url,
            media_urls,
            post_type,
            created_at,
            likes_count,
            comments_count,
            tags,
            score,
            ai_evaluation
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const savedPostsData = data || []
      
      // Transform the data to match our interface (posts array to posts object)
      const transformedData = savedPostsData.map(item => ({
        ...item,
        posts: Array.isArray(item.posts) ? item.posts[0] : item.posts
      })) as SavedPost[]
      
      setSavedPosts(transformedData)
      
      // Create a Set of saved post IDs for quick lookup
      const postIds = new Set(transformedData.map(sp => sp.post_id))
      setSavedPostIds(postIds)

    } catch (err: any) {
      console.error('Error fetching saved posts:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Check if a post is saved
  const isPostSaved = useCallback((postId: string) => {
    return savedPostIds.has(postId)
  }, [savedPostIds])

  // Save a post
  const savePost = useCallback(async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save posts",
        variant: "destructive"
      })
      return false
    }

    try {
      const { error } = await supabase
        .from('saved_posts')
        .insert({
          user_id: user.id,
          post_id: postId
        })

      if (error) {
        // Handle unique constraint violation (post already saved)
        if (error.code === '23505') {
          toast({
            title: "Already Saved",
            description: "This post is already in your saved posts",
            variant: "default"
          })
          return true
        }
        throw error
      }

      // Update local state
      setSavedPostIds(prev => new Set([...prev, postId]))
      
      toast({
        title: "Post Saved",
        description: "Post has been added to your saved posts",
        variant: "default"
      })

      return true
    } catch (err: any) {
      console.error('Error saving post:', err)
      toast({
        title: "Save Failed",
        description: err.message || "Failed to save post",
        variant: "destructive"
      })
      return false
    }
  }, [user])

  // Unsave a post
  const unsavePost = useCallback(async (postId: string) => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from('saved_posts')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId)

      if (error) throw error

      // Update local state
      setSavedPostIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })

      // Remove from saved posts list
      setSavedPosts(prev => prev.filter(sp => sp.post_id !== postId))

      toast({
        title: "Post Removed",
        description: "Post has been removed from your saved posts",
        variant: "default"
      })

      return true
    } catch (err: any) {
      console.error('Error unsaving post:', err)
      toast({
        title: "Remove Failed",
        description: err.message || "Failed to remove post",
        variant: "destructive"
      })
      return false
    }
  }, [user])

  // Toggle save state
  const toggleSavePost = useCallback(async (postId: string) => {
    const isSaved = isPostSaved(postId)
    
    if (isSaved) {
      return await unsavePost(postId)
    } else {
      return await savePost(postId)
    }
  }, [isPostSaved, savePost, unsavePost])

  // Load saved posts on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchSavedPosts()
    } else {
      setSavedPosts([])
      setSavedPostIds(new Set())
    }
  }, [user, fetchSavedPosts])

  return {
    savedPosts,
    savedPostIds,
    loading,
    error,
    isPostSaved,
    savePost,
    unsavePost,
    toggleSavePost,
    refreshSavedPosts: fetchSavedPosts
  }
}
