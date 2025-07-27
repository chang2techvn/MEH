"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface SmoothScrollIndicatorProps {
  isAutoScrolling: boolean
  className?: string
}

export function SmoothScrollIndicator({ 
  isAutoScrolling, 
  className = ""
}: SmoothScrollIndicatorProps) {
  
  return (
    <AnimatePresence>
      {isAutoScrolling && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2 }}
          className={`fixed bottom-20 right-4 z-50 ${className}`}
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full px-4 py-2 shadow-lg backdrop-blur-sm auto-scroll-indicator">
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-4 w-4" />
              </motion.div>
              <span className="text-sm font-medium">Đang cuộn mượt mà...</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SmoothScrollIndicator
