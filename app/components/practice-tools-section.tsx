"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Film, Pencil, MessageSquare, Users } from "lucide-react"

interface PracticeToolsSectionProps {
  onToolClick?: (tool: string) => void
}

const practiceTools = [
  {
    id: 'pronunciation',
    name: 'Pronunciation Checker',
    icon: Film,
    gradient: 'from-neo-mint to-purist-blue'
  },
  {
    id: 'grammar',
    name: 'Grammar Checker',
    icon: Pencil,
    gradient: 'from-cantaloupe to-cassis'
  },
  {
    id: 'conversation',
    name: 'AI Conversation',
    icon: MessageSquare,
    gradient: 'from-mellow-yellow to-cantaloupe'
  },
  {
    id: 'partners',
    name: 'Find Partners',
    icon: Users,
    gradient: 'from-purist-blue to-cassis'
  }
]

export function PracticeToolsSection({ onToolClick }: PracticeToolsSectionProps) {
  return (
    <Card className="neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purist-blue to-cassis blur-sm opacity-70"></div>
            <Sparkles className="relative h-5 w-5 text-purist-blue dark:text-cassis" />
          </div>
          <h2 className="text-lg font-bold">Practice Tools</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {practiceTools.map((tool) => {
            const IconComponent = tool.icon

            return (
              <motion.div
                key={tool.id}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button
                  variant="outline"
                  className="h-auto py-6 flex flex-col gap-3 w-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-800/30"
                  onClick={() => onToolClick?.(tool.id)}
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-glow-sm`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium">{tool.name}</span>
                </Button>
              </motion.div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
