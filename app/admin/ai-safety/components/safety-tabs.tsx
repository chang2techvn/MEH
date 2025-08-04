"use client"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Shield, AlertTriangle, Filter, Settings } from "lucide-react"

interface SafetyTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function SafetyTabs({ activeTab, onTabChange }: SafetyTabsProps) {
  return (
    <TabsList className="grid grid-cols-5 w-full max-w-4xl mx-auto">
      <TabsTrigger value="overview" className="flex items-center gap-2">
        <BarChart className="h-4 w-4" />
        <span className="hidden sm:inline">Overview</span>
      </TabsTrigger>
      <TabsTrigger value="rules" className="flex items-center gap-2">
        <Shield className="h-4 w-4" />
        <span className="hidden sm:inline">Safety Rules</span>
      </TabsTrigger>
      <TabsTrigger value="content" className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span className="hidden sm:inline">Flagged Content</span>
      </TabsTrigger>
      <TabsTrigger value="terms" className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <span className="hidden sm:inline">Banned Terms</span>
      </TabsTrigger>
      <TabsTrigger value="settings" className="flex items-center gap-2">
        <Settings className="h-4 w-4" />
        <span className="hidden sm:inline">Settings</span>
      </TabsTrigger>
    </TabsList>
  )
}
