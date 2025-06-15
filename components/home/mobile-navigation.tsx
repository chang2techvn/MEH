"use client"

import React, { Suspense, lazy } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { BookOpen, X, Zap, Users, Award } from "lucide-react"

const ThemeToggle = lazy(() => import("@/components/ui/theme-toggle"))

interface MobileNavigationProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const navigationItems = [
    {
      href: "/",
      label: "Home",
      icon: BookOpen
    },
    {
      href: "/challenges",
      label: "Challenges", 
      icon: Zap
    },
    {
      href: "/community",
      label: "Community",
      icon: Users
    },
    {
      href: "/resources",
      label: "Resources",
      icon: BookOpen
    },
    {
      href: "/profile",
      label: "Profile",
      icon: Award
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
          className="fixed inset-0 z-50 bg-neo-mint/10 dark:bg-dark-blue/20 backdrop-blur-xl md:hidden"
        >
          <div className="flex h-16 items-center justify-between px-6 border-b border-neo-mint/20 dark:border-dark-blue/20">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                <BookOpen className="relative h-6 w-6 text-neo-mint dark:text-purist-blue" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue">
                EnglishMastery
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          <nav className="flex flex-col p-6 space-y-6">
            {navigationItems.map((item) => {
              const IconComponent = item.icon
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-lg font-medium flex items-center gap-2 hover:text-neo-mint dark:hover:text-purist-blue transition-colors"
                  onClick={onClose}
                >
                  <div className="w-8 h-8 rounded-full bg-neo-mint/10 dark:bg-purist-blue/10 flex items-center justify-center">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  {item.label}
                </Link>
              )
            })}

            <div className="pt-6 border-t border-neo-mint/10 dark:border-purist-blue/10">
              <Suspense fallback={<div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-full"></div>}>
                <ThemeToggle />
              </Suspense>
            </div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Lazy import needs to be outside the component
// const lazy = (factory: () => Promise<{ default: React.ComponentType<any> }>) => {
//   return React.lazy(factory)
// }

// import React from "react"
