"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TooltipProvider } from "@/components/ui/tooltip"
import ThemeToggle from "@/components/ui/theme-toggle"
import UserMenu from "@/components/ui/user-menu"
import MessageButton from "@/components/messages/message-button"
import NotificationsDropdown from "@/components/ui/notifications-dropdown"
import { MobileHeaderButtons } from "@/components/home/mobile-header-buttons"

interface MainHeaderProps {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export default function MainHeader({ mobileMenuOpen, setMobileMenuOpen }: MainHeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [showMenuIcon, setShowMenuIcon] = useState(false)
  const [isHomePage, setIsHomePage] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }

      // Mobile header hide/show logic
      if (isMobile) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down - hide header
          setHeaderVisible(false)
        } else if (currentScrollY < lastScrollY) {
          // Scrolling up - show header
          setHeaderVisible(true)
        }
        setLastScrollY(currentScrollY)
      } else {
        // Always show header on desktop
        setHeaderVisible(true)
      }
    }

    // Check if we're on the home page
    setIsHomePage(window.location.pathname === '/')

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isMobile, lastScrollY])

  // Mobile logo animation effect - switch between logo and menu icon every 1.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setShowMenuIcon(prev => !prev)
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  return (
    <TooltipProvider>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm" : "bg-transparent"
        } ${
          isMobile ? (headerVisible ? "translate-y-0" : "-translate-y-full") : ""
        }`}
      >
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex h-20 items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile: Animated logo/menu combo */}
            <div className="md:hidden">
              <motion.button
                onClick={() => setMobileMenuOpen(true)}
                className="flex items-center p-2 rounded-lg transition-colors hover:bg-white/10 dark:hover:bg-gray-800/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="relative"
                  animate={{ 
                    rotate: showMenuIcon ? [0, 180] : [180, 0],
                    scale: showMenuIcon ? [1, 0.8, 1] : [1, 0.8, 1]
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                  <motion.div
                    animate={{ opacity: showMenuIcon ? 0 : 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <BookOpen className="relative h-6 w-6 text-neo-mint dark:text-purist-blue" />
                  </motion.div>
                  <motion.div
                    animate={{ opacity: showMenuIcon ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Menu className="h-6 w-6 text-neo-mint dark:text-purist-blue" />
                  </motion.div>
                </motion.div>
              </motion.button>
            </div>

            {/* Desktop: Static logo link */}
            <Link href="/" prefetch={true} className="hidden md:flex items-center gap-3">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, ease: "easeInOut", delay: 1 }}
                className="relative"
              >
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                <BookOpen className="relative h-6 w-6 text-neo-mint dark:text-purist-blue" />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="hidden sm:inline-block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue"
              >
                EnglishMasteryHub
              </motion.span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8 xl:gap-12 2xl:gap-16">
            <Link
              href="/"
              prefetch={true}
              className="text-sm lg:text-base font-medium text-neo-mint dark:text-purist-blue transition-colors hover:text-neo-mint/80 dark:hover:text-purist-blue/80 relative group px-2"
            >
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-neo-mint to-purist-blue group-hover:w-full transition-all duration-300"></span>
              Challenges
            </Link>
            <Link
              href="/community"
              prefetch={true}
              className="text-sm lg:text-base font-medium transition-colors hover:text-neo-mint dark:hover:text-purist-blue relative group px-2"
            >
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-neo-mint to-purist-blue group-hover:w-full transition-all duration-300"></span>
              Community
            </Link>
            <Link
              href="/resources"
              prefetch={true}
              className="text-sm lg:text-base font-medium transition-colors hover:text-neo-mint dark:hover:text-purist-blue relative group px-2"
            >
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-neo-mint to-purist-blue group-hover:w-full transition-all duration-300"></span>
              AI Learning Hub
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-3 lg:gap-4 xl:gap-6">
            {/* Mobile view - show essential buttons with progress and leaderboard */}
            <div className="md:hidden flex items-center gap-2">
              {/* Only show these buttons when on home route "/" */}
              {isHomePage && <MobileHeaderButtons />}
              <NotificationsDropdown />
              <MessageButton />
              <UserMenu />
            </div>
            
            {/* Desktop view - show all features */}
            <div className="hidden md:flex items-center gap-3 lg:gap-4 xl:gap-6">
              <div className="relative">
                <div className="flex items-center bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-full pl-3 pr-1 py-1">
                  <Search className="h-4 w-4 text-muted-foreground mr-2" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-8 w-[200px]"
                  />
                </div>
              </div>

              <NotificationsDropdown />

              <MessageButton />

              <ThemeToggle />

              <UserMenu />
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  )
}
