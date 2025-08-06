"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Video, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getVideoGenerationHistory } from "@/app/actions/daily-video-admin"

// Animation variants
const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

interface VideoGenerationHistoryProps {
  onRefresh?: () => void
}

export function VideoGenerationHistory({ onRefresh }: VideoGenerationHistoryProps) {
  const [history, setHistory] = useState<{
    date: string
    daily: { id: string; title: string; created_at: string | null } | null
    practice: { id: string; title: string; difficulty: string; created_at: string | null }[]
  }[]>([])
  const [loading, setLoading] = useState(true)

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today'
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  // Format time helper
  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/10 text-green-600 border-green-200'
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200'
      case 'advanced':
        return 'bg-red-500/10 text-red-600 border-red-200'
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  // Load history
  const loadHistory = async () => {
    try {
      setLoading(true)
      const historyData = await getVideoGenerationHistory()
      setHistory(historyData)
    } catch (error) {
      console.error('Error loading video generation history:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load history on mount
  useEffect(() => {
    loadHistory()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Video Generation History
          </CardTitle>
          <CardDescription>Loading recent video generation data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(7)].map((_, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Video Generation History
              </CardTitle>
              <CardDescription>Last 7 days of video generation activity</CardDescription>
            </div>
            <Button
              onClick={loadHistory}
              variant="ghost"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {history.map((day, index) => (
              <motion.div
                key={day.date}
                variants={slideUp}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{formatDate(day.date)}</span>
                    <span className="text-sm text-muted-foreground">{day.date}</span>
                  </div>
                  
                  {/* Status indicators */}
                  <div className="flex items-center gap-2">
                    {day.daily ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <Badge variant="outline" className="text-xs">
                      {day.practice.length}/3 Practice
                    </Badge>
                  </div>
                </div>

                {/* Daily Challenge */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Video className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">Daily Challenge:</span>
                  </div>
                  
                  {day.daily ? (
                    <div className="ml-5 text-sm">
                      <div className="font-medium text-foreground line-clamp-1">
                        {day.daily.title}
                      </div>
                      <div className="text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Generated at {formatTime(day.daily.created_at)}
                      </div>
                    </div>
                  ) : (
                    <div className="ml-5 text-sm text-muted-foreground">
                      No daily challenge generated
                    </div>
                  )}
                </div>

                {/* Practice Challenges */}
                {day.practice.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Video className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-medium">Practice Challenges:</span>
                    </div>
                    
                    <div className="ml-5 space-y-1">
                      {day.practice.map((practice, practiceIndex) => (
                        <div key={practiceIndex} className="flex items-center gap-2 text-sm">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getDifficultyColor(practice.difficulty)}`}
                          >
                            {practice.difficulty}
                          </Badge>
                          <span className="flex-1 line-clamp-1">{practice.title}</span>
                          <span className="text-muted-foreground text-xs">
                            {formatTime(practice.created_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            
            {history.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No video generation history available</p>
              </div>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
