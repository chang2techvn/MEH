"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { 
  User, 
  Camera, 
  Edit3, 
  Save, 
  X, 
  MapPin, 
  Calendar, 
  Trophy, 
  BookOpen, 
  MessageCircle,
  Heart,
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
  List
} from "lucide-react"

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import ProfileLayout from "@/components/profile/profile-layout"
import FeedPost from "@/components/feed/feed-post"
import { PostSkeleton } from "@/components/community"
import AchievementBadge from "@/components/profile/achievement-badge"
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
}

interface EditProfile {
  name: string
  bio: string
  location: string
  major: string
  academicYear: string
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthState()
  const { isMobile } = useMobile()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // States
  const [mounted, setMounted] = useState(false) // Add mounted state like resources route
  const [authChecked, setAuthChecked] = useState(false) // New state to track if auth has been thoroughly checked
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("posts")
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [userPosts, setUserPosts] = useState<UserPost[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [editProfile, setEditProfile] = useState<EditProfile>({
    name: '',
    bio: '',
    location: '',
    major: '',
    academicYear: ''
  })

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

  // Initialize edit form when user data is available
  useEffect(() => {
    if (user) {
      setEditProfile({
        name: user.name || '',
        bio: user.bio || '',
        location: '',
        major: user.major || '',
        academicYear: user.academicYear || ''
      })
    }
  }, [user])

  // Fetch user statistics
  const fetchUserStats = async () => {
    if (!user) return

    try {
      setIsLoadingStats(true)
      
      // Get posts count
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Get total likes on user's posts
      const { data: likesData } = await supabase
        .from('likes')
        .select('post_id')
        .in('post_id', 
          (await supabase
            .from('posts')
            .select('id')
            .eq('user_id', user.id)
          ).data?.map(p => p.id) || []
        )

      // Get total comments on user's posts
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .in('post_id',
          (await supabase
            .from('posts')
            .select('id')
            .eq('user_id', user.id)
          ).data?.map(p => p.id) || []
        )

      // Get completed challenges count - try different table names
      let challengesCount = 0
      try {
        const { count } = await supabase
          .from('user_challenges')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'completed')
        challengesCount = count || 0
      } catch (error) {
        // Fallback to challenges table if user_challenges doesn't exist
        try {
          const { count } = await supabase
            .from('challenges')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
          challengesCount = count || 0
        } catch (fallbackError) {
          console.log('No challenges table found, setting count to 0')
          challengesCount = 0
        }
      }

      setUserStats({
        totalPosts: postsCount || 0,
        totalLikes: likesData?.length || 0,
        totalComments: commentsCount || 0,
        streakDays: user.streakDays || 0,
        completedChallenges: challengesCount || 0,
        level: user.level || 1,
        experiencePoints: user.experiencePoints || 0,
        joinedAt: user.joinedAt?.toString() || new Date().toISOString()
      })
    } catch (error) {
      console.error('Error fetching user stats:', error)
      toast({
        title: "Error",
        description: "Failed to load user statistics",
        variant: "destructive"
      })
    } finally {
      setIsLoadingStats(false)
    }
  }

