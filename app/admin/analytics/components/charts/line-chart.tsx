"use client"

import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import type { ChartData } from "../../types"

export const LineChartComponent = ({ data, isLoading = false }: ChartData) => {
  const chartHeight = 200
  const chartWidth = 600
  const maxValue = Math.max(...data.map((item) => Math.max(item.views, item.engagement, item.completion))) * 1.1

  if (isLoading) {
    return <Skeleton className="w-full h-[200px]" />
  }

  return (
    <div className="relative h-[200px] w-full">
      <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((line, i) => (
          <line
            key={i}
            x1="0"
            y1={chartHeight - (chartHeight * line) / 4}
            x2={chartWidth}
            y2={chartHeight - (chartHeight * line) / 4}
            stroke="#e5e7eb"
            strokeDasharray="5,5"
          />
        ))}

        {/* Previous period line */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
          d={`M ${data.map((item, i) => `${(i * chartWidth) / (data.length - 1)},${chartHeight - (item.previousUsers / maxValue) * chartHeight}`).join(" L ")}`}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeDasharray="5,5"
        />

        {/* Current period line */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          d={`M ${data.map((item, i) => `${(i * chartWidth) / (data.length - 1)},${chartHeight - (item.users / maxValue) * chartHeight}`).join(" L ")}`}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
        />

        {/* Data points */}
        {data.map((item, i) => (
          <motion.circle
            key={i}
            initial={{ r: 0, opacity: 0 }}
            animate={{ r: 5, opacity: 1 }}
            transition={{ duration: 0.5, delay: 2 + i * 0.1 }}
            cx={(i * chartWidth) / (data.length - 1)}
            cy={chartHeight - (item.users / maxValue) * chartHeight}
            fill="white"
            stroke="#3b82f6"
            strokeWidth="2"
            className="cursor-pointer hover:r-6"
          />
        ))}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        {data
          .filter((_, i) => i % 2 === 0 || i === data.length - 1)
          .map((item, i) => (
            <div key={i}>{item.month || item.hour}</div>
          ))}
      </div>
    </div>
  )
}
