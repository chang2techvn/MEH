"use client"

import { motion } from "framer-motion"
import { BarChart2, Download, FileText, RefreshCw, MessageSquare, Mail, Send, Archive, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface AdminMessagesHeaderProps {
  toggleTemplates: () => void
  toggleAnalytics: () => void
}

export function AdminMessagesHeader({ toggleTemplates, toggleAnalytics }: AdminMessagesHeaderProps) {
  const { toast } = useToast()

  const handleRefresh = () => {
    toast({
      title: "Refreshing messages",
      description: "Your message list is being updated with the latest data.",
    })
  }

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your messages are being exported. You'll be notified when it's ready.",
    })
  }

  const handleBulkAction = (action: string) => {
    toast({
      title: `Bulk ${action}`,
      description: `Selected messages have been ${action.toLowerCase()}.`,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border-b bg-card/80 backdrop-blur-sm p-4"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-sm text-muted-foreground">Manage and monitor all user conversations</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={toggleTemplates}>
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Templates</span>
          </Button>

          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={toggleAnalytics}>
            <BarChart2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Analytics</span>
          </Button>

          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleRefresh}>
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="h-8 gap-1 bg-gradient-to-r from-neo-mint to-purist-blue hover:opacity-90"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleBulkAction("Marked as Read")}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Mark as Read
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction("Sent")}>
                <Send className="h-4 w-4 mr-2" />
                Send Bulk Message
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleBulkAction("Archived")}>
                <Archive className="h-4 w-4 mr-2" />
                Archive Selected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction("Deleted")} className="text-red-500 focus:text-red-500">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  )
}
