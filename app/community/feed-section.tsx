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
    // Refresh logic would go here
    console.log("Refreshing community feed...")
    // Instead of page reload, trigger a re-fetch of feed data
    // This would require adding a refresh function to useFeedData hook
    // For now, use router.refresh() which is more efficient than window.location.reload()
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
