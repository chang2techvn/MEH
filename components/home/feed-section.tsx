"use client"

import { Suspense, lazy, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageSquare, Search } from "lucide-react"
import { formatNewPost } from "@/utils/post-helpers"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"

const FeedPost = lazy(() => import("@/components/feed/feed-post"))
const FeedFilter = lazy(() => import("@/components/feed/feed-filter"))
const FeedEmptyState = lazy(() => import("@/components/feed/feed-empty-state"))

interface FeedSectionProps {
  posts: any[]
  filteredPosts: any[]
  loading: boolean
  hasMore: boolean
  activeFilters: string[]
  newPostAdded: boolean
  onFilterChange: (filters: string[]) => void
  onLoadMore: () => Promise<void>
  onRefresh: () => void
}

const LoadingFallback = () => (
  <div className="space-y-4">
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-40 w-full" />
  </div>
)

export function FeedSection({
  posts,
  filteredPosts,
  loading,
  hasMore,
  activeFilters,
  newPostAdded,
  onFilterChange,
  onLoadMore,
  onRefresh,
}: FeedSectionProps) {
  const { ref, inView, debouncedLoadMore } = useInfiniteScroll({
    loadMore: onLoadMore,
    hasMore,
    loading,
  })

  // Load more posts when in view
  useEffect(() => {
    if (inView) {
      debouncedLoadMore()
    }
  }, [inView, debouncedLoadMore])

  return (
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
          <FeedFilter onFilterChange={onFilterChange} />
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
                  onRefresh={onRefresh}
                  filterActive={activeFilters.length > 0}
                  message={activeFilters.length > 0 ? "No posts match your filters" : "No posts found"}
                />
              </Suspense>
            )}

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
                        <div className="contain-layout">
                          <FeedPost
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
                            title={formattedPost.title}
                          />
                        </div>
                      </Suspense>
                    )
                  })}
                </>
              )}
            </div>

            {loading && (
              <div className="space-y-4">
                <Skeleton className="h-[300px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            )}

            <div ref={ref} className="h-10 flex items-center justify-center">
              {hasMore && !loading && posts.length > 0 && (
                <Button
                  variant="outline"
                  onClick={onLoadMore}
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

          <TabsContent value="videos" className="space-y-4 mt-6">
            <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-xl" />}>
              <FeedPost
                username="sarah_chen"
                userImage="/placeholder.svg?height=40&width=40"
                timeAgo="2 hours ago"
                content="Just completed my video analysis on 'The Future of AI'. Check it out!"
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
                content="Here's my written analysis of the 'Climate Change' video."
                mediaType="text"
                textContent="Climate change represents one of the most significant challenges..."
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
                content="I struggled with pronunciation. Any tips from native speakers?"
                mediaType="none"
                likes={32}
                comments={21}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  )
}
