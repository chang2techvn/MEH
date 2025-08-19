"use client"

import { useRouter } from "next/navigation"
import { useFeedData } from "@/hooks/use-feed-data"
import { FeedSection as HomeFeedSection } from "@/components/home/feed-section"

export default function CommunityFeedSection() {
  const router = useRouter()
  const {
    posts,
    filteredPosts,
    activeFilters,
    setActiveFilters,
    loading: feedLoading,
    hasMore,
    loadMorePosts
  } = useFeedData()

  // Create missing functions that were in the original component
  const refreshFeed = () => {
    router.refresh()
  }

  const handleFilterChange = (filters: string[]) => {
    setActiveFilters(filters)
  }

  return (
    <HomeFeedSection
      posts={posts}
      filteredPosts={filteredPosts}
      loading={feedLoading}
      hasMore={hasMore}
      activeFilters={activeFilters}
      newPostAdded={false}
      onLoadMore={loadMorePosts}
      onRefresh={refreshFeed}
      onFilterChange={handleFilterChange}
    />
  )
}
