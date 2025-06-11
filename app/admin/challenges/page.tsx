"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { fetchAllChallenges } from "@/app/actions/challenge-videos"
import { challengeTopics, type Challenge } from "@/app/utils/challenge-constants"
import { extractVideoFromUrl } from "@/app/actions/youtube-video"
import { getDifficultyBadgeColor, getDifficultyDisplayName } from "@/app/utils/challenge-classifier"
import { setStorageItem, getStorageItem, setStorageItemDebounced, cleanupStorage } from "@/lib/storage-utils"
import {
  BookOpen,
  Clock,
  Edit,
  Eye,
  Filter,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Video,
  Tag,
  CheckCircle2,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import ChallengeDetailView from "@/components/admin/challenge-detail-view"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
}

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const STORAGE_KEY = "admin_challenges"

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null)
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "title" | "duration">("newest")
  const [viewMode, setViewMode] = useState<"table" | "grid" | "detail">("table")
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [topicFilterOpen, setTopicFilterOpen] = useState(false)
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([])
  const [bulkActionOpen, setBulkActionOpen] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null)

  // Form state for create/edit
  const [formState, setFormState] = useState({
    youtubeUrl: "",
    title: "",
    description: "",
    difficulty: "intermediate",
    duration: 0,
    videoId: "",
    thumbnailUrl: "",
    videoUrl: "",
    embedUrl: "",
    topics: [] as string[],
    featured: false,
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Get all available topics from challengeTopics
  const allTopics = [
    ...new Set([
      ...(challengeTopics.beginner || []),
      ...(challengeTopics.intermediate || []),
      ...(challengeTopics.advanced || []),
      ...(challengeTopics.general || []),
    ]),
  ].sort()

  // Load challenges on component mount
  useEffect(() => {
    loadChallenges()

    // Set up auto-refresh if enabled
    if (autoRefresh) {
      const checkRefreshInterval = setInterval(() => {
        const lastRefreshDate = localStorage.getItem("lastChallengeRefresh")
        const today = new Date().toISOString().split("T")[0]

        if (lastRefreshDate !== today) {
          loadChallenges(true)
        }
      }, 60000) // Check every minute

      return () => clearInterval(checkRefreshInterval)
    }
  }, [autoRefresh])

  // Filter challenges when tab, search term, sort order, or selected topics changes
  useEffect(() => {
    let filtered = Array.isArray(challenges) ? [...challenges] : []

    // Filter by difficulty
    if (activeTab !== "all") {
      filtered = filtered.filter((challenge) => challenge.difficulty === activeTab)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (challenge) =>
          challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          challenge.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by selected topics
    if (selectedTopics.length > 0) {
      filtered = filtered.filter((challenge) => {
        if (!challenge.topics) return false
        return challenge.topics.some((topic: string) => selectedTopics.includes(topic))
      })
    }

    // Sort challenges
    if (sortOrder === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortOrder === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    } else if (sortOrder === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortOrder === "duration") {
      filtered.sort((a, b) => b.duration - a.duration)
    }

    setFilteredChallenges(filtered)
  }, [challenges, activeTab, searchTerm, sortOrder, selectedTopics])
  // Load challenges from API and localStorage - optimized
  const loadChallenges = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)

      // Check if we need to refresh based on date
      const today = new Date().toISOString().split("T")[0]
      const lastRefreshDate = getStorageItem<string>("lastChallengeRefresh")

      // If we have cached challenges and it's the same day, use them unless forceRefresh is true
      const cachedChallenges = getStorageItem<Challenge[]>(STORAGE_KEY)
      if (cachedChallenges && lastRefreshDate === today && !forceRefresh) {
        setChallenges(cachedChallenges)
        setFilteredChallenges(cachedChallenges)
        setLastRefreshed(lastRefreshDate)
        setLoading(false)
        return
      }

      // Fetch new challenges
      const allChallenges = await fetchAllChallenges() // 10 daily challenges

      // Get user-created challenges from localStorage
      const userChallenges = getStorageItem<Challenge[]>("userChallenges") || []

      // Combine API challenges with user-created ones
      const combinedChallenges = [
        ...(Array.isArray(userChallenges) ? userChallenges : []),
        ...(Array.isArray(allChallenges) ? allChallenges : []),
      ]

      // Save to localStorage for caching with TTL (24 hours)
      setStorageItem(STORAGE_KEY, combinedChallenges, { 
        ttl: 24 * 60 * 60 * 1000, // 24 hours
        essential: true 
      })
      setStorageItem("lastChallengeRefresh", today, { essential: true })

      setChallenges(combinedChallenges)
      setFilteredChallenges(combinedChallenges)
      setLastRefreshed(today)

      if (forceRefresh) {
        toast({
          title: "Challenges Refreshed",
          description: "The challenge list has been updated with fresh content",
        })
      }
    } catch (error) {
      console.error("Error loading challenges:", error)
      toast({
        title: "Error",
        description: "Failed to load challenges. Please try again.",
        variant: "destructive",
      })

      // Try to load from cache as fallback
      const cachedChallenges = getStorageItem<Challenge[]>(STORAGE_KEY)
      if (cachedChallenges) {
        setChallenges(cachedChallenges)
        setFilteredChallenges(cachedChallenges)
        toast({
          title: "Using cached data",
          description: "Showing previously loaded challenges",
        })
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Refresh challenges
  const refreshChallenges = async () => {
    try {
      setRefreshing(true)
      await loadChallenges(true)
    } catch (error) {
      console.error("Error refreshing challenges:", error)
      toast({
        title: "Error",
        description: "Failed to refresh challenges",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  // Format duration from seconds to minutes:seconds
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  // Handle YouTube URL extraction
  const handleYoutubeUrlChange = async (url: string) => {
    setFormState({ ...formState, youtubeUrl: url })

    if (!url.trim()) return

    try {
      setFormLoading(true)
      setFormError(null)

      const videoData = await extractVideoFromUrl(url)

      if (!videoData) {
        setFormError("Could not extract video information from the provided URL")
        return
      }

      setFormState({
        ...formState,
        youtubeUrl: url,
        title: videoData.title,
        description: videoData.description,
        duration: videoData.duration,
        videoId: videoData.id,
        thumbnailUrl: videoData.thumbnailUrl,
        videoUrl: videoData.videoUrl,
        embedUrl: videoData.embedUrl,
        topics: Array.isArray(videoData.topics) ? videoData.topics : [],
      })
    } catch (error) {
      console.error("Error extracting video data:", error)
      setFormError("Failed to extract video data. Please check the URL and try again.")
    } finally {
      setFormLoading(false)
    }
  }

  // Handle create challenge
  const handleCreateChallenge = () => {
    setFormState({
      youtubeUrl: "",
      title: "",
      description: "",
      difficulty: "intermediate",
      duration: 0,
      videoId: "",
      thumbnailUrl: "",
      videoUrl: "",
      embedUrl: "",
      topics: [],
      featured: false,
    })
    setFormError(null)
    setCreateModalOpen(true)
  }

  // Handle edit challenge
  const handleEditChallenge = (challenge: Challenge) => {
    setCurrentChallenge(challenge)
    setFormState({
      youtubeUrl: "",
      title: challenge.title,
      description: challenge.description,
      difficulty: challenge.difficulty,
      duration: challenge.duration,
      videoId: challenge.id,
      thumbnailUrl: challenge.thumbnailUrl || "",
      videoUrl: challenge.videoUrl,
      embedUrl: challenge.embedUrl || "",
      topics: challenge.topics || [], // Ensure topics is never undefined
      featured: challenge.featured || false,
    })
    setFormError(null)
    setEditModalOpen(true)
  }

  // Handle delete challenge
  const handleDeleteChallenge = (challenge: Challenge) => {
    setCurrentChallenge(challenge)
    setDeleteModalOpen(true)
  }

  // Handle view challenge details
  const handleViewChallenge = (challenge: Challenge) => {
    setCurrentChallenge(challenge)
    setViewMode("detail")
  }

  // Handle back from detail view
  const handleBackFromDetail = () => {
    setViewMode("table")
    setCurrentChallenge(null)
  }

  // Toggle topic selection
  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) => {
      const prevArray = Array.isArray(prev) ? prev : []
      return prevArray.includes(topic) ? prevArray.filter((t) => t !== topic) : [...prevArray, topic]
    })
  }

  // Toggle challenge selection for bulk actions
  const toggleChallengeSelection = (id: string) => {
    setSelectedChallenges((prev) => {
      const prevArray = Array.isArray(prev) ? prev : []
      return prevArray.includes(id) ? prevArray.filter((cid) => cid !== id) : [...prevArray, id]
    })
  }

  // Select/deselect all visible challenges
  const toggleSelectAll = () => {
    if (!Array.isArray(filteredChallenges)) {
      setSelectedChallenges([])
      return
    }

    if (Array.isArray(selectedChallenges) && selectedChallenges.length === filteredChallenges.length) {
      setSelectedChallenges([])
    } else {
      setSelectedChallenges(filteredChallenges.map((c) => c.id))
    }
  }

  // Handle bulk delete
  const handleBulkDelete = () => {
    try {
      if (selectedChallenges.length === 0) return

      // Remove selected challenges
      const updatedChallenges = challenges.filter((challenge) => !selectedChallenges.includes(challenge.id))
      setChallenges(updatedChallenges)

      // Update localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChallenges))

      // Update user challenges in localStorage
      const userChallengesJson = localStorage.getItem("userChallenges")
      if (userChallengesJson) {
        const userChallenges = JSON.parse(userChallengesJson)
        const updatedUserChallenges = userChallenges.filter(
          (challenge: Challenge) => !selectedChallenges.includes(challenge.id),
        )
        localStorage.setItem("userChallenges", JSON.stringify(updatedUserChallenges))
      }

      // Reset selection and close dropdown
      setSelectedChallenges([])
      setBulkActionOpen(false)

      toast({
        title: "Challenges deleted",
        description: `${selectedChallenges.length} challenges have been deleted`,
      })
    } catch (error) {
      console.error("Error performing bulk delete:", error)
      toast({
        title: "Error",
        description: "Failed to delete challenges",
        variant: "destructive",
      })
    }
  }

  // Handle bulk change difficulty
  const handleBulkChangeDifficulty = (difficulty: string) => {
    try {
      if (selectedChallenges.length === 0) return

      // Update challenges
      const updatedChallenges = challenges.map((challenge) => {
        if (selectedChallenges.includes(challenge.id)) {
          return { ...challenge, difficulty }
        }
        return challenge
      })
      setChallenges(updatedChallenges)

      // Update localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChallenges))

      // Update user challenges in localStorage
      const userChallengesJson = localStorage.getItem("userChallenges")
      if (userChallengesJson) {
        const userChallenges = JSON.parse(userChallengesJson)
        const updatedUserChallenges = userChallenges.map((challenge: Challenge) => {
          if (selectedChallenges.includes(challenge.id)) {
            return { ...challenge, difficulty }
          }
          return challenge
        })
        localStorage.setItem("userChallenges", JSON.stringify(updatedUserChallenges))
      }

      // Reset selection and close dropdown
      setSelectedChallenges([])
      setBulkActionOpen(false)

      toast({
        title: "Difficulty updated",
        description: `${selectedChallenges.length} challenges have been updated to ${getDifficultyDisplayName(difficulty)}`,
      })
    } catch (error) {
      console.error("Error performing bulk difficulty change:", error)
      toast({
        title: "Error",
        description: "Failed to update challenges",
        variant: "destructive",
      })
    }
  }

  // Submit create challenge form
  const submitCreateForm = () => {
    try {
      if (!formState.title.trim() || !formState.videoUrl.trim()) {
        setFormError("Title and video URL are required")
        return
      }

      const newChallenge: Challenge = {
        id: formState.videoId || `custom-${Date.now()}`,
        title: formState.title,
        description: formState.description,
        thumbnailUrl: formState.thumbnailUrl,
        videoUrl: formState.videoUrl,
        embedUrl: formState.embedUrl,
        duration: formState.duration,
        difficulty: formState.difficulty,
        createdAt: new Date().toISOString(),
        topics: Array.isArray(formState.topics) ? formState.topics : [],
        featured: formState.featured,
      }      // Add to challenges list
      const updatedChallenges = [newChallenge, ...challenges]
      setChallenges(updatedChallenges)

      // Debounced save to localStorage for admin challenges
      setStorageItemDebounced(STORAGE_KEY, updatedChallenges, 300, { 
        ttl: 24 * 60 * 60 * 1000,
        essential: true 
      })

      // Save to localStorage for user challenges
      const userChallenges = getStorageItem<Challenge[]>("userChallenges") || []
      const updatedUserChallenges = [newChallenge, ...userChallenges]
      setStorageItemDebounced("userChallenges", updatedUserChallenges, 300, { essential: true })

      // Close modal and show success message
      setCreateModalOpen(false)
      toast({
        title: "Challenge created",
        description: "New challenge has been created successfully",
      })
    } catch (error) {
      console.error("Error creating challenge:", error)
      setFormError("Failed to create challenge. Please try again.")
    }
  }

  // Submit edit challenge form
  const submitEditForm = () => {
    try {
      if (!currentChallenge) return
      if (!formState.title.trim()) {
        setFormError("Title is required")
        return
      }

      const updatedChallenge: Challenge = {
        ...currentChallenge,
        title: formState.title,
        description: formState.description,
        difficulty: formState.difficulty,
        topics: Array.isArray(formState.topics) ? formState.topics : [],
        featured: formState.featured,
      }

      // Update challenges list
      const updatedChallenges = challenges.map((challenge) =>
        challenge.id === updatedChallenge.id ? updatedChallenge : challenge,
      )
      setChallenges(updatedChallenges)

      // Update localStorage for admin challenges
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChallenges))

      // Update localStorage for user challenges
      const savedChallenges = localStorage.getItem("userChallenges")
      if (savedChallenges) {
        let userChallenges = JSON.parse(savedChallenges)
        userChallenges = userChallenges.map((challenge: Challenge) =>
          challenge.id === updatedChallenge.id ? updatedChallenge : challenge,
        )
        localStorage.setItem("userChallenges", JSON.stringify(userChallenges))
      }

      // Close modal and show success message
      setEditModalOpen(false)
      toast({
        title: "Challenge updated",
        description: "Challenge has been updated successfully",
      })
    } catch (error) {
      console.error("Error updating challenge:", error)
      setFormError("Failed to update challenge. Please try again.")
    }
  }

  // Confirm delete challenge
  const confirmDeleteChallenge = () => {
    try {
      if (!currentChallenge) return

      // Remove from challenges list
      const updatedChallenges = challenges.filter((challenge) => challenge.id !== currentChallenge.id)
      setChallenges(updatedChallenges)

      // Update localStorage for admin challenges
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChallenges))

      // Update localStorage for user challenges
      const savedChallenges = localStorage.getItem("userChallenges")
      if (savedChallenges) {
        let userChallenges = JSON.parse(savedChallenges)
        userChallenges = userChallenges.filter((challenge: Challenge) => challenge.id !== currentChallenge.id)
        localStorage.setItem("userChallenges", JSON.stringify(userChallenges))
      }

      // Close modal and show success message
      setDeleteModalOpen(false)
      toast({
        title: "Challenge deleted",
        description: "Challenge has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting challenge:", error)
      toast({
        title: "Error",
        description: "Failed to delete challenge",
        variant: "destructive",
      })
    }
  }

  // If in detail view, show the challenge detail component
  if (viewMode === "detail" && currentChallenge) {
    return (
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <ChallengeDetailView
          challenge={currentChallenge}
          onEdit={handleEditChallenge}
          onBack={handleBackFromDetail}
          onDelete={handleDeleteChallenge}
        />
      </motion.div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative w-16 h-16">
            <motion.div
              animate={{
                rotate: 360,
                transition: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
              }}
              className="absolute inset-0"
            >
              <Loader2 className="h-16 w-16 text-primary" />
            </motion.div>
          </div>
          <p className="text-lg font-medium">Loading challenges...</p>
          <p className="text-sm text-muted-foreground">This may take a moment</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-6">
      {/* Header */}
      <motion.div variants={slideUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-neo-mint to-purist-blue bg-clip-text text-transparent">
            Challenge Management
          </h1>
          <p className="text-muted-foreground mt-1">Create, edit, and manage learning challenges for your users</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} id="auto-refresh" />
            <Label htmlFor="auto-refresh" className="text-sm cursor-pointer">
              Auto-refresh daily
            </Label>
          </div>
          <Button variant="outline" size="sm" onClick={refreshChallenges} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            size="sm"
            onClick={handleCreateChallenge}
            className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Challenge
          </Button>
        </div>
      </motion.div>

      {/* Last refreshed info */}
      {lastRefreshed && (
        <motion.div variants={slideUp} className="text-sm text-muted-foreground">
          Last refreshed: {new Date(lastRefreshed).toLocaleString()}
        </motion.div>
      )}

      {/* Filters and Search */}
      <motion.div variants={slideUp}>
        <Card className="border-none shadow-neo">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search challenges..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <DropdownMenu open={topicFilterOpen} onOpenChange={setTopicFilterOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-[150px]">
                      <Tag className="h-4 w-4 mr-2" />
                      <span>Topics</span>
                      <Badge className="ml-2 bg-primary/20 text-primary hover:bg-primary/30" variant="secondary">
                        {selectedTopics.length}
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[220px]" align="end">
                    <div className="p-2">
                      <ScrollArea className="h-[300px] pr-3">
                        <div className="space-y-2">
                          {allTopics.map((topic) => (
                            <div key={topic} className="flex items-center space-x-2">
                              <Checkbox
                                id={`topic-${topic}`}
                                checked={selectedTopics.includes(topic)}
                                onCheckedChange={() => toggleTopic(topic)}
                              />
                              <label
                                htmlFor={`topic-${topic}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {topic}
                              </label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="p-2 flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => setSelectedTopics([])} className="text-xs h-8">
                        Clear All
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setTopicFilterOpen(false)}
                        className="text-xs h-8 bg-gradient-to-r from-neo-mint to-purist-blue text-white"
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as any)}>
                  <SelectTrigger className="w-[180px]">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <span>Sort by</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="title">Title (A-Z)</SelectItem>
                    <SelectItem value="duration">Duration (Longest)</SelectItem>
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-[120px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <span>View</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setViewMode("table")}>
                      <div className={`w-4 h-4 mr-2 ${viewMode === "table" ? "text-primary" : ""}`}>
                        {viewMode === "table" ? <CheckCircle2 className="h-4 w-4" /> : <div className="w-4" />}
                      </div>
                      Table View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewMode("grid")}>
                      <div className={`w-4 h-4 mr-2 ${viewMode === "grid" ? "text-primary" : ""}`}>
                        {viewMode === "grid" ? <CheckCircle2 className="h-4 w-4" /> : <div className="w-4" />}
                      </div>
                      Grid View
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Bulk actions */}
            {selectedChallenges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between bg-muted/50 p-2 rounded-md"
              >
                <div className="text-sm">
                  <span className="font-medium">{selectedChallenges.length}</span> challenges selected
                </div>
                <div className="flex gap-2">
                  <DropdownMenu open={bulkActionOpen} onOpenChange={setBulkActionOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Bulk Actions
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleBulkChangeDifficulty("beginner")}>
                        Set as Beginner
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkChangeDifficulty("intermediate")}>
                        Set as Intermediate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkChangeDifficulty("advanced")}>
                        Set as Advanced
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleBulkDelete} className="text-red-600">
                        Delete Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedChallenges([])}>
                    Clear Selection
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs and Challenge List */}
      <motion.div variants={slideUp}>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
            >
              All Challenges
            </TabsTrigger>
            <TabsTrigger
              value="beginner"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
            >
              Beginner
            </TabsTrigger>
            <TabsTrigger
              value="intermediate"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
            >
              Intermediate
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
            >
              Advanced
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + viewMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="all" className="mt-6">
                {viewMode === "table" ? (
                  <ChallengeTable
                    challenges={filteredChallenges}
                    formatDuration={formatDuration}
                    formatDate={formatDate}
                    onEdit={handleEditChallenge}
                    onDelete={handleDeleteChallenge}
                    onView={handleViewChallenge}
                    selectedChallenges={selectedChallenges}
                    toggleSelection={toggleChallengeSelection}
                    toggleSelectAll={toggleSelectAll}
                    allSelected={
                      selectedChallenges.length === filteredChallenges.length && filteredChallenges.length > 0
                    }
                  />
                ) : (
                  <ChallengeGrid
                    challenges={filteredChallenges}
                    formatDuration={formatDuration}
                    onEdit={handleEditChallenge}
                    onDelete={handleDeleteChallenge}
                    onView={handleViewChallenge}
                    selectedChallenges={selectedChallenges}
                    toggleSelection={toggleChallengeSelection}
                  />
                )}
              </TabsContent>

              <TabsContent value="beginner" className="mt-6">
                {viewMode === "table" ? (
                  <ChallengeTable
                    challenges={filteredChallenges}
                    formatDuration={formatDuration}
                    formatDate={formatDate}
                    onEdit={handleEditChallenge}
                    onDelete={handleDeleteChallenge}
                    onView={handleViewChallenge}
                    selectedChallenges={selectedChallenges}
                    toggleSelection={toggleChallengeSelection}
                    toggleSelectAll={toggleSelectAll}
                    allSelected={
                      selectedChallenges.length === filteredChallenges.length && filteredChallenges.length > 0
                    }
                  />
                ) : (
                  <ChallengeGrid
                    challenges={filteredChallenges}
                    formatDuration={formatDuration}
                    onEdit={handleEditChallenge}
                    onDelete={handleDeleteChallenge}
                    onView={handleViewChallenge}
                    selectedChallenges={selectedChallenges}
                    toggleSelection={toggleChallengeSelection}
                  />
                )}
              </TabsContent>

              <TabsContent value="intermediate" className="mt-6">
                {viewMode === "table" ? (
                  <ChallengeTable
                    challenges={filteredChallenges}
                    formatDuration={formatDuration}
                    formatDate={formatDate}
                    onEdit={handleEditChallenge}
                    onDelete={handleDeleteChallenge}
                    onView={handleViewChallenge}
                    selectedChallenges={selectedChallenges}
                    toggleSelection={toggleChallengeSelection}
                    toggleSelectAll={toggleSelectAll}
                    allSelected={
                      selectedChallenges.length === filteredChallenges.length && filteredChallenges.length > 0
                    }
                  />
                ) : (
                  <ChallengeGrid
                    challenges={filteredChallenges}
                    formatDuration={formatDuration}
                    onEdit={handleEditChallenge}
                    onDelete={handleDeleteChallenge}
                    onView={handleViewChallenge}
                    selectedChallenges={selectedChallenges}
                    toggleSelection={toggleChallengeSelection}
                  />
                )}
              </TabsContent>

              <TabsContent value="advanced" className="mt-6">
                {viewMode === "table" ? (
                  <ChallengeTable
                    challenges={filteredChallenges}
                    formatDuration={formatDuration}
                    formatDate={formatDate}
                    onEdit={handleEditChallenge}
                    onDelete={handleDeleteChallenge}
                    onView={handleViewChallenge}
                    selectedChallenges={selectedChallenges}
                    toggleSelection={toggleChallengeSelection}
                    toggleSelectAll={toggleSelectAll}
                    allSelected={
                      selectedChallenges.length === filteredChallenges.length && filteredChallenges.length > 0
                    }
                  />
                ) : (
                  <ChallengeGrid
                    challenges={filteredChallenges}
                    formatDuration={formatDuration}
                    onEdit={handleEditChallenge}
                    onDelete={handleDeleteChallenge}
                    onView={handleViewChallenge}
                    selectedChallenges={selectedChallenges}
                    toggleSelection={toggleChallengeSelection}
                  />
                )}
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </motion.div>

      {/* Create Challenge Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Challenge</DialogTitle>
            <DialogDescription>
              Add a new challenge by entering a YouTube URL or manually entering the details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube Video URL (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="youtube-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formState.youtubeUrl}
                  onChange={(e) => setFormState({ ...formState, youtubeUrl: e.target.value })}
                  disabled={formLoading}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleYoutubeUrlChange(formState.youtubeUrl)}
                  disabled={formLoading || !formState.youtubeUrl.trim()}
                >
                  {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Extract"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste a YouTube URL to automatically extract video details, or fill in the form manually
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Challenge title"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  disabled={formLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={formState.difficulty}
                  onValueChange={(value) => setFormState({ ...formState, difficulty: value })}
                  disabled={formLoading}
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Challenge description"
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                disabled={formLoading}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Topics</Label>
              <ScrollArea className="h-[100px] border rounded-md p-2">
                <div className="space-y-2">
                  {allTopics.slice(0, 15).map((topic) => (
                    <div key={topic} className="flex items-center space-x-2">
                      <Checkbox
                        id={`create-topic-${topic}`}
                        checked={formState.topics.includes(topic)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormState({
                              ...formState,
                              topics: [...(Array.isArray(formState.topics) ? formState.topics : []), topic],
                            })
                          } else {
                            setFormState({
                              ...formState,
                              topics: Array.isArray(formState.topics)
                                ? formState.topics.filter((t) => t !== topic)
                                : [],
                            })
                          }
                        }}
                      />
                      <label
                        htmlFor={`create-topic-${topic}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {topic}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={formState.featured}
                onCheckedChange={(checked) => {
                  setFormState({
                    ...formState,
                    featured: !!checked,
                  })
                }}
              />
              <label
                htmlFor="featured"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Feature this challenge (will appear prominently on the challenges page)
              </label>
            </div>

            {formState.thumbnailUrl && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-16 bg-muted rounded overflow-hidden">
                    <img
                      src={formState.thumbnailUrl || "/placeholder.svg"}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{formState.title}</p>
                    <p className="text-xs text-muted-foreground">Duration: {formatDuration(formState.duration)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button
              onClick={submitCreateForm}
              disabled={formLoading || !formState.title.trim()}
              className="bg-gradient-to-r from-neo-mint to-purist-blue text-white"
            >
              Create Challenge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Challenge Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Challenge</DialogTitle>
            <DialogDescription>Update the challenge details.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  placeholder="Challenge title"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-difficulty">Difficulty Level</Label>
                <Select
                  value={formState.difficulty}
                  onValueChange={(value) => setFormState({ ...formState, difficulty: value })}
                >
                  <SelectTrigger id="edit-difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Challenge description"
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Topics</Label>
              <ScrollArea className="h-[100px] border rounded-md p-2">
                <div className="space-y-2">
                  {allTopics.slice(0, 15).map((topic) => (
                    <div key={topic} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-topic-${topic}`}
                        checked={formState.topics.includes(topic)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormState({
                              ...formState,
                              topics: [...(Array.isArray(formState.topics) ? formState.topics : []), topic],
                            })
                          } else {
                            setFormState({
                              ...formState,
                              topics: Array.isArray(formState.topics)
                                ? formState.topics.filter((t) => t !== topic)
                                : [],
                            })
                          }
                        }}
                      />
                      <label
                        htmlFor={`edit-topic-${topic}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {topic}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-featured"
                checked={formState.featured}
                onCheckedChange={(checked) => {
                  setFormState({
                    ...formState,
                    featured: !!checked,
                  })
                }}
              />
              <label
                htmlFor="edit-featured"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Feature this challenge (will appear prominently on the challenges page)
              </label>
            </div>

            {formState.thumbnailUrl && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-16 bg-muted rounded overflow-hidden">
                    <img
                      src={formState.thumbnailUrl || "/placeholder.svg"}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{formState.title}</p>
                    <p className="text-xs text-muted-foreground">Duration: {formatDuration(formState.duration)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitEditForm}
              disabled={!formState.title.trim()}
              className="bg-gradient-to-r from-neo-mint to-purist-blue text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this challenge? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {currentChallenge && (
              <div className="flex items-center gap-4">
                <div className="w-16 h-12 bg-muted rounded overflow-hidden">
                  {currentChallenge.thumbnailUrl ? (
                    <img
                      src={currentChallenge.thumbnailUrl || "/placeholder.svg"}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Video className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{currentChallenge.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {getDifficultyDisplayName(currentChallenge.difficulty)} •{" "}
                    {formatDuration(currentChallenge.duration)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteChallenge}>
              Delete Challenge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

// Challenge Table Component
function ChallengeTable({
  challenges,
  formatDuration,
  formatDate,
  onEdit,
  onDelete,
  onView,
  selectedChallenges,
  toggleSelection,
  toggleSelectAll,
  allSelected,
}: {
  challenges: Challenge[]
  formatDuration: (seconds: number) => string
  formatDate: (dateString: string) => string
  onEdit: (challenge: Challenge) => void
  onDelete: (challenge: Challenge) => void
  onView: (challenge: Challenge) => void
  selectedChallenges: string[]
  toggleSelection: (id: string) => void
  toggleSelectAll: () => void
  allSelected: boolean
}) {
  if (challenges.length === 0) {
    return (
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <Card className="border-none shadow-neo">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No challenges found matching your criteria</p>
            <Button className="bg-gradient-to-r from-neo-mint to-purist-blue text-white">Create a Challenge</Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <Card className="border-none shadow-neo overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all challenges"
                  />
                </TableHead>
                <TableHead className="w-[300px]">Challenge</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Topics</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {challenges.map((challenge) => (
                  <motion.tr
                    key={challenge.id}
                    variants={slideUp}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className={`${
                      selectedChallenges.includes(challenge.id) ? "bg-muted/50" : ""
                    } hover:bg-muted/30 transition-colors`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedChallenges.includes(challenge.id)}
                        onCheckedChange={() => toggleSelection(challenge.id)}
                        aria-label={`Select ${challenge.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-muted rounded overflow-hidden">
                          {challenge.thumbnailUrl ? (
                            <img
                              src={challenge.thumbnailUrl || "/placeholder.svg"}
                              alt={challenge.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <Video className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="truncate max-w-[200px]" title={challenge.title}>
                          {challenge.title}
                          {challenge.featured && (
                            <Badge
                              className="ml-2 bg-amber-500/20 text-amber-600 hover:bg-amber-500/30"
                              variant="secondary"
                            >
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getDifficultyBadgeColor(challenge.difficulty)}>
                        {getDifficultyDisplayName(challenge.difficulty)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{formatDuration(challenge.duration)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {challenge.topics && challenge.topics.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {challenge.topics.slice(0, 2).map((topic: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {challenge.topics.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{challenge.topics.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No topics</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(challenge.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(challenge)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(challenge)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onDelete(challenge)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </Card>
    </motion.div>
  )
}

// Challenge Grid Component
function ChallengeGrid({
  challenges,
  formatDuration,
  onEdit,
  onDelete,
  onView,
  selectedChallenges,
  toggleSelection,
}: {
  challenges: Challenge[]
  formatDuration: (seconds: number) => string
  onEdit: (challenge: Challenge) => void
  onDelete: (challenge: Challenge) => void
  onView: (challenge: Challenge) => void
  selectedChallenges: string[]
  toggleSelection: (id: string) => void
}) {
  if (challenges.length === 0) {
    return (
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <Card className="border-none shadow-neo">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No challenges found matching your criteria</p>
            <Button className="bg-gradient-to-r from-neo-mint to-purist-blue text-white">Create a Challenge</Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <AnimatePresence>
        {challenges.map((challenge) => (
          <motion.div
            key={challenge.id}
            variants={slideUp}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="relative"
          >
            <Card
              className={`h-full border-none shadow-neo hover:shadow-neo-hover transition-shadow ${
                selectedChallenges.includes(challenge.id) ? "ring-2 ring-primary ring-offset-2" : ""
              }`}
            >
              <div className="absolute top-2 right-2 z-10">
                <Checkbox
                  checked={selectedChallenges.includes(challenge.id)}
                  onCheckedChange={() => toggleSelection(challenge.id)}
                  aria-label={`Select ${challenge.title}`}
                />
              </div>

              <div className="relative aspect-video bg-muted overflow-hidden">
                {challenge.thumbnailUrl ? (
                  <img
                    src={challenge.thumbnailUrl || "/placeholder.svg"}
                    alt={challenge.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <div className="flex items-center justify-between">
                    <Badge className={getDifficultyBadgeColor(challenge.difficulty)}>
                      {getDifficultyDisplayName(challenge.difficulty)}
                    </Badge>
                    <div className="flex items-center gap-1 text-white text-xs">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(challenge.duration)}</span>
                    </div>
                  </div>
                </div>
                {challenge.featured && (
                  <div className="absolute top-0 left-0 bg-amber-500 text-white text-xs px-2 py-1">Featured</div>
                )}
              </div>

              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg line-clamp-2" title={challenge.title}>
                  {challenge.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{challenge.description}</p>

                {challenge.topics && challenge.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {challenge.topics.slice(0, 3).map((topic: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {challenge.topics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{challenge.topics.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-4 pt-0 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => onView(challenge)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(challenge)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDelete(challenge)} className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
