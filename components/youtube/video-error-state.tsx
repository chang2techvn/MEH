"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface VideoErrorStateProps {
  onReload: () => void
}

export function VideoErrorState({ onReload }: VideoErrorStateProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 dark:bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center"
      >
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
        <p className="text-center mb-4 text-lg font-medium">Failed to load the video</p>
        <Button
          onClick={onReload}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
        >
          Reload Video
        </Button>
      </motion.div>
    </div>
  )
}
