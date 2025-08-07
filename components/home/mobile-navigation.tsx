"use client"

import React, { Suspense, lazy } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { BookOpen, X, Zap, Users, Award, Settings } from "lucide-react"
import { useAuthState } from "@/contexts/auth-context"

const ThemeToggle = lazy(() => import("@/components/ui/theme-toggle"))

interface MobileNavigationProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const { user } = useAuthState() // Add auth state to check user role
  
  const navigationItems = [
    {
      href: "/",
      label: "Challenge",
      icon: BookOpen
    },
    {
      href: "/community",
      label: "Community",
      icon: Users
    },
    {
      href: "/resources",
      label: "AI Learning Hub",
      icon: Zap
    }
  ]

  // Add Admin navigation item if user is admin
  if (user?.role === 'admin') {
    navigationItems.push({
      href: "/admin",
      label: "Admin",
      icon: Settings
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl md:hidden"
          >
            <div className="flex h-16 items-center justify-between px-6 border-b border-neo-mint/20 dark:border-dark-blue/20">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                  <BookOpen className="relative h-6 w-6 text-neo-mint dark:text-purist-blue" />
                </div>
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue">
                  EnglishMasteryHub
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-neo-mint/10">
                <X className="h-6 w-6" />
              </Button>
            </div>

            <nav className="flex flex-col p-6 space-y-4 overflow-y-auto">
              {navigationItems.map((item, index) => {
                const IconComponent = item.icon
                
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    <Link
                      href={item.href}
                      prefetch={true}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-neo-mint/10 dark:hover:bg-purist-blue/10 transition-all duration-200 group"
                      onClick={onClose}
                    >
                      <div className="w-10 h-10 rounded-xl bg-neo-mint/10 dark:bg-purist-blue/10 flex items-center justify-center group-hover:bg-neo-mint/20 dark:group-hover:bg-purist-blue/20 transition-colors">
                        <IconComponent className="h-5 w-5 text-neo-mint dark:text-purist-blue" />
                      </div>
                      <span className="text-lg font-medium text-foreground group-hover:text-neo-mint dark:group-hover:text-purist-blue transition-colors">
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                )
              })}

              <motion.div 
                className="pt-6 border-t border-neo-mint/10 dark:border-purist-blue/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Suspense fallback={<div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-full"></div>}>
                  <ThemeToggle />
                </Suspense>
              </motion.div>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
