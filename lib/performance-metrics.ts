/**
 * Utility functions for collecting and reporting performance metrics
 */

// Interface for performance metrics
interface PerformanceMetrics {
  ttfb?: number
  fcp?: number
  lcp?: number
  cls?: number
  fid?: number
  inp?: number
  tbt?: number
  loadTime?: number
  domContentLoaded?: number
  resourcesLoaded?: number
  jsHeapSize?: number
}

// Function to collect Core Web Vitals and other performance metrics
export function collectPerformanceMetrics(): Promise<PerformanceMetrics> {
  return new Promise((resolve) => {
    // Only run in browser environment
    if (typeof window === "undefined") {
      resolve({})
      return
    }

    // Create an object to store metrics
    const metrics: PerformanceMetrics = {}

    // Function to finalize and return metrics
    const finalizeMetrics = () => {
      // Get navigation timing data
      const navigationTiming = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
      if (navigationTiming) {
        metrics.ttfb = navigationTiming.responseStart - navigationTiming.requestStart
        metrics.loadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart
        metrics.domContentLoaded = navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart
      }

      // Get resource timing data
      const resourceEntries = performance.getEntriesByType("resource")
      metrics.resourcesLoaded = resourceEntries.length

      // Get memory info if available
      if ((performance as any).memory) {
        metrics.jsHeapSize = (performance as any).memory.usedJSHeapSize / (1024 * 1024) // Convert to MB
      }

      resolve(metrics)
    }

    // Use Performance Observer to collect metrics if available
    if ("PerformanceObserver" in window) {
      // First Contentful Paint
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          if (entries.length > 0) {
            metrics.fcp = entries[0].startTime
            fcpObserver.disconnect()
          }
        })
        fcpObserver.observe({ type: "paint", buffered: true })
      } catch (e) {
        console.error("FCP observer error:", e)
      }

      // Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          if (entries.length > 0) {
            // Use the most recent LCP event
            const lastEntry = entries[entries.length - 1]
            metrics.lcp = lastEntry.startTime
          }
        })
        lcpObserver.observe({ type: "largest-contentful-paint", buffered: true })
      } catch (e) {
        console.error("LCP observer error:", e)
      }

      // Cumulative Layout Shift
      try {
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          metrics.cls = clsValue
        })
        clsObserver.observe({ type: "layout-shift", buffered: true })
      } catch (e) {
        console.error("CLS observer error:", e)
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          if (entries.length > 0) {
            const firstInput = entries[0]
            metrics.fid = (firstInput as any).processingStart - firstInput.startTime
            fidObserver.disconnect()
          }
        })
        fidObserver.observe({ type: "first-input", buffered: true })
      } catch (e) {
        console.error("FID observer error:", e)
      }

      // Interaction to Next Paint (INP)
      try {
        const inpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          if (entries.length > 0) {
            // Calculate the 75th percentile of interaction durations
            const durations = entries.map((entry) => (entry as any).duration).sort((a, b) => a - b)
            const idx = Math.floor(durations.length * 0.75)
            metrics.inp = durations[idx]
          }
        })
        inpObserver.observe({ type: "event", buffered: true } as PerformanceObserverInit)
      } catch (e) {
        console.error("INP observer error:", e)
      }

      // Total Blocking Time
      try {
        let totalBlockingTime = 0
        const tbtObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const blockingTime = (entry as any).duration - 50
            if (blockingTime > 0) {
              totalBlockingTime += blockingTime
            }
          }
          metrics.tbt = totalBlockingTime
        })
        tbtObserver.observe({ type: "longtask", buffered: true })
      } catch (e) {
        console.error("TBT observer error:", e)
      }
    }

    // Wait for the load event to finalize metrics
    if (document.readyState === "complete") {
      finalizeMetrics()
    } else {
      window.addEventListener("load", () => {
        // Give a small delay to ensure all observers have reported
        setTimeout(finalizeMetrics, 1000)
      })
    }
  })
}

