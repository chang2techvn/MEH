"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Film, Pencil } from "lucide-react"

interface Deadline {
  id: string
  title: string
  dueDate: string
  type: 'video' | 'writing' | 'speaking'
  progress: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

interface UpcomingDeadlinesSectionProps {
  deadlines?: Deadline[]
}

const defaultDeadlines: Deadline[] = [
  {
    id: '1',
    title: 'Technology Impact Video',
    dueDate: 'Due in 2 days',
    type: 'video',
    progress: 25,
    priority: 'urgent'
  },
  {
    id: '2',
    title: 'Written Analysis',
    dueDate: 'Due in 4 days',
    type: 'writing',
    progress: 50,
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Explanation Video',
    dueDate: 'Due in 6 days',
    type: 'video',
    progress: 33,
    priority: 'low'
  }
]

const getTypeIcon = (type: Deadline['type']) => {
  switch (type) {
    case 'video':
      return Film
    case 'writing':
      return Pencil
    default:
      return Film
  }
}

const getTypeGradient = (type: Deadline['type']) => {
  switch (type) {
    case 'video':
      return 'from-cantaloupe to-cassis'
    case 'writing':
      return 'from-neo-mint to-purist-blue'
    default:
      return 'from-mellow-yellow to-cantaloupe'
  }
}

const getPriorityBadge = (priority: Deadline['priority']) => {
  switch (priority) {
    case 'urgent':
      return (
        <Badge className="bg-gradient-to-r from-cantaloupe to-cassis text-white border-0 shadow-glow-sm">
          Urgent
        </Badge>
      )
    case 'high':
      return (
        <Badge className="bg-gradient-to-r from-mellow-yellow to-cantaloupe text-white border-0">
          High
        </Badge>
      )
    case 'medium':
      return (
        <Badge variant="outline" className="bg-white/20 dark:bg-gray-800/20">
          Medium
        </Badge>
      )
    default:
      return null
  }
}

export function UpcomingDeadlinesSection({ deadlines = defaultDeadlines }: UpcomingDeadlinesSectionProps) {
  return (
    <Card className="neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cantaloupe to-cassis blur-sm opacity-70"></div>
            <Clock className="relative h-5 w-5 text-cantaloupe dark:text-cassis" />
          </div>
          <h2 className="text-lg font-bold">Upcoming Deadlines</h2>
        </div>

        <div className="space-y-4">
          {deadlines.map((deadline) => {
            const IconComponent = getTypeIcon(deadline.type)
            const gradientClass = getTypeGradient(deadline.type)

            return (
              <motion.div
                key={deadline.id}
                className="group flex items-start gap-4 p-4 rounded-xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center flex-shrink-0 shadow-glow-sm`}>
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{deadline.title}</p>
                    {getPriorityBadge(deadline.priority)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{deadline.dueDate}</p>
                  <div className="h-1 w-full bg-white/20 dark:bg-gray-700/20 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${gradientClass} rounded-full`}
                      style={{ width: `${deadline.progress}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
