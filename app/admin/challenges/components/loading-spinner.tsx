"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

export default function LoadingSpinner() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative w-16 h-16">
          <motion.div
            animate={{
              rotate: 360,
              transition: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            }}
            className="absolute inset-0"
          >
            <Loader2 className="h-16 w-16 text-primary" />
          </motion.div>
        </div>
        <p className="text-lg font-medium">Loading challenges...</p>
        <p className="text-sm text-muted-foreground">This may take a moment</p>
      </motion.div>
    </div>
  )
}
