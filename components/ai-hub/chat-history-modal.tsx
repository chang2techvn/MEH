"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  X,
  Search, 
  Clock, 
  Trash2, 
  Calendar,
  Filter,
  History,
  MessageCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChatHistory } from "@/types/ai-hub.types"
import { useChatSessions } from "@/hooks/use-chat-sessions"
import { useAIAssistants } from "@/hooks/use-ai-assistants"
import { formatDistanceToNow, format } from "date-fns"
import { enUS } from "date-fns/locale"

// Optimized Avatar Component for Chat History with next/image
const OptimizedChatAvatar = ({ 
  src, 
  alt, 
  size = 32, 
  className = "",
  fallbackText,
  online = false,
  ...props 
}: {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
  fallbackText: string;
  online?: boolean;
  [key: string]: any;
}) => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <div className={`relative ${className}`} {...props}>
      <div 
        className="relative overflow-hidden rounded-full flex items-center justify-center bg-orange-100 border-2 border-white shadow-sm"
        style={{ width: size, height: size }}
      >
        {src && !imageError ? (
          <Image
            src={src}
            alt={alt}
            width={size * 2}
            height={size * 2}
            quality={80}
            className="object-cover rounded-full"
            style={{ width: size, height: size }}
            onError={() => setImageError(true)}
            sizes={`${size}px`}
            loading="lazy"
            draggable={false}
          />
        ) : (
          <span 
            className="text-orange-800 font-medium select-none" 
            style={{ fontSize: size * 0.35 }}
          >
            {fallbackText}
          </span>
        )}
      </div>
      {online && (
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
      )}
    </div>
  );
};

// Simple Avatar Row Component for Chat History (like desktop)
const SimpleAvatarRow = ({ 
  aiIds, 
  getAIById, 
  maxVisible = 4 
}: { 
  aiIds: string[], 
  getAIById: (id: string) => any,
  maxVisible?: number
}) => {
  const visibleAIs = aiIds.slice(0, maxVisible);
  const remainingCount = Math.max(0, aiIds.length - maxVisible);
  
  return (
    <div className="flex items-center gap-1">
      {visibleAIs.map((aiId) => {
        const ai = getAIById(aiId);
        return (
          <OptimizedChatAvatar
            key={aiId}
            src={ai?.avatar}
            alt={ai?.name || 'AI'}
            size={20}
            fallbackText={ai?.name?.charAt(0) || 'AI'}
            online={false} // No online indicator for small avatars
          />
        );
      })}
      {remainingCount > 0 && (
        <div 
          className="relative overflow-hidden rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 border border-white shadow-sm"
          style={{ width: 20, height: 20 }}
        >
          <span className="text-gray-600 dark:text-gray-300 font-medium text-[8px]">
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
};

interface ChatHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectChat: (chatId: string) => void
  onDeleteChat?: (chatId: string) => void
}

export function ChatHistoryModal({ 
  isOpen, 
  onClose, 
  onSelectChat, 
  onDeleteChat
}: ChatHistoryModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "messages">("recent")

  // Load real data from Supabase
  const { sessions: chatHistories, loading, error } = useChatSessions()
  const { getAIById } = useAIAssistants()

  const filters = [
    { id: "all", name: "All" },
    { id: "today", name: "Today" },
    { id: "week", name: "This Week" },
  ]

  const filteredChats = chatHistories
    .filter(chat => {
      const matchesSearch = chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      
      let matchesFilter = true
      const now = new Date()
      const chatDate = new Date(chat.timestamp)
      
      switch (selectedFilter) {
        case "today":
          matchesFilter = chatDate.toDateString() === now.toDateString()
          break
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesFilter = chatDate >= weekAgo
          break
        default:
          matchesFilter = true
      }
      
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        case "messages":
          // For sessions, we don't have messageCount, so sort by timestamp
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      }
    })

  const handleSelectChat = (chatId: string) => {
    onSelectChat(chatId)
    onClose()
  }

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDeleteChat) {
      onDeleteChat(chatId)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm mx-4 h-[70vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-800/20 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <History className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                History
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search & Filters */}
          <div className="p-4 pb-2 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 text-sm border-gray-200 dark:border-gray-700"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-2 overflow-x-auto">
                {/* Filter Button moved before tabs */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0 flex-shrink-0 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Filter className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem 
                      onClick={() => setSortBy("recent")}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Most Recent
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSortBy("oldest")}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Oldest
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {filters.map((filter) => (
                  <Button
                    key={filter.id}
                    variant={selectedFilter === filter.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(filter.id)}
                    className="whitespace-nowrap text-xs h-7 px-2 flex-shrink-0"
                  >
                    {filter.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto px-4">
            {loading ? (
              <div className="space-y-3 py-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3 p-3 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8 text-center">
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  Could not load chat history
                </div>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-center">
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  No conversations found
                </div>
              </div>
            ) : (
              <div className="space-y-2 py-2">
                <AnimatePresence>
                  {filteredChats.map((chat) => {
                    // Get all AI info from active_ai_ids array
                    const aiIds = chat.active_ai_ids || []
                    const isGroupChat = aiIds.length > 1
                    
                    return (
                      <motion.div
                        key={chat.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => handleSelectChat(chat.id)}
                        className="flex items-start space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 group"
                      >
                        {/* Main Avatar */}
                        <div className="relative flex-shrink-0">
                          <OptimizedChatAvatar
                            src={getAIById(aiIds[0])?.avatar}
                            alt={getAIById(aiIds[0])?.name || chat.title}
                            size={40}
                            fallbackText={getAIById(aiIds[0])?.name?.charAt(0) || chat.title.charAt(0)}
                            online={getAIById(aiIds[0])?.online}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                              {chat.title}
                            </h3>
                            <div className="flex items-center space-x-1">
                              {onDeleteChat && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Filter className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={(e) => handleDeleteChat(chat.id, e)}>
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Xóa
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>
                          
                          {/* Small Avatars Row (like desktop) */}
                          {isGroupChat && (
                            <div className="mb-2">
                              <SimpleAvatarRow 
                                aiIds={aiIds}
                                getAIById={getAIById}
                                maxVisible={4}
                              />
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2 mb-2">
                            {chat.lastMessage || 'No messages yet'}
                          </p>
                          
                          <div className="flex items-center text-xs text-gray-400 dark:text-gray-600">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(chat.timestamp), { 
                              addSuffix: true, 
                              locale: enUS 
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-center text-gray-500 dark:text-gray-400">
              Tap to open conversation
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
