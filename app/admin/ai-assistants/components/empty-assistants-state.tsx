"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AlertCircle, Plus } from "lucide-react"

interface EmptyAssistantsStateProps {
  onAddClick: () => void
  searchQuery: string
}

export function EmptyAssistantsState({ onAddClick, searchQuery }: EmptyAssistantsStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <AlertCircle className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-medium mb-2">No assistants found</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
        {searchQuery
          ? `No assistants match "${searchQuery}". Try a different search term.`
          : "There are no assistants in this category. Create your first assistant to get started."}
      </p>
      <Button onClick={onAddClick}>
        <Plus className="mr-2 h-4 w-4" />
        Create Assistant
      </Button>
    </motion.div>
  )
}
