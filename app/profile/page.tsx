"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { 
  Camera, 
  Edit3, 
  Save, 
  X, 
  Share2,
  Settings,
  TrendingUp,
  Award,
  Target,
  Users,
  Clock,
  Star,
  Upload,
  Check,
  Zap,
  Flame,
  Crown,
  Medal,
  Activity,
  Sparkles,
  Eye,
  Download,
  Plus,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Grid3X3,
  List,
  Search,
  Filter
} from "lucide-react"

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ImageCropper } from "@/components/ui/image-cropper"
import ProfileLayout from "@/components/profile/profile-layout"
import FeedPost from "@/components/feed/feed-post"
import FeedFilter from "@/components/feed/feed-filter"
import { PostSkeleton } from "@/components/community"
import EmptyState from "@/components/profile/empty-state"
import { ProfileSkeleton, StatsSkeleton, PostsSkeleton } from "@/components/profile/profile-skeleton"
import SEOMeta from "@/components/optimized/seo-meta"

// Contexts and Hooks
import { useAuthState, useAuthActions } from "@/contexts/auth-context"
import { useMobile } from "@/hooks/use-mobile"
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

interface EditProfile {
  name: string
  bio: string
  location: string
  role?: string
  major?: string
  class_name?: string
  academic_year?: string
  student_id?: string
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthState()
  const { updateUser, refreshUser } = useAuthActions()
  const { isMobile } = useMobile()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)

  // States
  const [mounted, setMounted] = useState(false) // Add mounted state like resources route
  const [authChecked, setAuthChecked] = useState(false) // New state to track if auth has been thoroughly checked
  const [isEditing, setIsEditing] = useState(false)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [userPosts, setUserPosts] = useState<UserPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<UserPost[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadingBackground, setIsUploadingBackground] = useState(false)
  const [showBackgroundCropper, setShowBackgroundCropper] = useState(false)
  const [selectedBackgroundFile, setSelectedBackgroundFile] = useState<File | null>(null)
  const [showAvatarCropper, setShowAvatarCropper] = useState(false)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  const [isFetchingStats, setIsFetchingStats] = useState(false) // Add flag to prevent multiple calls
  const [editProfile, setEditProfile] = useState<EditProfile>({
    name: '',
    bio: '',
    location: ''
  })
  
  // Debug log - only when necessary
  // console.log('🎯 Rendering statsCards with:', {
  //   isLoadingStats,
  //   hasUserStats: !!userStats,
  //   userStats,
  //   statsCards: statsCards.map(card => ({ label: card.label, value: card.value }))
  // })

  // Only log once when data changes
  const [lastLoggedFilter, setLastLoggedFilter] = useState('')
  const [lastLoggedPostsCount, setLastLoggedPostsCount] = useState(0)

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
          console.log('Session exists but user data not loaded yet, waiting...');
          // Set a flag to check again later
          setTimeout(() => setAuthChecked(false), 1000);
          return;
        }
        
        // Check localStorage for additional confirmation
        const localSession = localStorage.getItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
        if (localSession && (!user || !isAuthenticated)) {
          try {
            const parsedSession = JSON.parse(localSession);
            if (parsedSession.access_token && parsedSession.refresh_token) {
              console.log('Local session found, giving more time for auth to resolve');
              // Set a flag to check again later
              setTimeout(() => setAuthChecked(false), 1500);
              return;
            }
          } catch (e) {
            console.log('Error parsing local session');
          }
        }
        
        // Mark as checked to prevent multiple calls
        setAuthChecked(true);
        
        // Only redirect if we're absolutely sure there's no authentication
        if (!session || !session.user) {
          console.log('No valid session found, redirecting to login');
          
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

  // Filter posts whenever searchQuery, activeFilter, or userPosts change
  useEffect(() => {
    if (!userPosts.length) {
      setFilteredPosts([])
      return
    }

    // Only log when filter or posts count changes
    if (activeFilter !== lastLoggedFilter || userPosts.length !== lastLoggedPostsCount) {
      console.log('🔍 Filtering posts:', {
        totalPosts: userPosts.length,
        activeFilter,
        searchQuery,
        samplePost: userPosts[0] ? {
          id: userPosts[0].id,
          mediaType: userPosts[0].mediaType,
          mediaUrl: userPosts[0].mediaUrl,
          mediaUrls: userPosts[0].mediaUrls,
          hasAiEvaluation: !!userPosts[0].ai_evaluation,
          aiEvaluationType: typeof userPosts[0].ai_evaluation
        } : null
      })
      setLastLoggedFilter(activeFilter)
      setLastLoggedPostsCount(userPosts.length)
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
      // Reduced logging for better performance
      
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

    console.log(`🎯 Final filtered posts: ${filtered.length}`)
    setFilteredPosts(filtered)
  }, [searchQuery, activeFilter, userPosts, lastLoggedFilter, lastLoggedPostsCount])

  // Initialize edit form when user data is available
  useEffect(() => {
    if (user) {
      setEditProfile({
        name: user.name || '',
        bio: user.bio || '',
        location: '',
        role: user.role || '',
        major: user.major || '',
        class_name: user.className || '', // Map className to class_name for database
        academic_year: user.academicYear || '',
        student_id: user.studentId || ''
      })
    }
  }, [user])

  // Fetch user statistics - wrapped in useCallback to prevent recreation
  const fetchUserStats = useCallback(async () => {
    if (!user?.id || isFetchingStats) return

    try {
      setIsFetchingStats(true)
      setIsLoadingStats(true)
      
      console.log('🔍 Fetching user stats for user ID:', user.id)
      
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
      
      console.log('� Profile data with stats:', profileData)

      // Use pre-calculated stats from database
      const stats = {
        totalPosts: profileData.total_posts || 0,
        totalLikes: profileData.total_likes || 0,
        totalComments: profileData.total_comments || 0,
        streakDays: profileData.streak_days || 0,
        completedChallenges: profileData.completed_challenges || 0,
        level: profileData.level || 1,
        experiencePoints: profileData.experience_points || 0,
        joinedAt: profileData.created_at || new Date().toISOString()
      }

      setUserStats(stats)
      console.log('✅ Stats loaded from database:', stats)
      
      // Update user context with fresh data to ensure consistency
      if (updateUser && profileData) {
        updateUser({
          level: profileData.level || 1,
          streakDays: profileData.streak_days || 0,
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
    } finally {
      setIsFetchingStats(false)
      setIsLoadingStats(false)
      console.log('🔚 fetchUserStats completed')
    }
  }, [user?.id, isFetchingStats]) // Remove updateUser dependency to avoid infinite loop

  // Fallback function for real-time stats calculation
  const calculateStatsRealtime = useCallback(async () => {
    if (!user?.id) return

    try {
      console.log('🔄 Fallback: Calculating stats in real-time')
      
      // Get posts count
      const { count: postsCount, error: postsError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      
      if (postsError) {
        console.error('Error fetching posts count:', postsError)
      }

      // Get total likes on user's posts
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

      // Get total comments on user's posts
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
        totalPosts: postsCount || 0,
        totalLikes: totalLikes,
        totalComments: totalComments,
        streakDays: user.streakDays || 0,
        completedChallenges: 0, // Will be calculated by trigger
        level: level,
        experiencePoints: experiencePoints,
        joinedAt: user.joinedAt?.toString() || new Date().toISOString()
      }

      setUserStats(stats)
      console.log('📊 Real-time stats calculated:', stats)

      // Trigger stats update in database for future use
      try {
        await supabase.rpc('update_user_stats', { user_id_param: user.id })
        console.log('✅ Triggered database stats update')
      } catch (err: any) {
        console.log('⚠️ Could not trigger stats update:', err)
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

      // Skip fetching user likes for now to reduce queries - can be added later if needed
      console.log(`📝 Loaded ${posts?.length || 0} posts for user`)

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

        // Debug log for media type detection
        console.log(`📊 Post ${post.id}: post_type="${post.post_type}" (${typeof post.post_type}), ai_evaluation=${!!post.ai_evaluation}, mediaType="${mediaType}"`)

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
          videoEvaluation: post.ai_evaluation ? {
            overallScore: post.score || 0,
            pronunciation: post.ai_evaluation.pronunciation || {},
            grammar: post.ai_evaluation.grammar || {},
            vocabulary: post.ai_evaluation.vocabulary || {},
            fluency: post.ai_evaluation.fluency || {},
            feedback: post.ai_evaluation.feedback || "Analysis complete"
          } : undefined,
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

  // Load data on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      console.log('🔍 Profile Page - Loading data for user:', user.id)
      fetchUserStats()
      fetchUserPosts()
    }
  }, [user?.id]) // Only depend on user.id, not the callback functions

  // Debug log - only log when stats actually change
  useEffect(() => {
    console.log('🐛 State Debug - isLoadingStats:', isLoadingStats, 'userStats level:', userStats?.level, 'totalPosts:', userStats?.totalPosts)
  }, [isLoadingStats, userStats?.level, userStats?.totalPosts]) // Only depend on specific values

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive"
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      })
      return
    }

    // Show cropper dialog
    setSelectedAvatarFile(file)
    setShowAvatarCropper(true)
  }

  const handleAvatarCropComplete = async (croppedBlob: Blob) => {
    if (!user) return

    try {
      setIsUploading(true)

      // Delete old avatar if exists
      if (user.avatar && user.avatar.includes('supabase')) {
        try {
          const oldPath = user.avatar.split('/').pop()
          if (oldPath) {
            await supabase.storage
              .from('profile')
              .remove([`${user.id}/avatar/${oldPath}`])
          }
        } catch (error) {
          console.log('Could not delete old avatar:', error)
        }
      }

      // Upload cropped image to Supabase Storage
      const fileExt = selectedAvatarFile?.name.split('.').pop() || 'jpg'
      const fileName = `avatar-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/avatar/${fileName}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile')
        .upload(filePath, croppedBlob)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile')
        .getPublicUrl(filePath)

      // Update user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      // Update user context
      if (updateUser) {
        updateUser({ avatar: publicUrl })
      }

      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
        variant: "default"
      })

    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast({
        title: "Upload failed",
        description: "Failed to update profile picture",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      setShowAvatarCropper(false)
      setSelectedAvatarFile(null)
    }
  }

  // Handle background upload
  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive"
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit for background
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive"
      })
      return
    }

    // Show cropper dialog
    setSelectedBackgroundFile(file)
    setShowBackgroundCropper(true)
  }

  const handleBackgroundCropComplete = async (croppedBlob: Blob) => {
    if (!user) return

    try {
      setIsUploadingBackground(true)

      // Delete old background if exists
      if (user.background_url && user.background_url.includes('supabase')) {
        try {
          const oldPath = user.background_url.split('/').slice(-3).join('/') // Get user_id/background/filename
          await supabase.storage
            .from('profile')
            .remove([oldPath])
        } catch (error) {
          console.log('Could not delete old background:', error)
        }
      }

      // Upload cropped image to Supabase Storage
      const fileExt = selectedBackgroundFile?.name.split('.').pop() || 'jpg'
      const fileName = `background-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/background/${fileName}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile')
        .upload(filePath, croppedBlob)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile')
        .getPublicUrl(filePath)

      // Update user profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ background_url: publicUrl })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      // Refresh user data from database
      await refreshUser()

      toast({
        title: "Success",
        description: "Background image updated successfully!",
        variant: "default"
      })

    } catch (error) {
      console.error('Error uploading background:', error)
      toast({
        title: "Upload failed",
        description: "Failed to update background image",
        variant: "destructive"
      })
    } finally {
      setIsUploadingBackground(false)
      setShowBackgroundCropper(false)
      setSelectedBackgroundFile(null)
    }
  }

  // Handle profile update
  const handleProfileUpdate = async () => {
    if (!user) return

    try {
      console.log('🔄 Updating profile with data:', editProfile)
      
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({
          full_name: editProfile.name,
          bio: editProfile.bio,
          role: editProfile.role,
          major: editProfile.major,
          class_name: editProfile.class_name,
          academic_year: editProfile.academic_year,
          student_id: editProfile.student_id
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        throw error
      }

      console.log('✅ Profile updated successfully:', updatedProfile)

      // Update user context with new data
      if (updateUser) {
        updateUser({
          name: editProfile.name,
          bio: editProfile.bio,
          role: editProfile.role,
          major: editProfile.major,
          // Map database fields to user object properties
          academicYear: editProfile.academic_year,
          studentId: editProfile.student_id,
          className: editProfile.class_name
        })
      }

      // Refresh user data to ensure consistency
      if (refreshUser) {
        await refreshUser()
      }

      toast({
        title: "Profile Updated!",
        description: "Your profile information has been saved successfully.",
        variant: "default"
      })

      setIsEditing(false)

    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      })
    }
  }

  // Handle share profile
  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${user?.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user?.name}'s Profile`,
          text: `Check out ${user?.name}'s English learning journey!`,
          url: profileUrl,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(profileUrl)
        toast({
          title: "Link copied!",
          description: "Profile link copied to clipboard",
          variant: "default"
        })
      } catch (error) {
        console.error('Error copying to clipboard:', error)
      }
    }
  }

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative h-96 md:h-[450px] bg-gradient-to-r from-neo-mint/30 to-purist-blue/30 dark:from-purist-blue/20 dark:to-cassis/20 overflow-hidden mx-8 md:mx-16 lg:mx-24 xl:mx-48 2xl:mx-72 rounded-xl shadow-2xl"
        >
          {/* Background Image */}
          {user?.background_url ? (
            <img 
              src={user.background_url}
              alt="Profile background"
              className="absolute inset-0 w-full h-full object-cover object-center rounded-xl"
              style={{ 
                objectFit: 'cover',
                objectPosition: 'center'
              }}
              onLoad={() => console.log('Background image loaded successfully')}
              onError={(e) => console.error('Background image failed to load:', e)}
            />
          ) : (
            <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=1200')] bg-cover bg-center opacity-20 rounded-xl"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-xl"></div>

          <div className="absolute top-4 right-4 flex gap-2">
            {/* Upload new background */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
              onClick={() => backgroundInputRef.current?.click()}
              disabled={isUploadingBackground}
              title="Upload new background"
            >
              {isUploadingBackground ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>
            
            {/* Edit current background - only show if background exists */}
            {user?.background_url && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                onClick={() => setShowBackgroundCropper(true)}
                disabled={isUploadingBackground}
                title="Edit current background"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
              onClick={handleShareProfile}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
              onClick={() => router.push('/settings')}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* Hidden background input */}
          <input
            ref={backgroundInputRef}
            type="file"
            accept="image/*"
            onChange={handleBackgroundUpload}
            className="hidden"
          />
        </motion.div>

        <div className="relative z-10 -mt-20 pb-8 mx-8 md:mx-16 lg:mx-24 xl:mx-48 2xl:mx-72">
          {/* Profile Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-none shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  {/* Avatar Section */}
                  <div className="relative">
                    <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white dark:border-gray-800 shadow-xl">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white text-3xl">
                        {user.name ? user.name.substring(0, 2).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute -bottom-2 -right-2 rounded-full bg-white dark:bg-gray-900 shadow-lg hover:bg-neo-mint/10"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-neo-mint border-t-transparent" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>

                  {/* User Info */}
                  <div className="flex-1 text-center md:text-left">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={editProfile.name}
                            onChange={(e) => setEditProfile(prev => ({ ...prev, name: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={editProfile.bio}
                            onChange={(e) => setEditProfile(prev => ({ ...prev, bio: e.target.value }))}
                            className="mt-1 resize-none"
                            rows={3}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="role">Role</Label>
                            <select
                              id="role"
                              value={editProfile.role || ''}
                              onChange={(e) => setEditProfile(prev => ({ ...prev, role: e.target.value }))}
                              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neo-mint"
                            >
                              <option value="">Select Role</option>
                              <option value="student">Student</option>
                              <option value="teacher">Teacher</option>
                              <option value="admin">Admin</option>
                              <option value="staff">Staff</option>
                            </select>
                          </div>
                          
                          <div>
                            <Label htmlFor="academic_year">Academic Year</Label>
                            <Input
                              id="academic_year"
                              value={editProfile.academic_year || ''}
                              onChange={(e) => setEditProfile(prev => ({ ...prev, academic_year: e.target.value }))}
                              className="mt-1"
                              placeholder="e.g., 2024-2025"
                            />
                          </div>
                        </div>

                        {editProfile.role === 'student' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="major">Major</Label>
                              <Input
                                id="major"
                                value={editProfile.major || ''}
                                onChange={(e) => setEditProfile(prev => ({ ...prev, major: e.target.value }))}
                                className="mt-1"
                                placeholder="e.g., Technology"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="class_name">Class</Label>
                              <Input
                                id="class_name"
                                value={editProfile.class_name || ''}
                                onChange={(e) => setEditProfile(prev => ({ ...prev, class_name: e.target.value }))}
                                className="mt-1"
                                placeholder="e.g., SE07201"
                              />
                            </div>
                          </div>
                        )}

                        {editProfile.role === 'teacher' && (
                          <div>
                            <Label htmlFor="major">Subject</Label>
                            <Input
                              id="major"
                              value={editProfile.major || ''}
                              onChange={(e) => setEditProfile(prev => ({ ...prev, major: e.target.value }))}
                              className="mt-1"
                              placeholder="e.g., English Literature"
                            />
                          </div>
                        )}

                        {editProfile.role === 'staff' && (
                          <div>
                            <Label htmlFor="major">Position</Label>
                            <Input
                              id="major"
                              value={editProfile.major || ''}
                              onChange={(e) => setEditProfile(prev => ({ ...prev, major: e.target.value }))}
                              className="mt-1"
                              placeholder="e.g., Academic Coordinator"
                            />
                          </div>
                        )}

                        {editProfile.role === 'student' && (
                          <div>
                            <Label htmlFor="student_id">Student ID</Label>
                            <Input
                              id="student_id"
                              value={editProfile.student_id || ''}
                              onChange={(e) => setEditProfile(prev => ({ ...prev, student_id: e.target.value }))}
                              className="mt-1"
                              placeholder="e.g., BC00000"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button onClick={handleProfileUpdate} className="bg-gradient-to-r from-neo-mint to-purist-blue">
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => {
                            setIsEditing(false)
                            // Reset form to current user data
                            setEditProfile({
                              name: user.name || '',
                              bio: user.bio || '',
                              location: '',
                              role: user.role || '',
                              major: user.major || '',
                              class_name: user.className || '', // Map className to class_name for database
                              academic_year: user.academicYear || '',
                              student_id: user.studentId || ''
                            })
                          }}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        key={`${user.name}-${user.bio}`} // Key changes when name/bio updates
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                          <h1 className="text-3xl md:text-4xl font-bold gradient-text">{user.name}</h1>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsEditing(true)}
                            className="hover:bg-neo-mint/10"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <p className="text-muted-foreground mb-4 max-w-md">
                          {user.bio || "No bio added yet. Click the edit button to add one!"}
                        </p>

                        {/* Profile Information */}
                        {(user.role || user.major || user.className || user.academicYear || user.studentId) && (
                          <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Profile Information</h3>
                              {user.role && (
                                <Badge variant="secondary" className="capitalize text-xs px-2 py-0.5">
                                  {user.role}
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              {user.academicYear && (
                                <div className="text-muted-foreground">
                                  <span className="font-medium">Academic Year:</span> {user.academicYear}
                                </div>
                              )}
                              {user.major && (user.role === 'student' || user.role === 'teacher') && (
                                <div className="text-muted-foreground">
                                  <span className="font-medium">
                                    {user.role === 'teacher' ? 'Subject:' : 'Major:'}
                                  </span> {user.major}
                                </div>
                              )}
                              {user.major && user.role === 'staff' && (
                                <div className="text-muted-foreground">
                                  <span className="font-medium">Position:</span> {user.major}
                                </div>
                              )}
                              {user.className && user.role === 'student' && (
                                <div className="text-muted-foreground">
                                  <span className="font-medium">Class:</span> {user.className}
                                </div>
                              )}
                              {user.studentId && user.role === 'student' && (
                                <div className="text-muted-foreground">
                                  <span className="font-medium">Student ID:</span> {user.studentId}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              Joined {new Date(userStats?.joinedAt || '').toLocaleDateString('en-US', { 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Level and XP */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-neo-mint/10 to-purist-blue/10 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">Level {userStats?.level || 1}</span>
                            <span className="text-sm text-muted-foreground">
                              {userStats?.experiencePoints || 0} XP
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-neo-mint to-purist-blue h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${Math.min(((userStats?.experiencePoints || 0) % 1000) / 10, 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Content Section - Only Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 mx-8 md:mx-16 lg:mx-24 xl:mx-48 2xl:mx-72"
          >
            <div className="max-w-4xl mx-auto">
            {/* Search and Filter Controls */}
            <div className="mb-6 space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-white/20 dark:border-gray-700/20"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {['All', 'With AI', 'Videos', 'Images', 'Text Only'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      activeFilter === filter
                        ? 'bg-gradient-to-r from-neo-mint to-purist-blue text-white'
                        : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Content */}
            <div className="space-y-6">
              {isLoadingPosts ? (
                <PostsSkeleton />
              ) : filteredPosts.length === 0 ? (
                <EmptyState 
                  type="posts"
                  title={searchQuery ? "No posts found matching your search" : "No posts yet"}
                  description={searchQuery ? "Try adjusting your search or filters" : "Start sharing your English learning journey!"}
                />
              ) : (
                filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <FeedPost
                      key={post.id}
                      id={String(post.id)}
                      username={post.username}
                      userImage={post.userImage}
                      timeAgo={post.timeAgo}
                      content={post.content}
                      mediaType={post.mediaType || 'text'}
                      mediaUrl={post.mediaUrl}
                      mediaUrls={post.mediaUrls}
                      youtubeVideoId={post.youtubeVideoId}
                      textContent={post.textContent}
                      likes={post.likes}
                      comments={post.comments}
                      submission={post.submission}
                      videoEvaluation={post.videoEvaluation}
                      isNew={post.isNew || false}
                      title={post.title}
                    />
                  </motion.div>
                ))
              )}
            </div>
            </div>
          </motion.div>
        </div>
      </ProfileLayout>

      {/* Background Image Cropper */}
      <ImageCropper
        isOpen={showBackgroundCropper}
        onClose={() => {
          setShowBackgroundCropper(false)
          setSelectedBackgroundFile(null)
        }}
        onCropComplete={handleBackgroundCropComplete}
        imageFile={selectedBackgroundFile}
        currentImageUrl={user?.background_url}
        aspectRatio={2.5} // Adjusted to match the actual container aspect ratio (wider than 16:9)
        title="Crop Background Image"
      />

      {/* Avatar Image Cropper */}
      <ImageCropper
        isOpen={showAvatarCropper}
        onClose={() => {
          setShowAvatarCropper(false)
          setSelectedAvatarFile(null)
        }}
        onCropComplete={handleAvatarCropComplete}
        imageFile={selectedAvatarFile}
        currentImageUrl={user?.avatar}
        aspectRatio={1} // Square aspect ratio for avatar
        title="Crop Profile Picture"
      />
    </>
  )
}
