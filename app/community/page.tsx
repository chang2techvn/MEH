"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { dbHelpers, supabase } from "@/lib/supabase"
import {
  Users,
  Search,
  MessageSquare,
  CalendarIcon,
  Award,
  TrendingUp,
  Globe,
  BookOpen,
  ChevronRight,
  MapPin,
  Plus,
  Send,
  ImageIcon,
  Smile,
  Hash,
  X,
  Menu,
  Home,
  Settings,
  HelpCircle,
  Loader,
  RefreshCw,
  ChevronDown,
  Camera,
  Upload,
  Lock,
  MoreHorizontal,
  ArrowUp,
  Bell,
  LogOut,
  User,
  Zap,
  MoreVertical,
  PlusCircle,
  Sparkles,
  Paperclip,
  AtSign,
  GiftIcon as Gif,
  Eye,
  type LucideIcon,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import FeedPost from "@/components/feed-post"
import FeedFilter from "@/components/feed-filter"
import FeedEmptyState from "@/components/feed-empty-state"
import SEOMeta from "@/components/seo-meta"
import type { VideoEvaluation } from "@/lib/gemini-video-evaluation"
import { useMobile } from "@/hooks/use-mobile"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { format } from "date-fns"
import { useState, useEffect, useRef } from "react"

// Helper functions
const formatTimeAgo = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString()
}

const extractYouTubeId = (url: string): string | undefined => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : undefined
}

const isToday = (date: Date): boolean => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return date.toDateString() === tomorrow.toDateString()
}

// Types
interface Story {
  id: number
  user: string
  userImage: string
  storyImage: string
  time: string
  viewed: boolean
  isAddStory?: boolean
}

interface Post {
  id: number
  username: string
  userImage: string
  timeAgo: string
  content: string
  mediaType: "video" | "text" | "none" | "ai-submission" | "youtube" | "image"
  mediaUrl?: string | null
  youtubeVideoId?: string
  textContent?: string
  likes: number
  comments: number
  isNew?: boolean
  aiEvaluation?: any
  videoEvaluation?: VideoEvaluation | null
}

interface Contact {
  id: number
  name: string
  image: string
  online: boolean
  lastActive?: string
}

interface Event {
  id: number
  title: string
  date: string
  time: string
  location: string
  attendees: number
  badge: "today" | "tomorrow" | "upcoming"
}

interface Group {
  id: number
  name: string
  image: string
  members: number
  privacy: "public" | "private"
  active: boolean
}

interface StoryViewer {
  id: number
  name: string
  image: string
  timeViewed: string
}

