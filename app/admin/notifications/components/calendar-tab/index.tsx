"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { format, addMonths } from "date-fns"
import { ChevronLeft, ChevronRight, Mail, MessageSquare } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ScheduledMessage } from "../types"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface CalendarTabProps {
  scheduledMessages: ScheduledMessage[]
}

export const CalendarTab: React.FC<CalendarTabProps> = ({ scheduledMessages }) => {
  const [calendarView, setCalendarView] = useState<Date>(new Date())

  return (
    <motion.div
      key="calendar"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6 mt-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCalendarView(addMonths(calendarView, -1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold">{format(calendarView, "MMMM yyyy")}</h2>
            <Button variant="outline" size="icon" onClick={() => setCalendarView(addMonths(calendarView, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCalendarView(new Date())}>
              Today
            </Button>
            <Select defaultValue="month">
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="border-none shadow-neo">
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-medium py-2">
                  {day}
                </div>
              ))}

              {/* Calendar grid - this is a simplified version */}
              {Array.from({ length: 35 }).map((_, index) => {
                // This is a simplified calendar view - in a real app you'd calculate actual dates
                const day = index + 1
                const hasEvents = scheduledMessages.some((msg) => {
                  const msgDate = new Date(msg.date)
                  return msgDate.getDate() === day && msgDate.getMonth() === calendarView.getMonth()
                })

                const events = scheduledMessages.filter((msg) => {
                  const msgDate = new Date(msg.date)
                  return msgDate.getDate() === day && msgDate.getMonth() === calendarView.getMonth()
                })

                return (
                  <div
                    key={index}
                    className={cn(
                      "min-h-[100px] p-1 border rounded-md",
                      day > 31 && "opacity-50 bg-muted/50",
                      hasEvents && "border-primary/50",
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <span className={cn("text-sm font-medium", day > 31 && "text-muted-foreground")}>
                        {day <= 31 ? day : day - 31}
                      </span>
                      {hasEvents && <Badge className="text-[10px] px-1">{events.length}</Badge>}
                    </div>

                    <div className="mt-1 space-y-1">
                      {events.map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "text-[10px] p-1 rounded truncate",
                            event.type === "email"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                              : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
                          )}
                        >
                          {format(event.date, "HH:mm")} - {event.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-neo">
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Scheduled Messages</CardTitle>
            <CardDescription>View all your upcoming scheduled messages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledMessages
                .filter((msg) => new Date(msg.date) > new Date())
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .slice(0, 5)
                .map((message) => (
                  <div key={message.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-full",
                          message.type === "email"
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                            : "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
                        )}
                      >
                        {message.type === "email" ? (
                          <Mail className="h-4 w-4" />
                        ) : (
                          <MessageSquare className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{message.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {format(message.date, "PPP")} at {format(message.date, "p")}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {message.recipients} recipient{message.recipients !== 1 && "s"}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
