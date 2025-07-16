"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/ui/theme-toggle"

export default function SimpleHeader() {
  const [scrolled, setScrolled] = useState(false)

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
    <header
      className={`sticky top-0 z-30 w-full transition-all duration-300 ${
        scrolled ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm" : "bg-white dark:bg-gray-900"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" prefetch={true} className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, ease: "easeInOut", delay: 1 }}
              className="relative"
            >
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-vibrant-orange to-cantaloupe blur-sm opacity-70"></div>
              <BookOpen className="relative h-6 w-6 text-vibrant-orange dark:text-cantaloupe" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-vibrant-orange to-cantaloupe"
            >
              EnglishMasteryHub
            </motion.span>
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-sm font-medium transition-colors hover:text-vibrant-orange dark:hover:text-cantaloupe"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
            
            <Button
              size="sm"
              asChild
              className="bg-gradient-to-r from-vibrant-orange to-cantaloupe hover:from-vibrant-orange/80 hover:to-cantaloupe/80 text-white border-0"
            >
              <Link href="/auth/register">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
