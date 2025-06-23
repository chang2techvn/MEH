"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Users } from "lucide-react"
import type { EventCardProps } from "./types"

export function EventCard({ title, date, time, location, attendees, badge }: EventCardProps) {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer">
      <div className="p-2 sm:p-3">
        <div className="flex justify-between items-start mb-1.5 sm:mb-2">
          <h4 className="font-medium text-sm sm:text-base">{title}</h4>
          <Badge
            className={`
            ${badge === "today" ? "bg-green-500" : badge === "tomorrow" ? "bg-blue-500" : "bg-gray-500"} 
            text-white border-0 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 sm:py-0.5
          `}
          >
            {badge === "today" ? "Today" : badge === "tomorrow" ? "Tomorrow" : "Upcoming"}
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2">
          {date} • {time}
        </p>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
          <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span>{location}</span>
          <Separator orientation="vertical" className="h-2.5 sm:h-3" />
          <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span>{attendees} going</span>
        </div>
      </div>
    </Card>
  )
}
