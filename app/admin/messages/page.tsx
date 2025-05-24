"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Helmet } from "react-helmet"
import { motion } from "framer-motion"
import { Search, Filter, MessageSquare, Users, Clock, CheckCircle, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useMediaQuery } from "@/hooks/use-mobile"
import { MessagesList } from "@/components/admin/messages-list"
import { ConversationView } from "@/components/admin/conversation-view"
import { MessageTemplates } from "@/components/admin/message-templates"
import { MessageAnalytics } from "@/components/admin/message-analytics"

export default function AdminMessagesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showTemplates, setShowTemplates] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [viewMode, setViewMode] = useState<"list" | "conversation">(isMobile ? "list" : "conversation")

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)

    return () => clearTimeout(timer)
  }, [])

  // Handle conversation selection
  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id)
    if (isMobile) {
      setViewMode("conversation")
    }
  }

  // Handle back to list on mobile
  const handleBackToList = () => {
    if (isMobile) {
      setViewMode("list")
    }
  }

  // Toggle templates panel
  const toggleTemplates = () => {
    setShowTemplates(!showTemplates)
    setShowAnalytics(false)
  }

  // Toggle analytics panel
  const toggleAnalytics = () => {
    setShowAnalytics(!showAnalytics)
    setShowTemplates(false)
  }

  return (
    <>
      <Helmet>
        <title>Admin Messages | English Learning Platform</title>
        <meta name="description" content="Manage and monitor all user conversations in the English learning platform" />
        <meta name="keywords" content="admin, messages, conversations, management, english learning" />
      </Helmet>

      <div className="flex flex-col h-full">
        {/* Header */}
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
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Templates</span>
              </Button>

              <Button variant="outline" size="sm" className="h-8 gap-1" onClick={toggleAnalytics}>
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Analytics</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 gap-1 bg-gradient-to-r from-neo-mint to-purist-blue hover:opacity-90"
                  >
                    <Filter className="h-3.5 w-3.5" />
                    <span>Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Mark as Read
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Badge className="h-4 w-4 mr-2" />
                    Flag Messages
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Users className="h-4 w-4 mr-2" />
                    Assign to Team
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500 focus:text-red-500">
                    <Clock className="h-4 w-4 mr-2" />
                    Archive Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 p-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              icon={<MessageSquare className="h-5 w-5 text-purist-blue" />}
              title="Total Messages"
              value="12,486"
              change="+14.2%"
              isLoading={isLoading}
            />
            <StatsCard
              icon={<Users className="h-5 w-5 text-neo-mint" />}
              title="Active Conversations"
              value="1,024"
              change="+7.1%"
              isLoading={isLoading}
            />
            <StatsCard
              icon={<Clock className="h-5 w-5 text-cassis" />}
              title="Avg. Response Time"
              value="2.4 hrs"
              change="-18.5%"
              isPositive={true}
              isLoading={isLoading}
            />
            <StatsCard
              icon={<CheckCircle className="h-5 w-5 text-mellow-yellow" />}
              title="Resolution Rate"
              value="94.8%"
              change="+2.3%"
              isLoading={isLoading}
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
            {/* Messages List - Only show on desktop or when in list view on mobile */}
            {(!isMobile || viewMode === "list") && (
              <Card className="lg:col-span-4 overflow-hidden">
                <CardHeader className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Messages</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1">
                          <Filter className="h-3.5 w-3.5" />
                          <span>Filter</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => setFilterStatus("all")}>All Messages</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("unread")}>Unread</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("flagged")}>Flagged</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setFilterStatus("today")}>Today</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("week")}>This Week</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("month")}>This Month</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search messages..."
                      className="pl-8 bg-background"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-4 h-9">
                      <TabsTrigger value="all" className="text-xs">
                        All
                      </TabsTrigger>
                      <TabsTrigger value="unread" className="text-xs">
                        Unread
                      </TabsTrigger>
                      <TabsTrigger value="flagged" className="text-xs">
                        Flagged
                      </TabsTrigger>
                      <TabsTrigger value="archived" className="text-xs">
                        Archived
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent className="p-0">
                  <MessagesList
                    isLoading={isLoading}
                    activeTab={activeTab}
                    searchQuery={searchQuery}
                    filterStatus={filterStatus}
                    onSelectConversation={handleSelectConversation}
                    selectedConversationId={selectedConversation}
                  />
                </CardContent>
              </Card>
            )}

            {/* Conversation View - Only show on desktop or when in conversation view on mobile */}
            {(!isMobile || viewMode === "conversation") && (
              <Card className="lg:col-span-8 overflow-hidden">
                <ConversationView
                  conversationId={selectedConversation}
                  isLoading={isLoading}
                  onBackToList={handleBackToList}
                  isMobile={isMobile}
                />
              </Card>
            )}
          </div>
        </div>

        {/* Templates Panel */}
        <MessageTemplates isOpen={showTemplates} onClose={() => setShowTemplates(false)} />

        {/* Analytics Panel */}
        <MessageAnalytics isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} />
      </div>
    </>
  )
}

interface StatsCardProps {
  icon: React.ReactNode
  title: string
  value: string
  change: string
  isPositive?: boolean
  isLoading: boolean
}

function StatsCard({ icon, title, value, change, isPositive = false, isLoading }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="overflow-hidden"
    >
      <Card className="border border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-background shadow-sm">
              {icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <div
                  className={`flex items-center text-xs font-medium ${
                    isPositive ? "text-green-500" : change.startsWith("+") ? "text-green-500" : "text-red-500"
                  }`}
                >
                  <ArrowUpRight
                    className={`h-3 w-3 mr-1 ${
                      (isPositive && change.startsWith("+")) || (!isPositive && change.startsWith("-"))
                        ? ""
                        : "rotate-180"
                    }`}
                  />
                  {change}
                </div>
              </div>
              {isLoading ? <Skeleton className="h-8 w-24 mt-1" /> : <p className="text-2xl font-bold mt-1">{value}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
