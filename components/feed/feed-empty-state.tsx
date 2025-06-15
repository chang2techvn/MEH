"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageSquare, RefreshCw } from "lucide-react"

interface FeedEmptyStateProps {
  onRefresh: () => void
  message?: string
  filterActive?: boolean
}

export default function FeedEmptyState({
  onRefresh,
  message = "No posts found",
  filterActive = false,
}: FeedEmptyStateProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo">
        <div className="p-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="w-16 h-16 rounded-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm flex items-center justify-center mb-4"
          >
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </motion.div>

          <h3 className="text-xl font-bold mb-2">{message}</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {filterActive
              ? "Try adjusting your filters to see more posts."
              : "Be the first to share your learning journey with the community!"}
          </p>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={onRefresh}
              className="flex items-center gap-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>

            {!filterActive && (
              <Button className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0">
                Create Post
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
