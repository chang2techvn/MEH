"use client"

import { useCallback, useRef } from "react"
import { useInView } from "react-intersection-observer"
import { debounce } from "lodash"

interface UseInfiniteScrollProps {
  loadMore: () => Promise<void>
  hasMore: boolean
  loading: boolean
}

export function useInfiniteScroll({ loadMore, hasMore, loading }: UseInfiniteScrollProps) {
  const loader = useRef(null)

  // Optimized load more with debounce
  const debouncedLoadMore = useCallback(
    debounce(() => {
      if (hasMore && !loading) {
        loadMore()
      }
    }, 200), // Reduced debounce time to 200ms
    [hasMore, loading, loadMore],
  )

  // Use Intersection Observer to load more posts when scrolling to the end
  const { ref, inView } = useInView({
    threshold: 0.1, // Reduced threshold to 0.1 to load earlier
    rootMargin: "200px", // Increased rootMargin to load before user scrolls to the end
  })

  return {
    loader,
    debouncedLoadMore,
    ref,
    inView,
  }
}
