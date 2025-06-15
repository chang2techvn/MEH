"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"

interface InfiniteScrollProps {
  children: React.ReactNode
  loadMore: () => Promise<void>
  hasMore: boolean
  isLoading: boolean
  threshold?: number
  rootMargin?: string
  className?: string
  loader?: React.ReactNode
  endMessage?: React.ReactNode
  errorMessage?: React.ReactNode
  onError?: (error: Error) => void
}

export default function InfiniteScroll({
  children,
  loadMore,
  hasMore,
  isLoading,
  threshold = 0.1,
  rootMargin = "100px",
  className = "",
  loader,
  endMessage,
  errorMessage,
  onError,
}: InfiniteScrollProps) {
  const [error, setError] = useState<Error | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef<boolean>(false)

  // Load more items with error handling
  const handleLoadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return

    loadingRef.current = true
    setError(null)

    try {
      await loadMore()
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load more items")
      setError(error)
      onError?.(error)
    } finally {
      loadingRef.current = false
    }
  }, [loadMore, hasMore, onError])

  // Set up intersection observer
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return

    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !isLoading && !loadingRef.current) {
          handleLoadMore()
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observerRef.current.observe(sentinelRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, isLoading, threshold, rootMargin, handleLoadMore])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return (
    <div className={className} data-testid="infinite-scroll-container">
      {children}
      
      {/* Sentinel element for intersection observer */}
      {hasMore && (
        <div ref={sentinelRef} className="h-1" data-testid="infinite-scroll-sentinel" />
      )}

      {/* Loading state */}
      {isLoading && hasMore && (
        <div className="flex justify-center py-4" data-testid="infinite-scroll-loader">
          {loader || (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">Loading more...</span>
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex justify-center py-4" data-testid="infinite-scroll-error">
          {errorMessage || (
            <div className="text-center">
              <p className="text-sm text-destructive mb-2">Failed to load more items</p>
              <button
                onClick={handleLoadMore}
                className="text-sm text-primary hover:underline"
                disabled={isLoading}
              >
                Try again
              </button>
            </div>
          )}
        </div>
      )}

      {/* End message */}
      {!hasMore && !isLoading && (
        <div className="flex justify-center py-4" data-testid="infinite-scroll-end">
          {endMessage || (
            <p className="text-sm text-muted-foreground">No more items to load</p>
          )}
        </div>
      )}
    </div>
  )
}

// Hook for managing infinite scroll state
export function useInfiniteScroll<T>(
  initialItems: T[] = [],
  fetchMoreItems: (offset: number, limit: number) => Promise<T[]>,
  itemsPerPage: number = 20
) {
  const [items, setItems] = useState<T[]>(initialItems)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadMore = useCallback(async () => {
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const newItems = await fetchMoreItems(items.length, itemsPerPage)
      
      if (newItems.length === 0) {
        setHasMore(false)
      } else {
        setItems(prev => [...prev, ...newItems])
        if (newItems.length < itemsPerPage) {
          setHasMore(false)
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch items")
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [items.length, itemsPerPage, fetchMoreItems, isLoading])

  const reset = useCallback(() => {
    setItems(initialItems)
    setHasMore(true)
    setError(null)
    setIsLoading(false)
  }, [initialItems])

  return {
    items,
    isLoading,
    hasMore,
    error,
    loadMore,
    reset,
  }
}
