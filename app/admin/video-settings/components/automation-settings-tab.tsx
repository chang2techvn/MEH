"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Clock, Settings, CheckCircle, AlertTriangle, Info } from "lucide-react"
import { toast } from "@/hooks/use-toast"

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
      staggerChildren: 0.1,
    },
  },
}

interface AutomationSettings {
  enabled: boolean
  scheduleTime: string
  timezone: string
  minDuration: number
  maxDuration: number
  preferredTopics: string[]
  topicRotationDays: number
  requireTranscript: boolean
}

interface AutomationSettingsTabProps {
  onUpdate?: () => void
}

export function AutomationSettingsTab({ onUpdate }: AutomationSettingsTabProps) {
  const [settings, setSettings] = useState<AutomationSettings>({
    enabled: true,
    scheduleTime: "23:59",
    timezone: "Asia/Ho_Chi_Minh",
    minDuration: 180, // 3 minutes
    maxDuration: 1800, // 30 minutes (Gemini limit)
    preferredTopics: [],
    topicRotationDays: 7,
    requireTranscript: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Available timezones
  const timezones = [
    { value: "Asia/Ho_Chi_Minh", label: "Ho Chi Minh City (GMT+7)" },
    { value: "Asia/Bangkok", label: "Bangkok (GMT+7)" },
    { value: "Asia/Singapore", label: "Singapore (GMT+8)" },
    { value: "Asia/Tokyo", label: "Tokyo (GMT+9)" },
    { value: "America/New_York", label: "New York (GMT-5/-4)" },
    { value: "America/Los_Angeles", label: "Los Angeles (GMT-8/-7)" },
    { value: "Europe/London", label: "London (GMT+0/+1)" },
    { value: "UTC", label: "UTC (GMT+0)" }
  ]

  // Format duration in minutes
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  }

  // Load automation settings
  const loadSettings = async () => {
    try {
      setLoading(true)
      
      // Get settings from daily_video_settings table
      const response = await fetch('/api/admin/automation-settings')
      if (!response.ok) {
        throw new Error('Failed to load automation settings')
      }
      
      const data = await response.json()
      
      if (data.settings) {
        setSettings({
          enabled: data.settings.auto_fetch_enabled || true,
          scheduleTime: data.settings.schedule_time || "23:59",
          timezone: data.settings.timezone || "Asia/Ho_Chi_Minh",
          minDuration: data.settings.min_watch_time || 180,
          maxDuration: data.settings.max_watch_time || 1800,
          preferredTopics: data.settings.preferred_topics || [],
          topicRotationDays: data.settings.topic_rotation_days || 7,
          requireTranscript: data.settings.require_transcript !== false
        })
      }
    } catch (error) {
      console.error('Error loading automation settings:', error)
      toast({
        title: "Error loading settings",
        description: "Using default automation settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Save automation settings
  const saveSettings = async () => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/admin/automation-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          auto_fetch_enabled: settings.enabled,
          schedule_time: settings.scheduleTime,
          timezone: settings.timezone,
          min_watch_time: settings.minDuration,
          max_watch_time: settings.maxDuration,
          preferred_topics: settings.preferredTopics,
          topic_rotation_days: settings.topicRotationDays,
          require_transcript: settings.requireTranscript
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save automation settings')
      }
      
      toast({
        title: "Settings saved",
        description: "Automation settings have been updated successfully"
      })
      
      onUpdate?.()
    } catch (error) {
      console.error('Error saving automation settings:', error)
      toast({
        title: "Error saving settings",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading automation settings...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Automation Status */}
      <motion.div variants={slideUp}>
        <Alert className={settings.enabled ? "border-green-200 bg-green-50 dark:bg-green-950/20" : "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20"}>
          <div className="flex items-center gap-2">
            {settings.enabled ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
            <AlertDescription className={settings.enabled ? "text-green-800 dark:text-green-200" : "text-yellow-800 dark:text-yellow-200"}>
              {settings.enabled ? (
                <>Daily video automation is <strong>enabled</strong>. Videos will be generated automatically at {settings.scheduleTime} ({settings.timezone}).</>
              ) : (
                <>Daily video automation is <strong>disabled</strong>. Videos must be generated manually.</>
              )}
            </AlertDescription>
          </div>
        </Alert>
      </motion.div>

      {/* Main Settings */}
      <motion.div variants={slideUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Automation Configuration
            </CardTitle>
            <CardDescription>
              Configure when and how daily videos are automatically generated
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="automation-enabled" className="text-base font-medium">
                  Enable Daily Automation
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically generate new daily videos according to the schedule
                </p>
              </div>
              <Switch
                id="automation-enabled"
                checked={settings.enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
              />
            </div>

            {/* Schedule Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule-time">Schedule Time</Label>
                <Input
                  id="schedule-time"
                  type="time"
                  value={settings.scheduleTime}
                  onChange={(e) => setSettings(prev => ({ ...prev, scheduleTime: e.target.value }))}
                  disabled={!settings.enabled}
                />
                <p className="text-xs text-muted-foreground">
                  Time when daily videos are generated
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select 
                  value={settings.timezone} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}
                  disabled={!settings.enabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Timezone for the schedule
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Video Requirements */}
      <motion.div variants={slideUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Video Requirements
            </CardTitle>
            <CardDescription>
              Configure the requirements for automatically selected videos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Duration Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-duration">Minimum Duration</Label>
                <Input
                  id="min-duration"
                  type="number"
                  min="60"
                  max="3600"
                  step="30"
                  value={settings.minDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, minDuration: parseInt(e.target.value) || 180 }))}
                  disabled={!settings.enabled}
                />
                <p className="text-xs text-muted-foreground">
                  {formatDuration(settings.minDuration)} minimum
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-duration">Maximum Duration</Label>
                <Input
                  id="max-duration"
                  type="number"
                  min="300"
                  max="1800"
                  step="30"
                  value={settings.maxDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxDuration: parseInt(e.target.value) || 1800 }))}
                  disabled={!settings.enabled}
                />
                <p className="text-xs text-muted-foreground">
                  {formatDuration(settings.maxDuration)} maximum (Gemini limit: 30 min)
                </p>
              </div>
            </div>

            {/* Transcript Requirement */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="require-transcript" className="text-base font-medium">
                  Require Transcript
                </Label>
                <p className="text-sm text-muted-foreground">
                  Only select videos where transcript extraction is successful
                </p>
              </div>
              <Switch
                id="require-transcript"
                checked={settings.requireTranscript}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireTranscript: checked }))}
                disabled={!settings.enabled}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={slideUp} className="flex justify-end">
        <Button 
          onClick={saveSettings} 
          disabled={saving || !settings.enabled}
          className="min-w-[140px]"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Settings className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </motion.div>

      {/* Info Notice */}
      <motion.div variants={slideUp}>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> Changes to automation settings will take effect from the next scheduled run. 
            Current cron job runs daily at 23:59 Vietnam time. You can manually trigger video generation 
            from the "Daily Video" tab if needed.
          </AlertDescription>
        </Alert>
      </motion.div>
    </motion.div>
  )
}
