"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Edit, Clock, Mail, Sparkles, BarChart3, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface QuickActionsProps {
  setActiveTab: (tab: string) => void
  setShowAiAssistant: (show: boolean) => void
}

export const QuickActions: React.FC<QuickActionsProps> = ({ setActiveTab, setShowAiAssistant }) => {
  return (
    <Card className="border-none shadow-neo">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        <CardDescription>Common notification tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "New Message",
              icon: <Edit className="h-4 w-4 text-purist-blue" />,
              tab: "compose",
            },
            { label: "Schedule", icon: <Clock className="h-4 w-4 text-neo-mint" />, tab: "scheduled" },
            { label: "Templates", icon: <Mail className="h-4 w-4 text-cassis" />, tab: "overview" },
            {
              label: "AI Assistant",
              icon: <Sparkles className="h-4 w-4 text-purple-500" />,
              tab: "compose",
            },
            {
              label: "Analytics",
              icon: <BarChart3 className="h-4 w-4 text-purist-blue" />,
              tab: "overview",
            },
            {
              label: "Settings",
              icon: <Settings className="h-4 w-4 text-muted-foreground" />,
              tab: "overview",
            },
          ].map((action, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="p-3 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-neo hover:shadow-glow-sm transition-all duration-300 flex flex-col items-center justify-center gap-2 text-center"
              onClick={() => {
                setActiveTab(action.tab)
                if (action.label === "AI Assistant") {
                  setShowAiAssistant(true)
                }
              }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neo-mint/20 to-purist-blue/20 flex items-center justify-center">
                {action.icon}
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