// Function to report metrics to an analytics endpoint
export async function reportPerformanceMetrics(endpoint: string, metrics: PerformanceMetrics): Promise<void> {
  try {
    // Add user agent and URL information
    const reportData = {
      ...metrics,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    }

    // Use sendBeacon if available for more reliable reporting
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(reportData)], { type: "application/json" })
      navigator.sendBeacon(endpoint, blob)
    } else {
      // Fall back to fetch
      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
        // Use keepalive to ensure the request completes even if the page unloads
        keepalive: true,
      })
    }
  } catch (error) {
    console.error("Error reporting performance metrics:", error)
  }
}

// Function to log metrics to console (for development)
export function logPerformanceMetrics(): void {
  collectPerformanceMetrics().then((metrics) => {
    console.group("Performance Metrics")
    console.log("Time to First Byte (TTFB):", metrics.ttfb?.toFixed(2), "ms")
    console.log("First Contentful Paint (FCP):", metrics.fcp?.toFixed(2), "ms")
    console.log("Largest Contentful Paint (LCP):", metrics.lcp?.toFixed(2), "ms")
    console.log("Cumulative Layout Shift (CLS):", metrics.cls?.toFixed(4))
    console.log("First Input Delay (FID):", metrics.fid?.toFixed(2), "ms")
    console.log("Interaction to Next Paint (INP):", metrics.inp?.toFixed(2), "ms")
    console.log("Total Blocking Time (TBT):", metrics.tbt?.toFixed(2), "ms")
    console.log("Page Load Time:", metrics.loadTime?.toFixed(2), "ms")
    console.log("DOM Content Loaded:", metrics.domContentLoaded?.toFixed(2), "ms")
    console.log("Resources Loaded:", metrics.resourcesLoaded)
    if (metrics.jsHeapSize) {
      console.log("JS Heap Size:", metrics.jsHeapSize.toFixed(2), "MB")
    }
    console.groupEnd()
  })
}

// Function to check if performance meets thresholds
export function checkPerformanceThresholds(metrics: PerformanceMetrics): {
  passes: boolean
  scores: Record<string, { value: number; score: "good" | "needs-improvement" | "poor" }>
} {
  const thresholds = {
    lcp: { good: 2500, poor: 4000 }, // ms
    fid: { good: 100, poor: 300 }, // ms
    cls: { good: 0.1, poor: 0.25 },
    ttfb: { good: 800, poor: 1800 }, // ms
    inp: { good: 200, poor: 500 }, // ms
  }

  const scores: Record<string, { value: number; score: "good" | "needs-improvement" | "poor" }> = {}
  let allGood = true

  // Score each metric
  if (metrics.lcp !== undefined) {
    const score =
      metrics.lcp <= thresholds.lcp.good ? "good" : metrics.lcp <= thresholds.lcp.poor ? "needs-improvement" : "poor"
    scores.lcp = { value: metrics.lcp, score }
    if (score !== "good") allGood = false
  }

  if (metrics.fid !== undefined) {
    const score =
      metrics.fid <= thresholds.fid.good ? "good" : metrics.fid <= thresholds.fid.poor ? "needs-improvement" : "poor"
    scores.fid = { value: metrics.fid, score }
    if (score !== "good") allGood = false
  }

  if (metrics.cls !== undefined) {
    const score =
      metrics.cls <= thresholds.cls.good ? "good" : metrics.cls <= thresholds.cls.poor ? "needs-improvement" : "poor"
    scores.cls = { value: metrics.cls, score }
    if (score !== "good") allGood = false
  }

  if (metrics.ttfb !== undefined) {
    const score =
      metrics.ttfb <= thresholds.ttfb.good
        ? "good"
        : metrics.ttfb <= thresholds.ttfb.poor
          ? "needs-improvement"
          : "poor"
    scores.ttfb = { value: metrics.ttfb, score }
    if (score !== "good") allGood = false
  }

  if (metrics.inp !== undefined) {
    const score =
      metrics.inp <= thresholds.inp.good ? "good" : metrics.inp <= thresholds.inp.poor ? "needs-improvement" : "poor"
    scores.inp = { value: metrics.inp, score }
    if (score !== "good") allGood = false
  }

  return { passes: allGood, scores }
}
