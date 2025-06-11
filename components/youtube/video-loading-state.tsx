"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

export function VideoLoadingState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/10 dark:bg-black/30 backdrop-blur-sm z-10">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
      </motion.div>
    </div>
  )
}
