"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { reactions } from "./types"

interface CommentReactionsProps {
  liked: boolean
  likeCount: number
  selectedReaction: string | null
  showReactions: boolean
  commentId: string
  onLike: () => void
  onReaction: (reaction: string) => void
  onShowReactionsChange: (show: boolean) => void
}

export function CommentReactions({
  liked,
  likeCount,
  selectedReaction,
  showReactions,
  commentId,
  onLike,
  onReaction,
  onShowReactionsChange,
}: CommentReactionsProps) {
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => onShowReactionsChange(true)}
      onMouseLeave={() => onShowReactionsChange(false)}
    >
      <button
        onClick={onLike}
        className={`text-xs font-semibold hover:underline transition-colors ${
          selectedReaction || liked
            ? 'text-yellow-600 dark:text-yellow-500' 
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        {selectedReaction ? (
          // Get reaction name from reactions array
          reactions.find(r => r.emoji === selectedReaction)?.label || 'Like'
        ) : (
          'Like'
        )}
      </button>

      {/* Reactions popup */}
      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: -50, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 -top-1 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-full p-2 shadow-xl border border-white/20 dark:border-gray-700/30 z-20 flex gap-1"
            style={{
              // Extend the hover area to prevent gaps
              paddingBottom: '8px',
              marginBottom: '-4px'
            }}
            onMouseEnter={() => onShowReactionsChange(true)}
            onMouseLeave={() => onShowReactionsChange(false)}
          >
            {reactions.map((reaction, index) => (
              <Tooltip key={reaction.label}>
                <TooltipTrigger asChild>
                  <motion.button
                    
                    
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
  )
}
