"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

// UI Components
import ProfileLayout from "@/components/profile/profile-layout"
import { ProfileSkeleton } from "@/components/profile/profile-skeleton"
import { PostFilters } from "@/components/profile/post-filters"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileCard } from "@/components/profile/profile-card"
import { PostsSection } from "@/components/profile/posts-section"
import { ImageCroppersManager } from "@/components/profile/image-croppers-manager"
import SEOMeta from "@/components/optimized/seo-meta"

// Contexts and Hooks
import { useAuthState, useAuthActions } from "@/contexts/auth-context"
import { useProfileData } from "@/hooks/use-profile-data"
import { useProfileUploads } from "@/hooks/use-profile-uploads"
import { usePostsFilter } from "@/hooks/use-posts-filter"
import { useProfileEdit } from "@/hooks/use-profile-edit"
import { supabase } from "@/lib/supabase"

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

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthState()
  const { updateUser, refreshUser } = useAuthActions()
  const router = useRouter()

  // Use profile data hook
  const { userStats, userPosts, isLoadingPosts, fetchUserStats, fetchUserPosts } = useProfileData({ user, updateUser })

  // Use profile uploads hook
  const {
    isUploading,
    isUploadingBackground,
    showBackgroundCropper,
    selectedBackgroundFile,
    showAvatarCropper,
    selectedAvatarFile,
    handleAvatarUpload,
    handleAvatarCropComplete,
    handleBackgroundUpload,
    handleBackgroundCropComplete,
    setShowBackgroundCropper,
    setSelectedBackgroundFile,
    setShowAvatarCropper,
    setSelectedAvatarFile
  } = useProfileUploads({ user, updateUser, refreshUser })

  // Use posts filter hook
  const {
    filteredPosts,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter
  } = usePostsFilter({ userPosts })

  // Use profile edit hook
  const {
    isEditing,
    setIsEditing,
    editProfile,
    setEditProfile,
    handleProfileUpdate,
    handleShareProfile,
    handleCancelEdit
  } = useProfileEdit({ user, updateUser, refreshUser })

  // States
  const [mounted, setMounted] = useState(false) // Add mounted state like resources route
  const [authChecked, setAuthChecked] = useState(false) // New state to track if auth has been thoroughly checked

  // Handle authentication redirect with enhanced logic like resources route
  useEffect(() => {
    // Skip if component not mounted yet
    if (!mounted) return;
    
    // Skip if auth is still loading
    if (authLoading) return;
    
    // Skip if already checked to prevent multiple calls
    if (authChecked) return;
    
    // Additional check: Look for stored session as backup
    const checkStoredSession = async () => {
      try {
        // Check Supabase session directly
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // If we have a valid session but user/isAuthenticated is false, wait longer
        if (session && session.user && (!user || !isAuthenticated)) {
          // Set a flag to check again later
          setTimeout(() => setAuthChecked(false), 1000);
          return;
        }
        
        // Check localStorage for additional confirmation
        const localSession = localStorage.getItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
        if (localSession && (!user || !isAuthenticated)) {
          const parsedSession = JSON.parse(localSession);
          if (parsedSession.access_token && parsedSession.refresh_token) {
            // Set a flag to check again later
            setTimeout(() => setAuthChecked(false), 1500);
            return;
          }

        }
        
        // Mark as checked to prevent multiple calls
        setAuthChecked(true);
        
        // Only redirect if we're absolutely sure there's no authentication
        if (!session || !session.user) {
          
          // Triple check with a delay to be absolutely sure
          setTimeout(async () => {
            const { data: { session: finalCheck } } = await supabase.auth.getSession();
            if (!finalCheck || !finalCheck.user) {
              router.push('/auth/login?redirect=/profile');
            }
          }, 500); // Increased delay for final check
        }
      } catch (error) {
        console.error('Error checking session:', error);
        // Don't redirect on error, retry later
        setTimeout(() => setAuthChecked(false), 2000);
      }
    };
    
    // Add debounce to prevent multiple checks
    const timeoutId = setTimeout(() => {
      checkStoredSession();
    }, 300); // Initial delay
    
    return () => clearTimeout(timeoutId);
  }, [mounted, authLoading, isAuthenticated, user, router, authChecked]);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load data on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchUserStats()
      fetchUserPosts()
    }
  }, [user?.id, fetchUserStats, fetchUserPosts]) // Use functions from hook

  // Loading state
  if (authLoading || !mounted || !user) {
    return (
      <>
        <SEOMeta 
          title="Profile - English Learning Platform"
          description="Your English learning profile and achievements"
          keywords={["profile", "english learning", "student profile", "achievements"]}
        />
        <ProfileLayout>
          <ProfileSkeleton />
        </ProfileLayout>
      </>
    )
  }

  return (
    <>
      <SEOMeta 
        title={`${user.name}'s Profile - English Learning Platform`}
        description={user.bio || `View ${user.name}'s English learning journey, posts, and achievements.`}
        keywords={["profile", "english learning", "student profile", "achievements"]}
      />

      <ProfileLayout>
        {/* Profile Header */}
        <ProfileHeader
          user={user}
          isUploadingBackground={isUploadingBackground}
          onBackgroundUploadClick={() => {}}
          onBackgroundEditClick={() => setShowBackgroundCropper(true)}
          onShareProfile={handleShareProfile}
          onBackgroundUpload={handleBackgroundUpload}
        />

        <div className="relative z-10 -mt-20 pb-8 mx-8 md:mx-16 lg:mx-24 xl:mx-48 2xl:mx-72">
          {/* Profile Info Card */}
          <ProfileCard
            user={user}
            userStats={userStats}
            isEditing={isEditing}
            isUploading={isUploading}
            editProfile={editProfile}
            onEditClick={() => setIsEditing(true)}
            onSaveClick={handleProfileUpdate}
            onCancelClick={handleCancelEdit}
            onAvatarUpload={handleAvatarUpload}
            onEditProfileChange={(updates) => setEditProfile(prev => ({ ...prev, ...updates }))}
          />

          {/* Content Section - Only Posts */}
          <PostsSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            filteredPosts={filteredPosts}
            userPosts={userPosts}
            isLoadingPosts={isLoadingPosts}
          />
        </div>
      </ProfileLayout>

      {/* Image Croppers Manager */}
      <ImageCroppersManager
        showBackgroundCropper={showBackgroundCropper}
        selectedBackgroundFile={selectedBackgroundFile}
        onBackgroundClose={() => {
          setShowBackgroundCropper(false)
          setSelectedBackgroundFile(null)
        }}
        onBackgroundCropComplete={handleBackgroundCropComplete}
        showAvatarCropper={showAvatarCropper}
        selectedAvatarFile={selectedAvatarFile}
        onAvatarClose={() => {
          setShowAvatarCropper(false)
          setSelectedAvatarFile(null)
        }}
        onAvatarCropComplete={handleAvatarCropComplete}
        user={user}
      />
    </>
  )
}
