"use client"

import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { getTrendColor } from "../../utils/format-utils"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { ChartData } from "../../types"

export const BarChartComponent = ({ data, isLoading = false }: ChartData) => {
  if (isLoading) {
    return <Skeleton className="w-full h-[200px]" />
  }

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
  }

  return (
    <div className="space-y-6 w-full">
      {data.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="space-y-2"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{item.challenge || item.skill}</span>
              {item.trend && (
                <span className={cn("flex items-center text-xs", getTrendColor(item.trend))}>
                  {getTrendIcon(item.trend)}
                  <span className="ml-1">{item.improvement - item.previousImprovement}%</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{item.completed || item.improvement}%</span>
              {item.target && <span className="text-xs text-muted-foreground">Target: {item.target}%</span>}
            </div>
          </div>
          <div className="relative w-full bg-muted rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.completed || item.improvement}%` }}
              transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
              className={cn("h-full rounded-full", item.color || "bg-primary")}
            />
            {item.target && (
              <div
                className="absolute top-0 h-full border-l-2 border-dashed border-yellow-500"
                style={{ left: `${item.target}%` }}
              />
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
