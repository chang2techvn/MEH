"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  X,
  User,
  MessageCircle,
  Calendar,
  Trophy,
  Target,
  Clock,
  ExternalLink,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatTimeAgo } from "./utils"

// Simple cache for user profile data
const profileCache = new Map<string, UserProfileData>()
const cacheExpiry = new Map<string, number>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface UserProfileData {
  id: string
  full_name: string
  username: string
  avatar_url: string
  proficiency_level: string
  bio: string
  native_language: string
  target_language: string
  streak_days: number
  experience_points: number
  level: number
  joined_date: string
  last_active: string
  achievements_count: number
  challenges_completed: number
  total_posts: number
  total_likes: number
}

interface UserProfilePopupProps {
  userId: string
  userName: string
  userImage: string
  isOpen: boolean
  onClose: () => void
  onMessageClick: (userId: string, userName: string) => void
  position: { x: number; y: number }
}

export function UserProfilePopup({
  userId,
  userName,
  userImage,
  isOpen,
  onClose,
  onMessageClick,
  position,
}: UserProfilePopupProps) {
  const router = useRouter()
  const [userData, setUserData] = useState<UserProfileData | null>(null)
  const [loading, setLoading] = useState(false) // Changed to false for immediate display
  const [detailsLoaded, setDetailsLoaded] = useState(false)

  // Create initial data from props for immediate display
  const initialData: UserProfileData = {
    id: userId,
    full_name: userName,
    username: userName,
    avatar_url: userImage,
    proficiency_level: 'beginner', // Default values
    bio: '',
    native_language: '',
    target_language: 'English',
    streak_days: 0,
    experience_points: 0,
    level: 1,
    joined_date: new Date().toISOString(),
    last_active: new Date().toISOString(),
    achievements_count: 0,
    challenges_completed: 0,
    total_posts: 0,
    total_likes: 0,
  }

  useEffect(() => {
    if (isOpen && userId) {
      // Check cache first
      const cached = profileCache.get(userId)
      const cacheTime = cacheExpiry.get(userId)
      const now = Date.now()
      
      if (cached && cacheTime && now - cacheTime < CACHE_DURATION) {
        // Use cached data
        setUserData(cached)
        setDetailsLoaded(true)
        return
      }
      
      // Set initial data immediately for fast display
      setUserData(initialData)
      setDetailsLoaded(false)
      
      // Load detailed data in background
      loadUserProfile()
    }
  }, [isOpen, userId])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      
      // Get user profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          username,
          avatar_url,
          proficiency_level,
          bio,
          native_language,
          target_language,
          streak_days,
          experience_points,
          level,
          total_posts,
          total_likes,
          completed_challenges
        `)
        .eq('user_id', userId)
        .single()

      if (profileError) {
        console.error("Error loading profile:", profileError)
        setLoading(false)
        setDetailsLoaded(true)
        return
      }

      // Get user creation date and other data in parallel
      const [userResult, achievementsResult, challengesResult] = await Promise.all([
        supabase
          .from('users')
          .select('created_at, last_login')
          .eq('id', userId)
          .single(),
        
        supabase
          .from('user_achievements')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
          
        supabase
          .from('challenge_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_correct', true)
      ])

      const { data: user } = userResult
      const { count: achievementsCount } = achievementsResult
      const { count: challengesCompleted } = challengesResult

      // Update with detailed data
      const detailedData = {
        id: userId,
        full_name: profile.full_name || userName,
        username: profile.username || userName,
        avatar_url: profile.avatar_url || userImage,
        proficiency_level: profile.proficiency_level || 'beginner',
        bio: profile.bio || '',
        native_language: profile.native_language || '',
        target_language: profile.target_language || 'English',
        streak_days: profile.streak_days || 0,
        experience_points: profile.experience_points || 0,
        level: profile.level || 1,
        joined_date: user?.created_at || new Date().toISOString(),
        last_active: user?.last_login || new Date().toISOString(),
        achievements_count: achievementsCount || 0,
        challenges_completed: profile.completed_challenges || 0,
        total_posts: profile.total_posts || 0,
        total_likes: profile.total_likes || 0,
      }

      setUserData(detailedData)
      
      // Cache the data
      profileCache.set(userId, detailedData)
      cacheExpiry.set(userId, Date.now())
    } catch (error) {
      console.error("Error loading user profile:", error)
    } finally {
      setLoading(false)
      setDetailsLoaded(true)
    }
  }

  const handleViewProfile = () => {
    router.push(`/profile/${userId}`)
    onClose()
  }

  const handleMessage = () => {
    onMessageClick(userId, userData?.full_name || userName)
    onClose()
  }

  if (!isOpen) return null

  // Calculate position to keep popup in viewport
  const popupWidth = 320
  const popupHeight = 450
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800

  let adjustedX = position.x - popupWidth - 20 // Position to the left of contacts with more spacing
  let adjustedY = position.y - 50 // Center vertically around click point

  // Keep popup in viewport horizontally
  if (adjustedX < 20) {
    adjustedX = position.x + 60 // Position to the right if not enough space on left
  }
  if (adjustedX + popupWidth > viewportWidth - 20) {
    adjustedX = viewportWidth - popupWidth - 20
  }

  // Keep popup in viewport vertically
  if (adjustedY + popupHeight > viewportHeight - 20) {
    adjustedY = viewportHeight - popupHeight - 20
  }
  if (adjustedY < 20) {
    adjustedY = 20
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-transparent"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5 w-80 backdrop-blur-sm"
        style={{
          left: adjustedX,
          top: adjustedY,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Profile
          </h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Always show user data immediately, load details in background */}
        {userData ? (
          <div className="space-y-4">
            {/* User Avatar and Basic Info */}
            <div className="flex items-center space-x-3">
              <div className="relative flex-shrink-0">
                <Avatar className="h-16 w-16 border-2 border-gray-200 dark:border-gray-600 shadow-lg">
                  <AvatarImage 
                    src={userData.avatar_url} 
                    alt={userData.full_name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold">
                    {userData.full_name ? userData.full_name.substring(0, 2).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2">
                  <Badge 
                    variant="secondary" 
                    className="text-[10px] px-1.5 py-0 h-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm font-medium leading-none"
                  >
                    {userData.proficiency_level}
                  </Badge>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {userData.full_name || userData.username || 'Unknown User'}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  @{userData.username || 'no-username'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {detailsLoaded ? `Joined ${formatTimeAgo(userData.joined_date)}` : 'Loading...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {userData.bio && detailsLoaded && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                  {userData.bio}
                </p>
              </div>
            )}

            {/* Level Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Level {userData.level}
                </span>
                <span className="text-xs text-gray-500">
                  {userData.experience_points} XP
                </span>
              </div>
              <Progress 
                value={Math.min((userData.experience_points % 1000) / 10, 100)} 
                className="h-2"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-semibold">
                    {detailsLoaded ? userData.achievements_count : '...'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">Achievements</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center">
                  <Target className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-semibold">
                    {detailsLoaded ? userData.challenges_completed : '...'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">Completed</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm font-semibold">
                    {detailsLoaded ? userData.streak_days : '...'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">Day Streak</span>
              </div>
            </div>

            {/* Language Info */}
            {userData.native_language && detailsLoaded && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Learning:</span>
                <span>{userData.native_language} → {userData.target_language}</span>
              </div>
            )}

            {/* Loading indicator for background data */}
            {!detailsLoaded && (
              <div className="flex items-center justify-center py-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                  Loading details...
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleViewProfile}
                className="flex-1 bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Profile
              </Button>
              <Button 
                onClick={handleMessage}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Failed to load user profile</p>
            <Button onClick={onClose} variant="outline" size="sm" className="mt-2">
              Close
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
