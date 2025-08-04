"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, X } from "lucide-react"
import type { Topic } from "../types"

interface TopicListItemProps {
  topic: Topic
  onToggleTrending: (id: string) => void
  onRemoveTopic: (id: string) => void
}

export function TopicListItem({ topic, onToggleTrending, onRemoveTopic }: TopicListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/10"
    >
      <div className="flex items-center gap-2">
        <span>{topic.name}</span>
        {topic.trending && (
          <Badge className="bg-gradient-to-r from-neo-mint to-purist-blue text-white border-0">
            <TrendingUp className="h-3 w-3 mr-1" />
            Trending
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleTrending(topic.id)}
          className={topic.trending ? "text-neo-mint dark:text-purist-blue" : ""}
        >
          <TrendingUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemoveTopic(topic.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}
