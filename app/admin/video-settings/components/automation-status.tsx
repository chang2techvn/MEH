"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, CheckCircle, XCircle, AlertTriangle, Activity, Calendar, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { getAutomationStatus, triggerDailyVideoAutomation } from "@/app/actions/daily-video-admin"

// Animation variants
const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

interface AutomationStatusProps {
  onStatusUpdate?: () => void
}

export function AutomationStatus({ onStatusUpdate }: AutomationStatusProps) {
  const [status, setStatus] = useState<{
    hasToday: boolean
    lastRunTime: string | null
    nextRunTime: string
    isHealthy: boolean
    errors: string[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState(false)

  // Format time helper
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Calculate time until next run
  const getTimeUntilNextRun = (nextRunTime: string) => {
    const now = new Date()
    const nextRun = new Date(nextRunTime)
    const diffMs = nextRun.getTime() - now.getTime()
    
    if (diffMs <= 0) return 'Overdue'
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  // Load automation status
  const loadStatus = async () => {
    try {
      setLoading(true)
      const statusData = await getAutomationStatus()
      setStatus(statusData)
    } catch (error) {
      console.error('Error loading automation status:', error)
      toast({
        title: "Failed to load status",
        description: "Could not retrieve automation status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle manual trigger
  const handleManualTrigger = async () => {
    try {
      setTriggering(true)
      
      const result = await triggerDailyVideoAutomation()
      
      if (result.success) {
        toast({
          title: "Automation triggered",
          description: "Daily video automation has been started manually",
        })
        
        // Reload status after a short delay
        setTimeout(() => {
          loadStatus()
          onStatusUpdate?.()
        }, 2000)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Error triggering automation:', error)
      toast({
        title: "Trigger failed",
        description: error instanceof Error ? error.message : 'Failed to trigger automation',
        variant: "destructive",
      })
    } finally {
      setTriggering(false)
    }
  }

  // Load status on mount
  useEffect(() => {
    loadStatus()
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Automation Status
          </CardTitle>
          <CardDescription>Checking system health...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Automation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>Failed to load automation status</AlertDescription>
          </Alert>
          <Button onClick={loadStatus} variant="outline" className="mt-3">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
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
                <Activity className="h-5 w-5" />
                Automation Status
              </CardTitle>
              <CardDescription>Daily video generation system health</CardDescription>
            </div>
            <Button
              onClick={loadStatus}
              variant="ghost"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Overall Health Status */}
            <div className="flex items-center gap-3">
              {status.isHealthy ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              <div>
                <div className="font-semibold">
                  {status.isHealthy ? 'System Healthy' : 'Issues Detected'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {status.hasToday ? 
                    "Today's video is available" : 
                    "Today's video is missing"
                  }
                </div>
              </div>
            </div>

            {/* Status Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Today's Video Status */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Today's Video</span>
                </div>
                <Badge 
                  variant={status.hasToday ? "default" : "destructive"}
                  className="w-fit"
                >
                  {status.hasToday ? "Generated" : "Missing"}
                </Badge>
              </div>

              {/* Next Run Time */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Next Run</span>
                </div>
                <div className="text-sm">
                  <div>{formatDateTime(status.nextRunTime)}</div>
                  <div className="text-muted-foreground">
                    in {getTimeUntilNextRun(status.nextRunTime)}
                  </div>
                </div>
              </div>
            </div>

            {/* Last Run Time */}
            {status.lastRunTime && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-medium">Last Generated</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDateTime(status.lastRunTime)}
                </div>
              </div>
            )}

            {/* Errors */}
            {status.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-1">System Issues:</div>
                  <ul className="text-sm space-y-1">
                    {status.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Manual Trigger */}
            <div className="pt-4 border-t">
              <Button
                onClick={handleManualTrigger}
                disabled={triggering}
                className="w-full"
                variant={status.hasToday ? "outline" : "default"}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${triggering ? 'animate-spin' : ''}`} />
                {triggering ? 'Running Automation...' : 'Run Daily Automation Now'}
              </Button>
              {status.hasToday && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  This will regenerate today's video and practice challenges
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
