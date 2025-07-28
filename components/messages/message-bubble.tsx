"use client"

import { useState } from "react"
import type { Message, User } from "./types"
import { Check, CheckCheck, Clock, Heart, SmilePlus } from "lucide-react"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MessageBubbleProps {
  message: Message
  isFromCurrentUser: boolean
  sender: User | undefined
  showSender: boolean
  compact?: boolean
}

export default function MessageBubble({
  message,
  isFromCurrentUser,
  sender,
  showSender,
  compact = false,
}: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false)
  const [hasReacted, setHasReacted] = useState(false)

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3" />
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const handleReaction = () => {
    setHasReacted(!hasReacted)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-2 mb-2 group ${isFromCurrentUser ? "flex-row-reverse" : ""}`}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      {showSender && !isFromCurrentUser && !compact && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden">
          <img src={sender?.avatar || "/placeholder.svg"} alt={sender?.name} className="h-full w-full object-cover" />
        </div>
      )}

      {showSender && !isFromCurrentUser && compact && (
        <div className="flex-shrink-0 h-6 w-6 rounded-full overflow-hidden">
          <img src={sender?.avatar || "/placeholder.svg"} alt={sender?.name} className="h-full w-full object-cover" />
        </div>
      )}

      {!showSender && !isFromCurrentUser && !compact && <div className="w-8" />}
      {!showSender && !isFromCurrentUser && compact && <div className="w-6" />}

      <div className={`max-w-[80%] relative`}>
        {showSender && !isFromCurrentUser && !compact && (
          <div className="text-xs text-muted-foreground mb-1 ml-1">{sender?.name}</div>
        )}

        <div
          className={`${compact ? "p-2 text-sm" : "p-3"} rounded-2xl ${
            isFromCurrentUser ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted rounded-tl-none"
          }`}
        >
          <div className="whitespace-pre-wrap break-words">{message.text}</div>

          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment, index) => {
                if (attachment.type === "image") {
                  return (
                    <div
                      key={index}
                      className="rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={attachment.url || "/placeholder.svg"}
                        alt={attachment.name || "Attachment"}
                        className="w-full h-auto max-h-60 object-cover"
                      />
                    </div>
                  )
                }
                return null
              })}
            </div>
          )}

          <div className={`text-xs mt-1 flex items-center gap-1 ${isFromCurrentUser ? "justify-end" : ""}`}>
            <span className={isFromCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"}>
              {formatTime(message.timestamp)}
            </span>
            {isFromCurrentUser && <span className="text-primary-foreground/70">{getStatusIcon(message.status)}</span>}
          </div>
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div
            className={`absolute ${isFromCurrentUser ? "left-0" : "right-0"} bottom-0 transform ${
              isFromCurrentUser ? "-translate-x-1/2" : "translate-x-1/2"
            } translate-y-1/2`}
          >
            <div className="bg-background rounded-full px-2 py-1 shadow-md flex items-center text-xs border">
              <span className="mr-1">👍</span>
              <span>{message.reactions[0].count}</span>
            </div>
          </div>
        )}

        {/* Reaction button - only show in non-compact mode */}
        {!compact && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: showReactions || hasReacted ? 1 : 0,
                    scale: showReactions || hasReacted ? 1 : 0.8,
                  }}
                  
                  onClick={handleReaction}
                  className={`absolute ${
                    isFromCurrentUser ? "left-0 -translate-x-full -ml-2" : "right-0 translate-x-full mr-2"
                  } top-1/2 -translate-y-1/2 bg-background rounded-full p-1.5 shadow-md border ${
                    hasReacted ? "text-red-500" : "text-muted-foreground"
                  }`}
                >
                  {hasReacted ? <Heart className="h-3.5 w-3.5 fill-current" /> : <SmilePlus className="h-3.5 w-3.5" />}
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side={isFromCurrentUser ? "left" : "right"}>
                <p>React to message</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </motion.div>
  )
}
