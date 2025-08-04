"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Calendar, Settings, MessageSquare } from "lucide-react"

interface UserDetailsTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const UserDetailsTabs = ({ activeTab, setActiveTab }: UserDetailsTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Activity
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </TabsTrigger>
        <TabsTrigger value="notes" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Notes
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
