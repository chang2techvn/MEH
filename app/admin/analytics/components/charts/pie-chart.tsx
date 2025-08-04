"use client"

import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatNumber } from "../../utils/format-utils"
import type { ChartData } from "../../types"

export const PieChartComponent = ({ data, isLoading = false }: ChartData) => {
  if (isLoading) {
    return <Skeleton className="w-full h-[200px]" />
  }

  const total = data.reduce((sum, item) => sum + item.count, 0)
  let cumulativePercentage = 0

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
      <div className="relative w-40 h-40">
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          {data.map((item, i) => {
            const startAngle = cumulativePercentage * 3.6 // 3.6 degrees per percentage point
            cumulativePercentage += (item.count / total) * 100
            const endAngle = cumulativePercentage * 3.6

            // Calculate the SVG arc path
            const startX = 50 + 40 * Math.cos((startAngle - 90) * (Math.PI / 180))
            const startY = 50 + 40 * Math.sin((startAngle - 90) * (Math.PI / 180))
            const endX = 50 + 40 * Math.cos((endAngle - 90) * (Math.PI / 180))
            const endY = 50 + 40 * Math.sin((endAngle - 90) * (Math.PI / 180))
            const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

            const pathData = `M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`

            return (
              <motion.path
                key={i}
                d={pathData}
                fill={item.color.replace("bg-", "var(--")}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
              />
            )
          })}
          <circle cx="50" cy="50" r="25" fill="white" />
        </svg>
      </div>

      <div className="flex flex-col gap-3">
        {data.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className={cn("w-3 h-3 rounded-full", item.color)} />
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="text-sm font-medium">{item.level}</span>
                <span className="text-sm">{formatNumber(item.count)}</span>
              </div>
              <div className="text-xs text-muted-foreground">{item.percentage}% of users</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
