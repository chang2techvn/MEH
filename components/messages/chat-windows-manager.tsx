"use client"

import { AnimatePresence } from "framer-motion"
import { useChat } from "@/contexts/chat-context-realtime"
import ChatWindow from "./chat-window"

export default function ChatWindowsManager() {
  const { openChatWindows, minimizedChatWindows } = useChat()

  // Filter out minimized windows
  const visibleChatWindows = openChatWindows.filter((id) => !minimizedChatWindows.includes(id))

  return (
    <AnimatePresence>
      {visibleChatWindows.map((conversationId, index) => (
        <ChatWindow key={conversationId} conversationId={conversationId} />
      ))}
    </AnimatePresence>
  )
}
