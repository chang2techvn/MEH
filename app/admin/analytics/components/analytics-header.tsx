"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar, RefreshCw, Download, Zap, ChevronDown, ChevronUp } from "lucide-react"
import { formatDateRange } from "../utils/format-utils"

interface AnalyticsHeaderProps {
  dateRange: string
  setDateRange: (range: string) => void
  isRefreshing: boolean
  showInsights: boolean
  setShowInsights: (show: boolean) => void
  onRefresh: () => void
  onExport: () => void
}

export const AnalyticsHeader = ({
  dateRange,
  setDateRange,
  isRefreshing,
  showInsights,
  setShowInsights,
  onRefresh,
  onExport,
}: AnalyticsHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
    >
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track your platform performance and user engagement for {formatDateRange(dateRange)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Select defaultValue={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="last7days">Last 7 days</SelectItem>
            <SelectItem value="last30days">Last 30 days</SelectItem>
            <SelectItem value="thisMonth">This month</SelectItem>
            <SelectItem value="lastMonth">Last month</SelectItem>
            <SelectItem value="thisYear">This year</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
                {isRefreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh data</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={() => setShowInsights(!showInsights)}>
                <Zap className="h-4 w-4 mr-2" />
                Insights
                {showInsights ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Show AI-powered insights</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          onClick={onExport}
          className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </motion.div>
  )
}
