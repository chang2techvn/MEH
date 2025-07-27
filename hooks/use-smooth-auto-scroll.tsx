"use client"

import { useEffect, useRef, useCallback, useState } from 'react'

interface SmoothAutoScrollOptions {
  behavior?: ScrollBehavior
  block?: ScrollLogicalPosition
  inline?: ScrollLogicalPosition
  delay?: number
  staggerDelay?: number
  enabled?: boolean
}

interface ScrollQueueItem {
  id: string
  element: HTMLElement
  options: ScrollIntoViewOptions
  timestamp: number
}

export function useSmoothAutoScroll(options: SmoothAutoScrollOptions = {}) {
  const {
    behavior = 'smooth',
    block = 'end',
    inline = 'nearest',
    delay = 100,
    staggerDelay = 300,
    enabled = true
  } = options

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollQueueRef = useRef<ScrollQueueItem[]>([])
  const isScrollingRef = useRef(false)
  const lastScrollTimeRef = useRef(0)
  const [isAutoScrolling, setIsAutoScrolling] = useState(false)

  // Process scroll queue with staggering
  const processScrollQueue = useCallback(async () => {
    if (!enabled || isScrollingRef.current || scrollQueueRef.current.length === 0) {
      return
    }

    setIsAutoScrolling(true)
    isScrollingRef.current = true

    try {
      // Sort by timestamp to maintain order
      const queue = scrollQueueRef.current.sort((a, b) => a.timestamp - b.timestamp)
      
      for (let i = 0; i < queue.length; i++) {
        const item = queue[i]
        
        // Skip if element is no longer in DOM
        if (!document.body.contains(item.element)) {
          continue
        }

        // Check if element is already visible
        const rect = item.element.getBoundingClientRect()
        const containerRect = scrollContainerRef.current?.getBoundingClientRect()
        
        if (containerRect) {
          const isVisible = rect.bottom <= containerRect.bottom && 
                           rect.top >= containerRect.top
          
          // Only scroll if not visible or if it's the last message
          if (!isVisible || i === queue.length - 1) {
            // Add a small delay between scrolls for smooth effect
            if (i > 0) {
              await new Promise(resolve => setTimeout(resolve, staggerDelay))
            }
            
            item.element.scrollIntoView(item.options)
            lastScrollTimeRef.current = Date.now()
          }
        }
      }
      
      // Clear the queue
      scrollQueueRef.current = []
      
    } catch (error) {
      console.error('Error processing scroll queue:', error)
    } finally {
      // Add delay before allowing new scrolls
      setTimeout(() => {
        isScrollingRef.current = false
        setIsAutoScrolling(false)
      }, delay)
    }
  }, [enabled, delay, staggerDelay])

  // Add element to scroll queue
  const queueScroll = useCallback((element: HTMLElement, messageId?: string) => {
    if (!enabled || !element) return

    const scrollOptions: ScrollIntoViewOptions = {
      behavior,
      block,
      inline
    }

    const queueItem: ScrollQueueItem = {
      id: messageId || `scroll-${Date.now()}-${Math.random()}`,
      element,
      options: scrollOptions,
      timestamp: Date.now()
    }

    // Add to queue if not already present
    const existingIndex = scrollQueueRef.current.findIndex(item => item.id === queueItem.id)
    if (existingIndex === -1) {
      scrollQueueRef.current.push(queueItem)
    } else {
      // Update existing item with newer timestamp
      scrollQueueRef.current[existingIndex] = queueItem
    }

    // Process queue after a short delay to allow for batching
    setTimeout(processScrollQueue, delay)
  }, [enabled, behavior, block, inline, delay, processScrollQueue])

  // Scroll to bottom of container smoothly
  const scrollToBottom = useCallback(() => {
    if (!enabled || !scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const scrollElement = container.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement || container

    if (scrollElement) {
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior
      })
      lastScrollTimeRef.current = Date.now()
    }
  }, [enabled, behavior])

  // Auto scroll when new messages arrive
  const autoScrollToMessage = useCallback((messageElement: HTMLElement, messageId?: string) => {
    if (!enabled) return

    // Check if user has scrolled up manually (don't auto-scroll if they have)
    const timeSinceLastScroll = Date.now() - lastScrollTimeRef.current
    const hasUserScrolled = timeSinceLastScroll > 2000 // 2 seconds threshold

    if (scrollContainerRef.current && !hasUserScrolled) {
      const container = scrollContainerRef.current
      const scrollElement = container.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement || container
      
      if (scrollElement) {
        const containerRect = scrollElement.getBoundingClientRect()
        const scrollTop = scrollElement.scrollTop
        const scrollHeight = scrollElement.scrollHeight
        const clientHeight = scrollElement.clientHeight
        
        // Only auto-scroll if user is near the bottom (within 100px)
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
        
        if (isNearBottom) {
          queueScroll(messageElement, messageId)
        }
      }
    } else if (!hasUserScrolled) {
      // Fallback for non-container elements
      queueScroll(messageElement, messageId)
    }
  }, [enabled, queueScroll])

  // Track user scroll activity
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || !enabled) return

    const scrollElement = container.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement || container

    const handleScroll = () => {
      // Only update if this is a user-initiated scroll (not programmatic)
      if (!isScrollingRef.current) {
        lastScrollTimeRef.current = Date.now()
      }
    }

    scrollElement?.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      scrollElement?.removeEventListener('scroll', handleScroll)
    }
  }, [enabled])

  return {
    scrollContainerRef,
    autoScrollToMessage,
    scrollToBottom,
    queueScroll,
    isAutoScrolling,
    processScrollQueue
  }
}

export default useSmoothAutoScroll
