"use client"

import { useState, useEffect } from "react"
import type { ApiKey, AIModel, UsageData } from "../types"

interface UseAISettingsProps {
  initialApiKeys: ApiKey[]
  initialAiModels: AIModel[]
}

interface UseAISettingsReturn {
  apiKeys: ApiKey[]
  aiModels: AIModel[]
  usageData: UsageData[]
  setApiKeys: (apiKeys: ApiKey[]) => void
  setAiModels: (aiModels: AIModel[]) => void
  generateUsageData: () => UsageData[]
}

export const useAISettings = ({ initialApiKeys, initialAiModels }: UseAISettingsProps): UseAISettingsReturn => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys)
  const [aiModels, setAiModels] = useState<AIModel[]>(initialAiModels)
  const [usageData, setUsageData] = useState<UsageData[]>([])
  const [timeRange, setTimeRange] = useState("7d")

  useEffect(() => {
    setUsageData(generateUsageData())
  }, [timeRange])

  const generateUsageData = (): UsageData[] => {
    const data: UsageData[] = []
    const now = new Date()
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90

    for (let i = 0; i < days; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      // Generate random but somewhat realistic data
      const baseRequests = Math.floor(Math.random() * 100) + 50
      const dayOfWeek = date.getDay()
      // Less usage on weekends
      const multiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.6 : 1
      const requests = Math.floor(baseRequests * multiplier)
      const tokensPerRequest = Math.floor(Math.random() * 1000) + 500
      const tokens = requests * tokensPerRequest
      const cost = tokens * 0.00002

      data.push({
        date: dateStr,
        requests,
        tokens,
        cost,
      })
    }

    // Sort by date ascending
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  return {
    apiKeys,
    aiModels,
    usageData,
    setApiKeys,
    setAiModels,
    generateUsageData,
  }
}
