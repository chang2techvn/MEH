"use client"

import { useEffect, useState } from "react"
import { collectPerformanceMetrics, checkPerformanceThresholds } from "@/lib/performance-metrics"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { X } from "lucide-react"

interface PerformanceMetricsDisplay {
  lcp?: number
  fid?: number
  cls?: number
  ttfb?: number
  inp?: number
  loadTime?: number
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetricsDisplay>({})
  const [showMonitor, setShowMonitor] = useState(false)
  const [scores, setScores] = useState<Record<string, { value: number; score: "good" | "needs-improvement" | "poor" }>>(
    {},
  )

  useEffect(() => {
    // Only run in development or when explicitly enabled
    if (process.env.NODE_ENV !== "development" && !localStorage.getItem("enablePerformanceMonitor")) {
      return
    }

    const collectMetrics = async () => {
      // Wait for page to be fully loaded
      if (document.readyState !== "complete") {
        window.addEventListener("load", () => setTimeout(collectMetrics, 1000))
        return
      }

      // Collect metrics after a short delay to ensure all are captured
      setTimeout(async () => {
        const performanceMetrics = await collectPerformanceMetrics()
        const { scores } = checkPerformanceThresholds(performanceMetrics)

        setMetrics({
          lcp: performanceMetrics.lcp,
          fid: performanceMetrics.fid,
          cls: performanceMetrics.cls,
          ttfb: performanceMetrics.ttfb,
          inp: performanceMetrics.inp,
          loadTime: performanceMetrics.loadTime,
        })

        setScores(scores)
        setShowMonitor(true)

        // Log performance metrics to console in development
        if (process.env.NODE_ENV === "development") {
          console.group("Performance Metrics")
          console.log("Largest Contentful Paint (LCP):", performanceMetrics.lcp?.toFixed(2), "ms")
          console.log("First Input Delay (FID):", performanceMetrics.fid?.toFixed(2), "ms")
          console.log("Cumulative Layout Shift (CLS):", performanceMetrics.cls?.toFixed(4))
          console.log("Time to First Byte (TTFB):", performanceMetrics.ttfb?.toFixed(2), "ms")
          console.log("Interaction to Next Paint (INP):", performanceMetrics.inp?.toFixed(2), "ms")
          console.log("Page Load Time:", performanceMetrics.loadTime?.toFixed(2), "ms")
          console.groupEnd()
        }
      }, 2000)
    }

    collectMetrics()
  }, [])

  if (!showMonitor) return null

  const getScoreColor = (score: "good" | "needs-improvement" | "poor") => {
    switch (score) {
      case "good":
        return "bg-green-500 text-white"
      case "needs-improvement":
        return "bg-yellow-500 text-white"
      case "poor":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getProgressValue = (metric: string, value: number) => {
    switch (metric) {
      case "lcp":
        return Math.min(100, (value / 4000) * 100)
      case "fid":
        return Math.min(100, (value / 300) * 100)
      case "cls":
        return Math.min(100, (value / 0.25) * 100)
      case "ttfb":
        return Math.min(100, (value / 1800) * 100)
      case "inp":
        return Math.min(100, (value / 500) * 100)
      default:
        return 0
    }
  }

  const getProgressColor = (score: "good" | "needs-improvement" | "poor") => {
    switch (score) {
      case "good":
        return "bg-green-500"
      case "needs-improvement":
        return "bg-yellow-500"
      case "poor":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Card className="p-4 shadow-lg w-80">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-sm">Performance Monitor</h3>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowMonitor(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {Object.entries(scores).map(([metric, { value, score }]) => (
            <div key={metric} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium uppercase">{metric.toUpperCase()}</span>
                <Badge className={getScoreColor(score)}>
                  {metric === "cls" ? value.toFixed(3) : `${value.toFixed(0)}ms`}
                </Badge>
              </div>
              <Progress
                value={getProgressValue(metric, value)}
                className="h-2"
                indicatorClassName={getProgressColor(score)}
              />
            </div>
          ))}

          {metrics.loadTime && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium uppercase">Load Time</span>
                <span className="text-xs">{metrics.loadTime.toFixed(0)}ms</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
