"use client"

import { useState, useEffect, useCallback, useRef, useMemo, Suspense, lazy } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Clock,
  Film,
  MessageSquare,
  Pencil,
  Users,
  Search,
  X,
  Sparkles,
  Zap,
  Award,
  TrendingUp,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMobile } from "@/hooks/use-mobile"
import { formatNewPost } from "@/app/utils/post-helpers"
import { useInView } from "react-intersection-observer"
import { Skeleton } from "@/components/ui/skeleton"
import { debounce } from "lodash"
import { fetchCurrentChallenge } from "@/app/actions/challenge-videos"
import { type Challenge } from "./utils/challenge-constants"
import { toast } from "@/hooks/use-toast"

// Lazy load components that aren't needed immediately
const AssignedTask = lazy(() => import("@/components/assigned-task"))
const MainHeader = lazy(() => import("@/components/main-header"))
const FeedFilter = lazy(() => import("@/components/feed-filter"))
const FeedEmptyState = lazy(() => import("@/components/feed-empty-state"))
const ThemeToggle = lazy(() => import("@/components/theme-toggle"))
const FeedPost = lazy(() => import("@/components/feed-post"))
const AIChatButtonComponent = lazy(() =>
  import("@/components/ai-chat-button").then((mod) => ({ default: mod.AIChatButton })),
)
const OptimizedImage = lazy(() => import("@/components/optimized-image"))

