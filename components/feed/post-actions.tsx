"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { reactions } from "./types"

interface PostActionsProps {
  liked: boolean
  likeCount: number
  commentCount: number
  saved: boolean
  selectedReaction: string | null
  showReactions: boolean
  username: string
  onLike: () => void
  onComment: () => void
  onShare: () => void
  onSavedChange: (saved: boolean) => void
  onReaction: (reaction: string) => void
  onShowReactionsChange: (show: boolean) => void
}

export function PostActions({
  liked,
  likeCount,
  commentCount,
  saved,
  selectedReaction,
  showReactions,
  username,
  onLike,
  onComment,
  onShare,
  onSavedChange,
  onReaction,
  onShowReactionsChange,
}: PostActionsProps) {
  return (
    <div className="flex justify-between w-full">
      {/* Wrapper for like button and reactions */}
      <div 
        className="relative"
        onMouseEnter={() => onShowReactionsChange(true)}
        onMouseLeave={() => {
          // Add delay to allow moving between button and reactions
          setTimeout(() => onShowReactionsChange(false), 300)
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 rounded-full px-4 hover:bg-white/20 dark:hover:bg-gray-800/20"
          onClick={onLike}
        >
          {selectedReaction ? (
            <span className="text-lg mr-1">{selectedReaction}</span>
          ) : (
            <Heart
              className={`h-4 w-4 ${liked ? "fill-cassis text-cassis" : ""} transition-colors`}
              style={{
                transform: liked ? "scale(1.2)" : "scale(1)",
                transition: "transform 0.3s ease",
              }}
            />
          )}
          <span id={`like-count-${username.replace(/\s+/g, "-")}`}>{likeCount}</span>
        </Button>

        {/* Reactions popup */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: -45, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 -top-1 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-full p-2 shadow-xl border border-white/20 dark:border-gray-700/30 z-20 flex gap-1"
              style={{
                // Extend the hover area to prevent gaps
                paddingBottom: '8px',
                marginBottom: '-4px'
              }}
            >
              {reactions.map((reaction, index) => (
                <Tooltip key={reaction.label}>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 dark:hover:bg-gray-700/20"
                      onClick={() => onReaction(reaction.emoji)}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1
                      }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 10,
                        delay: index * 0.05 
                      }}
                    >
                      <span className="text-lg">{reaction.emoji}</span>
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{reaction.label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 rounded-full px-4 hover:bg-white/20 dark:hover:bg-gray-800/20"
        onClick={onComment}
      >
        <MessageSquare className="h-4 w-4" />
        <span id={`comment-count-${username.replace(/\s+/g, "-")}`}>{commentCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 rounded-full px-4 hover:bg-white/20 dark:hover:bg-gray-800/20"
        onClick={onShare}
      >
        <Share2 className="h-4 w-4" />
        <span>Share</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`flex items-center gap-2 rounded-full px-4 hover:bg-white/20 dark:hover:bg-gray-800/20 ${saved ? "text-neo-mint dark:text-purist-blue" : ""}`}
        onClick={() => onSavedChange(!saved)}
      >
        <Bookmark
          className={`h-4 w-4 ${saved ? "fill-neo-mint dark:fill-purist-blue" : ""}`}
          style={{
            transform: saved ? "scale(1.2)" : "scale(1)",
            transition: "transform 0.3s ease",
          }}
        />
        <span>{saved ? "Saved" : "Save"}</span>
      </Button>
    </div>
  )
}
