"use client"

import { useState, useEffect } from 'react'
import { toast } from '@/hooks/use-toast'

interface UserStats {
  totalPosts: number
  totalLikes: number
  totalComments: number
  streakDays: number
  completedChallenges: number
  level: number
  experiencePoints: number
  joinedAt: string
}

interface UserPost {
  id: string
  content: string
  imageUrl?: string
  videoUrl?: string
  createdAt: string
  likesCount: number
  commentsCount: number
  isLiked: boolean
}

interface ProfileData {
  id: string
  email: string
  name?: string
  avatar?: string
  bio?: string
  major?: string
  academicYear?: string
  role?: string
  points?: number
  level?: number
  experiencePoints?: number
  streakDays?: number
  lastActive?: Date
  joinedAt?: Date
  isActive?: boolean
  preferences?: any
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [posts, setPosts] = useState<UserPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch profile and stats
  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/profile')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile')
      }

      setProfile(data.profile)
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch profile')
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
      setIsLoadingStats(false)
    }
  }

  // Fetch user posts
  const fetchPosts = async (limit = 20, offset = 0) => {
    try {
      setIsLoadingPosts(true)
      
      const response = await fetch(`/api/profile/posts?limit=${limit}&offset=${offset}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch posts')
      }

      setPosts(data.posts)
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive"
      })
    } finally {
      setIsLoadingPosts(false)
    }
  }

  // Update profile
  const updateProfile = async (updates: {
    name?: string
    bio?: string
    major?: string
    academicYear?: string
  }) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      toast({
        title: "Success",
        description: "Profile updated successfully!",
        variant: "default"
      })

      // Refresh profile data
      await fetchProfile()
      
      return data.profile
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive"
      })
      throw error
    }
  }

  // Delete post
  const deletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/profile/posts?id=${postId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete post')
      }

      toast({
        title: "Success",
        description: "Post deleted successfully!",
        variant: "default"
      })

      // Remove post from local state
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId))
      
      // Refresh stats
      await fetchProfile()
      
    } catch (error) {
      console.error('Error deleting post:', error)
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete post",
        variant: "destructive"
      })
      throw error
    }
  }

  // Like/unlike post
  const toggleLike = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId)
      if (!post) return

      const response = await fetch('/api/posts/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to toggle like')
      }

      // Update local state optimistically
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === postId
            ? {
                ...p,
                isLiked: !p.isLiked,
                likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1
              }
            : p
        )
      )

    } catch (error) {
      console.error('Error toggling like:', error)
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      })
    }
  }

  // Load data on mount
  useEffect(() => {
    fetchProfile()
    fetchPosts()
  }, [])

  return {
    profile,
    stats,
    posts,
    isLoading,
    isLoadingStats,
    isLoadingPosts,
    error,
    fetchProfile,
    fetchPosts,
    updateProfile,
    deletePost,
    toggleLike,
    refetch: () => {
      fetchProfile()
      fetchPosts()
    }
  }
}
