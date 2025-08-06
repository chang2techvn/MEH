"use client"

/* eslint-disable bem/classname */

import { TabsContent } from "@/components/ui/tabs"

import { TabsTrigger } from "@/components/ui/tabs"

import { TabsList } from "@/components/ui/tabs"

import { Tabs } from "@/components/ui/tabs"

import { TooltipContent } from "@/components/ui/tooltip"

import { Button } from "@/components/ui/button"

import { TooltipTrigger } from "@/components/ui/tooltip"

import { Tooltip } from "@/components/ui/tooltip"

import { TooltipProvider } from "@/components/ui/tooltip"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, Save, RefreshCw, Video, Settings, CheckCircle, Clock, Tag } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getVideoSettings, updateVideoSettings, resetVideoSettings } from "@/app/actions/admin-settings"
import type { VideoSettings } from "@/app/actions/admin-settings"
import { useMobile } from "@/hooks/use-mobile"
import { DailyVideoTab } from "./components/daily-video-tab"
import { AutomationSettingsTab } from "./components/automation-settings-tab"
import { TopicsManagementTab } from "./components/topics-management-tab"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
}

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
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

const pulse = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.02, 1],
    transition: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
  },
}

export default function VideoSettingsPage() {
  const { theme } = useTheme()
  const isMobile = useMobile()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")

  const [settings, setSettings] = useState<VideoSettings>({
    minWatchTime: 180,
    maxVideoDuration: 300,
    autoPublish: true,
    enforceWatchTime: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [activeTab, setActiveTab] = useState(tabParam || "daily-video")
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)

  // Handle success animation with auto-dismiss
  const showSuccessWithAutoDismiss = useCallback(() => {
    setShowSuccessAnimation(true)
    
    // Auto-dismiss after 2 seconds
    const timeoutId = setTimeout(() => {
      setShowSuccessAnimation(false)
    }, 2000)

    // Cleanup function to prevent memory leaks
    return () => clearTimeout(timeoutId)
  }, [])

  // Clear animation on unmount
  useEffect(() => {
    return () => {
      setShowSuccessAnimation(false)
    }
  }, [])

  // Format seconds to minutes and seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/admin/video-settings?tab=${value}`, { scroll: false })
  }

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const data = await getVideoSettings()
        setSettings(data)
      } catch (error) {
        console.error("Error fetching settings:", error)
        toast({
          title: "Error",
          description: "Failed to load settings. Using defaults.",
          variant: "destructive",
        })
      } finally {
        setTimeout(() => setLoading(false), 800) // Add slight delay for animation
      }
    }

    fetchSettings()
  }, [])

  // Handle settings change
  const handleChange = (field: keyof VideoSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  // Handle save
  const handleSave = async () => {
    try {
      setSaving(true)

      // Validate settings
      if (settings.minWatchTime < 30) {
        toast({
          title: "Invalid watch time",
          description: "Minimum watch time should be at least 30 seconds",
          variant: "destructive",
        })
        return
      }

      if (settings.maxVideoDuration < settings.minWatchTime) {
        toast({
          title: "Invalid video duration",
          description: "Maximum video duration should be greater than minimum watch time",
          variant: "destructive",
        })
        return
      }

      // Save settings
      await updateVideoSettings(settings)

      // Show success animation with auto-dismiss
      showSuccessWithAutoDismiss()

      toast({
        title: "Settings saved",
        description: "Video settings have been updated successfully",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Handle reset
  const handleReset = async () => {
    try {
      setResetting(true)
      const defaultSettings = await resetVideoSettings()
      setSettings(defaultSettings)

      toast({
        title: "Settings reset",
        description: "Video settings have been reset to defaults",
      })
    } catch (error) {
      console.error("Error resetting settings:", error)
      toast({
        title: "Error",
        description: "Failed to reset settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setResetting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Video className="h-16 w-16 text-muted-foreground animate-pulse" />
            <motion.div
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-neo-mint flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            >
              <Settings className="h-3 w-3 text-white" />
            </motion.div>
          </div>
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-medium mb-2">Loading Video Settings</h3>
            <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-neo-mint to-purist-blue"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8 pb-20">
        {/* Success animation overlay */}
        <AnimatePresence>
          {showSuccessAnimation && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white dark:bg-gray-900 rounded-full p-8"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, rotate: 360 }}
                  transition={{ type: "spring", duration: 0.8 }}
                >
                  <CheckCircle className="h-20 w-20 text-green-500" />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div variants={slideUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue">
              Video Settings
            </h1>
            <p className="text-muted-foreground">Configure video requirements and content settings</p>
          </div>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={resetting}
                    className="relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-red-100 dark:bg-red-900/20 transform scale-0 group-hover:scale-100 transition-transform origin-center rounded-md"></span>
                    <span className="relative flex items-center gap-2">
                      {resetting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                      )}
                      Reset
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset all settings to default values</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0 relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform"></span>
              <span className="relative flex items-center gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Settings
              </span>
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeIn}>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger
                value="daily-video"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/10 data-[state=active]:to-purist-blue/10"
              >
                <Video className="h-4 w-4" />
                <span
                  className={
                    activeTab === "daily-video"
                      ? "bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue font-medium"
                      : ""
                  }
                >
                  Daily Video
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="automation"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/10 data-[state=active]:to-purist-blue/10"
              >
                <Settings className="h-4 w-4" />
                <span
                  className={
                    activeTab === "automation"
                      ? "bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue font-medium"
                      : ""
                  }
                >
                  Automation
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="topics"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/10 data-[state=active]:to-purist-blue/10"
              >
                <Tag className="h-4 w-4" />
                <span
                  className={
                    activeTab === "topics"
                      ? "bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue font-medium"
                      : ""
                  }
                >
                  Topics Management
                </span>
              </TabsTrigger>
            </TabsList>

            {/* Daily Video Tab */}
            <TabsContent value="daily-video" className="space-y-6">
              <DailyVideoTab onUpdate={showSuccessWithAutoDismiss} />
            </TabsContent>

            {/* Automation Settings Tab */}
            <TabsContent value="automation" className="space-y-6">
              <AutomationSettingsTab onUpdate={showSuccessWithAutoDismiss} />
            </TabsContent>

            {/* Topics Management Tab */}
            <TabsContent value="topics" className="space-y-6">
              <TopicsManagementTab onUpdate={showSuccessWithAutoDismiss} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