export default function CommunityPage() {
  const router = useRouter()
  const { isMobile } = useMobile()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("feed")
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")
  const [isPostingContent, setIsPostingContent] = useState(false)
  const [showLeftSidebar, setShowLeftSidebar] = useState(false)
  const [showRightSidebar, setShowRightSidebar] = useState(false)
  const [activeStory, setActiveStory] = useState<number | null>(null)
  const [viewedStories, setViewedStories] = useState<number[]>([])
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>("recent")
  const [feedPosts, setFeedPosts] = useState<Post[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [trendingTopics, setTrendingTopics] = useState<{ name: string; count: number }[]>([])
  const [showStoryCreator, setShowStoryCreator] = useState(false)
  const [storyCaption, setStoryCaption] = useState("")
  const [storyPreview, setStoryPreview] = useState<string | null>(null)
  const [isCreatingStory, setIsCreatingStory] = useState(false)
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 0)

  const [selectedDate, setSelectedDate] = useState<Date>()
  const [location, setLocation] = useState<string>("")
  const [showLocationPicker, setShowLocationPicker] = useState(false) 
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showTagPeople, setShowTagPeople] = useState(false)
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null)
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [taggedPeople, setTaggedPeople] = useState<string[]>([])
  const mainRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const postFileInputRef = useRef<HTMLInputElement>(null)
  const [storyViewers, setStoryViewers] = useState<StoryViewer[]>([])
  
  // Load real data from Supabase
  const loadData = async () => {
    try {
      setLoading(true)      // Load all data in parallel for better performance
      const [
        postsResult,
        storiesResult,
        onlineUsersResult,
        eventsResult,
        groupsResult,
        trendingResult      ] = await Promise.all([
        supabase
          .from('posts')
          .select(`
            *,
            users!user_id(id, name, avatar)
          `)
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
      const trendingData = trendingResult.data || []      // Transform posts data to include user information
      console.log('📊 Posts data from Supabase:', postsData)
      setFeedPosts(postsData.map((post: any) => {
        console.log('📝 Processing post:', post)
        return {
          id: post.id, // Keep as string UUID instead of converting to number
          username: post.users?.name || 'Unknown User',
          userImage: post.users?.avatar || "/placeholder.svg?height=40&width=40",
          timeAgo: formatTimeAgo(post.created_at || ''),
          content: post.content || '',
          mediaType: post.post_type === 'video' ? 'video' : 
                    post.post_type === 'youtube' ? 'youtube' : 
                    post.media_url ? 'image' : 'text',
          mediaUrl: post.media_url,
          youtubeVideoId: post.post_type === 'youtube' ? extractYouTubeId(post.media_url || '') : undefined,
          textContent: post.post_type === 'text' ? post.content : undefined,
          likes: post.likes_count || 0,          
          comments: post.comments_count || 0,
          isNew: false
        }
      }))

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
        },        ...storiesData.map((story: any) => ({
          id: Number(story.id),
          user: story.author?.name || 'Unknown User',
          userImage: story.author?.avatar || "/placeholder.svg?height=40&width=40",
          storyImage: story.media_url || "/placeholder.svg?height=200&width=200",
          time: formatTimeAgo(story.created_at || ''),
          viewed: viewedStories.includes(Number(story.id)),
        }))
      ])      // Transform contacts data (online users)
      setContacts(onlineUsersData.map((user: any) => ({
        id: Number(user.id.substring(0, 8)), // Use first 8 chars of UUID as number
        name: user.name,
        image: user.avatar || "/placeholder.svg?height=40&width=40",
        online: user.last_active && new Date(user.last_active) > new Date(Date.now() - 30 * 60 * 1000), // Active in last 30 minutes
        lastActive: user.last_active && new Date(user.last_active) <= new Date(Date.now() - 30 * 60 * 1000) ? formatTimeAgo(user.last_active) : undefined
      })))      // Transform events data
      setEvents(eventsData.map((event: any) => ({
        id: Number(event.id),
        title: event.title,
        date: new Date(event.startTime).toLocaleDateString(),
        time: new Date(event.startTime).toLocaleTimeString(),
        location: event.location,
        attendees: event.attendeeCount || 0,
        badge: isToday(new Date(event.startTime)) ? 'today' as const : 
               isTomorrow(new Date(event.startTime)) ? 'tomorrow' as const : 'upcoming' as const
      })))      // Transform groups data
      setGroups(groupsData.map((group: any) => ({
        id: Number(group.id),
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
      console.error('Error loading community data:', error)
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
      setContacts([])
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

    window.addEventListener("resize", handleResize)
    
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [viewedStories])

  // Set mounted to true for client-side rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Helper functions for data formatting
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const extractYouTubeId = (url: string | undefined) => {
    if (!url) return undefined
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : undefined
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isTomorrow = (date: Date) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return date.toDateString() === tomorrow.toDateString()
  }

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
  const handleStoryClick = (id: number) => {
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
      if (selectedDate) fullContent += ` — ${format(selectedDate, "PPP")}`

      // Determine post type
      let postType = 'text'
      if (mediaPreview && selectedMedia?.type.startsWith("video/")) {
        postType = 'video'
      } else if (mediaPreview && selectedMedia?.type.startsWith("image/")) {
        postType = 'image'
      }      // Create post in Supabase
      const { data: newPost, error } = await dbHelpers.createPost({
        title: fullContent.substring(0, 100), // Use first 100 chars as title
        content: fullContent,
        author_id: currentUser.id,
        type: postType,
        tags: [] // Could extract hashtags from content
      })
      
      if (error || !newPost) {
        console.error('Error creating post:', error)
        toast({
          title: "Error creating post",
          description: "There was an error publishing your post. Please try again.",
          variant: "destructive",
        })
        setIsPostingContent(false)
        return
      }      // Add the new post to the feed
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
      console.error('Error creating post:', error)
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

  const handleStoryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setStoryPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleStorySubmit = () => {
    if (!storyPreview) {
      toast({
        title: "No image selected",
        description: "Please select an image for your story",
        variant: "destructive",
      })
      return
    }

    setIsCreatingStory(true)

    // Simulate posting delay
    setTimeout(() => {
      setIsCreatingStory(false)
      setShowStoryCreator(false)
      setStoryPreview(null)
      setStoryCaption("")

      toast({
        title: "Story published!",
        description: "Your story has been published and is now visible to the community.",
      })
    }, 1500)
  }

  const handlePostFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      toast({
        title: "File selected",
        description: `${file.name} has been selected and will be attached to your post.`,
      })
    }
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
      />

      <div className="flex min-h-screen flex-col bg-[#f0f2f5] dark:bg-gray-900">
        {/* Facebook-style Header */}
        <header className="sticky top-0 z-40 w-full bg-white dark:bg-gray-800 shadow-sm">
          <div className="container mx-auto px-2 sm:px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleLeftSidebar}>
                <Menu className="h-5 w-5" />
              </Button>

              <Link href="/" className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                  <BookOpen className="relative h-5 sm:h-6 w-5 sm:w-6 text-neo-mint dark:text-purist-blue" />
                </div>
                <span className="hidden sm:inline-block text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue">
                  EnglishMastery
                </span>
              </Link>

              <div className="relative ml-2 hidden md:block max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search EnglishMastery"
                  className="pl-9 bg-gray-100 dark:bg-gray-700 border-none rounded-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push("/")}>
                <Home className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push("/messages")}>
                <MessageSquare className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* Mobile toggle for right sidebar */}
              <Button variant="ghost" size="icon" className="rounded-full lg:hidden" onClick={toggleRightSidebar}>
                <Users className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800">
                      <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
                        JD
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/help")}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

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
        </div>

        {/* Main Content */}
        <main ref={mainRef} className="flex-1 relative">
          <div className="container mx-auto px-2 sm:px-4 py-4">
            <div className="flex flex-col lg:flex-row lg:gap-4 xl:gap-6">
              {/* Left Sidebar */}
              <aside
                className={`
                  fixed inset-0 z-50 lg:static lg:z-auto lg:w-[240px] xl:w-[280px]
                  ${showLeftSidebar ? "block" : "hidden lg:block"}
                `}
              >
                {/* Mobile overlay */}
                {showLeftSidebar && (
                  <div
                    className="absolute inset-0 bg-black/50 lg:hidden"
                    onClick={() => setShowLeftSidebar(false)}
                  ></div>
                )}

                <div
                  className={`
                  relative h-full w-[280px] sm:w-[320px] lg:w-full 
                  bg-white dark:bg-gray-800 lg:bg-transparent lg:dark:bg-transparent
                  overflow-auto lg:sticky lg:top-[4.5rem] lg:h-[calc(100vh-4.5rem)]
                `}
                >
                  {/* Mobile header */}
                  {showLeftSidebar && (
                    <div className="p-4 flex justify-between items-center border-b lg:hidden">
                      <h2 className="font-semibold">Menu</h2>
                      <Button variant="ghost" size="icon" onClick={() => setShowLeftSidebar(false)}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  )}

                  <ScrollArea className="h-full py-4">
                    <div className="space-y-1 px-2">
                      <UserProfileCard />

                      <NavItem icon={Home} label="Home" href="/" />
                      <NavItem icon={Users} label="Community" href="/community" active />
                      <NavItem icon={Award} label="Challenges" href="/challenges" />
                      <NavItem icon={BookOpen} label="Resources" href="/resources" />
                      <NavItem icon={MessageSquare} label="Messages" href="/messages" />

                      <Separator className="my-4" />

                      <h3 className="font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase px-4 mb-2">
                        Your Shortcuts
                      </h3>

                      {groups.map((group) => (
                        <GroupNavItem key={group.id} name={group.name} image={group.image} active={group.active} />
                      ))}

                      <Button variant="ghost" className="w-full justify-start text-sm font-normal h-10 px-4">
                        <ChevronDown className="h-4 w-4 mr-2" />
                        See More
                      </Button>

                      <Separator className="my-4" />

                      <h3 className="font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase px-4 mb-2">
                        Explore
                      </h3>

                      <NavItem icon={Users} label="Events" href="/events" />
                      <NavItem icon={Users} label="Groups" href="/groups" />
                      <NavItem icon={Zap} label="Learning Paths" href="/learning-paths" />
                      <NavItem icon={TrendingUp} label="Trending" href="/trending" />

                      <Separator className="my-4" />

                      <div className="px-4 text-xs text-gray-500 dark:text-gray-400">
                        <p>Privacy · Terms · Advertising · Cookies · More · EnglishMastery © 2025</p>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </aside>

              {/* Main Feed */}
              <div className="flex-1 order-1 lg:order-2 max-w-full lg:max-w-[600px] xl:max-w-[700px]">
                {/* Stories Section */}
                <div className="mb-4 overflow-hidden">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base">Stories</h3>
                  </div>
                  <ScrollArea className="w-full">
                    <div className="flex gap-2 pb-2 min-w-max">
                      {/* Add Story Card - Always First */}
                      {!loading && (
                        <motion.div
                          whileHover={{ y: -5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          className="flex-shrink-0"
                        >
                          <div
                            className="w-[90px] sm:w-[110px] h-[160px] sm:h-[200px] rounded-xl relative overflow-hidden cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center"
                            onClick={() => setShowStoryCreator(true)}
                          >
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-2">
                              <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-neo-mint dark:text-purist-blue" />
                            </div>
                            <p className="text-xs sm:text-sm font-medium">Create Story</p>
                          </div>
                        </motion.div>
                      )}

                      {/* Story Cards */}
                      {loading
                        ? Array(8)
                            .fill(0)
                            .map((_, i) => <StoryCardSkeleton key={i} />)
                        : stories
                            .filter((story) => !story.isAddStory) // Filter out the "Add Story" item since we're adding it separately
                            .map((story) => (
                              <StoryCard key={story.id} story={story} onClick={() => handleStoryClick(story.id)} />
                            ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Create Post Card */}
                <Card className="mb-4 bg-white dark:bg-gray-800 shadow-sm border-0 overflow-hidden">
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                        <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
                          JD
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        variant="outline"
                        className="flex-1 justify-start text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border-0 rounded-full h-9 sm:h-10 text-sm sm:text-base"
                        onClick={() => setShowNewPostForm(true)}
                      >
                        What's on your mind, John?
                      </Button>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex justify-center gap-2 sm:gap-4">
                      <Button
                        variant="ghost"
                        className="flex-1 text-xs sm:text-sm p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => {
                          setShowNewPostForm(true)
                          setTimeout(() => {
                            postFileInputRef.current?.click()
                          }, 500)
                        }}
                      >
                        <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-green-500" />
                        <span>Photo/Video</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex-1 text-xs sm:text-sm p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => {
                          setShowNewPostForm(true)
                          setTimeout(() => {
                            setShowEmojiPicker(true)
                          }, 500)
                        }}
                      >
                        <Smile className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-yellow-500" />
                        <span>Feeling</span>
                      </Button>
                    </div>
                  </div>
                </Card>

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
                      <FeedPost
                        key={post.id}
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
                        isNew={post.isNew}
                        videoEvaluation={post.videoEvaluation}
                      />
                    ))                  ) : (
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
              <aside
                className={`
                  fixed inset-0 z-50 lg:static lg:z-auto lg:w-[280px] xl:w-[320px] lg:order-3
                  ${showRightSidebar ? "block" : "hidden lg:block"}
                `}
              >
                {/* Mobile overlay background */}
                {showRightSidebar && (
                  <div
                    className="absolute inset-0 bg-black/50 lg:hidden"
                    onClick={() => setShowRightSidebar(false)}
                  ></div>
                )}

                <div
                  className={`
                    relative h-full w-[280px] sm:w-[320px] lg:w-full 
                    bg-white dark:bg-gray-800 lg:bg-transparent lg:dark:bg-transparent
                    overflow-auto lg:sticky lg:top-[4.5rem] lg:h-[calc(100vh-4.5rem)]
                  `}
                >
                  {/* Mobile header */}
                  {showRightSidebar && (
                    <div className="p-4 flex justify-between items-center border-b lg:hidden">
                      <h2 className="font-semibold">Contacts & Events</h2>
                      <Button variant="ghost" size="icon" onClick={() => setShowRightSidebar(false)}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  )}

                  <ScrollArea className="h-full py-4 px-4 lg:px-0">
                    <div className="space-y-4 sm:space-y-6">
                      {/* Contacts Section */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                            Contacts
                          </h3>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full">
                              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full">
                              <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-1 sm:space-y-2 max-h-[240px] sm:max-h-[320px] overflow-y-auto pr-1">
                          {loading
                            ? Array(5)
                                .fill(0)
                                .map((_, i) => <ContactSkeleton key={i} />)
                            : contacts.map((contact) => (
                                <ContactItem
                                  key={contact.id}
                                  name={contact.name}
                                  image={contact.image}
                                  online={contact.online}
                                  lastActive={contact.lastActive}
                                />
                              ))}
                        </div>
                      </div>

                      {/* Upcoming Events */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                            Upcoming Events
                          </h3>
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full">
                            <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          {loading
                            ? Array(2)
                                .fill(0)
                                .map((_, i) => <EventSkeleton key={i} />)
                            : events.map((event) => (
                                <EventCard
                                  key={event.id}
                                  title={event.title}
                                  date={event.date}
                                  time={event.time}
                                  location={event.location}
                                  attendees={event.attendees}
                                  badge={event.badge}
                                />
                              ))}
                        </div>

                        <Button variant="ghost" className="w-full justify-start text-xs sm:text-sm mt-2 sm:mt-3">
                          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          See All Events
                        </Button>
                      </div>

                      {/* Trending Topics */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                            Trending Topics
                          </h3>
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full">
                            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </div>

                        <div className="space-y-1 sm:space-y-2">
                          {loading
                            ? Array(5)
                                .fill(0)
                                .map((_, i) => (
                                  <div key={i} className="flex items-center justify-between">
                                    <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
                                    <Skeleton className="h-4 sm:h-5 w-12 sm:w-16" />
                                  </div>
                                ))
                            : trendingTopics.slice(0, 5).map((topic) => (
                                <div
                                  key={topic.name}
                                  className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center gap-1.5 sm:gap-2">
                                    <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neo-mint dark:text-purist-blue" />
                                    <span className="font-medium text-sm sm:text-base">{topic.name}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs bg-white/10 dark:bg-gray-800/10">
                                    {topic.count}
                                  </Badge>
                                </div>
                              ))}
                        </div>

                        <Button variant="ghost" className="w-full justify-start text-xs sm:text-sm mt-2 sm:mt-3">
                          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          See All Topics
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </aside>
            </div>
          </div>
        </main>

        {/* Create Post Modal */}
        <AnimatePresence>
          {showNewPostForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
              onClick={(e) => {
                // Close modal when clicking outside
                if (e.target === e.currentTarget) {
                  setShowNewPostForm(false)
                  setNewPostContent("")
                  setSelectedFeeling(null)
                  setLocation("")
                  setTaggedPeople([])
                  setSelectedDate(undefined)
                  setSelectedMedia(null)
                  setMediaPreview(null)
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto shadow-xl border border-white/20 dark:border-gray-700/30"
              >
                {/* Header */}
                <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm z-10">
                  <div className="w-8">{/* Spacer for alignment */}</div>
                  <motion.h3
                    className="text-base sm:text-lg font-semibold text-center gradient-text"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Create Post
                  </motion.h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowNewPostForm(false)
                      setNewPostContent("")
                      setSelectedFeeling(null)
                      setLocation("")
                      setTaggedPeople([])
                      setSelectedDate(undefined)
                      setSelectedMedia(null)
                      setMediaPreview(null)
                    }}
                    className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 h-8 w-8"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="p-4 sm:p-5">
                  {/* User Info */}
                  <motion.div
                    className="flex items-start gap-3 mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-white dark:border-gray-800 shadow-md">
                        <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
                          JD
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <div className="flex flex-col">
                      <p className="font-semibold text-base sm:text-lg">John Doe</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-1 h-7 sm:h-8 text-xs rounded-full border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                          >
                            <Globe className="h-3 w-3 mr-1 text-neo-mint dark:text-purist-blue" />
                            Public
                            <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-white/20 dark:border-gray-700/30">
                          <DropdownMenuItem className="focus:bg-gray-100 dark:focus:bg-gray-700 cursor-pointer">
                            <Globe className="h-4 w-4 mr-2 text-neo-mint dark:text-purist-blue" />
                            Public
                          </DropdownMenuItem>
                          <DropdownMenuItem className="focus:bg-gray-100 dark:focus:bg-gray-700 cursor-pointer">
                            <Users className="h-4 w-4 mr-2 text-blue-500" />
                            Friends
                          </DropdownMenuItem>
                          <DropdownMenuItem className="focus:bg-gray-100 dark:focus:bg-gray-700 cursor-pointer">
                            <Lock className="h-4 w-4 mr-2 text-gray-500" />
                            Only Me
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>

                  {/* Text Area */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative"
                  >
                    <Textarea
                      placeholder="What's on your mind, John?"
                      className="min-h-[120px] sm:min-h-[150px] resize-none border-0 focus-visible:ring-1 focus-visible:ring-neo-mint dark:focus-visible:ring-purist-blue text-base sm:text-lg p-0 bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      aria-label="Post content"
                    />

                    {newPostContent.length > 0 && (
                      <motion.div
                        className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {newPostContent.length} characters
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Tags Container */}
                  <motion.div
                    className="mt-3 flex flex-wrap gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    {/* Display selected feeling */}
                    {selectedFeeling && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1.5 shadow-sm"
                      >
                        <Smile className="h-3.5 w-3.5 text-yellow-500" />
                        <span className="text-sm">Feeling {selectedFeeling}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                          onClick={() => setSelectedFeeling(null)}
                          aria-label={`Remove feeling ${selectedFeeling}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    )}

                    {/* Display selected location */}
                    {location && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1.5 shadow-sm"
                      >
                        <MapPin className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-sm">at {location}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                          onClick={() => setLocation("")}
                          aria-label={`Remove location ${location}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    )}

                    {/* Display selected date */}
                    {selectedDate && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1.5 shadow-sm"
                      >
                        <CalendarIcon className="h-3.5 w-3.5 text-purple-500" />
                        <span className="text-sm">{format(selectedDate, "PPP")}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                          onClick={() => setSelectedDate(undefined)}
                          aria-label={`Remove date ${format(selectedDate, "PPP")}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    )}

                    {/* Display tagged people */}
                    {taggedPeople.map((person) => (
                      <motion.div
                        key={person}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1.5 shadow-sm"
                      >
                        <AtSign className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-sm">{person}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                          onClick={() => removeTaggedPerson(person)}
                          aria-label={`Remove tag ${person}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Media preview */}
                  <AnimatePresence>
                    {mediaPreview && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="mt-4 relative rounded-xl overflow-hidden bg-black/5 dark:bg-white/5"
                      >
                        <div className="relative">
                          {selectedMedia?.type.startsWith("video/") ? (
                            <video src={mediaPreview} controls className="w-full h-auto max-h-[300px] object-contain" />
                          ) : (
                            <Image
                              src={mediaPreview || "/placeholder.svg"}
                              alt="Media preview"
                              width={500}
                              height={300}
                              className="w-full h-auto max-h-[300px] object-contain"
                            />
                          )}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={removeSelectedMedia}
                            className="absolute top-2 right-2 rounded-full bg-black/50 text-white hover:bg-black/70 h-8 w-8 shadow-lg"
                            aria-label="Remove media"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Add to post section */}
                  <motion.div
                    className="mt-4 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm sm:text-base">Add to your post</h4>
                      <div className="flex gap-1 sm:gap-2">
                        {/* Photo/Video Button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-600"
                                onClick={() => postFileInputRef.current?.click()}
                                aria-label="Add photo or video"
                              >
                                <ImageIcon className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-green-500" />
                                <input
                                  type="file"
                                  ref={postFileInputRef}
                                  accept="image/*,video/*"
                                  className="hidden"
                                  onChange={handleMediaSelect}
                                  aria-hidden="true"
                                />
                              </motion.button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                              <p>Photo/Video</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Tag People Button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Popover open={showTagPeople} onOpenChange={setShowTagPeople}>
                                <PopoverTrigger asChild>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-600"
                                    aria-label="Tag people"
                                  >
                                    <Users className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-blue-500" />
                                  </motion.button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-[220px] p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-white/20 dark:border-gray-700/30"
                                  align="end"
                                >
                                  <Command>
                                    <CommandInput placeholder="Search people..." className="border-none focus:ring-0" />
                                    <CommandList>
                                      <CommandEmpty>No people found.</CommandEmpty>
                                      <CommandGroup heading="Suggestions">
                                        {contacts.map((contact) => (
                                          <CommandItem
                                            key={contact.id}
                                            onSelect={() => handlePersonTag(contact.name)}
                                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                          >
                                            <Avatar className="h-6 w-6">
                                              <AvatarImage src={contact.image || "/placeholder.svg"} />
                                              <AvatarFallback>{contact.name.substring(0, 2)}</AvatarFallback>
                                            </Avatar>
                                            <span>{contact.name}</span>
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                              <p>Tag People</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Feeling/Activity Button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                                <PopoverTrigger asChild>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-600"
                                    aria-label="Add feeling or activity"
                                  >
                                    <Smile className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-yellow-500" />
                                  </motion.button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-[220px] p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-white/20 dark:border-gray-700/30"
                                  align="end"
                                >
                                  <Command>
                                    <CommandInput
                                      placeholder="Search feelings..."
                                      className="border-none focus:ring-0"
                                    />
                                    <CommandList>
                                      <CommandEmpty>No feelings found.</CommandEmpty>
                                      <CommandGroup heading="Feelings">
                                        {[
                                          "Happy",
                                          "Excited",
                                          "Loved",
                                          "Sad",
                                          "Thankful",
                                          "Blessed",
                                          "Grateful",
                                          "Motivated",
                                          "Inspired",
                                        ].map((feeling) => (
                                          <CommandItem
                                            key={feeling}
                                            onSelect={() => handleFeelingSelect(feeling.toLowerCase())}
                                            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                          >
                                            <div className="flex items-center gap-2">
                                              <div className="w-6 h-6 flex items-center justify-center">
                                                {feeling === "Happy" && "😊"}
                                                {feeling === "Excited" && "🎉"}
                                                {feeling === "Loved" && "❤️"}
                                                {feeling === "Sad" && "😢"}
                                                {feeling === "Thankful" && "🙏"}
                                                {feeling === "Blessed" && "✨"}
                                                {feeling === "Grateful" && "🌟"}
                                                {feeling === "Motivated" && "💪"}
                                                {feeling === "Inspired" && "💡"}
                                              </div>
                                              <span>{feeling}</span>
                                            </div>
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                              <p>Feeling/Activity</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Check in Button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Popover open={showLocationPicker} onOpenChange={setShowLocationPicker}>
                                <PopoverTrigger asChild>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-600"
                                    aria-label="Check in location"
                                  >
                                    <MapPin className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-red-500" />
                                  </motion.button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-[220px] p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-white/20 dark:border-gray-700/30"
                                  align="end"
                                >
                                  <Command>
                                    <CommandInput
                                      placeholder="Search locations..."
                                      className="border-none focus:ring-0"
                                    />
                                    <CommandList>
                                      <CommandEmpty>No locations found.</CommandEmpty>
                                      <CommandGroup heading="Suggestions">
                                        {[
                                          "Coffee Shop",
                                          "Library",
                                          "University",
                                          "Home",
                                          "Work",
                                          "Gym",
                                          "Restaurant",
                                          "Park",
                                          "Airport",
                                        ].map((place) => (
                                          <CommandItem
                                            key={place}
                                            onSelect={() => handleLocationSelect(place)}
                                            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                          >
                                            <div className="flex items-center gap-2">
                                              <MapPin className="h-4 w-4 text-red-500" />
                                              <span>{place}</span>
                                            </div>
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                              <p>Check in</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Calendar Button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-600"
                                    aria-label="Add date"
                                  >
                                    <CalendarIcon className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-purple-500" />
                                  </motion.button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                  align="end"
                                >
                                  <div className="p-3">
                                    <Calendar
                                      mode="single"
                                      selected={selectedDate}
                                      onSelect={setSelectedDate}
                                      initialFocus
                                      className="rounded-lg border-0"
                                      disabled={(date) => date < new Date("1900-01-01")}
                                      fromYear={1900}
                                      toYear={2100}
                                      classNames={{
                                        day_selected:
                                          "bg-neo-mint text-white hover:bg-neo-mint hover:text-white focus:bg-neo-mint focus:text-white",
                                        day_today: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-50",
                                        day: "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
                                        head_cell: "text-gray-500 dark:text-gray-400 font-normal text-xs",
                                        caption: "text-sm font-medium text-gray-900 dark:text-gray-100",
                                        nav_button:
                                          "text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400",
                                        table: "border-collapse space-y-1",
                                        cell: "p-0 relative",
                                        button: "h-9 w-9 p-0 font-normal",
                                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                      }}
                                    />
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                              <p>Add Date</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* More Button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-600"
                                    aria-label="More options"
                                  >
                                    <MoreHorizontal className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                                  </motion.button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-white/20 dark:border-gray-700/30"
                                >
                                  <DropdownMenuItem
                                    className="cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-700"
                                    onClick={() => {
                                      toast({
                                        title: "GIF Feature",
                                        description: "GIF selection will be available soon!",
                                      })
                                    }}
                                  >
                                    <Gif className="h-4 w-4 mr-2 text-pink-500" />
                                    Add GIF
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-700"
                                    onClick={() => {
                                      toast({
                                        title: "File Attachment",
                                        description: "File attachment feature will be available soon!",
                                      })
                                    }}
                                  >
                                    <Paperclip className="h-4 w-4 mr-2 text-orange-500" />
                                    Attach File
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-700"
                                    onClick={() => {
                                      toast({
                                        title: "Poll Creation",
                                        description: "Poll creation feature will be available soon!",
                                      })
                                    }}
                                  >
                                    <PlusCircle className="h-4 w-4 mr-2 text-blue-500" />
                                    Create Poll
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                              <p>More</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </motion.div>

                  {/* Post Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="mt-4"
                  >
                    <Button
                      className="w-full py-2 h-auto text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
                      onClick={handlePostSubmit}
                      disabled={(!newPostContent.trim() && !mediaPreview) || isPostingContent}
                      style={{
                        background: "linear-gradient(to right, hsl(var(--neo-mint)), hsl(var(--purist-blue)))",
                      }}
                    >
                      {isPostingContent ? (
                        <motion.div
                          className="flex items-center justify-center gap-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <Loader className="h-4 w-4 animate-spin" />
                          <span>Publishing...</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          className="flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          <span>Publish Post</span>
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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

                {/* Story content */}
                <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-gradient-to-br from-neo-mint/20 to-purist-blue/20">
                  <Image
                    src={
                      stories.find((s) => s.id === activeStory)?.storyImage || "/placeholder.svg?height=800&width=450"
                    }
                    alt="Story"
                    fill
                    className="object-cover"
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
                                    <AvatarFallback>{viewer.name.substring(0, 2)}</AvatarFallback>
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

// Component: UserProfileCard
function UserProfileCard() {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer mb-2">
      <Avatar className="h-9 w-9">
        <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">JD</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">John Doe</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Advanced Learner</p>
      </div>
    </div>
  )
}

// Component: NavItem
function NavItem({
  icon: Icon,
  label,
  href,
  active = false,
}: {
  icon: LucideIcon
  label: string
  href: string
  active?: boolean
}) {
  const router = useRouter()

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
        active ? "bg-gray-100 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
      onClick={(e) => {
        e.preventDefault()
        router.push(href)
      }}
    >
      <div
        className={`h-9 w-9 rounded-full flex items-center justify-center ${
          active ? "bg-neo-mint/10 dark:bg-purist-blue/10" : "bg-gray-200 dark:bg-gray-600"
        }`}
      >
        <Icon
          className={`h-5 w-5 ${active ? "text-neo-mint dark:text-purist-blue" : "text-gray-700 dark:text-gray-300"}`}
        />
      </div>
      <span className="font-medium">{label}</span>
    </Link>
  )
}

// Component: GroupNavItem
function GroupNavItem({
  name,
  image,
  active = false,
}: {
  name: string
  image: string
  active: boolean
}) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
      <Avatar className="h-9 w-9">
        <AvatarImage src={image || "/placeholder.svg"} alt={name} />
        <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
          {name.substring(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 flex items-center justify-between">
        <span className="font-medium">{name}</span>
        {active && <span className="h-2 w-2 rounded-full bg-green-500"></span>}
      </div>
    </div>
  )
}

// Component: StoryCard
function StoryCard({
  story,
  onClick,
}: {
  story: Story
  onClick: () => void
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className="flex-shrink-0"
    >
      {story.isAddStory ? (
        <div
          className="w-[90px] sm:w-[110px] h-[160px] sm:h-[200px] rounded-xl relative overflow-hidden cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center"
          onClick={onClick}
        >
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-2">
            <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-neo-mint dark:text-purist-blue" />
          </div>
          <p className="text-xs sm:text-sm font-medium">Create Story</p>
        </div>
      ) : (
        <div
          className="w-[90px] sm:w-[110px] h-[160px] sm:h-[200px] rounded-xl relative overflow-hidden cursor-pointer"
          onClick={onClick}
        >
          <Image src={story.storyImage || "/placeholder.svg"} alt={story.user} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
          <div className="absolute top-2 left-2">
            <div
              className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full border-3 sm:border-4 ${story.viewed ? "border-gray-400" : "border-neo-mint dark:border-purist-blue"} overflow-hidden`}
            >
              <Image
                src={story.userImage || "/placeholder.svg"}
                alt={story.user}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-white text-xs sm:text-sm font-medium line-clamp-2">{story.user}</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Component: StoryCardSkeleton
function StoryCardSkeleton() {
  return (
    <div className="w-[90px] sm:w-[110px] h-[160px] sm:h-[200px] rounded-xl relative overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
      <div className="absolute top-2 left-2">
        <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
      </div>
      <div className="absolute bottom-2 left-2 right-2">
        <Skeleton className="h-3 sm:h-4 w-full" />
      </div>
    </div>
  )
}

// Component: PostSkeleton
function PostSkeleton() {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 overflow-hidden">
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-3 mb-4">
          <Skeleton className="h-9 w-9 sm:h-10 sm:w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3.5 sm:h-4 w-24 sm:w-32" />
            <Skeleton className="h-2.5 sm:h-3 w-20 sm:w-24" />
          </div>
          <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
        </div>
        <div className="space-y-2 mb-4">
          <Skeleton className="h-3.5 sm:h-4 w-full" />
          <Skeleton className="h-3.5 sm:h-4 w-full" />
          <Skeleton className="h-3.5 sm:h-4 w-3/4" />
        </div>
        <Skeleton className="h-32 sm:h-40 w-full rounded-lg mb-4" />
        <div className="flex justify-between">
          <Skeleton className="h-7 sm:h-8 w-16 sm:w-20" />
          <Skeleton className="h-7 sm:h-8 w-16 sm:w-20" />
          <Skeleton className="h-7 sm:h-8 w-16 sm:w-20" />
        </div>
      </div>
    </Card>
  )
}

// Component: ContactItem
function ContactItem({
  name,
  image,
  online,
  lastActive,
}: {
  name: string
  image: string
  online: boolean
  lastActive?: string
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
      <div className="relative flex-shrink-0">
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border border-gray-200 dark:border-gray-700">
          <AvatarImage src={image || "/placeholder.svg"} alt={name} />
          <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
            {name.substring(0, 2)}
          </AvatarFallback>
        </Avatar>
        {online && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></span>
        )}
      </div>
      <div className="flex-1 flex items-center justify-between min-w-0">
        <span className="font-medium text-sm sm:text-base truncate">{name}</span>
        {!online && lastActive && (
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-1">
            {lastActive}
          </span>
        )}
      </div>
    </div>
  )
}

// Component: ContactSkeleton
function ContactSkeleton() {
  return (
    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5">
      <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0" />
      <Skeleton className="h-3.5 sm:h-4 w-20 sm:w-24 flex-1" />
    </div>
  )
}

// Component: EventCard
function EventCard({
  title,
  date,
  time,
  location,
  attendees,
  badge,
}: {
  title: string
  date: string
  time: string
  location: string
  attendees: number
  badge: "today" | "tomorrow" | "upcoming"
}) {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer">
      <div className="p-2 sm:p-3">
        <div className="flex justify-between items-start mb-1.5 sm:mb-2">
          <h4 className="font-medium text-sm sm:text-base">{title}</h4>
          <Badge
            className={`
            ${badge === "today" ? "bg-green-500" : badge === "tomorrow" ? "bg-blue-500" : "bg-gray-500"} 
            text-white border-0 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 sm:py-0 : "bg-gray-500"}
            text-white border-0 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 sm:py-0.5
          `}
          >
            {badge === "today" ? "Today" : badge === "tomorrow" ? "Tomorrow" : "Upcoming"}
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2">
          {date} • {time}
        </p>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
          <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span>{location}</span>
          <Separator orientation="vertical" className="h-2.5 sm:h-3" />
          <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span>{attendees} going</span>
        </div>
      </div>
    </Card>
  )
}

// Component: EventSkeleton
function EventSkeleton() {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-2 sm:p-3">
        <div className="flex justify-between items-start mb-1.5 sm:mb-2">
          <Skeleton className="h-3.5 sm:h-5 w-24 sm:w-32" />
          <Skeleton className="h-3.5 sm:h-5 w-12 sm:w-16" />
        </div>
        <Skeleton className="h-3 sm:h-4 w-full mb-1.5 sm:mb-2" />
        <Skeleton className="h-2.5 sm:h-3 w-3/4" />
      </div>
    </Card>
  )
}

// Component: EnhancedStoryCreator
function EnhancedStoryCreator({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [storyImage, setStoryImage] = useState<string | null>(null)
  const [storyCaption, setStoryCaption] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [storyPrivacy, setStoryPrivacy] = useState<"public" | "friends" | "close-friends">("public")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filters = [
    { id: "original", name: "Original", class: "" },
    { id: "grayscale", name: "Noir", class: "grayscale" },
    { id: "sepia", name: "Retro", class: "sepia" },
    { id: "saturate", name: "Vivid", class: "saturate-150" },
    { id: "contrast", name: "Dramatic", class: "contrast-125" },
    { id: "blur", name: "Dreamy", class: "blur-sm" },
    { id: "hue-rotate", name: "Cool", class: "hue-rotate-60" },
    { id: "warm", name: "Warm", class: "brightness-110 sepia-[.25]" },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      })
      setIsUploading(false)
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      })
      setIsUploading(false)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setStoryImage(event.target?.result as string)
      setIsUploading(false)
      setActiveFilter("original")
    }
    reader.readAsDataURL(file)
  }

  const handleCreateStory = () => {
    if (!storyImage) {
      toast({
        title: "No image selected",
        description: "Please select an image for your story",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50])
    }

    // Simulate story creation
    setTimeout(() => {
      toast({
        title: "Story published!",
        description: `Your story is now visible to ${storyPrivacy === "public" ? "everyone" : storyPrivacy === "friends" ? "your friends" : "close friends"}.`,
      })
      setIsCreating(false)
      onClose()
    }, 1500)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose()
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-white/20 dark:border-gray-700/30"
          >
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 h-8 w-8"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </Button>
              <motion.h3
                className="text-base sm:text-lg font-semibold text-center"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Create Story
              </motion.h3>
              <div className="w-8">{/* Spacer for alignment */}</div>
            </div>

            <div className="p-4 sm:p-5">
              {/* Story Image Upload Area */}
              {!storyImage ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="relative"
                >
                  <div
                    className="aspect-[9/16] rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity overflow-hidden group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center">
                        <Loader className="h-10 w-10 text-neo-mint dark:text-purist-blue animate-spin mb-3" />
                        <p className="text-sm font-medium">Uploading image...</p>
                      </div>
                    ) : (
                      <>
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white dark:bg-gray-700 shadow-lg flex items-center justify-center mb-4 border-2 border-neo-mint dark:border-purist-blue"
                        >
                          <Camera className="h-8 w-8 sm:h-10 sm:w-10 text-neo-mint dark:text-purist-blue" />
                        </motion.div>
                        <h3 className="text-base sm:text-lg font-semibold mb-2">Create a new story</h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center max-w-[250px]">
                          Share a photo with your friends and followers
                        </p>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-white/5 transition-all duration-300"
                        >
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          >
                            <span className="text-sm font-medium">Click to upload</span>
                          </motion.div>
                        </motion.div>
                      </>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      aria-label="Upload story image"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {/* Story Preview */}
                  <div className="relative">
                    <div className="aspect-[9/16] rounded-xl overflow-hidden bg-black">
                      <img
                        src={storyImage || "/placeholder.svg"}
                        alt="Story preview"
                        className={`w-full h-full object-cover ${activeFilter ? filters.find((f) => f.id === activeFilter)?.class || "" : ""}`}
                      />

                      {/* User Info Overlay */}
                      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 border-2 border-white">
                            <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
                              JD
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-white">John Doe</p>
                            <p className="text-xs text-white/70">Just now</p>
                          </div>
                        </div>
                      </div>

                      {/* Caption Overlay */}
                      {storyCaption && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                          <p className="text-sm text-white">{storyCaption}</p>
                        </div>
                      )}

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setStoryImage(null)
                          setActiveFilter(null)
                        }}
                        className="absolute top-3 right-3 rounded-full bg-black/50 text-white hover:bg-black/70 h-8 w-8"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Filters */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Filters</h4>
                    <ScrollArea className="w-full">
                      <div className="flex gap-2 pb-2">
                        {filters.map((filter) => (
                          <div
                            key={filter.id}
                            className={`flex-shrink-0 cursor-pointer transition-all duration-200 ${
                              activeFilter === filter.id
                                ? "ring-2 ring-neo-mint dark:ring-purist-blue ring-offset-2 dark:ring-offset-gray-800"
                                : "opacity-70 hover:opacity-100"
                            }`}
                            onClick={() => setActiveFilter(filter.id)}
                          >
                            <div className="w-16 h-16 rounded-lg overflow-hidden">
                              <img
                                src={storyImage || "/placeholder.svg"}
                                alt={filter.name}
                                className={`w-full h-full object-cover ${filter.class}`}
                              />
                            </div>
                            <p className="text-xs text-center mt-1">{filter.name}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Caption Input */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Caption</h4>
                    <Textarea
                      placeholder="Write a caption..."
                      value={storyCaption}
                      onChange={(e) => setStoryCaption(e.target.value)}
                      className="resize-none text-sm"
                      maxLength={150}
                    />
                    <div className="flex justify-end mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{storyCaption.length}/150</span>
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Who can see your story?</h4>
                    <div className="flex gap-2">
                      <Button
                        variant={storyPrivacy === "public" ? "default" : "outline"}
                        size="sm"
                        className={`flex-1 ${
                          storyPrivacy === "public" ? "bg-neo-mint hover:bg-neo-mint/90 text-white" : ""
                        }`}
                        onClick={() => setStoryPrivacy("public")}
                      >
                        <Globe className="h-3.5 w-3.5 mr-1" />
                        Public
                      </Button>
                      <Button
                        variant={storyPrivacy === "friends" ? "default" : "outline"}
                        size="sm"
                        className={`flex-1 ${
                          storyPrivacy === "friends" ? "bg-neo-mint hover:bg-neo-mint/90 text-white" : ""
                        }`}
                        onClick={() => setStoryPrivacy("friends")}
                      >
                        <Users className="h-3.5 w-3.5 mr-1" />
                        Friends
                      </Button>
                      <Button
                        variant={storyPrivacy === "close-friends" ? "default" : "outline"}
                        size="sm"
                        className={`flex-1 ${
                          storyPrivacy === "close-friends" ? "bg-neo-mint hover:bg-neo-mint/90 text-white" : ""
                        }`}
                        onClick={() => setStoryPrivacy("close-friends")}
                      >
                        <User className="h-3.5 w-3.5 mr-1" />
                        Close Friends
                      </Button>
                    </div>
                  </div>

                  {/* Create Button */}
                  <Button
                    className="w-full py-2 h-auto text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={handleCreateStory}
                    disabled={isCreating}
                    style={{
                      background: "linear-gradient(to right, hsl(var(--neo-mint)), hsl(var(--purist-blue)))",
                    }}
                  >
                    {isCreating ? (
                      <motion.div
                        className="flex items-center justify-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Publishing...</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        <span>Share Story</span>
                      </motion.div>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
