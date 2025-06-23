"use client"

import { useRef, useCallback, useEffect } from "react"

// Track component mount state
export function useMountedRef() {
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  return mountedRef
}

// Safe async operation hook that prevents state updates after unmount
export function useSafeAsyncOperation() {
  const mountedRef = useMountedRef()
  const safeAsyncCall = useCallback(
    <T,>(asyncFn: () => Promise<T>): Promise<T | null> => {
      return new Promise((resolve, reject) => {
        asyncFn()
          .then((result) => {
            if (mountedRef.current) {
              resolve(result)
            } else {
              resolve(null) // Component unmounted, return null instead of result
            }
          })
          .catch((error) => {
            if (mountedRef.current) {
              reject(error)
            } else {
              console.warn('Async operation completed after component unmount:', error)
              resolve(null)
            }
          })
      })
    },
    [mountedRef]
  )
  const safeSetState = useCallback(
    <T,>(setter: (value: T) => void, value: T) => {
      if (mountedRef.current) {
        setter(value)
      }
    },
    [mountedRef]
  )

  const safeCallback = useCallback(
    (callback: () => void) => {
      if (mountedRef.current) {
        callback()
      }
    },
    [mountedRef]
  )

  return {
    safeAsyncCall,
    safeSetState,
    safeCallback,
    isMounted: () => mountedRef.current,
  }
}

// Enhanced timeout hook that auto-cleans on unmount
export function useSafeTimeout() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useMountedRef()

  const setSafeTimeout = useCallback(
    (callback: () => void, delay: number) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          callback()
        }
      }, delay)

      return timeoutRef.current
    },
    [mountedRef]
  )

  const clearSafeTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // Auto cleanup on unmount
  useEffect(() => {
    return () => {
      clearSafeTimeout()
    }
  }, [clearSafeTimeout])

  return {
    setSafeTimeout,
    clearSafeTimeout,
  }
}

// Enhanced interval hook that auto-cleans on unmount
export function useSafeInterval() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useMountedRef()

  const setSafeInterval = useCallback(
    (callback: () => void, delay: number) => {
      // Clear existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      intervalRef.current = setInterval(() => {
        if (mountedRef.current) {
          callback()
        } else {
          // Auto-clear if component unmounted
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
        }
      }, delay)

      return intervalRef.current
    },
    [mountedRef]
  )

  const clearSafeInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Auto cleanup on unmount
  useEffect(() => {
    return () => {
      clearSafeInterval()
    }
  }, [clearSafeInterval])

  return {
    setSafeInterval,
    clearSafeInterval,
  }
}

// Hook to track memory usage (development only)
export function useMemoryMonitor(componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    const logMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        console.log(`[${componentName}] Memory:`, {
          used: `${Math.round(memory.usedJSHeapSize / 1048576)}MB`,
          total: `${Math.round(memory.totalJSHeapSize / 1048576)}MB`,
          limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)}MB`,
        })
      }
    }

    console.log(`[${componentName}] Component mounted`)
    logMemory()

    return () => {
      console.log(`[${componentName}] Component unmounted`)
      logMemory()
    }
  }, [componentName])
}

// Debounced function with safe cleanup
export function useSafeDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const { setSafeTimeout, clearSafeTimeout } = useSafeTimeout()

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      clearSafeTimeout()
      setSafeTimeout(() => callback(...args), delay)
    },
    [callback, delay, setSafeTimeout, clearSafeTimeout]
  ) as T

  return debouncedCallback
}
