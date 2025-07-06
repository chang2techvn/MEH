"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import OptimizedImage from "@/components/optimized/optimized-image"
import MainHeader from "@/components/ui/main-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
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
} from "lucide-react"
import FeedPost from "@/components/feed/feed-post"
import FeedFilter from "@/components/feed/feed-filter"
import FeedEmptyState from "@/components/feed/feed-empty-state"
import SEOMeta from "@/components/optimized/seo-meta"
import { useMobile } from "@/hooks/use-mobile"
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
  type Story,
  type Post,
  type Contact,
  type Event,
  type Group,
  type StoryViewer,
} from "@/components/community"

export default function CommunityPage() {
  const { isMobile } = useMobile()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")
  const [isPostingContent, setIsPostingContent] = useState(false)
  const [showLeftSidebar, setShowLeftSidebar] = useState(false)
  const [showRightSidebar, setShowRightSidebar] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeStory, setActiveStory] = useState<number | string | null>(null)
  const [viewedStories, setViewedStories] = useState<(number | string)[]>([])
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [feedPosts, setFeedPosts] = useState<Post[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [trendingTopics, setTrendingTopics] = useState<{ name: string; count: number }[]>([])
  const [showStoryCreator, setShowStoryCreator] = useState(false)
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 0)
  const [highlightPostId, setHighlightPostId] = useState<string | null>(null)

  const [selectedDate, setSelectedDate] = useState<Date>()
  const [location, setLocation] = useState<string>("")
  const [showLocationPicker, setShowLocationPicker] = useState(false) 
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showTagPeople, setShowTagPeople] = useState(false)
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null)
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [taggedPeople, setTaggedPeople] = useState<string[]>([])
  const postFileInputRef = useRef<HTMLInputElement>(null!)
  const [storyViewers, setStoryViewers] = useState<StoryViewer[]>([])

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
      setLoading(true)
    
      
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
        supabase
          .from('posts')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(20),
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

          // Determine media type with AI submission support
          let mediaType: "video" | "text" | "none" | "ai-submission" | "youtube" | "image" = 'text'
          if (post.media_url) {
            if (post.media_url.includes('youtube') || post.post_type === 'youtube') {
              mediaType = 'youtube'
            } else if (videoEvaluation) {
              mediaType = 'ai-submission' // Video with AI evaluation (from challenges)
            } else {
              mediaType = 'video' // Regular video without AI evaluation
            }
          } else {
            mediaType = 'text' // Text-only posts
          }

          return {
            id: post.id, // Keep as string UUID instead of converting to number
            username: post.username || 'Unknown User', // Use username directly from posts table
            userImage: post.user_image || "/placeholder.svg?height=40&width=40", // Use user_image directly from posts table
            timeAgo: formatTimeAgo(post.created_at || ''),
            content: post.content || '',
            mediaType,
            mediaUrl: post.media_url,
            youtubeVideoId: post.post_type === 'youtube' ? extractYouTubeId(post.media_url || '') : undefined,
            textContent: post.post_type === 'text' ? post.content : undefined,
            likes: post.likes_count || 0,          
            comments: post.comments_count || 0,
            submission: videoEvaluation ? {
              type: 'video_submission',
              videoUrl: post.media_url,
              content: post.content,
              evaluation: videoEvaluation
            } : undefined,
            videoEvaluation: videoEvaluation,
            isNew: false
          }
        }))
      }

      // Transform stories data to include user information
      setStories([
        {
          id: 0,
          user: "Add Story",
          userImage: "/placeholder.svg?height=40&width=40",
          storyImage: "",
          time: "",
          viewed: false,
          isAddStory: true,
        },        
        ...storiesData.map((story: any, index: number) => ({
          id: story.id || `story-${index + 1}`, // Keep UUID as string or use fallback
          user: story.author?.name || 'Unknown User',
          userImage: story.author?.avatar || "/placeholder.svg?height=40&width=40",
          storyImage: story.media_url || "/placeholder.svg?height=200&width=200",
          time: formatTimeAgo(story.created_at || ''),
          viewed: viewedStories.includes(story.id || `story-${index + 1}`),
        }))
      ])      
      
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
      setStories([{
        id: 0,
        user: "Add Story",
        userImage: "/placeholder.svg?height=40&width=40",
        storyImage: "",
        time: "",
        viewed: false,
        isAddStory: true,
      }])
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
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

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

  // Handle scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowScrollToTop(true)
      } else {
        setShowScrollToTop(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  const handleStoryClick = (id: number | string) => {
    if (id === 0) {
      // This is the "Add Story" button
      setShowStoryCreator(true)
      return
    }

    setActiveStory(id)
    if (!viewedStories.includes(id)) {
      setViewedStories([...viewedStories, id])

      // In a real app, you would load actual story viewers from the database
      setStoryViewers([
        { id: 1, name: "Sarah Chen", image: "/placeholder.svg?height=40&width=40", timeViewed: "5m ago" },
        { id: 2, name: "John Wilson", image: "/placeholder.svg?height=40&width=40", timeViewed: "10m ago" },
        { id: 3, name: "Lisa Wong", image: "/placeholder.svg?height=40&width=40", timeViewed: "15m ago" },
        { id: 4, name: "Mike Johnson", image: "/placeholder.svg?height=40&width=40", timeViewed: "20m ago" },
        { id: 5, name: "David Kim", image: "/placeholder.svg?height=40&width=40", timeViewed: "25m ago" },
      ])
    }

    // Auto close story after 5 seconds
    setTimeout(() => {
      setActiveStory(null)
    }, 5000)
  }

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file",
        variant: "destructive",
      })
      return
    }

    setSelectedMedia(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setMediaPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    toast({
      title: "Media selected",
      description: `${file.name} has been attached to your post.`,
    })

    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  // Add this function to remove selected media
  const removeSelectedMedia = () => {
    setSelectedMedia(null)
    setMediaPreview(null)
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
  
  const handlePostSubmit = async () => {
    if (!newPostContent.trim() && !mediaPreview) return

    setIsPostingContent(true)

    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50])
    }

    try {
      // Get current user
      const currentUser = await dbHelpers.getCurrentUser()
      if (!currentUser) {
        toast({
          title: "Authentication required",
          description: "Please log in to create a post.",
          variant: "destructive",
        })
        setIsPostingContent(false)
        return
      }

      // Prepare post content
      let fullContent = newPostContent
      if (selectedFeeling) fullContent += ` — feeling ${selectedFeeling}`
      if (location) fullContent += ` — at ${location}`
      if (taggedPeople.length > 0) fullContent += ` — with ${taggedPeople.join(", ")}`
      if (selectedDate) fullContent += ` — ${selectedDate.toLocaleDateString()}`

      // Determine post type
      let postType = 'text'
      if (mediaPreview && selectedMedia?.type.startsWith("video/")) {
        postType = 'video'
      } else if (mediaPreview && selectedMedia?.type.startsWith("image/")) {
        postType = 'image'
      }      

      // Create post in Supabase
      const { data: newPost, error } = await dbHelpers.createPost({
        title: fullContent.substring(0, 100), // Use first 100 chars as title
        content: fullContent,
        author_id: currentUser.id,
        type: postType,
        tags: [] // Could extract hashtags from content
      })
      
      if (error || !newPost) {
        toast({
          title: "Error creating post",
          description: "There was an error publishing your post. Please try again.",
          variant: "destructive",
        })
        setIsPostingContent(false)
        return
      }      

      // Add the new post to the feed
      const newPostForFeed = {
        id: newPost.id, // Keep as string UUID instead of converting to number
        username: currentUser.name || "You",
        userImage: currentUser.avatar || "/placeholder.svg?height=40&width=40",
        timeAgo: "Just now",
        content: fullContent,
        mediaType: postType === 'video' ? 'video' : mediaPreview ? 'text' : 'none' as "video" | "text" | "none" | "ai-submission" | "youtube",
        mediaUrl: mediaPreview,
        likes: 0,
        comments: 0,
        isNew: true,
      }

      setFeedPosts([newPostForFeed, ...feedPosts])
      
      // Reset form
      setNewPostContent("")
      setIsPostingContent(false)
      setShowNewPostForm(false)
      setSelectedFeeling(null)
      setLocation("")
      setTaggedPeople([])
      setSelectedDate(undefined)
      setSelectedMedia(null)
      setMediaPreview(null)

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
      toast({
        title: "Error creating post",
        description: "There was an error publishing your post. Please try again.",
        variant: "destructive",
      })
      setIsPostingContent(false)
    }
  }

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const handleFilterChange = (filters: string[]) => {
    setActiveFilters(filters)
  }

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

        {/* Mobile Search Bar */}
        <div className="md:hidden bg-white dark:bg-gray-800 px-4 py-2 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search EnglishMastery"
              className="pl-9 bg-gray-100 dark:bg-gray-700 border-none rounded-full"
            />
          </div>
        </div>        {/* Main Content */}
        <main className="flex-1 relative">
          <div className="container mx-auto px-2 sm:px-4 py-4">
            <div className="flex flex-col lg:flex-row lg:gap-4 xl:gap-6">
              {/* Left Sidebar */}
              <LeftSidebar 
                showLeftSidebar={showLeftSidebar}
                setShowLeftSidebar={setShowLeftSidebar}
                groups={groups}
              />

              {/* Main Feed */}
              <div className="flex-1 order-1 lg:order-2 max-w-full lg:max-w-[600px] xl:max-w-[700px]">
                {/* Stories Section */}
                <StoriesSection
                  stories={stories}
                  loading={loading}
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
                <div className="mb-4">
                  <FeedFilter onFilterChange={handleFilterChange} />
                </div>

                {/* Feed Posts */}
                <div className="space-y-4">
                  {loading ? (
                    Array(3)
                      .fill(0)
                      .map((_, i) => <PostSkeleton key={i} />)
                  ) : feedPosts.length > 0 ? (
                    feedPosts.map((post) => (
                      <div key={post.id} id={`post-${post.id}`}>
                        <FeedPost
                          username={post.username}
                          userImage={post.userImage}
                          timeAgo={post.timeAgo}
                          content={post.content}
                          mediaType={post.mediaType}
                          mediaUrl={post.mediaUrl}
                          youtubeVideoId={post.youtubeVideoId}
                          textContent={post.textContent}
                          likes={post.likes}
                          comments={post.comments}
                          submission={post.submission}
                          videoEvaluation={post.videoEvaluation}
                          isNew={post.isNew}
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
          mediaPreview={mediaPreview}
          setMediaPreview={setMediaPreview}
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
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveStory(null)}
                className="absolute top-4 right-4 rounded-full text-white"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-xs sm:max-w-sm md:max-w-md"
              >
                {/* Story progress bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="h-full bg-neo-mint dark:bg-purist-blue"
                  />
                </div>

                {/* Story content */}                <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-gradient-to-br from-neo-mint/20 to-purist-blue/20">
                  <Image
                    src={
                      stories.find((s) => s.id === activeStory)?.storyImage || "/placeholder.svg?height=800&width=450"
                    }
                    alt="Story"
                    fill
                    priority={true}
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  />

                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex items-center gap-2">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-white">
                      <AvatarImage src={stories.find((s) => s.id === activeStory)?.userImage || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
                        {stories.find((s) => s.id === activeStory)?.user.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm sm:text-base text-white">
                        {stories.find((s) => s.id === activeStory)?.user}
                      </p>
                      <p className="text-xs text-white/70">{stories.find((s) => s.id === activeStory)?.time}</p>
                    </div>
                  </div>

                  {/* Story viewers */}
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 rounded-full bg-black/30 text-white px-3">
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          <span className="text-xs">{storyViewers.length}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-60 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-white/20 dark:border-gray-700/30">
                        <div className="p-2">
                          <h4 className="text-sm font-medium mb-2 px-2">Viewers</h4>
                          <ScrollArea className="h-[200px]">
                            <div className="space-y-1">
                              {storyViewers.map((viewer) => (
                                <div
                                  key={viewer.id}
                                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={viewer.image || "/placeholder.svg"} />
                                    <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
                                      {viewer.name ? viewer.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{viewer.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{viewer.timeViewed}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Story interactions */}
                  <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 px-3 sm:px-4">
                    <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full p-1.5 sm:p-2">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-white">
                        <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
                          JD
                        </AvatarFallback>
                      </Avatar>
                      <Input
                        placeholder="Reply to story..."
                        className="bg-transparent border-none text-white placeholder:text-white/70 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                      />
                      <Button size="icon" variant="ghost" className="text-white h-7 w-7 sm:h-8 sm:w-8">
                        <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Story Creator */}
        <EnhancedStoryCreator isOpen={showStoryCreator} onClose={() => setShowStoryCreator(false)} />

        {/* Scroll to Top Button */}
        <AnimatePresence>
          {showScrollToTop && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-30"
            >
              <Button
                size="icon"
                className="rounded-full bg-neo-mint hover:bg-neo-mint/90 text-white shadow-lg h-10 w-10 sm:h-12 sm:w-12"
                onClick={handleScrollToTop}
              >
                <ArrowUp className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
