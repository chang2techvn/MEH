"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Edit, Clock, CalendarIcon } from "lucide-react"
import { OverviewTab } from "./overview-tab"
import { ComposeTab } from "./compose-tab"
import { ScheduledTab } from "./scheduled-tab"
import { CalendarTab } from "./calendar-tab"
import type { ScheduledMessage } from "./types"

interface NotificationTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  scheduledMessages: ScheduledMessage[]
}

export const NotificationTabs: React.FC<NotificationTabsProps> = ({ activeTab, setActiveTab, scheduledMessages }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="compose"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Compose</span>
          </TabsTrigger>
          <TabsTrigger
            value="scheduled"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Scheduled</span>
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {activeTab === "overview" && <OverviewTab key="overview" />}
          {activeTab === "compose" && <ComposeTab key="compose" />}
          {activeTab === "scheduled" && <ScheduledTab key="scheduled" />}
          {activeTab === "calendar" && <CalendarTab key="calendar" scheduledMessages={scheduledMessages} />}
        </AnimatePresence>
      </Tabs>
    </motion.div>
  )
}
