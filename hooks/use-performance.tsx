/**
 * Performance optimization hooks and utilities
 */

import { useEffect, useRef, useCallback, useMemo } from 'react'

/**
 * Debounce hook for optimizing frequent function calls
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay]) as T
}

/**
 * Throttle hook for limiting function execution frequency
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRunRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastRunRef.current >= delay) {
      lastRunRef.current = now
      callback(...args)
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        lastRunRef.current = Date.now()
        callback(...args)
      }, delay - (now - lastRunRef.current))
    }
  }, [callback, delay]) as T
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  callback: (isIntersecting: boolean) => void,
  options: IntersectionObserverInit = {}
) {
  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        callback(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )
    
    observer.observe(element)
    
    return () => {
      observer.disconnect()
    }
  }, [elementRef, callback, options])
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor(componentName: string) {
  const renderTimeRef = useRef<number>(0)
  const mountTimeRef = useRef<number>(0)
  
  useEffect(() => {
    mountTimeRef.current = performance.now()
    
    return () => {
      const unmountTime = performance.now()
      const totalTime = unmountTime - mountTimeRef.current
      
      if (totalTime > 16) { // More than one frame
        console.warn(`Component ${componentName} was mounted for ${totalTime.toFixed(2)}ms`)
      }
    }
  }, [componentName])
  
  useEffect(() => {
    const renderTime = performance.now() - renderTimeRef.current
    
    if (renderTime > 16) { // More than one frame
      console.warn(`Component ${componentName} render took ${renderTime.toFixed(2)}ms`)
    }
  })
  
  useEffect(() => {
    renderTimeRef.current = performance.now()
  })
}

/**
 * Memory usage monitoring hook
 */
export function useMemoryMonitor(interval: number = 30000) {
  useEffect(() => {
    if (!('memory' in performance)) return
    
    let checks = 0
    const maxChecks = 10 // Limit checks to avoid infinite monitoring
    
    const intervalId = setInterval(() => {
      if (checks >= maxChecks) {
        clearInterval(intervalId)
        return
      }
      
      const memory = (performance as any).memory
      const usedMB = memory.usedJSHeapSize / (1024 * 1024)
      const totalMB = memory.totalJSHeapSize / (1024 * 1024)
      const limitMB = memory.jsHeapSizeLimit / (1024 * 1024)
      
      // Warn if memory usage is high
      if (usedMB > limitMB * 0.8) {
        console.warn(`High memory usage: ${usedMB.toFixed(2)}MB / ${limitMB.toFixed(2)}MB`)
      }
      
      checks++
    }, interval)
    
    return () => clearInterval(intervalId)
  }, [interval])
}

/**
 * Request idle callback hook for non-critical tasks
 */
export function useIdleCallback(
  callback: () => void,
  deps: React.DependencyList,
  timeout: number = 1000
) {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = (window as any).requestIdleCallback(callback, { timeout })
      return () => (window as any).cancelIdleCallback(id)
    } else {
      // Fallback for browsers without requestIdleCallback
      const id = setTimeout(callback, 1)
      return () => clearTimeout(id)
    }
  }, deps)
}

/**
 * Virtual scrolling hook for large lists
 */
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0)
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    )
    
    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    }
  }, [items, itemHeight, containerHeight, scrollTop])
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])
  
  return {
    visibleItems,
    handleScroll
  }
}

/**
 * Bundle size monitoring (development only)
 */
export function useBundleMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
      // Monitor the size of loaded JavaScript bundles
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Type assertion for PerformanceResourceTiming which has transferSize
        const resourceEntry = entry as PerformanceResourceTiming
        if (entry.name.includes('.js') && resourceEntry.transferSize) {
          const sizeKB = resourceEntry.transferSize / 1024
          if (sizeKB > 500) { // Warn for bundles > 500KB
            console.warn(`Large bundle detected: ${entry.name} (${sizeKB.toFixed(2)}KB)`)
          }
        }
      })
    })
    
    observer.observe({ entryTypes: ['resource'] })
    
    return () => observer.disconnect()
  }, [])
}

/**
 * Component re-render monitoring
 */
export function useRenderMonitor(componentName: string, props?: any) {
  const renderCount = useRef(0)
  const prevProps = useRef(props)
  
  useEffect(() => {
    renderCount.current++
    
    if (renderCount.current > 10) {
      console.warn(`Component ${componentName} has re-rendered ${renderCount.current} times`)
      
      if (props && prevProps.current) {
        const changedProps = Object.keys(props).filter(
          key => props[key] !== prevProps.current[key]
        )
        
        if (changedProps.length > 0) {
          console.log(`Changed props: ${changedProps.join(', ')}`)
        }
      }
    }
    
    prevProps.current = props
  })
}

import { useState } from 'react'
