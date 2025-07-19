"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"

interface VirtualScrollProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  className?: string
  onScroll?: (scrollTop: number) => void
  scrollToIndex?: number
}

export default function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = "",
  onScroll,
  scrollToIndex,
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )
    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1)
  }, [items, visibleRange])

  // Total height of all items
  const totalHeight = items.length * itemHeight

  // Handle scroll events
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    // Add null check to prevent errors during unmounting or edge cases
    if (!e.currentTarget) {
      return
    }
    
    const newScrollTop = e.currentTarget.scrollTop
    setScrollTop(newScrollTop)
    onScroll?.(newScrollTop)
  }, [onScroll])

  // Scroll to specific index
  useEffect(() => {
    if (scrollToIndex !== undefined && scrollElementRef.current) {
      const targetScrollTop = scrollToIndex * itemHeight
      scrollElementRef.current.scrollTop = targetScrollTop
      setScrollTop(targetScrollTop)
    }
  }, [scrollToIndex, itemHeight])

  // Throttle scroll events for better performance
  const throttledHandleScroll = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout | null = null
      return (e: React.UIEvent<HTMLDivElement>) => {
        // Add safety check to prevent errors during unmounting
        if (!e.currentTarget) {
          return
        }
        
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => handleScroll(e), 16) // ~60fps
      }
    })(),
    [handleScroll]
  )

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={throttledHandleScroll}
      data-testid="virtual-scroll-container"
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            transform: `translateY(${visibleRange.startIndex * itemHeight}px)`,
          }}
        >
          {visibleItems.map((item, index) =>
            renderItem(item, visibleRange.startIndex + index)
          )}
        </div>
      </div>
    </div>
  )
}

// Hook for managing virtual scroll state
export function useVirtualScroll<T>(items: T[], itemHeight: number) {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(400)

  const handleScroll = useCallback((newScrollTop: number) => {
    setScrollTop(newScrollTop)
  }, [])

  const scrollToItem = useCallback((index: number) => {
    return index * itemHeight
  }, [itemHeight])

  return {
    scrollTop,
    containerHeight,
    setContainerHeight,
    handleScroll,
    scrollToItem,
  }
}
