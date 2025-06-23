"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  MoreVertical,
  PlusCircle,
  ChevronRight,
  Sparkles,
  Hash,
  X,
} from "lucide-react"
import { ContactItem } from "./contact-item"
import { ContactSkeleton } from "./contact-skeleton"
import { EventCard } from "./event-card"
import { EventSkeleton } from "./event-skeleton"
import type { Contact, Event } from "./types"

interface RightSidebarProps {
  showRightSidebar: boolean
  setShowRightSidebar: (show: boolean) => void
  contacts: Contact[]
  events: Event[]
  trendingTopics: { name: string; count: number }[]
  loading: boolean
}

export function RightSidebar({
  showRightSidebar,
  setShowRightSidebar,
  contacts,
  events,
  trendingTopics,
  loading,
}: RightSidebarProps) {
  return (
    <aside
      className={`
        fixed inset-0 z-50 lg:static lg:z-auto lg:w-[280px] xl:w-[320px] lg:order-3
        ${showRightSidebar ? "block" : "hidden lg:block"}
      `}
    >
      {/* Mobile overlay background */}
      {showRightSidebar && (
        <div
          className="absolute inset-0 bg-black/50 lg:hidden"
          onClick={() => setShowRightSidebar(false)}
        ></div>
      )}

      <div
        className={`
          relative h-full w-[280px] sm:w-[320px] lg:w-full 
          bg-white dark:bg-gray-800 lg:bg-transparent lg:dark:bg-transparent
          overflow-auto lg:sticky lg:top-[4.5rem] lg:h-[calc(100vh-4.5rem)]
        `}
      >
        {/* Mobile header */}
        {showRightSidebar && (
          <div className="p-4 flex justify-between items-center border-b lg:hidden">
            <h2 className="font-semibold">Contacts & Events</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowRightSidebar(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}

        <ScrollArea className="h-full py-4 px-4 lg:px-0">
          <div className="space-y-4 sm:space-y-6">
            {/* Contacts Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  Contacts
                </h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full">
                    <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full">
                    <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1 sm:space-y-2 max-h-[240px] sm:max-h-[320px] overflow-y-auto pr-1">
                {loading
                  ? Array(5)
                      .fill(0)
                      .map((_, i) => <ContactSkeleton key={i} />)
                  : contacts.map((contact) => (
                      <ContactItem
                        key={contact.id}
                        name={contact.name}
                        image={contact.image}
                        online={contact.online}
                        lastActive={contact.lastActive}
                      />
                    ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  Upcoming Events
                </h3>
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full">
                  <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {loading
                  ? Array(2)
                      .fill(0)
                      .map((_, i) => <EventSkeleton key={i} />)
                  : events.map((event) => (
                      <EventCard
                        key={event.id}
                        title={event.title}
                        date={event.date}
                        time={event.time}
                        location={event.location}
                        attendees={event.attendees}
                        badge={event.badge}
                      />
                    ))}
              </div>

              <Button variant="ghost" className="w-full justify-start text-xs sm:text-sm mt-2 sm:mt-3">
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                See All Events
              </Button>
            </div>

            {/* Trending Topics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  Trending Topics
                </h3>
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>

              <div className="space-y-1 sm:space-y-2">
                {loading
                  ? Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
                          <Skeleton className="h-4 sm:h-5 w-12 sm:w-16" />
                        </div>
                      ))
                  : trendingTopics.slice(0, 5).map((topic) => (
                      <div
                        key={topic.name}
                        className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neo-mint dark:text-purist-blue" />
                          <span className="font-medium text-sm sm:text-base">{topic.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs bg-white/10 dark:bg-gray-800/10">
                          {topic.count}
                        </Badge>
                      </div>
                    ))}
              </div>

              <Button variant="ghost" className="w-full justify-start text-xs sm:text-sm mt-2 sm:mt-3">
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                See All Topics
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>
    </aside>
  )
}
