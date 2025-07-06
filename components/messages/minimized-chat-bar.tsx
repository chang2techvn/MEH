"use client"

import { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useChat } from "@/contexts/chat-context-realtime"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Grid2X2 } from "lucide-react"

export default function MinimizedChatBar() {
  const { minimizedChatWindows, maximizeChatWindow, getConversationById, rearrangeAllWindows, currentUser } = useChat()

  // Filter out duplicates and invalid conversations
  const validMinimizedWindows = useMemo(() => {
    const uniqueIds = [...new Set(minimizedChatWindows)]
    return uniqueIds.filter(conversationId => {
      const conversation = getConversationById(conversationId)
      if (!conversation) return false
      const otherParticipant = conversation.participants.find((p) => p.id !== currentUser?.id)
      return !!otherParticipant
    })
  }, [minimizedChatWindows, getConversationById, currentUser?.id])

  if (validMinimizedWindows.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-none">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 p-2 pointer-events-auto"
      >
        <AnimatePresence>
          {validMinimizedWindows.map((conversationId) => {
            const conversation = getConversationById(conversationId)
            const otherParticipant = conversation!.participants.find((p) => p.id !== currentUser?.id)!

            return (
              <motion.div
                key={conversationId}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="relative cursor-pointer group"
                onClick={() => maximizeChatWindow(conversationId)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-900 shadow-md group-hover:ring-2 group-hover:ring-neo-mint dark:group-hover:ring-purist-blue transition-all">
                    <AvatarImage src={otherParticipant.avatar || "/placeholder.svg"} alt={otherParticipant.name} />
                    <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
                      {otherParticipant.name ? otherParticipant.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${
                      otherParticipant.status === "online"
                        ? "bg-green-500"
                        : otherParticipant.status === "away"
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                    }`}
                  ></span>
                </div>

                {conversation && conversation.unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-neo-mint to-purist-blue text-[10px] text-white px-1.5"
                  >
                    {conversation.unreadCount}
                  </motion.span>
                )}

                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 text-xs py-1 px-2 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {otherParticipant.name}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {minimizedChatWindows.length > 0 && (
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full bg-white dark:bg-gray-900 shadow-md hover:bg-neo-mint/10 dark:hover:bg-purist-blue/10 ml-2"
            onClick={rearrangeAllWindows}
            title="Rearrange all windows"
          >
            <Grid2X2 className="h-4 w-4" />
            <span className="sr-only">Rearrange windows</span>
          </Button>
        )}
      </motion.div>
    </div>
  )
}
