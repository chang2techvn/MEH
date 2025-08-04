"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Mail, MessageSquare } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import type { ScheduledMessage } from "../types"
import { cn } from "@/lib/utils"

interface UpcomingScheduledProps {
  scheduledMessages: ScheduledMessage[]
}

export const UpcomingScheduled: React.FC<UpcomingScheduledProps> = ({ scheduledMessages }) => {
  return (
    <Card className="border-none shadow-neo">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Upcoming Scheduled</CardTitle>
        <CardDescription>Next messages to be sent</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scheduledMessages
            .filter((msg) => new Date(msg.date) > new Date())
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, 3)
            .map((message, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors"
              >
                <div
                  className={cn(
                    "p-2 rounded-full",
                    message.type === "email"
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      : "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
                  )}
                >
                  {message.type === "email" ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{message.title}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {format(message.date, "MMM d")} at {format(message.date, "p")}
                    </p>
                    {message.recurring !== "none" && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">
                        {message.recurring}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
