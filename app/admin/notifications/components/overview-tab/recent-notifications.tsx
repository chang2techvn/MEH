"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Mail, MessageSquare, ChevronRight, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { RecentActivity } from "../types"

interface RecentNotificationsProps {
  recentActivity: RecentActivity[]
}

export const RecentNotifications: React.FC<RecentNotificationsProps> = ({ recentActivity }) => {
  return (
    <Card className="md:col-span-3 border-none shadow-neo">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Notifications</CardTitle>
          <Button variant="ghost" size="sm" className="h-8 gap-1">
            View all
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>Latest messages sent to users</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((activity, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors"
            >
              <div
                className={cn(
                  "p-2 rounded-full",
                  activity.type === "email"
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
                )}
              >
                {activity.type === "email" ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{activity.title}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">
                    {activity.recipients} recipients
                  </Badge>
                  <p className="text-xs text-muted-foreground">{activity.timestamp.toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-xs font-medium whitespace-nowrap flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                {activity.status === 'sent' ? 'Delivered' : activity.status}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
