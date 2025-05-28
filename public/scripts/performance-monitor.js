// Performance monitoring script
;(() => {
  // Only run if the browser supports the Performance API
  if (!("performance" in window)) return

  // Core Web Vitals metrics
  const vitalsMetrics = ["CLS", "FID", "LCP", "FCP", "TTFB"]

  // Initialize performance observer
  if ("PerformanceObserver" in window) {
    try {
      // Layout Shift Observer
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        let clsValue = 0

        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })

        // Report CLS if it's significant
        if (clsValue > 0.1) {
          console.log("CLS:", clsValue.toFixed(4))
          // Here you would send this to your analytics
        }
      })

      clsObserver.observe({ type: "layout-shift", buffered: true })

      // Largest Contentful Paint Observer
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]

        console.log("LCP:", lastEntry.startTime.toFixed(0), "ms")
        // Here you would send this to your analytics
      })

      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true })

      // First Input Delay Observer
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          console.log("FID:", entry.processingStart - entry.startTime, "ms")
          // Here you would send this to your analytics
        })
      })

      fidObserver.observe({ type: "first-input", buffered: true })

      // Navigation and Resource Timing
      const navigationObserver = new PerformanceObserver((list) => {
        const navEntry = list.getEntries()[0]
        if (navEntry.entryType === "navigation") {
          console.log("TTFB:", navEntry.responseStart - navEntry.requestStart, "ms")
          console.log("DOM Interactive:", navEntry.domInteractive, "ms")
          console.log("DOM Complete:", navEntry.domComplete, "ms")
          console.log("Load Event:", navEntry.loadEventEnd, "ms")
          // Here you would send this to your analytics
        }
      })

      navigationObserver.observe({ type: "navigation", buffered: true })
    } catch (e) {
      console.error("Performance Observer error:", e)
    }
  }

  // Report performance metrics when the page is fully loaded
  window.addEventListener("load", () => {
    setTimeout(() => {
      const navigationTiming = performance.getEntriesByType("navigation")[0]
      const paintTiming = performance.getEntriesByType("paint")

      if (navigationTiming) {
        // Calculate and report key metrics
        const ttfb = navigationTiming.responseStart - navigationTiming.requestStart
        const domLoad = navigationTiming.domContentLoadedEventEnd - navigationTiming.responseEnd
        const fullLoad = navigationTiming.loadEventEnd - navigationTiming.responseEnd

        console.log("Performance metrics:")
        console.log("- TTFB:", ttfb.toFixed(2), "ms")
        console.log("- DOM Load:", domLoad.toFixed(2), "ms")
        console.log("- Full Load:", fullLoad.toFixed(2), "ms")

        // Here you would send these metrics to your analytics
      }

      if (paintTiming.length) {
        paintTiming.forEach((paint) => {
          console.log(`- ${paint.name}:`, paint.startTime.toFixed(2), "ms")
          // Here you would send these metrics to your analytics
        })
      }

      // Report resource timing for critical resources
      const resourceTiming = performance.getEntriesByType("resource")
      const criticalResources = resourceTiming.filter((resource) => {
        const url = resource.name.toLowerCase()
        return url.includes("main") || url.includes("chunk") || url.includes("critical")
      })

      if (criticalResources.length) {
        console.log("Critical resource timing:")
        criticalResources.forEach((resource) => {
          console.log(`- ${resource.name.split("/").pop()}:`, resource.responseEnd.toFixed(2), "ms")
          // Here you would send these metrics to your analytics
        })
      }

      // Clear the performance buffer to avoid memory leaks
      performance.clearResourceTimings()
    }, 0)
  })

  // Detect long tasks that might cause jank
  if ("PerformanceObserver" in window) {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log("Long task detected:", entry.duration.toFixed(2), "ms")
          // Here you would send this to your analytics
        })
      })

      longTaskObserver.observe({ type: "longtask", buffered: true })
    } catch (e) {
      // Long Task API may not be supported
    }
  }

  // Detect memory usage if supported
  if (performance.memory) {
    setInterval(() => {
      const memoryUsage = {
        totalJSHeapSize: performance.memory.totalJSHeapSize / (1024 * 1024),
        usedJSHeapSize: performance.memory.usedJSHeapSize / (1024 * 1024),
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit / (1024 * 1024),
      }

      console.log("Memory usage:", memoryUsage)
      // Here you would send this to your analytics
    }, 30000) // Check every 30 seconds
  }
})()