// Loading fallback component
const LoadingFallback = () => <div className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg h-32 w-full"></div>

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null)
  const [challengeLoading, setChallengeLoading] = useState(true)
  const isMobile = useMobile()
  const [newPostAdded, setNewPostAdded] = useState(false)
  const [posts, setPosts] = useState<any[]>([])
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const loader = useRef(null)

  // Tối ưu hóa loadMorePosts với useCallback
  const loadMorePosts = useCallback(async () => {
    if (loading) return

    setLoading(true)

    try {
      // Sử dụng Promise.all để tải nhiều dữ liệu cùng lúc
      const [newPosts] = await Promise.all([
        // Giả lập việc tải thêm bài đăng
        new Promise<any[]>((resolve) => {
          setTimeout(() => {
            resolve([
              {
                id: `generated-${Date.now()}-1`,
                username: "alex_teacher",
                userImage: "/placeholder.svg?height=40&width=40",
                title: "Here's my analysis of the latest TED Talk on language learning",
                content:
                  "<p>I found this TED Talk really insightful about how we can improve language acquisition through immersive experiences. The speaker highlighted several techniques that I've been using with my students.</p>",
                videoUrl: "/placeholder.svg?height=400&width=600",
                createdAt: new Date().toISOString(),
              },
              {
                id: `generated-${Date.now()}-2`,
                username: "language_master",
                userImage: "/placeholder.svg?height=40&width=40",
                title: "My pronunciation practice for difficult English sounds",
                content:
                  "<p>I've been working on the 'th' sound and the difference between 'v' and 'w'. Here's my practice session!</p>",
                videoUrl: "/placeholder.svg?height=400&width=600",
                createdAt: new Date().toISOString(),
              },
            ])
          }, 500) // Giảm thời gian chờ xuống 500ms
        }),
      ])

      setPosts((prev) => [...prev, ...newPosts])
      setPage((prev) => prev + 1)

      // Giả lập việc hết bài đăng để tải
      if (page >= 3) {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error loading posts:", error)
    } finally {
      setLoading(false)
    }
  }, [loading, page])

  // Tối ưu hiệu suất render với debounce
  const debouncedLoadMorePosts = useCallback(
    debounce(() => {
      if (hasMore && !loading) {
        loadMorePosts()
      }
    }, 200), // Giảm thời gian debounce xuống 200ms
    [hasMore, loading, loadMorePosts],
  )

  // Sử dụng Intersection Observer để tải thêm bài đăng khi cuộn đến cuối
  const { ref, inView } = useInView({
    threshold: 0.1, // Giảm threshold xuống 0.1 để tải sớm hơn
    rootMargin: "200px", // Tăng rootMargin để tải trước khi người dùng cuộn đến
  })

  // Sử dụng useMemo để tránh tính toán lại các bài đăng đã lọc
  const filteredPosts = useMemo(() => {
    if (activeFilters.length === 0) return posts

    return posts.filter((post) => {
      const formattedPost = formatNewPost(post)
      const mediaType = formattedPost.mediaType

      if (activeFilters.includes("video") && (mediaType === "video" || mediaType === "youtube")) {
        return true
      }

      if (activeFilters.includes("text") && mediaType === "text") {
        return true
      }

      if (activeFilters.includes("discussion") && mediaType === "none") {
        return true
      }

      return false
    })
  }, [posts, activeFilters])

  // Hàm để xử lý thay đổi bộ lọc
  const handleFilterChange = useCallback((filters: string[]) => {
    setActiveFilters(filters)
  }, [])

  // Hàm để làm mới feed
  const refreshFeed = useCallback(() => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setPosts([])
      setHasMore(true)
      setPage(1)
    }, 500) // Giảm thời gian chờ xuống 500ms
  }, [])

  // Tải thêm bài đăng khi cuộn đến cuối
  useEffect(() => {
    if (inView) {
      debouncedLoadMorePosts()
    }
  }, [inView, debouncedLoadMorePosts])

  // Check for new posts from localStorage
  useEffect(() => {
    const checkForNewPosts = () => {
      const newPostData = localStorage.getItem("newPost")
      if (newPostData) {
        try {
          const postData = JSON.parse(newPostData)

          // Thêm bài đăng mới vào đầu danh sách
          setPosts((prev) => {
            // Kiểm tra xem bài đăng đã tồn tại chưa để tránh trùng lặp
            const exists = prev.some((post) => post.id === postData.id)
            if (exists) {
              return prev
            }
            return [postData, ...prev]
          })

          setNewPostAdded(true)
        } catch (error) {
          console.error("Error parsing new post data:", error)
        }
      }
    }

    // Kiểm tra ngay khi component được mount
    checkForNewPosts()

    // Lắng nghe sự kiện storage change (khi localStorage được cập nhật từ tab khác)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "newPost" && e.newValue) {
        checkForNewPosts()
      }
    }

    // Lắng nghe sự kiện tùy chỉnh khi bài đăng mới được xuất bản
    const handleNewPostPublished = (e: CustomEvent) => {
      setPosts((prev) => {
        // Kiểm tra xem bài đăng đã tồn tại chưa để tránh trùng lặp
        const exists = prev.some((post) => post.id === e.detail.id)
        if (exists) {
          return prev
        }
        return [e.detail, ...prev]
      })
      setNewPostAdded(true)
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("newPostPublished", handleNewPostPublished as EventListener)

    // Kiểm tra định kỳ mỗi 5 giây (tăng lên từ 2 giây để giảm tải)
    const intervalId = setInterval(checkForNewPosts, 5000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("newPostPublished", handleNewPostPublished as EventListener)
      clearInterval(intervalId)
    }
  }, [])
  // Hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load current challenge
  useEffect(() => {
    const loadCurrentChallenge = async () => {
      try {
        setChallengeLoading(true)
        const challenge = await fetchCurrentChallenge()
        setCurrentChallenge(challenge)
      } catch (error) {
        console.error("Error loading current challenge:", error)
        toast({
          title: "Error",
          description: "Failed to load current challenge. Please try again.",
          variant: "destructive",
        })
      } finally {
        setChallengeLoading(false)
      }
    }

    if (mounted) {
      loadCurrentChallenge()
    }
  }, [mounted])

  // Preload critical data
  useEffect(() => {
    // Preload initial posts
    const preloadPosts = async () => {
      if (posts.length === 0 && !loading) {
        loadMorePosts()
      }
    }

    if (mounted) {
      preloadPosts()
    }
  }, [mounted, posts.length, loading, loadMorePosts])

  if (!mounted) {
    // Return a lightweight loading state
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // Reduced from 0.1 to 0.05 for faster animation
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 }, // Reduced y from 20 to 10 for subtler animation
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } }, // Increased stiffness for faster animation
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-background/80 dark:from-background dark:via-background/90 dark:to-background/80">
      <Suspense fallback={<div className="h-16 bg-background"></div>}>
        <MainHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      </Suspense>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }} // Increased stiffness and damping for faster animation
            className="fixed inset-0 z-50 bg-neo-mint/10 dark:bg-dark-blue/20 backdrop-blur-xl md:hidden"
          >
            <div className="flex h-16 items-center justify-between px-6 border-b border-neo-mint/20 dark:border-dark-blue/20">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                  <BookOpen className="relative h-6 w-6 text-neo-mint dark:text-purist-blue" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue">
                  EnglishMastery
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="flex flex-col p-6 space-y-6">
              <Link
                href="/"
                className="text-lg font-medium text-neo-mint dark:text-purist-blue flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-neo-mint/10 dark:bg-purist-blue/10 flex items-center justify-center">
                  <BookOpen className="h-4 w-4" />
                </div>
                Home
              </Link>
              <Link href="/challenges" className="text-lg font-medium flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neo-mint/10 dark:bg-purist-blue/10 flex items-center justify-center">
                  <Zap className="h-4 w-4" />
                </div>
                Challenges
              </Link>
              <Link href="/community" className="text-lg font-medium flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neo-mint/10 dark:bg-purist-blue/10 flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
                Community
              </Link>
              <Link href="/resources" className="text-lg font-medium flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neo-mint/10 dark:bg-purist-blue/10 flex items-center justify-center">
                  <BookOpen className="h-4 w-4" />
                </div>
                Resources
              </Link>
              <Link href="/profile" className="text-lg font-medium flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neo-mint/10 dark:bg-purist-blue/10 flex items-center justify-center">
                  <Award className="h-4 w-4" />
                </div>
                Profile
              </Link>

              <div className="pt-6 border-t border-neo-mint/10 dark:border-purist-blue/10">
                <Suspense fallback={<div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-full"></div>}>
                  <ThemeToggle />
                </Suspense>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 relative overflow-hidden">
        {/* Background decorations - optimized with contain property */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-neo-mint/10 dark:bg-purist-blue/10 blur-3xl -z-10 animate-blob contain-paint"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-cantaloupe/10 dark:bg-cassis/10 blur-3xl -z-10 animate-blob animation-delay-2000 contain-paint"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-mellow-yellow/5 dark:bg-mellow-yellow/5 blur-3xl -z-10 animate-blob animation-delay-4000 contain-paint"></div>

        <div className="container grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
          <motion.div
            className="md:col-span-2 space-y-6"
            variants={container}
            initial="hidden"
            animate="show"
            layout
            layoutRoot
          >
            <motion.div variants={item} layout>
              <Card className="neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                      <Sparkles className="relative h-5 w-5 text-neo-mint dark:text-purist-blue" />
                    </div>
                    <h2 className="text-xl font-bold">Your Current Challenge</h2>
                  </div>                  <Suspense fallback={<LoadingFallback />}>
                    {challengeLoading ? (
                      <LoadingFallback />
                    ) : currentChallenge ? (                      <AssignedTask
                        key={currentChallenge.id}
                        title={currentChallenge.title}
                        description={currentChallenge.description}
                        videoUrl={currentChallenge.videoUrl}
                        dueDate={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        userId="demo-user-id"
                        username="Demo User"
                        userImage="/placeholder.svg?height=40&width=40"
                      />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No current challenge available</p>
                      </div>
                    )}
                  </Suspense>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item} layout>
              <Card className="neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                        <MessageSquare className="relative h-5 w-5 text-neo-mint dark:text-purist-blue" />
                      </div>
                      <h2 className="text-xl font-bold">Community Feed</h2>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm -z-10"></div>
                      <div className="flex items-center bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-full pl-3 pr-1 py-1">
                        <Search className="h-4 w-4 text-muted-foreground mr-2" />
                        <Input
                          type="search"
                          placeholder="Search posts..."
                          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-8 w-[120px] md:w-[200px]"
                        />
                      </div>
                    </div>
                  </div>

                  <Suspense fallback={<div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>}>
                    <FeedFilter onFilterChange={handleFilterChange} />
                  </Suspense>

                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm p-1 rounded-full">
                      <TabsTrigger
                        value="all"
                        className="rounded-full data-[state=active]:bg-neo-mint data-[state=active]:text-white dark:data-[state=active]:bg-purist-blue"
                      >
                        All
                      </TabsTrigger>
                      <TabsTrigger
                        value="videos"
                        className="rounded-full data-[state=active]:bg-neo-mint data-[state=active]:text-white dark:data-[state=active]:bg-purist-blue"
                      >
                        Videos
                      </TabsTrigger>
                      <TabsTrigger
                        value="writings"
                        className="rounded-full data-[state=active]:bg-neo-mint data-[state=active]:text-white dark:data-[state=active]:bg-purist-blue"
                      >
                        Writings
                      </TabsTrigger>
                      <TabsTrigger
                        value="discussions"
                        className="rounded-full data-[state=active]:bg-neo-mint data-[state=active]:text-white dark:data-[state=active]:bg-purist-blue"
                      >
                        Discussions
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4 mt-6">
                      {posts.length === 0 && !loading && (
                        <Suspense fallback={<LoadingFallback />}>
                          <FeedEmptyState
                            onRefresh={refreshFeed}
                            filterActive={activeFilters.length > 0}
                            message={activeFilters.length > 0 ? "No posts match your filters" : "No posts found"}
                          />
                        </Suspense>
                      )}

                      {/* Display filtered posts with virtualization for performance */}
                      <div className="space-y-4 content-visibility-auto">
                        {filteredPosts.length > 0 && (
                          <>
                            {filteredPosts.map((post, index) => {
                              const formattedPost = formatNewPost(post)
                              return (
                                <Suspense
                                  key={`post-suspense-${post.id || index}`}
                                  fallback={<Skeleton className="h-[300px] w-full rounded-xl" />}
                                >
                                  <div className="contain-layout">                                    <FeedPost
                                      key={`new-post-${post.id || index}`}
                                      username={formattedPost.username}
                                      userImage={formattedPost.userImage}
                                      timeAgo={formattedPost.timeAgo}
                                      content={formattedPost.content}
                                      mediaType={formattedPost.mediaType}
                                      likes={formattedPost.likes}
                                      comments={formattedPost.comments}
                                      isNew={post.isNew || false}
                                      submission={formattedPost.submission}
                                      videoEvaluation={post.videoEvaluation || null}
                                    />
                                  </div>
                                </Suspense>
                              )
                            })}
                          </>
                        )}
                      </div>

                      {/* Loading indicator */}
                      {loading && (
                        <div className="space-y-4">
                          <Skeleton className="h-[300px] w-full rounded-xl" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                          </div>
                        </div>
                      )}

                      {/* Infinite scroll trigger */}
                      <div ref={ref} className="h-10 flex items-center justify-center">
                        {hasMore && !loading && posts.length > 0 && (
                          <Button
                            variant="outline"
                            onClick={loadMorePosts}
                            className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm"
                          >
                            Load more posts
                          </Button>
                        )}
                        {!hasMore && posts.length > 0 && (
                          <p className="text-sm text-muted-foreground">No more posts to load</p>
                        )}
                      </div>
                    </TabsContent>

                    {/* Other tabs content */}
                    <TabsContent value="videos" className="space-y-4 mt-6">
                      <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-xl" />}>
                        <FeedPost
                          username="sarah_chen"
                          userImage="/placeholder.svg?height=40&width=40"
                          timeAgo="2 hours ago"
                          content="Just completed my video analysis on 'The Future of AI'. Check it out and let me know what you think about my pronunciation!"
                          mediaType="video"
                          mediaUrl="https://example.com/videos/sarah-ai-analysis"
                          likes={24}
                          comments={8}
                        />
                      </Suspense>
                    </TabsContent>
                    <TabsContent value="writings" className="space-y-4 mt-6">
                      <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-xl" />}>
                        <FeedPost
                          username="mike_johnson"
                          userImage="/placeholder.svg?height=40&width=40"
                          timeAgo="5 hours ago"
                          content="Here's my written analysis of the 'Climate Change' video. I focused on using proper grammar and vocabulary. Would appreciate feedback on my sentence structure!"
                          mediaType="text"
                          textContent="Climate change represents one of the most significant challenges facing humanity today. The video highlighted three key aspects: rising global temperatures, extreme weather events, and potential solutions. Scientists have observed a consistent warming trend over the past century, with the rate of warming accelerating in recent decades..."
                          likes={15}
                          comments={12}
                        />
                      </Suspense>
                    </TabsContent>
                    <TabsContent value="discussions" className="space-y-4 mt-6">
                      <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-xl" />}>
                        <FeedPost
                          username="lisa_wong"
                          userImage="/placeholder.svg?height=40&width=40"
                          timeAgo="1 day ago"
                          content="I struggled with the pronunciation of 'particularly' and 'specifically' in my video. Any tips from native speakers?"
                          mediaType="none"
                          likes={32}
                          comments={21}
                        />
                      </Suspense>
                    </TabsContent>
                  </Tabs>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div className="space-y-6" variants={container} initial="hidden" animate="show" layout layoutRoot>
            <motion.div variants={item} layout>
              <Card className="neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                        <TrendingUp className="relative h-5 w-5 text-neo-mint dark:text-purist-blue" />
                      </div>
                      <h2 className="text-lg font-bold">Your Progress</h2>
                    </div>
                    <Badge className="bg-gradient-to-r from-neo-mint to-purist-blue text-white border-0 shadow-glow-sm">
                      Level 12
                    </Badge>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Videos Completed</span>
                        <span className="text-sm font-medium">12/20</span>
                      </div>
                      <div className="w-full h-3 bg-white/40 dark:bg-gray-800/40 rounded-full overflow-hidden p-0.5">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-neo-mint to-purist-blue"
                          initial={{ width: 0 }}
                          animate={{ width: "60%" }}
                          transition={{ duration: 0.5, ease: "easeOut" }} // Reduced from 1s to 0.5s
                        ></motion.div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Writings Submitted</span>
                        <span className="text-sm font-medium">8/20</span>
                      </div>
                      <div className="w-full h-3 bg-white/40 dark:bg-gray-800/40 rounded-full overflow-hidden p-0.5">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-neo-mint to-purist-blue"
                          initial={{ width: 0 }}
                          animate={{ width: "40%" }}
                          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }} // Reduced delay from 0.2s to 0.1s
                        ></motion.div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Speaking Practice</span>
                        <span className="text-sm font-medium">10/20</span>
                      </div>
                      <div className="w-full h-3 bg-white/40 dark:bg-gray-800/40 rounded-full overflow-hidden p-0.5">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-neo-mint to-purist-blue"
                          initial={{ width: 0 }}
                          animate={{ width: "50%" }}
                          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }} // Reduced delay from 0.4s to 0.2s
                        ></motion.div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/20 dark:border-gray-700/20">
                    <h3 className="text-sm font-medium mb-4">Daily Streak</h3>
                    <div className="flex justify-between">
                      {[1, 2, 3, 4, 5, 6, 7].map((day, i) => (
                        <div key={day} className="flex flex-col items-center">
                          <motion.div
                            className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                              i < 5
                                ? "bg-gradient-to-br from-neo-mint to-purist-blue text-white shadow-glow-sm"
                                : "bg-white/20 dark:bg-gray-800/20"
                            }`}
                            whileHover={{ scale: 1.05 }} // Reduced scale from 1.1 to 1.05
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            {day}
                          </motion.div>
                          <span className="text-xs">{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item} layout>
              <Card className="neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cantaloupe to-cassis blur-sm opacity-70"></div>
                      <Clock className="relative h-5 w-5 text-cantaloupe dark:text-cassis" />
                    </div>
                    <h2 className="text-lg font-bold">Upcoming Deadlines</h2>
                  </div>
                  <div className="space-y-4">
                    <motion.div
                      className="group flex items-start gap-4 p-4 rounded-xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.01 }} // Reduced scale from 1.02 to 1.01
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cantaloupe to-cassis flex items-center justify-center flex-shrink-0 shadow-glow-sm">
                        <Film className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">Technology Impact Video</p>
                          <Badge className="bg-gradient-to-r from-cantaloupe to-cassis text-white border-0 shadow-glow-sm">
                            Urgent
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Due in 2 days</p>
                        <div className="h-1 w-full bg-white/20 dark:bg-gray-700/20 rounded-full mt-2 overflow-hidden">
                          <div className="h-full w-1/4 bg-gradient-to-r from-cantaloupe to-cassis rounded-full"></div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="group flex items-start gap-4 p-4 rounded-xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neo-mint to-purist-blue flex items-center justify-center flex-shrink-0 shadow-glow-sm">
                        <Pencil className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Written Analysis</p>
                        <p className="text-sm text-muted-foreground mt-1">Due in 4 days</p>
                        <div className="h-1 w-full bg-white/20 dark:bg-gray-700/20 rounded-full mt-2 overflow-hidden">
                          <div className="h-full w-1/2 bg-gradient-to-r from-neo-mint to-purist-blue rounded-full"></div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="group flex items-start gap-4 p-4 rounded-xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mellow-yellow to-cantaloupe flex items-center justify-center flex-shrink-0 shadow-glow-sm">
                        <Film className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Explanation Video</p>
                        <p className="text-sm text-muted-foreground mt-1">Due in 6 days</p>
                        <div className="h-1 w-full bg-white/20 dark:bg-gray-700/20 rounded-full mt-2 overflow-hidden">
                          <div className="h-full w-1/3 bg-gradient-to-r from-mellow-yellow to-cantaloupe rounded-full"></div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item} layout>
              <Card className="neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-mellow-yellow to-cantaloupe blur-sm opacity-70"></div>
                      <Award className="relative h-5 w-5 text-mellow-yellow dark:text-cantaloupe" />
                    </div>
                    <h2 className="text-lg font-bold">Top Contributors</h2>
                  </div>
                  <ScrollArea className="h-[220px] pr-4">
                    <div className="space-y-4">
                      {[
                        { name: "John Wilson", avatar: "JW", level: "Advanced", streak: 120, points: 1245, rank: 1 },
                        { name: "Sarah Chen", avatar: "SC", level: "Advanced", streak: 98, points: 1120, rank: 2 },
                        { name: "Mike Johnson", avatar: "MJ", level: "Intermediate", streak: 85, points: 980, rank: 3 },
                        { name: "Lisa Wong", avatar: "LW", level: "Advanced", streak: 76, points: 920, rank: 4 },
                        { name: "David Kim", avatar: "DK", level: "Intermediate", streak: 65, points: 850, rank: 5 },
                      ].map((user, i) => (
                        <motion.div
                          key={user.name}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors cursor-pointer"
                          whileHover={{ scale: 1.01, x: 3 }} // Reduced scale and x movement
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                              <div className="relative flex">
                                <Avatar className="border-2 border-white dark:border-gray-800">
                                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt={user.name} />
                                  <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
                                    {user.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md">
                                  <span className="text-[10px] font-bold text-neo-mint dark:text-purist-blue">
                                    #{user.rank}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <div className="flex items-center gap-1">
                                <Badge
                                  variant="outline"
                                  className="text-xs px-1 py-0 h-4 bg-white/20 dark:bg-gray-800/20"
                                >
                                  {user.level}
                                </Badge>
                                <span className="text-xs text-muted-foreground">• {user.streak} day streak</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{user.points}</span>
                            <span className="text-xs text-muted-foreground">pts</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>

                  <Button
                    variant="outline"
                    className="w-full mt-4 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-800/30"
                  >
                    View All Leaderboard
                  </Button>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item} layout>
              <Card className="neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purist-blue to-cassis blur-sm opacity-70"></div>
                      <Sparkles className="relative h-5 w-5 text-purist-blue dark:text-cassis" />
                    </div>
                    <h2 className="text-lg font-bold">Practice Tools</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.03 }} // Reduced scale from 1.05 to 1.03
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Button
                        variant="outline"
                        className="h-auto py-6 flex flex-col gap-3 w-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-800/30"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neo-mint to-purist-blue flex items-center justify-center shadow-glow-sm">
                          <Film className="h-5 w-5 text-white" />
                        </div>
                        <span>Pronunciation Checker</span>
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Button
                        variant="outline"
                        className="h-auto py-6 flex flex-col gap-3 w-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-800/30"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cantaloupe to-cassis flex items-center justify-center shadow-glow-sm">
                          <Pencil className="h-5 w-5 text-white" />
                        </div>
                        <span>Grammar Checker</span>
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Button
                        variant="outline"
                        className="h-auto py-6 flex flex-col gap-3 w-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-800/30"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mellow-yellow to-cantaloupe flex items-center justify-center shadow-glow-sm">
                          <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        <span>AI Conversation</span>
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Button
                        variant="outline"
                        className="h-auto py-6 flex flex-col gap-3 w-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-800/30"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purist-blue to-cassis flex items-center justify-center shadow-glow-sm">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <span>Find Partners</span>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </main>      {/* Floating Chat Icon - lazy loaded */}
      <Suspense fallback={null}>
        <AIChatButtonComponent />
      </Suspense>

      <footer className="border-t border-white/10 dark:border-gray-800/10 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                  <BookOpen className="relative h-6 w-6 text-neo-mint dark:text-purist-blue" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue">
                  EnglishMastery
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Master English through our innovative 4-Skill Video Crucible methodology. Practice listening, speaking,
                reading, and writing in an engaging community.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/challenges" className="text-muted-foreground hover:text-foreground transition-colors">
                    Challenges
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="text-muted-foreground hover:text-foreground transition-colors">
                    Resources
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Subscribe</h3>
              <p className="text-sm text-muted-foreground mb-2">Get the latest updates and news</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Your email"
                    className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20"
                  />
                </div>
                <Button className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 dark:border-gray-800/10 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 EnglishMastery. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
