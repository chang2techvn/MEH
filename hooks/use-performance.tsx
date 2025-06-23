"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSafeTimeout } from "./use-safe-async"

// Debounced value hook with safe cleanup
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const { setSafeTimeout, clearSafeTimeout } = useSafeTimeout()

  useEffect(() => {
    clearSafeTimeout()
    setSafeTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearSafeTimeout()
    }
  }, [value, delay, setSafeTimeout, clearSafeTimeout])

  return debouncedValue
}

// Throttled function hook
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const lastCall = useRef<number>(0)
  const { setSafeTimeout } = useSafeTimeout()

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastCall.current >= delay) {
        lastCall.current = now
        return func(...args)
      } else {
        setSafeTimeout(() => {
          lastCall.current = Date.now()
          func(...args)
        }, delay - (now - lastCall.current))
      }
    }) as T,
    [func, delay, setSafeTimeout]
  )
}

// Performance monitoring hook
export function usePerformanceMonitor(name: string) {
  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return
    }

    const startTime = performance.now()
    console.log(`[Performance] ${name} component mounted`)

    return () => {
      const endTime = performance.now()
      console.log(`[Performance] ${name} component unmounted after ${endTime - startTime}ms`)
    }
  }, [name])
}

// Frame rate monitoring
export function useFrameRate() {
  const [fps, setFps] = useState<number>(0)
  const frameCount = useRef<number>(0)
  const lastTime = useRef<number>(performance.now())

  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return
    }

    let animationId: number

    const calculateFPS = () => {
      frameCount.current++
      const currentTime = performance.now()
      const delta = currentTime - lastTime.current

      if (delta >= 1000) {
        const currentFPS = Math.round((frameCount.current * 1000) / delta)
        setFps(currentFPS)
        frameCount.current = 0
        lastTime.current = currentTime
      }

      animationId = requestAnimationFrame(calculateFPS)
    }

    animationId = requestAnimationFrame(calculateFPS)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return fps
}

// Memory usage monitoring
export function useMemoryUsage() {
  const [memoryInfo, setMemoryInfo] = useState<{
    used: number
    total: number
    limit: number
  } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || 
        process.env.NODE_ENV !== 'development' ||
        !('memory' in performance)) {
      return
    }

    const updateMemoryInfo = () => {
      const memory = (performance as any).memory
      setMemoryInfo({
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
      })
    }

    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, 5000) // Update every 5s

    return () => clearInterval(interval)
  }, [])

  return memoryInfo
}

// Bundle size tracking
export function useBundleSize() {
  const [bundleSize, setBundleSize] = useState<number>(0)

  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return
    }

    // Estimate bundle size from transferred resources
    const resources = performance.getEntriesByType('resource')
    const jsResources = resources.filter(resource => 
      resource.name.includes('.js') || resource.name.includes('chunk')
    )
    
    const totalSize = jsResources.reduce((sum, resource) => {
      return sum + ((resource as any).transferSize || 0)
    }, 0)

    setBundleSize(Math.round(totalSize / 1024)) // KB
  }, [])

  return bundleSize
}

// Render performance tracking
export function useRenderPerformance(componentName: string) {
  const renderCount = useRef<number>(0)
  const renderTimes = useRef<number[]>([])

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    renderCount.current++
    const renderTime = performance.now()
    renderTimes.current.push(renderTime)

    // Keep only last 10 renders
    if (renderTimes.current.length > 10) {
      renderTimes.current = renderTimes.current.slice(-10)
    }

    console.log(`[Render] ${componentName} rendered ${renderCount.current} times`)
  })

  return {
    renderCount: renderCount.current,
    averageRenderTime: renderTimes.current.length > 1 
      ? renderTimes.current.slice(1).reduce((sum, time, index) => 
          sum + (time - renderTimes.current[index]), 0) / (renderTimes.current.length - 1)
      : 0,
  }
}

// Component size monitoring
export function useComponentSize() {
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setSize({ width, height })
      }
    })

    resizeObserver.observe(ref.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return { ref, size }
}

// Network performance monitoring
export function useNetworkPerformance() {
  const [networkInfo, setNetworkInfo] = useState<{
    effectiveType: string
    downlink: number
    rtt: number
  } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('connection' in navigator)) {
      return
    }

    const connection = (navigator as any).connection
    
    const updateNetworkInfo = () => {
      setNetworkInfo({
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
      })
    }

    updateNetworkInfo()
    connection.addEventListener('change', updateNetworkInfo)

    return () => {
      connection.removeEventListener('change', updateNetworkInfo)
    }
  }, [])

  return networkInfo
}
