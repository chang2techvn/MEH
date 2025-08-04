"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Send, Bell, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"

interface HeaderSectionProps {
  isLoading: boolean
  refreshData: () => void
  setActiveTab: (tab: string) => void
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({ isLoading, refreshData, setActiveTab }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Notification Center</h1>
        <p className="text-muted-foreground mt-1">Send targeted messages to your users via email and Zalo</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading} className="shadow-neo">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Refreshing..." : "Refresh Data"}
        </Button>
        <Button
          size="sm"
          className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0 shadow-neo"
          onClick={() => setActiveTab("compose")}
        >
          <Send className="h-4 w-4 mr-2" />
          New Message
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative group hover:bg-muted transition-colors"
                onClick={() =>
                  toast({
                    title: "Notifications",
                    description: "You have new notifications",
                  })
                }
              >
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-0 group-hover:opacity-70 transition-opacity"></div>
                <Bell className="relative h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-neo-mint to-purist-blue text-[10px] text-white shadow-glow-sm notification-indicator">
                  3
                </span>
                <span className="sr-only">Notifications</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.div>
  )
}
