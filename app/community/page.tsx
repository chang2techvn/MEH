"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import OptimizedImage from "@/components/optimized/optimized-image"
import MainHeader from "@/components/ui/main-header"
import { MobileNavigation } from "@/components/home/mobile-navigation"
import { CommunityMobileBottomNavigation } from "@/components/community/community-mobile-bottom-navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { uploadVideo, uploadImage, formatFileSize } from "@/lib/file-upload"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { dbHelpers, supabase } from "@/lib/supabase"
import {
  Search,
  RefreshCw,
  ArrowUp,
  X,
  Send,
  Eye,
  Heart,
} from "lucide-react"
import FeedPost from "@/components/feed/feed-post"
import FeedFilter from "@/components/feed/feed-filter"
import FeedEmptyState from "@/components/feed/feed-empty-state"
import SEOMeta from "@/components/optimized/seo-meta"
import { useMobile } from "@/hooks/use-mobile"
import { useStories } from "@/hooks/use-stories"
import { useAuth } from "@/contexts/auth-context"
import type { Story } from "@/hooks/use-stories"
import { useState, useEffect, useRef } from "react"

// Import community components
import {
  LeftSidebar,
  RightSidebar,
  StoriesSection,
  CreatePostCard,
  CreatePostModal,
  EnhancedStoryCreator,
  PostSkeleton,
  formatTimeAgo,
  extractYouTubeId,
  isToday,
  isTomorrow,
  type Post,
  type Contact,
  type Event,
  type Group,
  type StoryViewer,
} from "@/components/community"
import { StoryViewersModal } from "@/components/community/story-viewers-modal"

// Format story time to show hours (e.g., "21h") or "now" for recent stories
const formatStoryTime = (dateString: string): string => {
  const now = new Date()
  const storyDate = new Date(dateString)
  const diffInMinutes = Math.floor((now.getTime() - storyDate.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 5) {
    return "now"
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m`
  } else {
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours}h`
    } else {
      // Story should expire after 24 hours, but just in case
      return "1d"
    }
  }
}

