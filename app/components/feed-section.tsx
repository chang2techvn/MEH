"use client"

import { Suspense, lazy, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { formatNewPost } from "@/app/utils/post-helpers"
import { useInfiniteScroll } from "../hooks/use-infinite-scroll"

const FeedPost = lazy(() => import("@/components/feed-post"))
const FeedFilter = lazy(() => import("@/components/feed-filter"))
const FeedEmptyState = lazy(() => import("@/components/feed-empty-state"))

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
    <div className="space-y-6">
      <Suspense fallback={<Skeleton className="h-16 w-full" />}>
        <FeedFilter onFilterChange={onFilterChange} />
      </Suspense>

      <AnimatePresence mode="wait">
        {filteredPosts.length === 0 && !loading ? (
          <Suspense fallback={<LoadingFallback />}>
            <FeedEmptyState
              onRefresh={onRefresh}
              filterActive={activeFilters.length > 0}
              message={
                activeFilters.length > 0
                  ? "No posts match your current filters"
                  : "No posts yet. Be the first to share something!"
              }
            />
          </Suspense>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {filteredPosts.map((post, index) => {
              const formattedPost = formatNewPost(post)
              const isNewPost = newPostAdded && index === 0
              
              return (
                <Suspense key={post.id || index} fallback={<LoadingFallback />}>
                  <FeedPost
                    {...formattedPost}
                    isNew={isNewPost}
                  />
                </Suspense>
              )
            })}

            {/* Infinite scroll trigger */}
            {hasMore && (
              <div ref={ref} className="py-4">
                {loading && <LoadingFallback />}
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground"
              >
                <p>You've reached the end! 🎉</p>
                <p className="text-sm">Check back later for new posts.</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
