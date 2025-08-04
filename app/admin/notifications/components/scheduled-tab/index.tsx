"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, Plus, Repeat, CalendarIcon, AlertCircle, Bell } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Edit, Trash } from "lucide-react"
import { format } from "date-fns"
import { initialScheduledMessages } from "../../constants"
import type { ScheduledMessage } from "../../types"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { getFutureDates } from "../../utils/date-utils"
import { Mail, MessageSquare } from "lucide-react"
import { Label } from "@/components/ui/label"

type ScheduledTabProps = {}

export const ScheduledTab: React.FC<ScheduledTabProps> = () => {
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>(initialScheduledMessages)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [showScheduleDetails, setShowScheduleDetails] = useState<number | null>(null)

  // Handle delete scheduled message
  const handleDeleteScheduledMessage = (id: number) => {
    setScheduledMessages(scheduledMessages.filter((message) => message.id !== id))
    setShowDeleteConfirm(null)
  }

  return (
    <motion.div
      key="scheduled"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6 mt-0">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Scheduled Messages</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-3.5 w-3.5 mr-1" />
              Filter
            </Button>
            <Button size="sm" onClick={() => {}}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              New Schedule
            </Button>
          </div>
        </div>

        {scheduledMessages.length > 0 ? (
          <div className="grid gap-4">
            {scheduledMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden"
              >
                <Card className="border-l-4 border-l-primary border-none shadow-neo">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between p-4">
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
                            <Mail className="h-5 w-5" />
                          ) : (
                            <MessageSquare className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{message.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(message.date, "PPP")} at {format(message.date, "p")}
                            {message.recurring !== "none" && (
                              <span className="ml-2 text-xs">• Recurring {message.recurring}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {message.recipients} recipient{message.recipients !== 1 && "s"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            message.status === "scheduled"
                              ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                              : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
                          )}
                        >
                          {message.status === "scheduled" ? "Scheduled" : "Sent"}
                        </Badge>

                        <div className="flex items-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setShowScheduleDetails(message.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit Schedule</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500"
                                  onClick={() => setShowDeleteConfirm(message.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete Schedule</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>

                    {/* Upcoming occurrences for recurring messages */}
                    {message.recurring !== "none" && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="p-3 bg-muted/50 rounded-md">
                          <h4 className="text-xs font-medium mb-2 flex items-center">
                            <Repeat className="h-3.5 w-3.5 mr-1" />
                            Upcoming Occurrences
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {getFutureDates(message.date, message.recurring).map((futureDate, index) => (
                              <div key={index} className="text-xs text-muted-foreground flex items-center">
                                <CalendarIcon className="h-3 w-3 mr-1 text-muted-foreground/70" />
                                {format(futureDate, "PPP")} at {format(message.date, "p")}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Delete confirmation */}
                <AnimatePresence>
                  {showDeleteConfirm === message.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center"
                    >
                      <div className="p-4 text-center">
                        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <h3 className="font-medium mb-1">Delete this scheduled message?</h3>
                        <p className="text-sm text-muted-foreground mb-4">This action cannot be undone.</p>
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(null)}>
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteScheduledMessage(message.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Schedule details */}
                <AnimatePresence>
                  {showScheduleDetails === message.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center"
                    >
                      <div className="p-4 w-full max-w-md">
                        <h3 className="font-medium mb-3 flex items-center">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Schedule
                        </h3>
                        <div className="space-y-3 mb-4">
                          <div className="grid gap-1.5">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input id="edit-title" defaultValue={message.title} />
                          </div>
                          <div className="grid gap-1.5">
                            <Label htmlFor="edit-date">Next Send Date</Label>
                            <div className="flex items-center gap-2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="w-full justify-start">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {format(message.date, "PPP")}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar mode="single" selected={message.date} initialFocus />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                          <div className="grid gap-1.5">
                            <Label htmlFor="edit-time">Time</Label>
                            <Select defaultValue={format(message.date, "HH:mm")}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {["08:00", "09:00", "10:00", "12:00", "14:00", "16:00", "18:00"].map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-1.5">
                            <Label htmlFor="edit-recurring">Recurring</Label>
                            <Select defaultValue={message.recurring}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No Repeat</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setShowScheduleDetails(null)}>
                            Cancel
                          </Button>
                          <Button size="sm" onClick={() => setShowScheduleDetails(null)}>
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border rounded-md">
            <Bell className="h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">No scheduled messages</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Create a new message to schedule it for delivery</p>
            <Button onClick={() => {}}>
              <Plus className="h-4 w-4 mr-1" />
              Create New Message
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
