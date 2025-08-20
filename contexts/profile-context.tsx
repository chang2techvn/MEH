"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuthState } from './auth-context'
import { useProfileData } from '@/hooks/use-profile-data'
import { useProfileUploads } from '@/hooks/use-profile-uploads'
import { usePostsFilter } from '@/hooks/use-posts-filter'
import { useProfileEdit } from '@/hooks/use-profile-edit'

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
  ai_evaluation?: any
}

interface ProfileContextValue {
  // Cache data
  userStats: UserStats | null
  userPosts: UserPost[]
  isLoadingPosts: boolean
  isCacheReady: boolean
  
  // Profile data methods
  fetchUserStats: () => Promise<void>
  fetchUserPosts: () => Promise<void>
  
  // Profile uploads
  isUploading: boolean
  isUploadingBackground: boolean
  showBackgroundCropper: boolean
  selectedBackgroundFile: File | null
  showAvatarCropper: boolean
  selectedAvatarFile: File | null
  handleAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  handleAvatarCropComplete: (blob: Blob) => void
  handleBackgroundUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleBackgroundCropComplete: (blob: Blob) => void
  setShowBackgroundCropper: (show: boolean) => void
  setSelectedBackgroundFile: (file: File | null) => void
  setShowAvatarCropper: (show: boolean) => void
  setSelectedAvatarFile: (file: File | null) => void
  
  // Posts filter
  filteredPosts: UserPost[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeFilter: string
  setActiveFilter: (filter: string) => void
  
  // Profile edit
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
  editProfile: any
  setEditProfile: (profile: any) => void
  handleProfileUpdate: () => Promise<void>
  handleShareProfile: () => void
  handleCancelEdit: () => void
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useAuthState()
  const [isCacheReady, setIsCacheReady] = useState(false)
  
  // Initialize hooks conditionally based on user state
  const profileData = useProfileData({ user, updateUser })
  const profileUploads = useProfileUploads({ 
    user, 
    updateUser, 
    refreshUser: async () => {} // Empty async function
  })
  const postsFilter = usePostsFilter({ userPosts: profileData.userPosts })
  const profileEdit = useProfileEdit({ 
    user, 
    updateUser, 
    refreshUser: async () => {} // Empty async function
  })

  // Preload profile data when user is available
  useEffect(() => {
    if (user?.id && !isCacheReady) {
      console.log('🔄 Preloading profile data for user:', user.id)
      
      Promise.all([
        profileData.fetchUserStats(),
        profileData.fetchUserPosts()
      ]).then(() => {
        console.log('✅ Profile data cache ready')
        setIsCacheReady(true)
      }).catch(error => {
        console.error('❌ Failed to preload profile data:', error)
        setIsCacheReady(true) // Set ready anyway to prevent blocking
      })
    }
  }, [user?.id])

  const value: ProfileContextValue = {
    // Cache data
    userStats: profileData.userStats,
    userPosts: profileData.userPosts,
    isLoadingPosts: profileData.isLoadingPosts,
    isCacheReady,
    
    // Profile data methods
    fetchUserStats: profileData.fetchUserStats,
    fetchUserPosts: profileData.fetchUserPosts,
    
    // Profile uploads
    ...profileUploads,
    
    // Posts filter
    ...postsFilter,
    
    // Profile edit
    ...profileEdit
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
