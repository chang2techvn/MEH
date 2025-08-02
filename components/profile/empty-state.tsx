"use client"

import { motion } from "framer-motion"
import { BookOpen, PenTool, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface EmptyStateProps {
  type: 'posts' | 'achievements' | 'activity'
  title: string
  description: string
  actionText?: string
  actionUrl?: string
  icon?: React.ReactNode
  onClick?: () => void
}

export default function EmptyState({ 
  type, 
  title, 
  description, 
  actionText, 
  actionUrl,
  icon,
  onClick 
}: EmptyStateProps) {
  const router = useRouter()

  const getIcon = () => {
    if (icon) return icon
    
    switch (type) {
      case 'posts':
        return <BookOpen className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
      case 'achievements':
        return <PenTool className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
      case 'activity':
        return <Users className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
      default:
        return <BookOpen className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
    }
  }

  const handleAction = () => {
    if (onClick) {
      onClick()
    } else if (actionUrl) {
      router.push(actionUrl)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-12"
    >
      {getIcon()}
      
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2"
      >
        {title}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-muted-foreground mb-6 max-w-md mx-auto"
      >
        {description}
      </motion.p>

      {actionText && (actionUrl || onClick) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleAction}
            className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white transition-all duration-200"
          >
            {actionText}
          </Button>
        </motion.div>
      )}

      {/* Decorative elements */}
      <div className="mt-8 flex justify-center space-x-2 opacity-30">
        <div className="w-2 h-2 bg-neo-mint rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-purist-blue rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="w-2 h-2 bg-cassis rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </motion.div>
  )
}