  // Fetch user posts
  const fetchUserPosts = async () => {
    if (!user) return

    try {
      setIsLoadingPosts(true)
      
      // First fetch posts without join
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          title,
          media_url,
          media_urls,
          post_type,
          ai_evaluation,
          score,
          created_at,
          likes_count,
          comments_count,
          user_id,
          username,
          user_image,
          thumbnail_url,
          original_video_id
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (postsError) throw postsError

      // Then fetch likes for these posts separately
      let userLikes: string[] = []
      if (posts && posts.length > 0) {
        const postIds = posts.map(p => p.id)
        const { data: likesData } = await supabase
          .from('likes')
          .select('post_id')
          .in('post_id', postIds)
          .eq('user_id', user.id)
        
        userLikes = likesData?.map(like => like.post_id) || []
      }

      // Transform data to match FeedPost interface
      setUserPosts(posts?.map(post => {
        // Calculate time ago using helper function
        const timeAgo = formatTimeAgo(post.created_at)

        // Determine media type (copy logic from community)
        let mediaType: 'image' | 'video' | 'youtube' | 'text' | 'ai-submission' = 'text'
        
        // Check for YouTube
        const youtubeId = extractYouTubeId(post.content || "")
        if (youtubeId) {
          mediaType = 'youtube'
        } else if (post.media_url) {
          // Check if it's a video or image based on URL or post_type
          if (post.post_type === 'video' || 
              post.media_url?.includes('video') || 
              post.media_url?.includes('.mp4') ||
              post.media_url?.includes('.webm') ||
              post.media_url?.includes('.mov')) {
            mediaType = 'video'
          } else if (post.post_type === 'image' || 
                    post.media_url?.includes('image') ||
                    post.media_url?.includes('.jpg') ||
                    post.media_url?.includes('.jpeg') ||
                    post.media_url?.includes('.png') ||
                    post.media_url?.includes('.gif') ||
                    post.media_url?.includes('.webp')) {
            mediaType = 'image'
          }
        } else if (post.post_type === 'challenge' || post.post_type === 'submission') {
          mediaType = 'ai-submission'
        }

        return {
          id: post.id,
          username: post.username || user.name || 'Unknown User',
          userImage: post.user_image || user.avatar || '/placeholder.svg',
          timeAgo,
          content: post.content || '',
          mediaType,
          mediaUrl: post.media_url,
          mediaUrls: post.media_urls ? (Array.isArray(post.media_urls) ? post.media_urls : [post.media_urls]) : (post.media_url ? [post.media_url] : []),
          youtubeVideoId: youtubeId,
          textContent: mediaType === "text" ? post.content : undefined,
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          title: post.title,
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
  }

  // Load data on mount
  useEffect(() => {
    if (user) {
      fetchUserStats()
      fetchUserPosts()
    }
  }, [user])

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

    try {
      setIsUploading(true)

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
        variant: "default"
      })

      // Refresh the page or update context
      window.location.reload()

    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast({
        title: "Upload failed",
        description: "Failed to update profile picture",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Handle profile update
  const handleProfileUpdate = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editProfile.name,
          bio: editProfile.bio,
          major: editProfile.major,
          academic_year: editProfile.academicYear
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Profile updated successfully!",
        variant: "default"
      })

      setIsEditing(false)
      // Refresh or update context
      window.location.reload()

    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Update failed",
        description: "Failed to update profile",
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

  const statsCards = [
    { label: "Posts", value: userStats?.totalPosts || 0, icon: BookOpen, color: "text-neo-mint" },
    { label: "Likes", value: userStats?.totalLikes || 0, icon: Heart, color: "text-rose-500" },
    { label: "Comments", value: userStats?.totalComments || 0, icon: MessageCircle, color: "text-purist-blue" },
    { label: "Streak", value: userStats?.streakDays || 0, icon: Trophy, color: "text-amber-500" },
    { label: "Challenges", value: userStats?.completedChallenges || 0, icon: Target, color: "text-cassis" },
    { label: "Level", value: userStats?.level || 1, icon: Award, color: "text-purple-500" }
  ]

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
          className="relative h-64 md:h-80 bg-gradient-to-r from-neo-mint/30 to-purist-blue/30 dark:from-purist-blue/20 dark:to-cassis/20 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=1200')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>

          <div className="absolute top-4 right-4 flex gap-2">
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
        </motion.div>

        <div className="container relative z-10 -mt-20 pb-8 max-w-[600px] xl:max-w-[800px] mx-auto">
          {/* Profile Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
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
                            <Label htmlFor="major">Major</Label>
                            <Input
                              id="major"
                              value={editProfile.major}
                              onChange={(e) => setEditProfile(prev => ({ ...prev, major: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="academicYear">Academic Year</Label>
                            <Input
                              id="academicYear"
                              value={editProfile.academicYear}
                              onChange={(e) => setEditProfile(prev => ({ ...prev, academicYear: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleProfileUpdate} className="bg-gradient-to-r from-neo-mint to-purist-blue">
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
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

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                          {user.major && (
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              <span>{user.major}</span>
                            </div>
                          )}
                          {user.academicYear && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{user.academicYear}</span>
                            </div>
                          )}
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
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6"
          >
            {statsCards.map((stat, index) => (
              <Card key={stat.label} className="border-none shadow-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-gray-900/70 transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold">{isLoadingStats ? "..." : stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Content Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <TabsTrigger value="posts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint data-[state=active]:to-purist-blue data-[state=active]:text-white">
                  Posts
                </TabsTrigger>
                <TabsTrigger value="achievements" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint data-[state=active]:to-purist-blue data-[state=active]:text-white">
                  Achievements
                </TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint data-[state=active]:to-purist-blue data-[state=active]:text-white">
                  Activity
                </TabsTrigger>
              </TabsList>

              {/* Posts Tab */}
              <TabsContent value="posts" className="mt-6">
                {/* Remove Card wrapper to match community layout */}
                <div className="space-y-2 sm:space-y-4">
                  {isLoadingPosts ? (
                    Array(3)
                      .fill(0)
                      .map((_, i) => <PostSkeleton key={i} />)
                  ) : userPosts.length > 0 ? (
                    <div className="space-y-2 sm:space-y-4">
                      {userPosts.map((post) => (
                        <div key={post.id} id={`post-${post.id}`}>
                          <FeedPost
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
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      type="posts"
                      title="No posts yet"
                      description="Share your English learning journey with the community!"
                      actionText="Create Your First Post"
                      actionUrl="/community"
                    />
                  )}
                </div>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="mt-6">
                <Card className="border-none shadow-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      Achievements & Badges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {/* Achievement Badges */}
                      {[
                        { title: "First Post", description: "Created your first post", earned: userStats?.totalPosts && userStats.totalPosts > 0, icon: "📝" },
                        { title: "Social Butterfly", description: "Received 10+ likes", earned: userStats?.totalLikes && userStats.totalLikes >= 10, icon: "💖" },
                        { title: "Streak Master", description: "7 day learning streak", earned: userStats?.streakDays && userStats.streakDays >= 7, icon: "🔥" },
                        { title: "Challenge Accepted", description: "Completed 5 challenges", earned: userStats?.completedChallenges && userStats.completedChallenges >= 5, icon: "🎯" },
                        { title: "Level Up", description: "Reached level 5", earned: userStats?.level && userStats.level >= 5, icon: "⭐" },
                        { title: "Community Star", description: "100+ total interactions", earned: (userStats?.totalLikes || 0) + (userStats?.totalComments || 0) >= 100, icon: "🌟" }
                      ].map((achievement, index) => (
                        <AchievementBadge
                          key={achievement.title}
                          achievement={achievement}
                          index={index}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="mt-6">
                <Card className="border-none shadow-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purist-blue" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Mock activity data - replace with real data */}
                      {[
                        { action: "Completed challenge", item: "Daily Grammar Quiz", time: "2 hours ago", icon: Target },
                        { action: "Posted", item: "My English learning progress", time: "1 day ago", icon: BookOpen },
                        { action: "Received like on", item: "Pronunciation practice video", time: "2 days ago", icon: Heart },
                        { action: "Commented on", item: "Speaking challenge discussion", time: "3 days ago", icon: MessageCircle },
                        { action: "Achieved", item: "7-day learning streak", time: "1 week ago", icon: Trophy }
                      ].map((activity, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                        >
                          <div className="flex-shrink-0">
                            <activity.icon className="h-5 w-5 text-neo-mint" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">
                              <span className="font-medium">{activity.action}</span>
                              {activity.item && (
                                <>
                                  <span className="text-muted-foreground"> </span>
                                  <span className="text-purist-blue">"{activity.item}"</span>
                                </>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </ProfileLayout>
    </>
  )
}