export default function CommunityPage() {
  const { isMobile } = useMobile()
  const { user } = useAuth()
  const { 
    stories, 
    loading: storiesLoading, 
    createStory, 
    viewStory,
    addStoryReply 
  } = useStories()
  
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")
  const [isPostingContent, setIsPostingContent] = useState(false)
  const [showLeftSidebar, setShowLeftSidebar] = useState(false)
  const [showRightSidebar, setShowRightSidebar] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeStory, setActiveStory] = useState<number | string | null>(null)
  const [activeUserStories, setActiveUserStories] = useState<Story[]>([])
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [progressKey, setProgressKey] = useState(0) // Force progress bar re-render
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [feedPosts, setFeedPosts] = useState<Post[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [trendingTopics, setTrendingTopics] = useState<{ name: string; count: number }[]>([])
  const [showStoryCreator, setShowStoryCreator] = useState(false)
  const [showStoryViewers, setShowStoryViewers] = useState(false)
  const [selectedStoryForViewers, setSelectedStoryForViewers] = useState<string | null>(null)
  const [storyPaused, setStoryPaused] = useState(false)
  const [storyReplyText, setStoryReplyText] = useState("")
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [showStoryReactions, setShowStoryReactions] = useState(false)
  const [storyReactionAnimations, setStoryReactionAnimations] = useState<Array<{id: string, emoji: string, x: number, y: number}>>([])
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 0)
  const [highlightPostId, setHighlightPostId] = useState<string | null>(null)

  const [selectedDate, setSelectedDate] = useState<Date>()
  const [location, setLocation] = useState<string>("")
  const [showLocationPicker, setShowLocationPicker] = useState(false) 
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showTagPeople, setShowTagPeople] = useState(false)
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null)
  const [selectedMedia, setSelectedMedia] = useState<File[]>([])
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([])
  const [taggedPeople, setTaggedPeople] = useState<string[]>([])
  const postFileInputRef = useRef<HTMLInputElement>(null!)

  // Extract highlight parameter from URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const highlight = urlParams.get('highlight')
      if (highlight) {
        setHighlightPostId(highlight)
        // Remove the parameter from URL after extracting
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [])
  
  // Load real data from Supabase
  const loadData = async () => {
    try {
      // Don't set loading state - let component show skeletons while data loads
      
      // Check authentication state first
      const { data: { session }, error: authError } = await supabase.auth.getSession()

      // Load all data in parallel for better performance
      const [
        postsResult,
        storiesResult,
        onlineUsersResult,
        eventsResult,
        groupsResult,
        trendingResult      
      ] = await Promise.all([
        // Get posts with fallback profile handling
        supabase
          .from('posts')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(20)
          .then(async (postsResult) => {
            if (postsResult.data) {
              // Get unique user_ids from posts
              const userIds = [...new Set(postsResult.data.map(post => post.user_id))]
              
              // Get profiles for all users
              const { data: profilesData } = await supabase
                .from('profiles')
                .select('user_id, full_name, username, avatar_url')
                .in('user_id', userIds)
              
              // Create a lookup map
              const profilesMap = new Map()
              profilesData?.forEach(profile => {
                profilesMap.set(profile.user_id, profile)
              })
              
              // Attach profiles to posts
              postsResult.data = postsResult.data.map(post => ({
                ...post,
                profile: profilesMap.get(post.user_id)
              }))
            }
            return postsResult
          }),
        dbHelpers.getStories(10),
        dbHelpers.getOnlineUsers(10),
        dbHelpers.getEvents(),
        dbHelpers.getGroups(),
        dbHelpers.getTrendingTopics(10)
      ])



      const postsData = postsResult.data || []
      const storiesData = storiesResult.data || []
      const onlineUsersData = onlineUsersResult.data || []
      const eventsData = eventsResult.data || []
      const groupsData = groupsResult.data || []
      const trendingData = trendingResult.data || []      
      
      console.log('🔍 Debug: onlineUsersData:', onlineUsersData)
      console.log('🔍 Debug: onlineUsersResult error:', onlineUsersResult.error)

      if (postsData.length === 0) {
        // Create some sample posts if none exist
        setFeedPosts([
          {
            id: 'sample-1',
            username: 'English Learner',
            userImage: "/placeholder.svg?height=40&width=40",
            timeAgo: '2 hours ago',
            content: 'Just practiced my English conversation skills! 🗣️ Feeling more confident every day.',
            mediaType: 'text',
            mediaUrl: null,
            youtubeVideoId: undefined,
            textContent: 'Just practiced my English conversation skills! 🗣️ Feeling more confident every day.',
            likes: 5,
            comments: 2,
            submission: undefined,
            videoEvaluation: undefined,
            isNew: false
          },
          {
            id: 'sample-2',
            username: 'Study Buddy',
            userImage: "/placeholder.svg?height=40&width=40",
            timeAgo: '4 hours ago',
            content: 'Check out this amazing pronunciation video I found!',
            mediaType: 'youtube',
            mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeVideoId: 'dQw4w9WgXcQ',
            textContent: undefined,
            likes: 12,
            comments: 5,
            submission: undefined,
            videoEvaluation: undefined,
            isNew: false
          }
        ])
      } else {
        setFeedPosts(postsData.map((post: any) => {
          // Parse AI evaluation if it exists
          let videoEvaluation = null
          if (post.ai_evaluation) {
            try {
              videoEvaluation = typeof post.ai_evaluation === 'string' 
                ? JSON.parse(post.ai_evaluation) 
                : post.ai_evaluation
            } catch (error) {
              console.error('Error parsing AI evaluation:', error)
            }
          }

          // Get media URLs - support both single and multiple media
          const mediaUrls = post.media_urls && Array.isArray(post.media_urls) && post.media_urls.length > 0
            ? post.media_urls
            : post.media_url ? [post.media_url] : []

          // Determine media type with AI submission support
          let mediaType: "video" | "text" | "none" | "ai-submission" | "youtube" | "image" = 'text'
          
          if (mediaUrls.length > 0) {
            const firstMediaUrl = mediaUrls[0]
            if (firstMediaUrl.includes('youtube') || post.post_type === 'youtube') {
              mediaType = 'youtube'
            } else if (videoEvaluation) {
              mediaType = 'ai-submission' // Video with AI evaluation (from challenges)
            } else if (post.post_type === 'image') {
              mediaType = 'image' // Image posts
            } else if (post.post_type === 'video') {
              mediaType = 'video' // Regular video without AI evaluation
            } else {
              // Auto-detect based on file extension or URL pattern
              const url = firstMediaUrl.toLowerCase()
              if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif') || url.includes('.webp')) {
                mediaType = 'image'
              } else if (url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') || url.includes('.avi')) {
                mediaType = 'video'
              } else {
                mediaType = 'video' // Default fallback
              }
            }
          } else {
            mediaType = 'text' // Text-only posts
          }

          return {
            id: post.id, // Keep as string UUID instead of converting to number
            username: post.profile?.full_name || post.profile?.username || 'Unknown User', // Từ profiles table
            userImage: post.profile?.avatar_url || "/placeholder.svg?height=40&width=40", // Từ profiles table
            timeAgo: formatTimeAgo(post.created_at || ''),
            content: post.content || '',
            mediaType,
            mediaUrl: mediaUrls[0], // First media URL for backward compatibility
            mediaUrls: mediaUrls, // All media URLs for new multiple media support
            youtubeVideoId: post.post_type === 'youtube' ? extractYouTubeId(mediaUrls[0] || '') : undefined,
            textContent: post.post_type === 'text' ? post.content : undefined,
            likes: post.likes_count || 0,          
            comments: post.comments_count || 0,
            title: post.title, // Add title for badge extraction
            submission: videoEvaluation ? {
              type: 'video_submission',
              videoUrl: mediaUrls[0],
              content: post.content,
              evaluation: videoEvaluation
            } : undefined,
            videoEvaluation: videoEvaluation,
            isNew: false
          }
        }))
      }

      // Stories data will be handled by useStories hook      
      
      // Transform contacts data (online users)
      if (onlineUsersData.length === 0) {
        // Create sample contacts if none exist
        setContacts([
          {
            id: "contact-1",
            name: "Sarah Johnson",
            image: "/placeholder.svg?height=40&width=40",
            online: true,
            lastActive: undefined
          },
          {
            id: "contact-2",
            name: "Mike Chen",
            image: "/placeholder.svg?height=40&width=40",
            online: true,
            lastActive: undefined
          },
          {
            id: "contact-3",
            name: "Emma Wilson",
            image: "/placeholder.svg?height=40&width=40",
            online: false,
            lastActive: "5 minutes ago"
          },
          {
            id: "contact-4",
            name: "Alex Rodriguez",
            image: "/placeholder.svg?height=40&width=40",
            online: false,
            lastActive: "2 hours ago"
          },
          {
            id: "contact-5",
            name: "Lisa Park",
            image: "/placeholder.svg?height=40&width=40",
            online: true,
            lastActive: undefined
          }
        ])
      } else {
        setContacts(onlineUsersData.map((profile: any, index: number) => ({
          id: profile.user_id || profile.id || `contact-${index}`, // Use original ID or fallback
          name: profile.full_name || profile.username || 'Unknown User',
          image: profile.avatar_url || "/placeholder.svg?height=40&width=40",
          online: profile.users?.last_active && new Date(profile.users.last_active) > new Date(Date.now() - 30 * 60 * 1000), // Active in last 30 minutes
          lastActive: profile.users?.last_active && new Date(profile.users.last_active) <= new Date(Date.now() - 30 * 60 * 1000) ? formatTimeAgo(profile.users.last_active) : undefined
        })))
      }      
      
      // Transform events data
      setEvents(eventsData.map((event: any, index: number) => ({
        id: event.id || `event-${index}`, // Use original ID or fallback
        title: event.title,
        date: new Date(event.startTime || event.start_date).toLocaleDateString(),
        time: new Date(event.startTime || event.start_date).toLocaleTimeString(),
        location: event.location,
        attendees: event.attendeeCount || 0,
        badge: isToday(new Date(event.startTime || event.start_date)) ? 'today' as const : 
               isTomorrow(new Date(event.startTime || event.start_date)) ? 'tomorrow' as const : 'upcoming' as const
      })))      
      
      // Transform groups data
      setGroups(groupsData.map((group: any, index: number) => ({
        id: group.id || `group-${index}`, // Use original ID or fallback
        name: group.name,
        image: group.avatar || "/placeholder.svg?height=40&width=40",
        members: group.memberCount || 0,
        privacy: group.isPublic ? 'public' as const : 'private' as const,
        active: true
      })))

      // Transform trending topics data
      setTrendingTopics(trendingData.map((topic: any) => ({
        name: topic.name,
        count: topic.count
      })))

    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Unable to load community data. Please refresh the page.",
        variant: "destructive"
      })
      
      // Set empty arrays instead of mock data
      setFeedPosts([])
      // Stories data will be handled by useStories hook
      setContacts([
        {
          id: 1,
          name: "Sarah Johnson",
          image: "/placeholder.svg?height=40&width=40",
          online: true,
          lastActive: undefined
        },
        {
          id: 2,
          name: "Mike Chen",
          image: "/placeholder.svg?height=40&width=40",
          online: true,
          lastActive: undefined
        },
        {
          id: 3,
          name: "Emma Wilson",
          image: "/placeholder.svg?height=40&width=40",
          online: false,
          lastActive: "5 minutes ago"
        }
      ])
      setEvents([])
      setGroups([])
      setTrendingTopics([])
    } finally {
      // Loading state is managed by initialLoad instead
    }
  }

  useEffect(() => {
    // Set loading to false immediately to show skeleton states
    setLoading(false)
    
    // Load data in background without blocking UI
    loadData().then(() => {
      setInitialLoad(false)
    }).catch(error => {
      console.error('Error loading community data:', error)
      setInitialLoad(false)
    })

    // Handle window resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    // Listen for new posts published from challenges
    const handleNewPostPublished = (event: CustomEvent) => {
      console.log("🎉 New post published event received:", event.detail)
      
      const newPost = {
        id: event.detail.id,
        username: event.detail.username,
        userImage: event.detail.userImage,
        timeAgo: 'Just now',
        content: event.detail.content,
        mediaType: event.detail.mediaType || 'ai-submission',
        mediaUrl: event.detail.videoUrl || event.detail.mediaUrl,
        youtubeVideoId: undefined,
        textContent: undefined,
        likes: 0,
        comments: 0,
        title: event.detail.title, // Add title for badge
        submission: event.detail.submission,
        videoEvaluation: event.detail.videoEvaluation,
        isNew: true
      }

      // Add new post to the beginning of the feed
      setFeedPosts(prev => [newPost, ...prev])
      
      // Show success toast
      toast({
        title: "New post published!",
        description: "Your post has been added to the community feed.",
      })
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("newPostPublished", handleNewPostPublished as EventListener)
    
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("newPostPublished", handleNewPostPublished as EventListener)
    }
  }, []) // Remove viewedStories dependency to prevent infinite loop

  // Scroll to highlighted post after data is loaded
  useEffect(() => {
    if (highlightPostId && feedPosts.length > 0 && !loading) {
      const scrollToPost = () => {
        const postElement = document.getElementById(`post-${highlightPostId}`)
        if (postElement) {
          postElement.scrollIntoView({ 
            behavior: "smooth", 
            block: "center" 
          })
          
          // Add highlight effect
          postElement.classList.add('ring-2', 'ring-neo-mint', 'dark:ring-purist-blue')
          
          // Remove highlight after 3 seconds
          setTimeout(() => {
            postElement.classList.remove('ring-2', 'ring-neo-mint', 'dark:ring-purist-blue')
          }, 3000)
          
          // Show toast notification
          toast({
            title: "📍 Your post is here!",
            description: "Successfully navigated to your published post.",
            duration: 3000,
          })
        }
      }
      
      // Delay scroll to ensure all posts are rendered
      setTimeout(scrollToPost, 500)
    }
  }, [highlightPostId, feedPosts, loading])

  // Set mounted to true for client-side rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-advance stories when viewing multiple stories
  useEffect(() => {
    if (activeStory && activeUserStories.length > 0 && !storyPaused) {
      const timer = setTimeout(() => {
        if (currentStoryIndex < activeUserStories.length - 1) {
          // Move to next story in current user's stories
          const newIndex = currentStoryIndex + 1
          setCurrentStoryIndex(newIndex)
          setActiveStory(activeUserStories[newIndex].id)
          setProgressKey(prev => prev + 1) // Force progress bar reset
          viewStory(String(activeUserStories[newIndex].id))
          
          // Update story viewers modal if open and user is story author
          if (showStoryViewers && user && activeUserStories[newIndex]?.author_id === user.id) {
            setSelectedStoryForViewers(activeUserStories[newIndex].id)
          } else if (showStoryViewers) {
            // Close modal if new story is not authored by current user
            setShowStoryViewers(false)
            setStoryPaused(false)
          }
        } else {
          // Move to next user's stories
          moveToNextUser()
        }
      }, 5000) // 5 seconds per story

      return () => clearTimeout(timer)
    }
  }, [activeStory, currentStoryIndex, activeUserStories, viewStory, storyPaused])

  // Helper function to move to next user's stories
  const moveToNextUser = () => {
    const allGroupedStories = getStoriesGroupedByUser()
    const currentUserIndex = allGroupedStories.findIndex(group => 
      group.stories.some(s => s.id === activeStory)
    )
    
    if (currentUserIndex !== -1 && currentUserIndex < allGroupedStories.length - 1) {
      // Move to next user
      const nextUserGroup = allGroupedStories[currentUserIndex + 1]
      setActiveUserStories(nextUserGroup.stories)
      setCurrentStoryIndex(0)
      setActiveStory(nextUserGroup.stories[0].id)
      setProgressKey(prev => prev + 1) // Force progress bar reset
      viewStory(String(nextUserGroup.stories[0].id))
      
      // Update story viewers modal if open and user is story author
      if (showStoryViewers && user && nextUserGroup.stories[0]?.author_id === user.id) {
        setSelectedStoryForViewers(nextUserGroup.stories[0].id)
      } else if (showStoryViewers) {
        // Close modal if new story is not authored by current user
        setShowStoryViewers(false)
        setStoryPaused(false)
      }
    } else {
      // No more users, close story viewer
      setActiveStory(null)
      setActiveUserStories([])
      setCurrentStoryIndex(0)
      setProgressKey(0)
      // Close viewers modal if open
      if (showStoryViewers) {
        setShowStoryViewers(false)
        setStoryPaused(false)
      }
    }
  }

  // Helper function to move to previous user's stories
  const moveToPreviousUser = () => {
    const allGroupedStories = getStoriesGroupedByUser()
    const currentUserIndex = allGroupedStories.findIndex(group => 
      group.stories.some(s => s.id === activeStory)
    )
    
    if (currentUserIndex > 0) {
      // Move to previous user
      const prevUserGroup = allGroupedStories[currentUserIndex - 1]
      const lastStoryIndex = prevUserGroup.stories.length - 1
      setActiveUserStories(prevUserGroup.stories)
      setCurrentStoryIndex(lastStoryIndex) // Start at last story of previous user
      setActiveStory(prevUserGroup.stories[lastStoryIndex].id)
      setProgressKey(prev => prev + 1) // Force progress bar reset
      viewStory(String(prevUserGroup.stories[lastStoryIndex].id))
      
      // Update story viewers modal if open and user is story author
      if (showStoryViewers && user && prevUserGroup.stories[lastStoryIndex]?.author_id === user.id) {
        setSelectedStoryForViewers(prevUserGroup.stories[lastStoryIndex].id)
      } else if (showStoryViewers) {
        // Close modal if new story is not authored by current user
        setShowStoryViewers(false)
        setStoryPaused(false)
      }
    }
  }

  // Navigation functions for stories
  const goToPreviousStory = () => {
    if (currentStoryIndex > 0) {
      // Previous story in current user's stories
      const newIndex = currentStoryIndex - 1
      setCurrentStoryIndex(newIndex)
      setActiveStory(activeUserStories[newIndex].id)
      setProgressKey(prev => prev + 1) // Force progress bar reset
      viewStory(String(activeUserStories[newIndex].id))
      
      // Update story viewers modal if open and user is story author
      if (showStoryViewers && user && activeUserStories[newIndex]?.author_id === user.id) {
        setSelectedStoryForViewers(activeUserStories[newIndex].id)
      } else if (showStoryViewers) {
        // Close modal if new story is not authored by current user
        setShowStoryViewers(false)
        setStoryPaused(false)
      }
    } else {
      // Move to previous user's stories
      moveToPreviousUser()
    }
  }

  const goToNextStory = () => {
    if (currentStoryIndex < activeUserStories.length - 1) {
      // Next story in current user's stories
      const newIndex = currentStoryIndex + 1
      setCurrentStoryIndex(newIndex)
      setActiveStory(activeUserStories[newIndex].id)
      setProgressKey(prev => prev + 1) // Force progress bar reset
      viewStory(String(activeUserStories[newIndex].id))
      
      // Update story viewers modal if open and user is story author
      if (showStoryViewers && user && activeUserStories[newIndex]?.author_id === user.id) {
        setSelectedStoryForViewers(activeUserStories[newIndex].id)
      } else if (showStoryViewers) {
        // Close modal if new story is not authored by current user
        setShowStoryViewers(false)
        setStoryPaused(false)
      }
    } else {
      // Move to next user's stories
      moveToNextUser()
    }
  }
  
  const handleStoryClick = (story: Story) => {
    // Check if this is from the "Add Story" button (handled in StoriesSection)
    // or if story.id is 0 for backward compatibility
    if (String(story.id) === "0" || story.id === "add-story") {
      setShowStoryCreator(true)
      return
    }

    // Find all stories from the same user
    const groupedStories = getStoriesGroupedByUser()
    const userGroup = groupedStories.find(group => 
      group.stories.some(s => s.id === story.id)
    )
    
    if (userGroup) {
      // Set all stories from this user
      setActiveUserStories(userGroup.stories)
      // Find the index of the clicked story
      const storyIndex = userGroup.stories.findIndex(s => s.id === story.id)
      setCurrentStoryIndex(storyIndex)
      setActiveStory(story.id)
      setProgressKey(prev => prev + 1) // Force progress bar reset
      
      // Mark story as viewed
      viewStory(String(story.id))
    }
  }

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Separate images and videos
    const imageFiles = files.filter(file => file.type.startsWith("image/"))
    const videoFiles = files.filter(file => file.type.startsWith("video/"))
    
    // Check if trying to upload multiple videos
    if (videoFiles.length > 1) {
      toast({
        title: "Multiple videos not allowed",
        description: "You can only upload one video per post",
        variant: "destructive",
      })
      return
    }
    
    // Check if trying to mix video with other files
    if (videoFiles.length > 0 && (imageFiles.length > 0 || selectedMedia.length > 0)) {
      toast({
        title: "Cannot mix videos with other files",
        description: "Please upload either one video OR multiple images, not both",
        variant: "destructive",
      })
      return
    }
    
    // Check if already have video and trying to add more files
    const hasExistingVideo = selectedMedia.some(file => file.type.startsWith("video/"))
    if (hasExistingVideo && files.length > 0) {
      toast({
        title: "Cannot add more files",
        description: "You already have a video. Remove it first to add other files",
        variant: "destructive",
      })
      return
    }

    // Combine with existing files
    const allFiles = [...selectedMedia, ...files]
    
    // Check file limits - max 10 images or 1 video
    if (imageFiles.length > 0 && allFiles.length > 10) {
      toast({
        title: "Too many images",
        description: "You can upload maximum 10 images per post",
        variant: "destructive",
      })
      return
    }

    const validFiles: File[] = []
    const previews: string[] = [...mediaPreviews]

    for (const file of files) {
      // Check file size limits
      const isVideo = file.type.startsWith("video/")
      const isImage = file.type.startsWith("image/")
      
      if (isVideo && file.size > 100 * 1024 * 1024) { // 100MB for videos
        toast({
          title: "Video file too large",
          description: `${file.name} is larger than 100MB`,
          variant: "destructive",
        })
        continue
      }
      
      if (isImage && file.size > 10 * 1024 * 1024) { // 10MB for images
        toast({
          title: "Image file too large", 
          description: `${file.name} is larger than 10MB`,
          variant: "destructive",
        })
        continue
      }

      // Check file type
      if (!isImage && !isVideo) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image or video file`,
          variant: "destructive",
        })
        continue
      }

      validFiles.push(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        previews.push(event.target?.result as string)
        if (previews.length === validFiles.length + mediaPreviews.length) {
          setMediaPreviews(previews)
        }
      }
      reader.readAsDataURL(file)
    }

    if (validFiles.length > 0) {
      setSelectedMedia([...selectedMedia, ...validFiles])

      console.log("📁 Media files selected:", validFiles.map(f => ({
        name: f.name,
        size: formatFileSize(f.size),
        type: f.type
      })))

      toast({
        title: "Media selected",
        description: `${validFiles.length} file(s) added to your post.`,
      })

      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }
  }

  // Add this function to remove selected media
  const removeSelectedMedia = (index?: number) => {
    if (index !== undefined) {
      // Remove specific file
      const newMedia = selectedMedia.filter((_, i) => i !== index)
      const newPreviews = mediaPreviews.filter((_, i) => i !== index)
      setSelectedMedia(newMedia)
      setMediaPreviews(newPreviews)
    } else {
      // Remove all files
      setSelectedMedia([])
      setMediaPreviews([])
    }
  }

  // Add this function to handle feeling selection
  const handleFeelingSelect = (feeling: string) => {
    setSelectedFeeling(feeling)
    setShowEmojiPicker(false)
  }

  // Add this function to handle location selection
  const handleLocationSelect = (place: string) => {
    setLocation(place)
    setShowLocationPicker(false)
  }

  // Add this function to handle person tagging
  const handlePersonTag = (person: string) => {
    if (!taggedPeople.includes(person)) {
      setTaggedPeople([...taggedPeople, person])
    }
    setShowTagPeople(false)
  }

  // Add this function to remove a tagged person
  const removeTaggedPerson = (person: string) => {
    setTaggedPeople(taggedPeople.filter((p) => p !== person))
  }

  // Helper function to group stories by user
  const getStoriesGroupedByUser = () => {
    const grouped = new Map<string, Story[]>()
    
    stories.forEach(story => {
      const userId = story.author_id
      if (!grouped.has(userId)) {
        grouped.set(userId, [])
      }
      grouped.get(userId)!.push(story)
    })
    
    // Convert to array and sort stories within each group by creation time
    return Array.from(grouped.entries()).map(([userId, userStories]) => ({
      userId,
      stories: userStories.sort((a, b) => 
        new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
      )
    }))
  }
  
  const handlePostSubmit = async () => {
    console.log("🚀 handlePostSubmit called")
    console.log("📝 newPostContent:", newPostContent)
    console.log("🖼️ mediaPreviews:", mediaPreviews)
    
    if (!newPostContent.trim() && mediaPreviews.length === 0) {
      console.log("❌ No content or media, returning early")
      return
    }

    console.log("🔄 Setting isPostingContent to true")
    setIsPostingContent(true)

    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50])
    }

    try {
      console.log("👤 Getting current user...")
      // Get current user
      const currentUser = await dbHelpers.getCurrentUser()
      console.log("👤 Current user:", currentUser)
      
      if (!currentUser) {
        console.log("❌ No current user found")
        toast({
          title: "Authentication required",
          description: "Please log in to create a post.",
          variant: "destructive",
        })
        setIsPostingContent(false)
        return
      }

      // Prepare post content - CHỈ dùng nội dung chính, không thêm feeling, location, etc.
      let fullContent = newPostContent.trim()

      console.log("📝 Clean content:", fullContent)

      // Determine post type and upload media if present
      let postType = 'text'
      let uploadedMediaUrls: string[] = []

      if (selectedMedia.length > 0) {
        console.log("📁 Uploading media files...", selectedMedia.length)
        
        try {
          for (const file of selectedMedia) {
            if (file.type.startsWith("video/")) {
              postType = 'video'
              const uploadResult = await uploadVideo(file)
              if (uploadResult.error) {
                throw new Error(uploadResult.error)
              }
              uploadedMediaUrls.push(uploadResult.url!)
            } else if (file.type.startsWith("image/")) {
              if (postType !== 'video') { // Keep video priority
                postType = 'image'
              }
              const uploadResult = await uploadImage(file)
              if (uploadResult.error) {
                throw new Error(uploadResult.error)
              }
              uploadedMediaUrls.push(uploadResult.url!)
            }
          }
          console.log("✅ Media uploaded successfully:", uploadedMediaUrls)
        } catch (uploadError) {
          console.log("❌ Error uploading media:", uploadError)
          toast({
            title: "Error uploading media",
            description: "Failed to upload your media files. Please try again.",
            variant: "destructive",
          })
          setIsPostingContent(false)
          return
        }
      }

      console.log("📄 Post type:", postType)
      console.log("📤 Creating post in Supabase...")

      // Create post in Supabase with media URLs
      const postData: any = {
        title: fullContent.substring(0, 100), // Use first 100 chars as title
        content: fullContent,
        user_id: currentUser.id,
        post_type: postType,
        tags: [] // Could extract hashtags from content
      }

      // Handle media URLs - use new media_urls column for multiple files
      if (uploadedMediaUrls.length > 1) {
        // Multiple files: use media_urls array
        postData.media_urls = uploadedMediaUrls
        postData.media_url = uploadedMediaUrls[0] // Keep first one for backward compatibility
      } else if (uploadedMediaUrls.length === 1) {
        // Single file: use traditional media_url
        postData.media_url = uploadedMediaUrls[0]
      }

      const { data: newPost, error } = await dbHelpers.createPost(postData)
      
      console.log("📤 Supabase response - data:", newPost)
      console.log("📤 Supabase response - error:", error)
      
      if (error || !newPost) {
        console.log("❌ Error creating post:", error)
        toast({
          title: "Error creating post",
          description: "There was an error publishing your post. Please try again.",
          variant: "destructive",
        })
        setIsPostingContent(false)
        return
      }      

      console.log("✅ Post created successfully!")
      
      // Add the new post to the feed với thông tin chính xác từ currentUser
      const newPostForFeed = {
        id: newPost.id,
        username: currentUser.name || "Anonymous User", // Từ currentUser
        userImage: currentUser.avatar || "/placeholder.svg?height=40&width=40", // Từ currentUser
        timeAgo: "Just now",
        content: fullContent,
        mediaType: (postType === 'video' ? 'video' : postType === 'image' ? 'image' : 'text') as "video" | "text" | "none" | "ai-submission" | "youtube" | "image",
        mediaUrl: uploadedMediaUrls[0], // First media URL for backward compatibility
        mediaUrls: uploadedMediaUrls, // All media URLs for multiple media support
        youtubeVideoId: undefined,
        textContent: postType === 'text' && uploadedMediaUrls.length === 0 ? fullContent : undefined,
        likes: 0,
        comments: 0,
        title: newPost.title,
        submission: undefined, // Không có AI evaluation cho post thường
        videoEvaluation: undefined, // Không có AI evaluation cho post thường
        isNew: true,
      }

      console.log("🔄 Adding new post to feed...")
      setFeedPosts([newPostForFeed, ...feedPosts])
      
      // Tự động remove "New Post" badge sau 30 giây
      setTimeout(() => {
        setFeedPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === newPost.id ? { ...post, isNew: false } : post
          )
        )
      }, 30000) // 30 seconds
      
      console.log("🧹 Resetting form...")
      // Reset form
      setNewPostContent("")
      setSelectedMedia([])
      setMediaPreviews([])
      setIsPostingContent(false)
      setShowNewPostForm(false)
      setSelectedFeeling(null)
      setLocation("")
      setTaggedPeople([])
      setSelectedDate(undefined)

      console.log("✅ Post published successfully!")
      toast({
        title: "Post published!",
        description: "Your post has been published to the community feed.",
      })

      // Scroll to the top of the feed to see the new post
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }, 300)
    } catch (error) {
      console.log("💥 Catch block error:", error)
      toast({
        title: "Error creating post",
        description: "There was an error publishing your post. Please try again.",
        variant: "destructive",
      })
      setIsPostingContent(false)
    }
  }

  const handleFilterChange = (filters: string[]) => {
    setActiveFilters(filters)
  }

  // Handle story viewers modal
  const handleStoryViewersClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event bubbling to story navigation
    const currentStory = activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory)
    if (currentStory && user && currentStory.author_id === user.id) {
      setSelectedStoryForViewers(currentStory.id)
      setShowStoryViewers(true)
      setStoryPaused(true) // Pause story progression
    }
  }

  // Handle closing story viewers
  const handleCloseStoryViewers = () => {
    setShowStoryViewers(false)
    setStoryPaused(false) // Resume story progression
  }

  // Handle story reply submission
  const handleStoryReplySubmit = async () => {
    if (!storyReplyText.trim() || !activeStory || isSubmittingReply) return

    setIsSubmittingReply(true)
    setStoryPaused(true) // Pause story while sending reply

    try {
      const success = await addStoryReply(String(activeStory), storyReplyText.trim())
      
      if (success) {
        setStoryReplyText("")
        // Keep story paused for a moment to show success
        setTimeout(() => {
          setStoryPaused(false)
        }, 1500)
      } else {
        setStoryPaused(false) // Resume if failed
      }
    } catch (error) {
      setStoryPaused(false) // Resume if failed
    } finally {
      setIsSubmittingReply(false)
    }
  }

  // Handle story reply input key press
  const handleStoryReplyKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleStoryReplySubmit()
    }
  }

  // Handle story reaction submission
  const handleStoryReaction = async (emoji: string) => {
    if (!activeStory || !user) return

    try {
      // Add floating animation
      const animationId = Date.now().toString()
      const buttonRect = document.querySelector('.story-reactions-button')?.getBoundingClientRect()
      
      setStoryReactionAnimations(prev => [...prev, {
        id: animationId,
        emoji,
        x: buttonRect ? buttonRect.left + buttonRect.width / 2 : window.innerWidth / 2,
        y: buttonRect ? buttonRect.top : window.innerHeight / 2
      }])

      // Remove animation after 3 seconds
      setTimeout(() => {
        setStoryReactionAnimations(prev => prev.filter(anim => anim.id !== animationId))
      }, 3000)

      // Close reactions popup
      setShowStoryReactions(false)

      // Add reaction to database using story_views table
      // Add reaction to existing reactions array or create new record
      const timestamp = new Date().toISOString()
      
      // First, try to get existing reaction record
      const { data: existingRecord } = await supabase
        .from('story_views')
        .select('id, reactions')
        .eq('story_id', activeStory)
        .eq('viewer_id', user.id)
        .eq('interaction_type', 'reaction')
        .single()

      let reactions = []
      if (existingRecord) {
        // Update existing record - add new reaction to array
        reactions = existingRecord.reactions || []
        
        // Check if this emoji already exists - if so, update timestamp
        const existingReactionIndex = reactions.findIndex((r: any) => r.emoji === emoji)
        if (existingReactionIndex >= 0) {
          reactions[existingReactionIndex].timestamp = timestamp
        } else {
          // Add new reaction
          reactions.push({ emoji, timestamp })
        }

        const { error: updateError } = await supabase
          .from('story_views')
          .update({
            reactions,
            reacted_at: timestamp,
            viewed_at: timestamp
          })
          .eq('id', existingRecord.id)
        
        if (updateError) throw updateError
      } else {
        // Create new reaction record
        reactions = [{ emoji, timestamp }]
        const { error: insertError } = await supabase
          .from('story_views')
          .insert({
            story_id: activeStory,
            viewer_id: user.id,
            interaction_type: 'reaction',
            reactions,
            reacted_at: timestamp,
            viewed_at: timestamp
          })
        
        if (insertError) throw insertError
      }

      toast({
        title: "Reaction Added",
        description: `You reacted with ${emoji}`
      })
    } catch (error: any) {
      console.error('Error adding story reaction:', error)
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive"
      })
    }
  }

  // Available story reactions
  const storyReactions = ['❤️', '😂', '😮', '😢', '😡', '👍']

  if (!mounted) return null

  // Helper function to toggle right sidebar on mobile
  const toggleRightSidebar = () => {
    setShowRightSidebar(!showRightSidebar)
    if (!showRightSidebar) {
      // Close left sidebar if opening right sidebar
      setShowLeftSidebar(false)
    }
  }

  // Helper function to toggle left sidebar on mobile
  const toggleLeftSidebar = () => {
    setShowLeftSidebar(!showLeftSidebar)
    if (!showLeftSidebar) {
      // Close right sidebar if opening left sidebar
      setShowRightSidebar(false)
    }
  }

  // Determine if we're on a small mobile device
  const isSmallMobile = windowWidth < 640 // sm breakpoint
  const isTablet = windowWidth >= 640 && windowWidth < 1024 // between sm and lg

  return (
    <>
      <SEOMeta
        title="Community | EnglishMastery - Connect with English Learners Worldwide"
        description="Join our global English learning community. Connect with learners worldwide, share your progress, participate in discussions, and grow together in a supportive environment."
        keywords={[
          "English community",
          "language learners",
          "English practice",
          "global community",
          "language exchange",
        ]}
      />      <div className="flex min-h-screen flex-col bg-[#f0f2f5] dark:bg-gray-900">
        <MainHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

        {/* Mobile menu */}
        <MobileNavigation 
          isOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)} 
        />

        {/* Main Content */}
        <main className="flex-1 relative">
          <div className="w-full max-w-none px-1 sm:px-2 md:px-4 lg:px-6 xl:px-8 2xl:px-12 py-2 sm:py-4">
            <div className="flex flex-col lg:flex-row lg:gap-4 xl:gap-6 2xl:gap-8 2xl:justify-center 2xl:max-w-[1800px] 2xl:mx-auto">
              {/* Left Sidebar */}
              <LeftSidebar 
                showLeftSidebar={showLeftSidebar}
                setShowLeftSidebar={setShowLeftSidebar}
                groups={groups}
              />

              {/* Main Feed */}
              <div className="flex-1 order-1 lg:order-2 max-w-full lg:max-w-[600px] xl:max-w-[800px] 2xl:max-w-[800px] 2xl:ml-32 2xl:mr-8">
                {/* Stories Section */}
                <StoriesSection
                  setShowStoryCreator={setShowStoryCreator}
                  handleStoryClick={handleStoryClick}
                />

                {/* Create Post Card */}
                <CreatePostCard
                  setShowNewPostForm={setShowNewPostForm}
                  setShowEmojiPicker={setShowEmojiPicker}
                  postFileInputRef={postFileInputRef}
                />

                {/* Feed Filters */}
                <div className="mb-2 sm:mb-4">
                  <FeedFilter onFilterChange={handleFilterChange} />
                </div>

                {/* Feed Posts */}
                <div className="space-y-2 sm:space-y-4">
                  {initialLoad ? (
                    Array(3)
                      .fill(0)
                      .map((_, i) => <PostSkeleton key={i} />)
                  ) : feedPosts.length > 0 ? (
                    feedPosts.map((post) => (
                      <div key={post.id} id={`post-${post.id}`}>
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
                          isNew={post.isNew}
                          title={post.title}
                        />
                      </div>
                    ))
                  ) : (
                    <FeedEmptyState
                      onRefresh={() => loadData()}
                      filterActive={activeFilters.length > 0}
                    />
                  )}

                  {feedPosts.length > 0 && (
                    <div className="flex justify-center py-4">
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          toast({
                            title: "Loading more posts",
                            description: "Fetching additional content for your feed",
                          })
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Load More
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar */}
              <RightSidebar
                showRightSidebar={showRightSidebar}
                setShowRightSidebar={setShowRightSidebar}
                contacts={contacts}
                events={events}
                trendingTopics={trendingTopics}
                loading={loading}
              />
            </div>
          </div>
        </main>        {/* Create Post Modal */}
        <CreatePostModal
          showNewPostForm={showNewPostForm}
          setShowNewPostForm={setShowNewPostForm}
          newPostContent={newPostContent}
          setNewPostContent={setNewPostContent}
          isPostingContent={isPostingContent}
          selectedFeeling={selectedFeeling}
          setSelectedFeeling={setSelectedFeeling}
          location={location}
          setLocation={setLocation}
          taggedPeople={taggedPeople}
          setTaggedPeople={setTaggedPeople}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedMedia={selectedMedia}
          setSelectedMedia={setSelectedMedia}
          mediaPreviews={mediaPreviews}
          setMediaPreviews={setMediaPreviews}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          showLocationPicker={showLocationPicker}
          setShowLocationPicker={setShowLocationPicker}
          showTagPeople={showTagPeople}
          setShowTagPeople={setShowTagPeople}
          postFileInputRef={postFileInputRef}
          contacts={contacts}
          handlePostSubmit={handlePostSubmit}
          handleMediaSelect={handleMediaSelect}
          removeSelectedMedia={removeSelectedMedia}
          handleFeelingSelect={handleFeelingSelect}
          handleLocationSelect={handleLocationSelect}
          handlePersonTag={handlePersonTag}
          removeTaggedPerson={removeTaggedPerson}
        />

        {/* Story Viewer */}
        <AnimatePresence>
          {activeStory !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 pb-16 md:pb-0"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveStory(null)}
                className="absolute top-4 right-4 rounded-full text-white z-60"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-[280px] mx-4 sm:max-w-xs md:max-w-sm lg:max-w-md md:mx-0"
              >
                {/* Story content */}
                <div className="relative aspect-[9/16] max-h-[calc(100vh-8rem)] md:max-h-none overflow-hidden rounded-xl bg-gradient-to-br from-neo-mint/20 to-purist-blue/20">
                  {/* Story Progress Bars */}
                  {activeUserStories.length > 1 && (
                    <div className="absolute top-2 left-3 right-3 flex gap-1 z-10">
                      {activeUserStories.map((_, index) => (
                        <div 
                          key={`${progressKey}-${index}`} // Use progressKey to force re-render
                          className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
                        >
                          <motion.div
                            key={`progress-${progressKey}-${index}`} // Unique key for each animation
                            className="h-full bg-white"
                            initial={{ width: index < currentStoryIndex ? "100%" : "0%" }}
                            animate={{ 
                              width: index < currentStoryIndex ? "100%" : 
                                     index === currentStoryIndex ? "100%" : "0%" 
                            }}
                            transition={{ 
                              duration: index === currentStoryIndex ? (storyPaused ? 0 : 5) : 0,
                              ease: "linear",
                              delay: 0 // No delay to start immediately
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Enhanced Story Content Rendering */}
                  {(() => {
                    const currentStory = activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory)
                    if (!currentStory) return null

                    const mediaUrl = currentStory?.media_url || (currentStory?.images?.[0])
                    const mediaType = currentStory?.media_type
                    const backgroundColor = currentStory?.background_color || '#000000'
                    const backgroundImage = currentStory?.background_image
                    const textElements = currentStory?.text_elements || []
                    const mediaTransform = currentStory?.media_transform
                    
                    const isVideo = mediaType === 'video' || 
                      (mediaUrl && (mediaUrl.includes('.mp4') || 
                      mediaUrl.includes('.webm') || 
                      mediaUrl.includes('.mov') ||
                      mediaUrl.includes('video') ||
                      mediaUrl.includes('.avi')))

                    return (
                      <div 
                        className="w-full h-full relative overflow-hidden"
                        style={{
                          ...(backgroundImage 
                            ? {
                                backgroundImage: `url(${backgroundImage})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                              }
                            : backgroundColor.includes('gradient') 
                              ? { backgroundImage: backgroundColor }
                              : { backgroundColor: backgroundColor }
                          )
                        }}
                      >
                        {/* Background Media */}
                        {mediaUrl && (
                          <div 
                            className="absolute inset-0 overflow-hidden"
                            style={{
                              transform: mediaTransform ? 
                                `scale(${mediaTransform.scale || 1}) translate(${mediaTransform.x || 0}px, ${mediaTransform.y || 0}px) rotate(${mediaTransform.rotation || 0}deg)` :
                                undefined
                            }}
                          >
                            {isVideo ? (
                              <video
                                key={activeStory} // Force re-render when story changes
                                src={mediaUrl}
                                className="w-full h-full object-cover"
                                autoPlay
                                muted
                                loop
                                playsInline
                                controls={false}
                                onLoadedData={(e) => {
                                  // Restart video from beginning when story opens
                                  e.currentTarget.currentTime = 0
                                  e.currentTarget.play()
                                }}
                                onClick={(e) => {
                                  // Restart video when clicked
                                  e.currentTarget.currentTime = 0
                                  e.currentTarget.play()
                                }}
                              />
                            ) : (
                              <Image
                                src={mediaUrl}
                                alt="Story"
                                fill
                                priority={true}
                                className="object-cover"
                                placeholder="blur"
                                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                              />
                            )}
                          </div>
                        )}

                        {/* Text Elements */}
                        {textElements.map((textElement: any, index: number) => (
                          <div
                            key={textElement.id || index}
                            className="absolute select-none pointer-events-none z-10"
                            style={{
                              left: `${textElement.x}%`,
                              top: `${textElement.y}%`,
                              transform: 'translate(-50%, -50%)',
                              fontSize: `${textElement.fontSize}px`,
                              color: textElement.color,
                              fontFamily: textElement.fontFamily,
                              fontWeight: textElement.fontWeight,
                              fontStyle: textElement.fontStyle,
                              textAlign: textElement.textAlign as any,
                              backgroundColor: textElement.backgroundColor !== 'transparent' ? textElement.backgroundColor : undefined,
                              padding: textElement.backgroundColor !== 'transparent' ? '4px 8px' : undefined,
                              borderRadius: textElement.backgroundColor !== 'transparent' ? '4px' : undefined,
                              textShadow: '1px 1px 2px rgba(0,0,0,0.5)', // Add shadow for better readability
                            }}
                          >
                            {textElement.text}
                          </div>
                        ))}
                      </div>
                    )
                  })()}

                  {/* Navigation Areas and Buttons */}
                  <>
                    {/* Previous Story Area (invisible clickable area) - excluding bottom reply area */}
                    <div 
                      className="absolute left-0 top-0 w-1/3 bottom-16 cursor-pointer z-10"
                      onClick={goToPreviousStory}
                    />
                    
                    {/* Next Story Area (invisible clickable area) - excluding top area for eye button and bottom reply area */}
                    <div 
                      className="absolute right-0 top-16 w-1/3 bottom-16 cursor-pointer z-10"
                      onClick={goToNextStory}
                    />

                    {/* Visible Navigation Buttons */}
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 border border-white/20"
                        onClick={goToPreviousStory}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </Button>
                    </div>

                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 border border-white/20"
                        onClick={goToNextStory}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </div>
                  </>

                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex items-center gap-2 z-20">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-white">
                      <AvatarImage src={
                        (activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory))?.profiles?.avatar_url || "/placeholder.svg"
                      } />
                      <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
                        {(activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory))?.profiles?.full_name?.substring(0, 2) || 
                         (activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory))?.profiles?.username?.substring(0, 2) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm sm:text-base text-white">
                        {(activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory))?.profiles?.full_name || 
                         (activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory))?.profiles?.username || "Unknown"}
                      </p>
                      <p className="text-xs text-white/70">
                        {(activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory))?.created_at 
                          ? formatStoryTime((activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory))!.created_at!) 
                          : "now"
                        }
                      </p>
                    </div>
                  </div>

                  {/* Story viewers - Only show for story author */}
                  {user && (activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory))?.author_id === user.id && (
                    <>
                      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-30">
                        <div 
                          className="h-8 rounded-full bg-black/30 text-white px-3 flex items-center cursor-pointer hover:bg-black/40 transition-colors"
                          onClick={handleStoryViewersClick}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          <span className="text-xs">{(activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory))?.views_count || 0}</span>
                        </div>
                      </div>

                      {/* Story Viewers Overlay */}
                      <StoryViewersModal 
                        isOpen={showStoryViewers}
                        onClose={handleCloseStoryViewers}
                        storyId={selectedStoryForViewers || ''}
                        storyAuthorId={user?.id || ''}
                      />
                    </>
                  )}

                  {/* Story interactions */}
                  <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 px-3 sm:px-4 z-20 mb-safe">
                    <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full p-1.5 sm:p-2">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-white flex-shrink-0">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
                          {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      {(() => {
                        const currentStory = activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory)
                        const isOwnStory = currentStory && user && currentStory.author_id === user.id
                        
                        if (isOwnStory) {
                          return (
                            <div className="flex-1 flex items-center justify-center text-white/70 text-sm">
                              <span>This is your story</span>
                            </div>
                          )
                        }
                        
                        return (
                          <div className="flex gap-1 items-center flex-1 min-w-0">
                            {/* Maximized Story Reply Input with integrated Send button */}
                            <div className="relative flex-1 min-w-0">
                              <Input
                                placeholder="Reply to story..."
                                className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/70 focus-visible:ring-1 focus-visible:ring-white/50 focus-visible:ring-offset-0 text-sm rounded-full px-4 py-2 pr-12"
                                value={storyReplyText}
                                onChange={(e) => setStoryReplyText(e.target.value)}
                                onKeyDown={handleStoryReplyKeyPress}
                                onFocus={() => setStoryPaused(true)} // Pause story when focusing on input
                                onBlur={() => {
                                  // Only resume if not submitting reply
                                  if (!isSubmittingReply) {
                                    setStoryPaused(false)
                                  }
                                }}
                                disabled={isSubmittingReply}
                              />
                              
                              {/* Send Button inside input */}
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="absolute right-1 top-1/2 -translate-y-1/2 text-white h-8 w-8 rounded-full bg-transparent hover:bg-white/20 disabled:opacity-50 transition-all duration-200"
                                onClick={handleStoryReplySubmit}
                                disabled={!storyReplyText.trim() || isSubmittingReply}
                              >
                                {isSubmittingReply ? (
                                  <svg className="animate-spin h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                  </svg>
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            
                            {/* Story Reactions Button - compact and right-aligned */}
                            <Popover open={showStoryReactions} onOpenChange={setShowStoryReactions}>
                              <PopoverTrigger asChild>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="story-reactions-button h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all duration-200 flex-shrink-0"
                                  onClick={() => setStoryPaused(true)}
                                >
                                  <Heart className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent 
                                className="w-auto p-1 bg-black/30 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl"
                                align="end"
                                side="top"
                                sideOffset={10}
                              >
                                <div className="flex gap-1">
                                  {storyReactions.map((emoji) => (
                                    <Button
                                      key={emoji}
                                      variant="ghost"
                                      size="sm"
                                      className="text-lg p-1 h-auto hover:scale-110 transition-transform duration-200 hover:bg-white/10 rounded-xl min-w-0"
                                      onClick={() => handleStoryReaction(emoji)}
                                    >
                                      {emoji}
                                    </Button>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Story Creator */}
        <EnhancedStoryCreator isOpen={showStoryCreator} onClose={() => setShowStoryCreator(false)} />

        {/* Floating Story Reaction Animations */}
        <AnimatePresence>
          {storyReactionAnimations.map((reaction) => (
            <motion.div
              key={reaction.id}
              initial={{ 
                opacity: 1, 
                scale: 1, 
                x: reaction.x - 20, 
                y: reaction.y - 20 
              }}
              animate={{ 
                opacity: 0, 
                scale: 1.5, 
                y: reaction.y - 120,
                x: reaction.x - 20 + (Math.random() - 0.5) * 40
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, ease: "easeOut" }}
              className="fixed pointer-events-none z-[9999] text-3xl"
              style={{
                left: 0,
                top: 0,
              }}
            >
              {reaction.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Mobile Bottom Navigation - Only visible on mobile */}
        <div className="md:hidden">
          <CommunityMobileBottomNavigation />
        </div>
      </div>
    </>
  )
}
