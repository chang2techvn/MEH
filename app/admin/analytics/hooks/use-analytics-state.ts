"use client"

import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"

export const useAnalyticsState = () => {
  const [dateRange, setDateRange] = useState("last30days")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null)
  const [showInsights, setShowInsights] = useState(false)

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const refreshData = async () => {
    setIsRefreshing(true)
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
    setIsRefreshing(false)

    toast({
      title: "Data refreshed",
      description: "Analytics data has been updated with the latest information.",
    })
  }

  const exportData = () => {
    toast({
      title: "Export started",
      description: "Analytics data is being exported. You'll be notified when it's ready.",
    })
  }

  const toggleVideoDetails = (id: string) => {
    setExpandedVideo(expandedVideo === id ? null : id)
  }

  return {
    dateRange,
    setDateRange,
    isRefreshing,
    isLoading,
    setIsLoading,
    activeTab,
    setActiveTab,
    expandedVideo,
    showInsights,
    setShowInsights,
    refreshData,
    exportData,
    toggleVideoDetails,
  }
}
