"use client"

import { motion } from "framer-motion"
import { DailyVideoDisplay } from "./daily-video-display"
import { AutomationStatus } from "./automation-status"
import { VideoGenerationHistory } from "./video-generation-history"
import { ManualVideoOverride } from "./manual-video-override"

// Animation variants
const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

interface DailyVideoTabProps {
  onUpdate?: () => void
}

export function DailyVideoTab({ onUpdate }: DailyVideoTabProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Current Daily Video */}
      <motion.div variants={slideUp}>
        <DailyVideoDisplay onVideoUpdate={onUpdate} />
      </motion.div>

      {/* Manual Video Override */}
      <motion.div variants={slideUp}>
        <ManualVideoOverride onVideoSet={onUpdate} />
      </motion.div>

      {/* Automation Status */}
      <motion.div variants={slideUp}>
        <AutomationStatus onStatusUpdate={onUpdate} />
      </motion.div>

      {/* Video Generation History */}
      <motion.div variants={slideUp}>
        <VideoGenerationHistory onRefresh={onUpdate} />
      </motion.div>
    </motion.div>
  )
}
