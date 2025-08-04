"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import type { UsageData } from "../types"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

interface UsageAnalyticsTabProps {
  usageData: UsageData[]
  generateUsageData: () => UsageData[]
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  timeRange: string
  setTimeRange: (timeRange: string) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
}

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
}

export const UsageAnalyticsTab: React.FC<UsageAnalyticsTabProps> = ({
  usageData,
  generateUsageData,
  isLoading,
  setIsLoading,
  timeRange,
  setTimeRange,
}) => {
  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Calculate total usage
  const calculateTotalUsage = () => {
    const totalRequests = usageData.reduce((sum, day) => sum + day.requests, 0)
    const totalTokens = usageData.reduce((sum, day) => sum + day.tokens, 0)
    const totalCost = usageData.reduce((sum, day) => sum + day.cost, 0)

    return {
      requests: totalRequests,
      tokens: totalTokens,
      cost: totalCost,
    }
  }

  return (
    <>
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Usage Analytics</h2>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setTimeRange(timeRange)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Usage Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <motion.div key={`skeleton-${i}`} variants={itemVariants} className="rounded-lg border p-4 space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-full" />
            </motion.div>
          ))
        ) : (
          // Usage stats cards
          <>
            <motion.div
              variants={itemVariants}
              className="rounded-lg border p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
            >
              <h3 className="text-sm font-medium text-muted-foreground">Total Requests</h3>
              <p className="text-2xl font-bold mt-1">{formatNumber(calculateTotalUsage().requests)}</p>
              <div className="mt-2">
                <Progress value={75} className="h-1.5" />
              </div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="rounded-lg border p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
            >
              <h3 className="text-sm font-medium text-muted-foreground">Total Tokens</h3>
              <p className="text-2xl font-bold mt-1">{formatNumber(calculateTotalUsage().tokens)}</p>
              <div className="mt-2">
                <Progress value={60} className="h-1.5" />
              </div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="rounded-lg border p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
            >
              <h3 className="text-sm font-medium text-muted-foreground">Total Cost</h3>
              <p className="text-2xl font-bold mt-1">{formatCurrency(calculateTotalUsage().cost)}</p>
              <div className="mt-2">
                <Progress value={40} className="h-1.5" />
              </div>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Usage Chart */}
      <motion.div
        variants={fadeInVariants}
        className="rounded-lg border p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
      >
        <h3 className="text-lg font-medium mb-4">Usage Over Time</h3>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <div className="h-[300px] w-full relative">
            {/* Chart visualization */}
            <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
              {usageData.map((day, i) => (
                <motion.div
                  key={i}
                  className="relative group"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: `${(day.requests / 100) * 80}%` }}
                  transition={{ delay: i * 0.03, duration: 0.5, type: "spring" }}
                >
                  <div className="w-2 sm:w-3 bg-gradient-to-t from-purist-blue to-neo-mint rounded-t-md group-hover:w-3 sm:group-hover:w-4 transition-all duration-200"></div>
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-foreground text-background text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {day.date.split("-")[2]}/{day.date.split("-")[1]}: {day.requests} requests
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-border"></div>
          </div>
        )}
      </motion.div>

      {/* Usage by Provider */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          variants={fadeInVariants}
          className="rounded-lg border p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
        >
          <h3 className="text-lg font-medium mb-4">Usage by Provider</h3>
          {isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <div className="h-[200px] w-full relative">
              {/* Pie chart visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <motion.div
                    className="absolute inset-0 rounded-full border-8 border-t-neo-mint border-r-purist-blue border-b-cassis border-l-mellow-yellow"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 100, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  ></motion.div>
                  <div className="absolute inset-2 bg-background rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold">100%</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex justify-around">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-neo-mint"></div>
                  <span className="text-xs">OpenAI (45%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purist-blue"></div>
                  <span className="text-xs">Gemini (30%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cassis"></div>
                  <span className="text-xs">Others (25%)</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          variants={fadeInVariants}
          className="rounded-lg border p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
        >
          <h3 className="text-lg font-medium mb-4">Usage by Model</h3>
          {isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>GPT-4o</span>
                  <span>42%</span>
                </div>
                <Progress value={42} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Gemini Pro</span>
                  <span>28%</span>
                </div>
                <Progress value={28} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>GPT-3.5 Turbo</span>
                  <span>18%</span>
                </div>
                <Progress value={18} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Claude 3</span>
                  <span>8%</span>
                </div>
                <Progress value={8} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Others</span>
                  <span>4%</span>
                </div>
                <Progress value={4} className="h-2" />
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Cost Breakdown */}
      <motion.div
        variants={fadeInVariants}
        className="rounded-lg border p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
      >
        <h3 className="text-lg font-medium mb-4">Cost Breakdown</h3>
        {isLoading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 text-sm font-medium">Provider</th>
                  <th className="text-left py-2 px-4 text-sm font-medium">Model</th>
                  <th className="text-right py-2 px-4 text-sm font-medium">Requests</th>
                  <th className="text-right py-2 px-4 text-sm font-medium">Tokens</th>
                  <th className="text-right py-2 px-4 text-sm font-medium">Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4 text-sm">OpenAI</td>
                  <td className="py-2 px-4 text-sm">GPT-4o</td>
                  <td className="py-2 px-4 text-sm text-right">1,245</td>
                  <td className="py-2 px-4 text-sm text-right">2.4M</td>
                  <td className="py-2 px-4 text-sm text-right font-medium">$24.00</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 text-sm">OpenAI</td>
                  <td className="py-2 px-4 text-sm">GPT-3.5 Turbo</td>
                  <td className="py-2 px-4 text-sm text-right">3,567</td>
                  <td className="py-2 px-4 text-sm text-right">5.2M</td>
                  <td className="py-2 px-4 text-sm text-right font-medium">$7.80</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 text-sm">Google</td>
                  <td className="py-2 px-4 text-sm">Gemini Pro</td>
                  <td className="py-2 px-4 text-sm text-right">2,890</td>
                  <td className="py-2 px-4 text-sm text-right">4.1M</td>
                  <td className="py-2 px-4 text-sm text-right font-medium">$10.25</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 text-sm">Anthropic</td>
                  <td className="py-2 px-4 text-sm">Claude 3</td>
                  <td className="py-2 px-4 text-sm text-right">845</td>
                  <td className="py-2 px-4 text-sm text-right">1.8M</td>
                  <td className="py-2 px-4 text-sm text-right font-medium">$27.00</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 text-sm">Mistral</td>
                  <td className="py-2 px-4 text-sm">Mistral Large</td>
                  <td className="py-2 px-4 text-sm text-right">432</td>
                  <td className="py-2 px-4 text-sm text-right">0.9M</td>
                  <td className="py-2 px-4 text-sm text-right font-medium">$7.20</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-sm font-medium" colSpan={2}>
                    Total
                  </td>
                  <td className="py-2 px-4 text-sm text-right font-medium">8,979</td>
                  <td className="py-2 px-4 text-sm text-right font-medium">14.4M</td>
                  <td className="py-2 px-4 text-sm text-right font-bold">$76.25</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </>
  )
}
