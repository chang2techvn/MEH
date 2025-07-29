"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/utils/animation"

interface HeroSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  showToggle?: boolean
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
  onToggleButtonHoverEnter?: () => void
  onToggleButtonHoverLeave?: () => void
  onSidebarHoverEnter?: () => void
  onSidebarHoverLeave?: () => void
}

export default function HeroSection({ 
  title, 
  description, 
  children, 
  showToggle, 
  sidebarCollapsed, 
  onToggleSidebar,
  onToggleButtonHoverEnter,
  onToggleButtonHoverLeave,
  onSidebarHoverEnter,
  onSidebarHoverLeave
}: HeroSectionProps) {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
      <motion.div variants={staggerItem}>
        <Card className="neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo relative">
          <div className="p-4 sm:p-6">
            <motion.div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4" variants={fadeInUp}>
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                <Sparkles className="relative h-4 w-4 sm:h-5 sm:w-5 text-neo-mint dark:text-purist-blue" />
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">{title}</h2>
              
              {/* Toggle Button - positioned in top right corner */}
              {showToggle && onToggleSidebar && (
                <>
                  {/* Desktop Toggle Button */}
                  <div 
                    className="hidden md:block absolute top-3 sm:top-4 right-3 sm:right-4 z-10"
                    onMouseEnter={onToggleButtonHoverEnter}
                    onMouseLeave={onToggleButtonHoverLeave}
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onToggleSidebar}
                      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white dark:hover:bg-gray-800 shadow-lg rounded-full w-7 h-7 sm:w-8 sm:h-8 transition-all duration-300"
                    >
                      {sidebarCollapsed ? (
                        <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      ) : (
                        <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </Button>
                  </div>

                  {/* Mobile Toggle Button - Now we've removed the fixed button from desktop/laptop */}
                </>
              )}
            </motion.div>

            {description && (
              <motion.p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4" variants={fadeInUp}>
                {description}
              </motion.p>
            )}

            <motion.div variants={fadeInUp}>{children}</motion.div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
