"use client"

import { motion } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react"

interface UserTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  pendingApprovalsCount: number
}

export const UserTabs = ({
  activeTab,
  setActiveTab,
  pendingApprovalsCount,
}: UserTabsProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ delay: 0.1, duration: 0.5 }}
      className="mb-6"
    >
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 p-1 rounded-xl bg-muted/80 backdrop-blur-sm">
          <TabsTrigger
            value="all"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-800 transition-all duration-300"
          >
            <Users className="h-4 w-4 mr-2 hidden sm:inline-block" />
            All Users
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-800 transition-all duration-300"
          >
            <CheckCircle className="h-4 w-4 mr-2 hidden sm:inline-block" />
            Active
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-yellow-600 data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-800 transition-all duration-300"
          >
            <Clock className="h-4 w-4 mr-2 hidden sm:inline-block" />
            Pending
            {pendingApprovalsCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800 text-xs">
                {pendingApprovalsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="inactive"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-600 data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-800 transition-all duration-300"
          >
            <AlertCircle className="h-4 w-4 mr-2 hidden sm:inline-block" />
            Inactive
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </motion.div>
  )
}
