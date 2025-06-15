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

interface MainHeaderProps {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export default function MainHeader({ mobileMenuOpen, setMobileMenuOpen }: MainHeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <TooltipProvider>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
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
                EnglishMastery
              </motion.span>
            </Link>
          </div>

          <Button variant="ghost" size="icon" className="md:hidden relative" onClick={() => setMobileMenuOpen(true)}>
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-0 group-hover:opacity-70 transition-opacity"></div>
            <Menu className="h-6 w-6" />
          </Button>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-neo-mint dark:text-purist-blue transition-colors hover:text-neo-mint/80 dark:hover:text-purist-blue/80 relative group"
            >
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-neo-mint to-purist-blue group-hover:w-full transition-all duration-300"></span>
              Home
            </Link>
            <Link
              href="/challenges"
              className="text-sm font-medium transition-colors hover:text-neo-mint dark:hover:text-purist-blue relative group"
            >
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-neo-mint to-purist-blue group-hover:w-full transition-all duration-300"></span>
              Challenges
            </Link>
            <Link
              href="/community"
              className="text-sm font-medium transition-colors hover:text-neo-mint dark:hover:text-purist-blue relative group"
            >
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-neo-mint to-purist-blue group-hover:w-full transition-all duration-300"></span>
              Community
            </Link>
            <Link
              href="/resources"
              className="text-sm font-medium transition-colors hover:text-neo-mint dark:hover:text-purist-blue relative group"
            >
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-neo-mint to-purist-blue group-hover:w-full transition-all duration-300"></span>
              AI Learning Hub
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
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
      </header>
    </TooltipProvider>
  )
}
