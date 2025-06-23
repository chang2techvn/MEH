"use client"

import { useEffect, useState } from "react"

// Core Web Vitals metrics interface
interface WebVitalsMetric {
  name: string
  value: number
  delta: number
  id: string
  rating: 'good' | 'needs-improvement' | 'poor'
}

// Web Vitals thresholds
const THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
}

// Get rating based on value and thresholds
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS]
  if (!threshold) return 'good'
  
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// Track Core Web Vitals
export function useWebVitals() {
  const [metrics, setMetrics] = useState<WebVitalsMetric[]>([])
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return
    }

    // Check if web-vitals API is supported
    setIsSupported('web-vitals' in window || 'PerformanceObserver' in window)

    const handleMetric = (metric: any) => {
      const webVitalsMetric: WebVitalsMetric = {
        name: metric.name,
        value: metric.value,
        delta: metric.delta,
        id: metric.id,
        rating: getRating(metric.name, metric.value),
      }

      setMetrics(prev => {
        const existingIndex = prev.findIndex(m => m.name === metric.name)
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = webVitalsMetric
          return updated
        }
        return [...prev, webVitalsMetric]
      })

      // Log to console in development
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: `${metric.value}ms`,
        rating: webVitalsMetric.rating,
        id: metric.id,
      })
    }

    // Try to import web-vitals dynamically
    const loadWebVitals = async () => {
      try {
        const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals')
        
        getCLS(handleMetric)
        getFID(handleMetric)
        getFCP(handleMetric)
        getLCP(handleMetric)
        getTTFB(handleMetric)
      } catch (error) {
        console.warn('web-vitals library not available:', error)
        
        // Fallback: Use Performance Observer directly
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              if (entry.entryType === 'navigation') {
                const navEntry = entry as PerformanceNavigationTiming
                handleMetric({
                  name: 'TTFB',
                  value: navEntry.responseStart - navEntry.requestStart,
                  delta: navEntry.responseStart - navEntry.requestStart,
                  id: 'fallback-ttfb',
                })
              }
            })
          })
          
          observer.observe({ entryTypes: ['navigation'] })
          
          return () => observer.disconnect()
        }
      }
    }

    loadWebVitals()
  }, [])

  return {
    metrics,
    isSupported,
    getMetricByName: (name: string) => metrics.find(m => m.name === name),
    getAllRatings: () => {
      return metrics.reduce((acc, metric) => {
        acc[metric.name] = metric.rating
        return acc
      }, {} as Record<string, string>)
    },
  }
}

// Performance budget monitoring
export function usePerformanceBudget() {
  const [budgetStatus, setBudgetStatus] = useState<{
    bundleSize: { current: number; budget: number; status: 'ok' | 'warning' | 'error' }
    loadTime: { current: number; budget: number; status: 'ok' | 'warning' | 'error' }
    memoryUsage: { current: number; budget: number; status: 'ok' | 'warning' | 'error' }
  }>({
    bundleSize: { current: 0, budget: 300, status: 'ok' }, // 300KB budget
    loadTime: { current: 0, budget: 2000, status: 'ok' }, // 2s budget
    memoryUsage: { current: 0, budget: 50, status: 'ok' }, // 50MB budget
  })

  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return
    }

    const checkBudgets = () => {
      // Check bundle size
      const resources = performance.getEntriesByType('resource')
      const jsResources = resources.filter(r => r.name.includes('.js'))
      const totalSize = jsResources.reduce((sum, r) => sum + ((r as any).transferSize || 0), 0) / 1024

      // Check load time
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const loadTime = navigation ? navigation.loadEventEnd - navigation.navigationStart : 0

      // Check memory usage
      let memoryUsage = 0
      if ('memory' in performance) {
        const memory = (performance as any).memory
        memoryUsage = memory.usedJSHeapSize / 1048576 // MB
      }

      setBudgetStatus({
        bundleSize: {
          current: totalSize,
          budget: 300,
          status: totalSize > 400 ? 'error' : totalSize > 300 ? 'warning' : 'ok',
        },
        loadTime: {
          current: loadTime,
          budget: 2000,
          status: loadTime > 3000 ? 'error' : loadTime > 2000 ? 'warning' : 'ok',
        },
        memoryUsage: {
          current: memoryUsage,
          budget: 50,
          status: memoryUsage > 80 ? 'error' : memoryUsage > 50 ? 'warning' : 'ok',
        },
      })
    }

    // Check immediately
    setTimeout(checkBudgets, 1000)
    
    // Check every 10 seconds
    const interval = setInterval(checkBudgets, 10000)

    return () => clearInterval(interval)
  }, [])

  return budgetStatus
}

// Real User Monitoring (RUM)
export function useRealUserMonitoring() {
  const [rumData, setRumData] = useState<{
    pageViews: number
    sessionDuration: number
    bounceRate: number
    errors: number
  }>({
    pageViews: 0,
    sessionDuration: 0,
    bounceRate: 0,
    errors: 0,
  })

  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return
    }

    const sessionStart = Date.now()
    let pageViews = 1
    let errors = 0

    // Track page views (SPA navigation)
    const handlePopState = () => {
      pageViews++
      setRumData(prev => ({ ...prev, pageViews }))
    }

    // Track errors
    const handleError = (event: ErrorEvent) => {
      errors++
      setRumData(prev => ({ ...prev, errors }))
      console.error('[RUM] JavaScript Error:', event.error)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      errors++
      setRumData(prev => ({ ...prev, errors }))
      console.error('[RUM] Unhandled Promise Rejection:', event.reason)
    }

    // Track session duration
    const updateSessionDuration = () => {
      const duration = Date.now() - sessionStart
      setRumData(prev => ({ ...prev, sessionDuration: duration }))
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    // Update session duration every 5 seconds
    const durationInterval = setInterval(updateSessionDuration, 5000)

    // Final update on page unload
    const handleBeforeUnload = () => {
      updateSessionDuration()
      // Calculate bounce rate (simple: < 30 seconds = bounce)
      const duration = Date.now() - sessionStart
      const bounceRate = duration < 30000 && pageViews === 1 ? 100 : 0
      
      console.log('[RUM] Session Summary:', {
        duration: `${Math.round(duration / 1000)}s`,
        pageViews,
        errors,
        bounceRate: `${bounceRate}%`,
      })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      clearInterval(durationInterval)
    }
  }, [])

  return rumData
}
