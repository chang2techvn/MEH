"use client"

import type React from "react"

import { motion } from "framer-motion"
import { ActivityChart } from "./activity-chart"
import { RecentNotifications } from "./recent-notifications"
import { MessageTemplates } from "./message-templates"
import { UpcomingScheduled } from "./upcoming-scheduled"
import { QuickActions } from "./quick-actions"
import { useNotificationState } from "../../hooks/use-notification-state"
import { useTemplateSelection } from "../../hooks/use-template-selection"
import { recentActivity, messageTemplates } from "../../constants"

export const OverviewTab: React.FC = () => {
  const { setActiveTab, setShowAiAssistant, scheduledMessages, setMessageType, setMessageSubject, setMessageContent } =
    useNotificationState()
  const { handleSelectTemplate } = useTemplateSelection(setMessageSubject, setMessageContent)

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6 mt-0">
        {/* Activity and Recent Notifications */}
        <div className="grid gap-6 md:grid-cols-7">
          <ActivityChart />
          <RecentNotifications recentActivity={recentActivity} />
        </div>

        {/* Templates and Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3">
          <MessageTemplates
            messageTemplates={messageTemplates}
            handleSelectTemplate={handleSelectTemplate}
            setActiveTab={setActiveTab}
          />
          <UpcomingScheduled scheduledMessages={scheduledMessages} />
          <QuickActions setActiveTab={setActiveTab} setShowAiAssistant={setShowAiAssistant} />
        </div>
      </div>
    </motion.div>
  )
}
