import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { toast } from '@/hooks/use-toast'

export interface Story {
  id: string
  author_id: string
  content: string
  media_url?: string
  media_type: 'image' | 'video'
  background_color: string
  text_color: string
  background_image?: string
  text_elements?: any[]
  media_transform?: any
  images?: string[]
  duration: number
  is_active: boolean
  views_count: number
  created_at: string
  updated_at: string
  expires_at: string
  // Joined data
  profiles?: {
    user_id: string
    username: string
    full_name: string
    avatar_url?: string
  }
  story_views?: {
    id: string
    viewer_id: string
    viewed_at: string
  }[]
}

export interface StoryView {
  id: string
  story_id: string
  viewer_id: string
  viewed_at: string
}

export function useStories() {
  const { user } = useAuth()
  const [stories, setStories] = useState<Story[]>([])
  const [myStories, setMyStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all active stories
  const fetchStories = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Use the function instead of view
      const { data, error } = await supabase
        .rpc('get_stories_with_user_data')

      if (error) throw error

      // Transform data to match our interface
      const transformedStories: Story[] = (data || []).map((story: any) => ({
        id: story.id,
        author_id: story.author_id,
        content: story.content,
        media_url: story.media_url,
        media_type: story.media_type,
        background_color: story.background_color,
        text_color: story.text_color,
        background_image: story.background_image,
        text_elements: story.text_elements,
        media_transform: story.media_transform,
        images: story.images,
        duration: story.duration,
        is_active: story.is_active,
        views_count: story.views_count,
        created_at: story.created_at,
        updated_at: story.updated_at,
        expires_at: story.expires_at,
        profiles: {
          user_id: story.user_id,
          username: story.username,
          full_name: story.full_name,
          avatar_url: story.avatar_url
        }
      }))

      setStories(transformedStories)
    } catch (err: any) {
      console.error('Error fetching stories:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch current user's stories
  const fetchMyStories = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          story_views (
            id,
            viewer_id,
            viewed_at
          )
        `)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setMyStories(data || [])
    } catch (err: any) {
      console.error('Error fetching my stories:', err)
    }
  }, [user])

  // Create a new story
  const createStory = useCallback(async (storyData: {
    content: string
    media_url?: string
    media_type: 'image' | 'video'
    background_color?: string
    background_image?: string
    text_color?: string
    text_elements?: any[]
    media_transform?: any
    images?: string[]
    duration?: number
  }) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create stories",
        variant: "destructive"
      })
      return false
    }

    try {
      const { data, error } = await supabase
        .from('stories')
        .insert([
          {
            author_id: user.id,
            content: storyData.content,
            media_url: storyData.media_url,
            media_type: storyData.media_type,
            background_color: storyData.background_color || '#000000',
            background_image: storyData.background_image,
            text_color: storyData.text_color || '#ffffff',
            text_elements: storyData.text_elements || [],
            media_transform: storyData.media_transform,
            images: storyData.images || [],
            duration: storyData.duration || 24,
            expires_at: new Date(Date.now() + (storyData.duration || 24) * 60 * 60 * 1000).toISOString()
          }
        ])
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Story Created",
        description: "Your story has been shared successfully!"
      })

      // Refresh stories
      await fetchStories()
      await fetchMyStories()

      return true
    } catch (err: any) {
      console.error('Error creating story:', err)
      toast({
        title: "Error Creating Story",
        description: err.message,
        variant: "destructive"
      })
      return false
    }
  }, [user, fetchStories, fetchMyStories])

  // View a story (record view)
  const viewStory = useCallback(async (storyId: string) => {
    if (!user) return false

    try {
      // Use the new function that handles author check and duplicate prevention
      const { data, error } = await supabase
        .rpc('record_story_view', { 
          story_id: storyId, 
          viewer_id: user.id 
        })

      if (error) throw error

      // The function returns true if view was recorded, false if not (e.g., author viewing own story)
      return data === true
    } catch (err: any) {
      console.error('Error recording story view:', err)
      return false
    }
  }, [user])

  // Delete story
  const deleteStory = useCallback(async (storyId: string) => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId)
        .eq('author_id', user.id)

      if (error) throw error

      toast({
        title: "Story Deleted",
        description: "Your story has been removed"
      })

      // Refresh stories
      await fetchStories()
      await fetchMyStories()

      return true
    } catch (err: any) {
      console.error('Error deleting story:', err)
      toast({
        title: "Error Deleting Story",
        description: err.message,
        variant: "destructive"
      })
      return false
    }
  }, [user, fetchStories, fetchMyStories])

  // Upload media to stories bucket
  const uploadStoryMedia = useCallback(async (file: File): Promise<string | null> => {
    if (!user) return null

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      console.log(`Uploading ${file.type} file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

      const { data, error } = await supabase.storage
        .from('stories')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Storage upload error:', error)
        throw error
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('stories')
        .getPublicUrl(fileName)

      console.log('Upload successful, public URL:', urlData.publicUrl)
      return urlData.publicUrl
    } catch (err: any) {
      console.error('Error uploading story media:', err)
      toast({
        title: "Upload Error", 
        description: err.message || "Failed to upload media. Please try again.",
        variant: "destructive"
      })
      return null
    }
  }, [user])

  // Check if story is viewed by current user
  const isStoryViewed = useCallback((story: Story) => {
    if (!user || !story.story_views) return false
    return story.story_views.some(view => view.viewer_id === user.id)
  }, [user])

  // Add story reply
  const addStoryReply = useCallback(async (storyId: string, replyContent: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to reply to stories",
        variant: "destructive"
      })
      return false
    }

    if (!replyContent.trim()) {
      toast({
        title: "Reply Required",
        description: "Please enter a reply message",
        variant: "destructive"
      })
      return false
    }

    try {
      const { data, error } = await supabase
        .rpc('add_story_reply', {
          p_story_id: storyId,
          p_viewer_id: user.id,
          p_reply_content: replyContent.trim()
        })

      if (error) throw error

      if (data.success) {
        toast({
          title: "Reply Sent",
          description: "Your reply has been sent to the story author"
        })
        return true
      } else {
        throw new Error(data.error || 'Failed to send reply')
      }
    } catch (err: any) {
      console.error('Error adding story reply:', err)
      toast({
        title: "Error Sending Reply",
        description: err.message,
        variant: "destructive"
      })
      return false
    }
  }, [user])

  // Get story replies (for story author)
  const getStoryReplies = useCallback(async (storyId: string) => {
    if (!user) return []

    try {
      const { data, error } = await supabase
        .rpc('get_story_replies', {
          p_story_id: storyId,
          p_author_id: user.id
        })

      if (error) throw error

      return data || []
    } catch (err: any) {
      console.error('Error fetching story replies:', err)
      return []
    }
  }, [user])

  // Get stories grouped by user
  const getStoriesGroupedByUser = useCallback(() => {
    const grouped = stories.reduce((acc, story) => {
      const userId = story.author_id
      if (!acc[userId]) {
        acc[userId] = {
          user: story.profiles,
          stories: []
        }
      }
      acc[userId].stories.push(story)
      return acc
    }, {} as Record<string, { user: any, stories: Story[] }>)

    return Object.values(grouped)
  }, [stories])

  // Initialize
  useEffect(() => {
    fetchStories()
  }, [fetchStories])

  useEffect(() => {
    if (user) {
      fetchMyStories()
    }
  }, [user, fetchMyStories])

  return {
    stories,
    myStories,
    loading,
    error,
    fetchStories,
    fetchMyStories,
    createStory,
    viewStory,
    deleteStory,
    uploadStoryMedia,
    isStoryViewed,
    addStoryReply,
    getStoryReplies,
    getStoriesGroupedByUser,
    refreshStories: fetchStories
  }
}
