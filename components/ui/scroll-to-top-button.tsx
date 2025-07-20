"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"

interface ScrollToTopButtonProps {
  showOnMobileOnly?: boolean
  threshold?: number
  className?: string
}

export function ScrollToTopButton({ 
  showOnMobileOnly = true, 
  threshold = 500,
  className = ""
}: ScrollToTopButtonProps) {
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > threshold) {
        setShowScrollToTop(true)
      } else {
        setShowScrollToTop(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [threshold])

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // Only show on mobile if showOnMobileOnly is true
  const shouldShow = showOnMobileOnly ? isMobile && showScrollToTop : showScrollToTop

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-20 ${className}`}
        >
          <Button
            size="icon"
            style={{ 
              backgroundColor: "hsl(var(--neo-mint))",
              color: "white"
            }}
            className="rounded-full hover:opacity-90 shadow-lg h-10 w-10 sm:h-12 sm:w-12"
            onClick={handleScrollToTop}
          >
            <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
