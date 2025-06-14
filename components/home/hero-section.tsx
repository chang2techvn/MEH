"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/utils/animation"

interface HeroSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

export default function HeroSection({ title, description, children }: HeroSectionProps) {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem}>
        <Card className="neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo">
          <div className="p-6">
            <motion.div className="flex items-center gap-3 mb-4" variants={fadeInUp}>
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                <Sparkles className="relative h-5 w-5 text-neo-mint dark:text-purist-blue" />
              </div>
              <h2 className="text-xl font-bold">{title}</h2>
            </motion.div>

            {description && (
              <motion.p className="text-sm text-muted-foreground mb-4" variants={fadeInUp}>
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
