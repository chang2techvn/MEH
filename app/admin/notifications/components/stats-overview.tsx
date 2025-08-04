"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Bell, Mail, MessageSquare, Check, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { NotificationStats } from "../types"

interface StatsOverviewProps {
  progressValues: {
    openRate: number
    clickRate: number
    deliveryRate: number
  }
  notificationStats: NotificationStats
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ progressValues, notificationStats }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border-none shadow-neo neo-card hover:shadow-glow-sm transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neo-mint/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Bell className="h-4 w-4 mr-2 text-purist-blue" />
              Total Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{notificationStats.totalSent.toLocaleString()}</div>
              <div className="flex items-center text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full text-xs">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span className="font-medium">+8%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Across all channels</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border-none shadow-neo neo-card hover:shadow-glow-sm transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purist-blue/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Mail className="h-4 w-4 mr-2 text-neo-mint" />
              Open Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{progressValues.openRate}%</div>
              <div className="flex items-center text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full text-xs">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span className="font-medium">+3%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Average email open rate</p>
            <div className="mt-3">
              <Progress value={progressValues.openRate} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border-none shadow-neo neo-card hover:shadow-glow-sm transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cantaloupe/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MessageSquare className="h-4 w-4 mr-2 text-cassis" />
              Click Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{progressValues.clickRate}%</div>
              <div className="flex items-center text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full text-xs">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span className="font-medium">+2%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Average click-through rate</p>
            <div className="mt-3">
              <Progress value={progressValues.clickRate} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border-none shadow-neo neo-card hover:shadow-glow-sm transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-mellow-yellow/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Check className="h-4 w-4 mr-2 text-purist-blue" />
              Delivery Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{progressValues.deliveryRate}%</div>
              <div className="flex items-center text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full text-xs">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span className="font-medium">+1%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Successful delivery rate</p>
            <div className="mt-3">
              <Progress value={progressValues.deliveryRate} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
