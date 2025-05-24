"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Loader2,
  Save,
  RefreshCw,
  Clock,
  Video,
  Settings,
  CheckCircle,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
  Upload,
  Youtube,
  Play,
  Check,
  Zap,
  FileVideo,
  Shield,
  Sparkles,
  Lightbulb,
  Trash2,
  Plus,
  ChevronRight,
  BarChart3,
  Sliders,
  Filter,
  Maximize2,
  Minimize2,
  HelpCircle,
  Bookmark,
  Star,
  Palette,
  Layers,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getVideoSettings, updateVideoSettings, resetVideoSettings } from "@/app/actions/admin-settings"
import type { VideoSettings } from "@/app/actions/admin-settings"
import YouTubeUrlManager from "../components/youtube-url-manager"
import { useMobile } from "@/hooks/use-mobile"

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
  const videoPreviewRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const [settings, setSettings] = useState<VideoSettings>({
    minWatchTime: 180,
    maxVideoDuration: 300,
    autoPublish: true,
    enforceWatchTime: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [activeTab, setActiveTab] = useState(tabParam || "general")
  const [previewProgress, setPreviewProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

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

      // Show success animation
      setShowSuccessAnimation(true)
      setTimeout(() => setShowSuccessAnimation(false), 2000)

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

  // Handle video preview play
  const handlePlayPreview = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setPreviewProgress(0)
      return
    }

    setIsPlaying(true)
    let progress = 0
    const interval = setInterval(() => {
      progress += 1
      const percentage = (progress / settings.minWatchTime) * 100
      setPreviewProgress(Math.min(percentage, 100))

      if (progress >= settings.minWatchTime) {
        clearInterval(interval)
        setTimeout(() => {
          setIsPlaying(false)
          setPreviewProgress(0)
        }, 1000)
      }
    }, 1000)
  }

  // Toggle fullscreen for video preview
  const toggleFullscreen = () => {
    if (!videoPreviewRef.current) return

    if (!isFullscreen) {
      if (videoPreviewRef.current.requestFullscreen) {
        videoPreviewRef.current.requestFullscreen()
        setIsFullscreen(true)
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Toggle card expansion
  const toggleCardExpansion = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId)
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
                value="general"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/10 data-[state=active]:to-purist-blue/10"
              >
                <Settings className="h-4 w-4" />
                <span
                  className={
                    activeTab === "general"
                      ? "bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue font-medium"
                      : ""
                  }
                >
                  General
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="watch-time"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/10 data-[state=active]:to-purist-blue/10"
              >
                <Clock className="h-4 w-4" />
                <span
                  className={
                    activeTab === "watch-time"
                      ? "bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue font-medium"
                      : ""
                  }
                >
                  Watch Time
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/10 data-[state=active]:to-purist-blue/10"
              >
                <Video className="h-4 w-4" />
                <span
                  className={
                    activeTab === "content"
                      ? "bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue font-medium"
                      : ""
                  }
                >
                  Content
                </span>
              </TabsTrigger>
            </TabsList>

            {/* General Settings Tab */}
            <TabsContent value="general" className="space-y-6">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Main Settings Card */}
                <motion.div variants={slideUp} className="lg:col-span-2">
                  <Card className="overflow-hidden border-t-4 border-t-neo-mint shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-neo-mint/10 to-purist-blue/10">
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-neo-mint" />
                        General Settings
                      </CardTitle>
                      <CardDescription>Configure general video settings for your platform</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <motion.div
                        className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                        whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      >
                        <div className="space-y-0.5">
                          <Label htmlFor="autoPublish" className="text-base">
                            Auto-publish Submissions
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically publish user submissions to the community feed
                          </p>
                        </div>
                        <Switch
                          id="autoPublish"
                          checked={settings.autoPublish}
                          onCheckedChange={(checked) => handleChange("autoPublish", checked)}
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-neo-mint data-[state=checked]:to-purist-blue"
                        />
                      </motion.div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div className="space-y-2" whileHover={{ y: -2 }}>
                          <Label htmlFor="maxVideoDuration" className="flex items-center gap-2">
                            <FileVideo className="h-4 w-4 text-neo-mint" />
                            Maximum Video Duration
                          </Label>
                          <div className="flex items-center gap-4">
                            <Slider
                              id="maxVideoDuration"
                              min={60}
                              max={600}
                              step={30}
                              value={[settings.maxVideoDuration]}
                              onValueChange={(value) => handleChange("maxVideoDuration", value[0])}
                              className="flex-1"
                            />
                            <div className="w-16 p-2 text-center rounded-md border bg-muted/30 font-mono">
                              {formatTime(settings.maxVideoDuration)}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Videos longer than this will be automatically trimmed.
                          </p>
                        </motion.div>

                        <motion.div
                          className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20"
                          whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                        >
                          <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-700 dark:text-blue-400">Video Processing</h4>
                              <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                                Videos are automatically processed to ensure they meet your requirements. Longer videos
                                will be trimmed to the maximum duration.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      <motion.div
                        className="p-4 rounded-lg border bg-gradient-to-r from-neo-mint/5 to-purist-blue/5"
                        whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      >
                        <div className="flex items-start gap-3">
                          <Sparkles className="h-5 w-5 text-neo-mint mt-0.5" />
                          <div>
                            <h4 className="font-medium">Video Enhancement</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Enable AI-powered video enhancement to improve video quality automatically.
                            </p>
                            <div className="mt-3 flex items-center gap-3">
                              <Switch id="videoEnhancement" defaultChecked={true} />
                              <Label htmlFor="videoEnhancement" className="text-sm cursor-pointer">
                                Enable enhancement
                              </Label>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </CardContent>
                    <CardFooter className="bg-muted/20 flex justify-between py-4">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Last updated: Today at 10:45 AM
                      </div>
                      <Badge variant="outline" className="bg-neo-mint/10 text-neo-mint border-neo-mint/20">
                        Active
                      </Badge>
                    </CardFooter>
                  </Card>
                </motion.div>

                {/* Stats Card */}
                <motion.div variants={slideUp}>
                  <Card className="overflow-hidden border-t-4 border-t-purist-blue shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-purist-blue/10 to-neo-mint/10">
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purist-blue" />
                        Video Statistics
                      </CardTitle>
                      <CardDescription>Current video usage statistics</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Average Watch Time</span>
                            <span className="font-medium">2:45</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-purist-blue to-neo-mint"
                              style={{ width: "68%" }}
                              initial={{ width: 0 }}
                              animate={{ width: "68%" }}
                              transition={{ duration: 1, delay: 0.2 }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Target: {formatTime(settings.minWatchTime)}</span>
                            <span>68% of target</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Video Completion Rate</span>
                            <span className="font-medium">76%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-purist-blue to-neo-mint"
                              style={{ width: "76%" }}
                              initial={{ width: 0 }}
                              animate={{ width: "76%" }}
                              transition={{ duration: 1, delay: 0.3 }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Video Uploads</span>
                            <span className="font-medium">124 / week</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-purist-blue to-neo-mint"
                              style={{ width: "82%" }}
                              initial={{ width: 0 }}
                              animate={{ width: "82%" }}
                              transition={{ duration: 1, delay: 0.4 }}
                            />
                          </div>
                        </div>

                        <div className="pt-2 grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg border bg-muted/30 text-center">
                            <div className="text-2xl font-bold text-purist-blue">42</div>
                            <div className="text-xs text-muted-foreground">Active Videos</div>
                          </div>
                          <div className="p-3 rounded-lg border bg-muted/30 text-center">
                            <div className="text-2xl font-bold text-neo-mint">87%</div>
                            <div className="text-xs text-muted-foreground">Engagement</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted/20 flex justify-center py-4">
                      <Button variant="outline" size="sm" className="w-full">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Detailed Analytics
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              </motion.div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Upload Settings Card */}
                <motion.div variants={slideUp}>
                  <Card
                    className={`overflow-hidden transition-all duration-300 ${expandedCard === "upload" ? "col-span-2" : ""}`}
                  >
                    <CardHeader className="bg-gradient-to-r from-neo-mint/5 to-purist-blue/5 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Upload className="h-5 w-5 text-neo-mint" />
                          Upload Settings
                        </CardTitle>
                        <CardDescription>Configure video upload settings</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleCardExpansion("upload")}
                        className="h-8 w-8"
                      >
                        {expandedCard === "upload" ? (
                          <Minimize2 className="h-4 w-4" />
                        ) : (
                          <Maximize2 className="h-4 w-4" />
                        )}
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      <AnimatePresence>
                        <motion.div
                          className="space-y-4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <FileVideo className="h-4 w-4 text-neo-mint" />
                              Maximum File Size
                            </Label>
                            <div className="flex items-center gap-2">
                              <Slider defaultValue={[100]} max={500} step={10} className="flex-1" />
                              <div className="w-16 p-2 text-center rounded-md border bg-muted/30 font-mono">100 MB</div>
                            </div>
                            <p className="text-xs text-muted-foreground">Maximum file size for video uploads</p>
                          </div>

                          <div className="space-y-2">
                            <Label>Allowed Formats</Label>
                            <div className="flex flex-wrap gap-2">
                              <Badge className="bg-neo-mint/20 text-neo-mint hover:bg-neo-mint/30 border-none">
                                MP4
                              </Badge>
                              <Badge className="bg-purist-blue/20 text-purist-blue hover:bg-purist-blue/30 border-none">
                                WebM
                              </Badge>
                              <Badge className="bg-muted hover:bg-muted/80 border-none">MOV</Badge>
                              <Button variant="outline" size="sm" className="h-6 px-2 rounded-full">
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </Button>
                            </div>
                          </div>

                          {expandedCard === "upload" && (
                            <motion.div
                              className="space-y-4 pt-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              <div className="space-y-2">
                                <Label>Video Processing</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="flex items-center space-x-2">
                                    <Switch id="autoCompress" defaultChecked />
                                    <Label htmlFor="autoCompress">Auto-compress large videos</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Switch id="autoTranscode" defaultChecked />
                                    <Label htmlFor="autoTranscode">Auto-transcode to MP4</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Switch id="generateThumbnail" defaultChecked />
                                    <Label htmlFor="generateThumbnail">Generate thumbnails</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Switch id="extractMetadata" defaultChecked />
                                    <Label htmlFor="extractMetadata">Extract metadata</Label>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Upload Restrictions</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="flex items-center space-x-2">
                                    <Switch id="requireApproval" />
                                    <Label htmlFor="requireApproval">Require admin approval</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Switch id="limitUploadsPerDay" />
                                    <Label htmlFor="limitUploadsPerDay">Limit uploads per day</Label>
                                  </div>
                                </div>
                              </div>

                              <div className="p-4 rounded-lg border bg-amber-50 dark:bg-amber-950/20">
                                <div className="flex items-start gap-3">
                                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium text-amber-700 dark:text-amber-400">Storage Usage</h4>
                                    <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                                      You are currently using 68% of your storage quota. Consider enabling
                                      auto-compression to save space.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* YouTube Integration Card */}
                <motion.div variants={slideUp}>
                  <Card
                    className={`overflow-hidden transition-all duration-300 ${expandedCard === "youtube" ? "col-span-2" : ""}`}
                  >
                    <CardHeader className="bg-gradient-to-r from-purist-blue/5 to-neo-mint/5 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Youtube className="h-5 w-5 text-purist-blue" />
                          YouTube Integration
                        </CardTitle>
                        <CardDescription>Configure YouTube video settings</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleCardExpansion("youtube")}
                        className="h-8 w-8"
                      >
                        {expandedCard === "youtube" ? (
                          <Minimize2 className="h-4 w-4" />
                        ) : (
                          <Maximize2 className="h-4 w-4" />
                        )}
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      <AnimatePresence>
                        <motion.div
                          className="space-y-4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="space-y-0.5">
                              <Label className="text-base">Allow YouTube Videos</Label>
                              <p className="text-sm text-muted-foreground">
                                Allow users to use YouTube videos for challenges
                              </p>
                            </div>
                            <Switch
                              defaultChecked
                              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purist-blue data-[state=checked]:to-neo-mint"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Key className="h-4 w-4 text-purist-blue" />
                              YouTube API Key
                            </Label>
                            <div className="flex gap-2">
                              <Input type="password" value="••••••••••••••••••••••" className="font-mono" disabled />
                              <Button variant="outline" size="icon" className="shrink-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Used for fetching video metadata and transcripts
                            </p>
                          </div>

                          {expandedCard === "youtube" && (
                            <motion.div
                              className="space-y-4 pt-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              <div className="space-y-2">
                                <Label>YouTube Features</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="flex items-center space-x-2">
                                    <Switch id="fetchTranscripts" defaultChecked />
                                    <Label htmlFor="fetchTranscripts">Fetch transcripts</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Switch id="fetchComments" />
                                    <Label htmlFor="fetchComments">Fetch comments</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Switch id="embedPlayer" defaultChecked />
                                    <Label htmlFor="embedPlayer">Embed player</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Switch id="allowPlaylistImport" />
                                    <Label htmlFor="allowPlaylistImport">Allow playlist import</Label>
                                  </div>
                                </div>
                              </div>

                              <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
                                <div className="flex items-start gap-3">
                                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium text-blue-700 dark:text-blue-400">API Usage</h4>
                                    <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                                      Your YouTube API quota usage is at 42% for today. The quota resets at midnight
                                      Pacific Time.
                                    </p>
                                    <div className="mt-2 h-2 bg-blue-100 dark:bg-blue-800 rounded-full overflow-hidden">
                                      <div className="h-full bg-blue-500 dark:bg-blue-400" style={{ width: "42%" }} />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Content Restrictions</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="flex items-center space-x-2">
                                    <Switch id="restrictContentRating" defaultChecked />
                                    <Label htmlFor="restrictContentRating">Restrict content rating</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Switch id="allowUnlistedVideos" defaultChecked />
                                    <Label htmlFor="allowUnlistedVideos">Allow unlisted videos</Label>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Advanced Settings */}
              <motion.div variants={slideUp}>
                <Card>
                  <CardHeader className="bg-gradient-to-r from-neo-mint/5 to-purist-blue/5">
                    <CardTitle className="flex items-center gap-2">
                      <Sliders className="h-5 w-5 text-neo-mint" />
                      Advanced Settings
                    </CardTitle>
                    <CardDescription>Fine-tune advanced video configuration options</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <motion.div
                        className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                        whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="h-5 w-5 text-neo-mint" />
                          <h3 className="font-medium">Content Moderation</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="aiModeration" className="text-sm">
                              AI Moderation
                            </Label>
                            <Switch id="aiModeration" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="humanReview" className="text-sm">
                              Human Review
                            </Label>
                            <Switch id="humanReview" />
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                        whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Zap className="h-5 w-5 text-purist-blue" />
                          <h3 className="font-medium">Performance</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="adaptiveStreaming" className="text-sm">
                              Adaptive Streaming
                            </Label>
                            <Switch id="adaptiveStreaming" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="preloadVideos" className="text-sm">
                              Preload Videos
                            </Label>
                            <Switch id="preloadVideos" defaultChecked />
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                        whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Palette className="h-5 w-5 text-neo-mint" />
                          <h3 className="font-medium">Appearance</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="customBranding" className="text-sm">
                              Custom Branding
                            </Label>
                            <Switch id="customBranding" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="customControls" className="text-sm">
                              Custom Controls
                            </Label>
                            <Switch id="customControls" defaultChecked />
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors md:col-span-2 lg:col-span-3"
                        whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Layers className="h-5 w-5 text-purist-blue" />
                          <h3 className="font-medium">Video Processing Pipeline</h3>
                        </div>
                        <div className="relative">
                          <div className="flex justify-between mb-2">
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-none"
                            >
                              Upload
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-none"
                            >
                              Process
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-none"
                            >
                              Analyze
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-none"
                            >
                              Optimize
                            </Badge>
                            <Badge variant="outline" className="bg-neo-mint/20 text-neo-mint border-none">
                              Publish
                            </Badge>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
                            <div className="h-full w-full bg-gradient-to-r from-green-500 via-blue-500 via-purple-500 via-amber-500 to-neo-mint" />
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-xs text-muted-foreground">
                            <div>Validation</div>
                            <div>Transcoding</div>
                            <div>AI Content Analysis</div>
                            <div>Compression</div>
                            <div>Distribution</div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Watch Time Tab */}
            <TabsContent value="watch-time" className="space-y-6">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Watch Time Requirements Card */}
                <motion.div variants={slideUp} className="lg:col-span-2">
                  <Card className="overflow-hidden border-t-4 border-t-neo-mint shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-neo-mint/10 to-purist-blue/10">
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-neo-mint" />
                        Watch Time Requirements
                      </CardTitle>
                      <CardDescription>Configure how long users must watch videos</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <motion.div
                        className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                        whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      >
                        <div className="space-y-0.5">
                          <Label htmlFor="enforceWatchTime" className="text-base">
                            Enforce Watch Time
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Require users to watch videos for the minimum time before proceeding
                          </p>
                        </div>
                        <Switch
                          id="enforceWatchTime"
                          checked={settings.enforceWatchTime}
                          onCheckedChange={(checked) => handleChange("enforceWatchTime", checked)}
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-neo-mint data-[state=checked]:to-purist-blue"
                        />
                      </motion.div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="minWatchTime" className="text-base flex items-center gap-2">
                            <Clock className="h-4 w-4 text-neo-mint" />
                            Minimum Watch Time
                          </Label>
                          <Badge
                            variant="outline"
                            className="font-mono bg-gradient-to-r from-neo-mint/10 to-purist-blue/10"
                          >
                            {formatTime(settings.minWatchTime)}
                          </Badge>
                        </div>

                        <Slider
                          id="minWatchTime"
                          min={30}
                          max={600}
                          step={30}
                          value={[settings.minWatchTime]}
                          onValueChange={(value) => handleChange("minWatchTime", value[0])}
                          className="w-full"
                        />

                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>30 seconds</span>
                          <span>5 minutes</span>
                          <span>10 minutes</span>
                        </div>

                        <p className="text-sm text-muted-foreground mt-2">
                          Users must watch videos for at least this amount of time before proceeding. Recommended: 180
                          seconds (3 minutes).
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.div
                          className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20 flex flex-col items-center text-center"
                          whileHover={{ y: -4, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
                          variants={pulse}
                          animate="animate"
                        >
                          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <h4 className="font-medium">Recommended</h4>
                          <p className="text-sm text-green-600 dark:text-green-400">3 minutes</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 border-green-200 text-green-600 hover:bg-green-100"
                            onClick={() => handleChange("minWatchTime", 180)}
                          >
                            Set
                          </Button>
                        </motion.div>

                        <motion.div
                          className="p-4 rounded-lg border bg-muted/30 flex flex-col items-center text-center"
                          whileHover={{ y: -4, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
                        >
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <h4 className="font-medium">Quick</h4>
                          <p className="text-sm text-muted-foreground">1 minute</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => handleChange("minWatchTime", 60)}
                          >
                            Set
                          </Button>
                        </motion.div>

                        <motion.div
                          className="p-4 rounded-lg border bg-muted/30 flex flex-col items-center text-center"
                          whileHover={{ y: -4, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
                        >
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2">
                            <Video className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <h4 className="font-medium">Thorough</h4>
                          <p className="text-sm text-muted-foreground">5 minutes</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => handleChange("minWatchTime", 300)}
                          >
                            Set
                          </Button>
                        </motion.div>
                      </div>

                      <motion.div
                        className="p-4 rounded-lg border bg-amber-50 dark:bg-amber-950/20"
                        whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-amber-700 dark:text-amber-400">Important Note</h4>
                            <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                              Setting a very long minimum watch time may frustrate users. We recommend keeping it
                              between 2-5 minutes for the best learning experience.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t p-6 bg-muted/20">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Info className="h-4 w-4" />
                        <span>Changes will apply to all new challenges</span>
                      </div>
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
                      >
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>

                {/* Watch Time Visualization Card */}
                <motion.div variants={slideUp}>
                  <Card className="overflow-hidden border-t-4 border-t-purist-blue shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-purist-blue/10 to-neo-mint/10">
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-purist-blue" />
                        Watch Time Visualization
                      </CardTitle>
                      <CardDescription>Preview how watch time appears to users</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="rounded-lg overflow-hidden border">
                        <div ref={videoPreviewRef} className="aspect-video bg-gray-100 dark:bg-gray-800 relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Video className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                          </div>

                          <div className="absolute top-4 right-4 flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/30 text-white h-8 w-8"
                              onClick={toggleFullscreen}
                            >
                              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                            </Button>
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
                            <div className="flex items-center gap-3 mb-2 text-white">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`rounded-full ${isPlaying ? "bg-white/30" : "bg-white/20"} backdrop-blur-sm hover:bg-white/30 text-white`}
                                onClick={handlePlayPreview}
                              >
                                {isPlaying ? (
                                  <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                  </motion.div>
                                ) : (
                                  <Play className="h-5 w-5 ml-0.5" />
                                )}
                              </Button>

                              <div className="flex-1 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <div className="text-sm font-medium">
                                  {isPlaying
                                    ? formatTime(Math.floor((previewProgress / 100) * settings.minWatchTime))
                                    : "0:00"}{" "}
                                  / {formatTime(settings.minWatchTime)}
                                </div>
                              </div>
                            </div>

                            <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
                              <motion.div
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-neo-mint to-purist-blue"
                                style={{ width: `${previewProgress}%` }}
                                initial={{ width: "0%" }}
                                animate={{ width: `${previewProgress}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>

                            <div className="mt-2 flex justify-between items-center">
                              <div className="text-xs text-white/80">
                                <span>Watch {formatTime(settings.minWatchTime)} to continue</span>
                              </div>
                              <div className="text-xs font-medium text-white/80">{Math.round(previewProgress)}%</div>
                            </div>
                          </div>

                          {/* Completion animation */}
                          <AnimatePresence>
                            {previewProgress >= 100 && (
                              <motion.div
                                className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <motion.div
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.8, opacity: 0 }}
                                  transition={{ type: "spring", duration: 0.5 }}
                                  className="bg-white dark:bg-gray-800 rounded-full p-6"
                                >
                                  <CheckCircle className="h-12 w-12 text-green-500" />
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div className="mt-6 space-y-4">
                        <div className="space-y-2">
                          <Label>Watch Time Behavior</Label>
                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center space-x-2">
                              <Switch id="showProgressBar" defaultChecked />
                              <Label htmlFor="showProgressBar">Show progress bar</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch id="showRemainingTime" defaultChecked />
                              <Label htmlFor="showRemainingTime">Show remaining time</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch id="showCompletionAnimation" defaultChecked />
                              <Label htmlFor="showCompletionAnimation">Show completion animation</Label>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
                          <div className="flex items-start gap-3">
                            <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-700 dark:text-blue-400">User Experience Tip</h4>
                              <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                                Clear visual feedback helps users understand how much time they need to watch. This
                                reduces frustration and improves completion rates.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted/20 flex justify-center py-4 border-t">
                      <Button variant="outline" size="sm" className="w-full" onClick={handlePlayPreview}>
                        <Play className="h-4 w-4 mr-2" />
                        Test Watch Time Experience
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Watch Time Analytics Card */}
              <motion.div variants={slideUp}>
                <Card>
                  <CardHeader className="bg-gradient-to-r from-neo-mint/5 to-purist-blue/5">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-neo-mint" />
                      Watch Time Analytics
                    </CardTitle>
                    <CardDescription>Insights into user watch time behavior</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <div className="h-64 bg-muted/30 rounded-lg border flex items-center justify-center">
                          <div className="text-center p-6">
                            <BarChart3 className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-medium mb-2">Watch Time Distribution</h3>
                            <p className="text-sm text-muted-foreground">
                              Chart showing distribution of user watch times across all videos
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="space-y-6">
                          <div className="p-4 rounded-lg border bg-muted/30">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Clock className="h-4 w-4 text-neo-mint" />
                              Average Watch Time
                            </h4>
                            <div className="text-3xl font-bold mb-2">2:45</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <ChevronRight className="h-3 w-3 text-green-500" />
                              <span className="text-green-500">+12%</span> from last month
                            </div>
                          </div>

                          <div className="p-4 rounded-lg border bg-muted/30">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-purist-blue" />
                              Completion Rate
                            </h4>
                            <div className="text-3xl font-bold mb-2">76%</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <ChevronRight className="h-3 w-3 text-green-500" />
                              <span className="text-green-500">+8%</span> from last month
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg border bg-muted/30 text-center">
                        <div className="text-2xl font-bold text-neo-mint">87%</div>
                        <div className="text-xs text-muted-foreground">Mobile Completion</div>
                      </div>
                      <div className="p-4 rounded-lg border bg-muted/30 text-center">
                        <div className="text-2xl font-bold text-purist-blue">92%</div>
                        <div className="text-xs text-muted-foreground">Desktop Completion</div>
                      </div>
                      <div className="p-4 rounded-lg border bg-muted/30 text-center">
                        <div className="text-2xl font-bold text-amber-500">3:12</div>
                        <div className="text-xs text-muted-foreground">Peak Watch Time</div>
                      </div>
                      <div className="p-4 rounded-lg border bg-muted/30 text-center">
                        <div className="text-2xl font-bold text-red-500">1:05</div>
                        <div className="text-xs text-muted-foreground">Drop-off Point</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Watch Time Recommendations */}
              <motion.div variants={slideUp}>
                <Card>
                  <CardHeader className="bg-gradient-to-r from-purist-blue/5 to-neo-mint/5">
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-purist-blue" />
                      Watch Time Recommendations
                    </CardTitle>
                    <CardDescription>AI-powered suggestions to improve watch time</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <motion.div
                        className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20"
                        whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <Star className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-green-700 dark:text-green-400">Optimal Watch Time</h4>
                            <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                              Based on your user data, the optimal minimum watch time is 2:30 minutes. This balances
                              completion rates with learning effectiveness.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3 border-green-200 text-green-600 hover:bg-green-100"
                              onClick={() => handleChange("minWatchTime", 150)}
                            >
                              Apply Recommendation
                            </Button>
                          </div>
                        </div>
                      </motion.div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div
                          className="p-4 rounded-lg border bg-muted/30"
                          whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <Bookmark className="h-4 w-4 text-purist-blue" />
                            </div>
                            <div>
                              <h4 className="font-medium">Engagement Boost</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                Adding interactive elements at the 1-minute mark can increase watch time by up to 40%.
                              </p>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                          className="p-4 rounded-lg border bg-muted/30"
                          whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-neo-mint" />
                            </div>
                            <div>
                              <h4 className="font-medium">Reduce Drop-offs</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                Show progress more prominently to reduce the 60% of users who drop off before
                                completion.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              {/* YouTube URL Manager */}
              <motion.div variants={slideUp}>
                <YouTubeUrlManager />
              </motion.div>

              {/* Daily Video Rotation Card */}
              <motion.div variants={slideUp}>
                <Card className="overflow-hidden border-t-4 border-t-neo-mint shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-neo-mint/10 to-purist-blue/10">
                    <CardTitle className="flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 text-neo-mint" />
                      Daily Video Rotation
                    </CardTitle>
                    <CardDescription>How the system manages daily video challenges</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <motion.div
                      className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20"
                      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    >
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-700 dark:text-blue-400">Automatic Video Selection</h4>
                          <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                            The system automatically selects a new video each day at midnight. The video will remain the
                            same throughout the day unless an admin manually changes it.
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        className="p-4 rounded-lg border bg-muted/30"
                        whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      >
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          Admin Control
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Admins can override the automatic selection by manually setting a video or approving a
                          suggested video. The selected video will be used until it's changed or reset.
                        </p>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="adminOverride">Admin Override</Label>
                          <Switch id="adminOverride" defaultChecked />
                        </div>
                      </motion.div>

                      <motion.div
                        className="p-4 rounded-lg border bg-muted/30"
                        whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      >
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-500" />
                          Video Rotation
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          When no video is manually selected, the system will automatically rotate videos daily based on
                          your content settings.
                        </p>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="autoRotation">Auto Rotation</Label>
                          <Switch id="autoRotation" defaultChecked />
                        </div>
                      </motion.div>
                    </div>

                    <div className="space-y-4">
                      <Label>Rotation Schedule</Label>
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                          <div key={day} className="p-2 rounded-md border bg-muted/30">
                            <div className="text-xs font-medium mb-1">{day}</div>
                            <Badge variant="outline" className="w-full text-xs bg-muted/50">
                              {day === "Mon" || day === "Wed" || day === "Fri"
                                ? "Grammar"
                                : day === "Tue" || day === "Thu"
                                  ? "Vocabulary"
                                  : "Conversation"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border bg-gradient-to-r from-neo-mint/5 to-purist-blue/5">
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-neo-mint mt-0.5" />
                        <div>
                          <h4 className="font-medium">Smart Rotation</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Enable AI-powered video selection that adapts to user engagement patterns and learning
                            progress.
                          </p>
                          <div className="mt-3 flex items-center gap-3">
                            <Switch id="smartRotation" defaultChecked={true} />
                            <Label htmlFor="smartRotation" className="text-sm cursor-pointer">
                              Enable smart rotation
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Content Requirements Card */}
              <motion.div variants={slideUp}>
                <Card className="overflow-hidden border-t-4 border-t-purist-blue shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-purist-blue/10 to-neo-mint/10">
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-purist-blue" />
                      Content Requirements
                    </CardTitle>
                    <CardDescription>Configure content requirements for user submissions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div className="space-y-2" whileHover={{ y: -2 }}>
                        <Label className="flex items-center gap-2">
                          <FileVideo className="h-4 w-4 text-purist-blue" />
                          Minimum Text Length
                        </Label>
                        <div className="flex items-center gap-2">
                          <Slider defaultValue={[100]} min={10} max={500} step={10} className="flex-1" />
                          <div className="w-16 p-2 text-center rounded-md border bg-muted/30 font-mono">100</div>
                        </div>
                        <p className="text-xs text-muted-foreground">Minimum character length for text submissions</p>
                      </motion.div>

                      <motion.div className="space-y-2" whileHover={{ y: -2 }}>
                        <Label className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purist-blue" />
                          Minimum Video Length
                        </Label>
                        <div className="flex items-center gap-2">
                          <Slider defaultValue={[30]} min={5} max={300} step={5} className="flex-1" />
                          <div className="w-16 p-2 text-center rounded-md border bg-muted/30 font-mono">0:30</div>
                        </div>
                        <p className="text-xs text-muted-foreground">Minimum length for video submissions in seconds</p>
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                        whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      >
                        <div className="space-y-0.5">
                          <Label className="text-base">Content Moderation</Label>
                          <p className="text-sm text-muted-foreground">Automatically moderate user-submitted content</p>
                        </div>
                        <Switch
                          defaultChecked
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purist-blue data-[state=checked]:to-neo-mint"
                        />
                      </motion.div>

                      <motion.div
                        className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                        whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      >
                        <div className="space-y-0.5">
                          <Label className="text-base">AI Evaluation</Label>
                          <p className="text-sm text-muted-foreground">Use AI to evaluate user submissions</p>
                        </div>
                        <Switch
                          defaultChecked
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purist-blue data-[state=checked]:to-neo-mint"
                        />
                      </motion.div>
                    </div>

                    <motion.div
                      className="p-4 rounded-lg border bg-gradient-to-r from-purist-blue/5 to-neo-mint/5"
                      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    >
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-purist-blue mt-0.5" />
                        <div>
                          <h4 className="font-medium">Content Filtering</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Configure automatic content filtering to ensure all submissions meet community guidelines.
                          </p>
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center space-x-2">
                              <Switch id="filterProfanity" defaultChecked />
                              <Label htmlFor="filterProfanity">Filter profanity</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch id="filterHateSpeech" defaultChecked />
                              <Label htmlFor="filterHateSpeech">Filter hate speech</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch id="filterPII" defaultChecked />
                              <Label htmlFor="filterPII">Filter personal information</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch id="filterSpam" defaultChecked />
                              <Label htmlFor="filterSpam">Filter spam</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t p-6 bg-muted/20">
                    <Button variant="outline">
                      <EyeOff className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
                    >
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* Content Library Card */}
              <motion.div variants={slideUp}>
                <Card>
                  <CardHeader className="bg-gradient-to-r from-neo-mint/5 to-purist-blue/5">
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-neo-mint" />
                      Content Library
                    </CardTitle>
                    <CardDescription>Manage your video content library</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Search content..."
                          className="w-64"
                        />
                        <Button variant="outline" size="icon">
                          <Filter className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button className="bg-gradient-to-r from-neo-mint to-purist-blue text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Content
                      </Button>
                    </div>

                    <ScrollArea className="h-64 rounded-md border">
                      <div className="p-4 space-y-4">
                        {[1, 2, 3, 4, 5].map((item) => (
                          <motion.div
                            key={item}
                            className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                            whileHover={{ x: 5 }}
                          >
                            <div className="w-16 h-9 bg-muted rounded flex items-center justify-center shrink-0">
                              <Video className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">
                                {item === 1
                                  ? "Introduction to English Grammar"
                                  : item === 2
                                    ? "Advanced Conversation Techniques"
                                    : item === 3
                                      ? "Business English Essentials"
                                      : item === 4
                                        ? "Pronunciation Guide"
                                        : "Vocabulary Building Strategies"}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <Badge variant="outline" className="text-xs h-5 px-1">
                                  {item === 1 || item === 4
                                    ? "Grammar"
                                    : item === 2 || item === 5
                                      ? "Vocabulary"
                                      : "Conversation"}
                                </Badge>
                                <span>•</span>
                                <span>
                                  {item === 1
                                    ? "4:32"
                                    : item === 2
                                      ? "6:15"
                                      : item === 3
                                        ? "5:48"
                                        : item === 4
                                          ? "3:22"
                                          : "7:05"}
                                </span>
                                <span>•</span>
                                <span>
                                  {item === 1
                                    ? "2 days ago"
                                    : item === 2
                                      ? "1 week ago"
                                      : item === 3
                                        ? "3 days ago"
                                        : item === 4
                                          ? "Today"
                                          : "2 weeks ago"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg border bg-muted/30 text-center">
                        <div className="text-2xl font-bold text-neo-mint">42</div>
                        <div className="text-xs text-muted-foreground">Total Videos</div>
                      </div>
                      <div className="p-4 rounded-lg border bg-muted/30 text-center">
                        <div className="text-2xl font-bold text-purist-blue">12</div>
                        <div className="text-xs text-muted-foreground">Categories</div>
                      </div>
                      <div className="p-4 rounded-lg border bg-muted/30 text-center">
                        <div className="text-2xl font-bold text-amber-500">3.2 GB</div>
                        <div className="text-xs text-muted-foreground">Storage Used</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function Key(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  )
}

function Pencil(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  )
}

function Search(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}
