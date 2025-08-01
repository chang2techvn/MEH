"use client"

import { ReactNode, useState } from "react"
import { motion } from "framer-motion"
import MainHeader from "@/components/ui/main-header"
import { MobileBottomNavigation } from "@/components/home/mobile-bottom-navigation"
import { useMobile } from "@/hooks/use-mobile"

interface ProfileLayoutProps {
  children: ReactNode
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const { isMobile } = useMobile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-[#f0f2f5] dark:bg-gray-900">
      {/* Header */}
      <MainHeader 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`${isMobile ? 'pb-20' : ''}`}
      >
        {children}
      </motion.main>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNavigation />}
    </div>
  )
}
