"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Loader2,
  Save,
  Settings,
  Bell,
  Mail,
  Shield,
  Globe,
  Palette,
  Moon,
  Sun,
  Smartphone,
  Upload,
  Trash2,
  AlertTriangle,
  Info,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  User,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { useTheme, themeColors } from "@/contexts/theme-context"

export default function SettingsPage() {
  const { theme, updateTheme, resetTheme } = useTheme()

  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [isLoading, setIsLoading] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // General settings state
  const [platformName, setPlatformName] = useState("English Learning Platform")
  const [supportEmail, setSupportEmail] = useState("support@example.com")
  const [defaultLanguage, setDefaultLanguage] = useState("en")
  const [timeZone, setTimeZone] = useState("UTC")
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)
  const [challengeReminders, setChallengeReminders] = useState(true)
  const [feedbackAlerts, setFeedbackAlerts] = useState(true)

  // Security settings state
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)
  const [passwordExpiry, setPasswordExpiry] = useState("90")
  const [sessionTimeout, setSessionTimeout] = useState("30")
  const [loginAttempts, setLoginAttempts] = useState("5")

  // Appearance settings state - now using the theme context
  const [colorPreview, setColorPreview] = useState<{primary: string, secondary: string, accent: string} | null>(null)
  const [themePresets, setThemePresets] = useState([
    { name: "Default", primary: "purist-blue", secondary: "neo-mint", accent: "cassis" },
    { name: "Sunset", primary: "vibrant-orange", secondary: "cantaloupe", accent: "cassis" },
    { name: "Ocean", primary: "dark-blue", secondary: "purist-blue", accent: "neo-mint" },
    { name: "Forest", primary: "#2E7D32", secondary: "#81C784", accent: "#FFC107" },
    { name: "Berry", primary: "#9C27B0", secondary: "#E1BEE7", accent: "#FF5722" },
  ])

  // Handle save settings
  const handleSave = async () => {
    try {
      setSaving(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
        variant: "default",
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

  // Preview theme colors
  const previewThemeColors = (primary: string, secondary: string, accent: string) => {
    setColorPreview({ primary, secondary, accent })
    // Apply the preview colors temporarily
    updateTheme({ primaryColor: primary, secondaryColor: secondary, accentColor: accent })
  }

  // Clear preview
  const clearPreview = () => {
    setColorPreview(null)
    // Revert to the saved theme
    updateTheme({
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      accentColor: theme.accentColor,
    })
  }

  // Apply theme preset
  const applyThemePreset = (preset: any) => {
    updateTheme({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    })
    setColorPreview(null)
  }

  // Handle reset to defaults
  const handleResetToDefaults = async () => {
    try {
      setIsLoading(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Reset all settings to defaults
      setPlatformName("English Learning Platform")
      setSupportEmail("support@example.com")
      setDefaultLanguage("en")
      setTimeZone("UTC")
      setMaintenanceMode(false)
      setEmailNotifications(true)
      setPushNotifications(true)
      setMarketingEmails(false)
      setChallengeReminders(true)
      setFeedbackAlerts(true)
      setTwoFactorAuth(false)
      setPasswordExpiry("90")
      setSessionTimeout("30")
      setLoginAttempts("5")

      // Reset theme to defaults
      resetTheme()

      toast({
        title: "Settings reset",
        description: "All settings have been reset to their default values.",
      })

      setConfirmReset(false)
    } catch (error) {
      console.error("Error resetting settings:", error)
      toast({
        title: "Error",
        description: "Failed to reset settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Simulate refresh data
  const handleRefreshData = async () => {
    setRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setRefreshing(false)

    toast({
      title: "Data refreshed",
      description: "Settings data has been refreshed from the server.",
    })
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Platform Settings</h1>
          <p className="text-muted-foreground">Configure your English learning platform settings</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={refreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setConfirmReset(true)} className="flex items-center gap-1">
            <Trash2 className="h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0 shadow-neo"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="relative"
      >
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 p-1 shadow-neo bg-background rounded-lg">
            <TabsTrigger value="general" className="flex items-center gap-2 data-[state=active]:shadow-neo">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:shadow-neo">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:shadow-neo">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2 data-[state=active]:shadow-neo">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6 space-y-6">
            <motion.div variants={container} initial="hidden" animate="show">
              <Card className="shadow-neo overflow-hidden border-2">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    General Settings
                  </CardTitle>
                  <CardDescription>Configure basic platform settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <motion.div variants={item} className="space-y-2">
                    <Label htmlFor="platform-name" className="text-base">
                      Platform Name
                    </Label>
                    <Input
                      id="platform-name"
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      className="shadow-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      This name will be displayed throughout the platform and in emails
                    </p>
                  </motion.div>

                  <motion.div variants={item} className="space-y-2">
                    <Label htmlFor="support-email" className="text-base">
                      Support Email
                    </Label>
                    <Input
                      id="support-email"
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="shadow-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      This email will be used for support inquiries and system notifications
                    </p>
                  </motion.div>

                  <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="default-language" className="text-base">
                        Default Language
                      </Label>
                      <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                        <SelectTrigger id="default-language" className="shadow-sm">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="ja">Japanese</SelectItem>
                          <SelectItem value="zh">Chinese</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Default language for new users</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time-zone" className="text-base">
                        Time Zone
                      </Label>
                      <Select value={timeZone} onValueChange={setTimeZone}>
                        <SelectTrigger id="time-zone" className="shadow-sm">
                          <SelectValue placeholder="Select time zone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="Europe/London">London (GMT)</SelectItem>
                          <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                          <SelectItem value="Asia/Tokyo">Japan Standard Time (JST)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Default time zone for displaying dates and times</p>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={item}
                    className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 shadow-sm"
                  >
                    <div className="space-y-0.5">
                      <Label htmlFor="maintenance-mode" className="text-base">
                        Maintenance Mode
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Enable maintenance mode to temporarily disable access to the platform
                      </p>
                    </div>
                    <Switch
                      id="maintenance-mode"
                      checked={maintenanceMode}
                      onCheckedChange={setMaintenanceMode}
                      className="data-[state=checked]:bg-primary"
                    />
                  </motion.div>

                  {maintenanceMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-amber-700 dark:text-amber-400">
                            Warning: Maintenance Mode Active
                          </h4>
                          <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                            When maintenance mode is enabled, only administrators will be able to access the platform.
                            All other users will see a maintenance page.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6 bg-muted/10">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <span>Last updated: May 13, 2025</span>
                  </div>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    size="sm"
                    className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0 shadow-neo"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6 space-y-6">
            <motion.div variants={container} initial="hidden" animate="show">
              <Card className="shadow-neo overflow-hidden border-2">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>Configure how and when notifications are sent</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <motion.div
                    variants={item}
                    className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 shadow-sm"
                  >
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications" className="text-base">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">Send email notifications for important events</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                      className="data-[state=checked]:bg-primary"
                    />
                  </motion.div>

                  <motion.div
                    variants={item}
                    className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 shadow-sm"
                  >
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications" className="text-base">
                        Push Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">Send push notifications to mobile devices</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                      className="data-[state=checked]:bg-primary"
                    />
                  </motion.div>

                  <motion.div
                    variants={item}
                    className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 shadow-sm"
                  >
                    <div className="space-y-0.5">
                      <Label htmlFor="marketing-emails" className="text-base">
                        Marketing Emails
                      </Label>
                      <p className="text-sm text-muted-foreground">Send promotional emails and newsletters</p>
                    </div>
                    <Switch
                      id="marketing-emails"
                      checked={marketingEmails}
                      onCheckedChange={setMarketingEmails}
                      className="data-[state=checked]:bg-primary"
                    />
                  </motion.div>

                  <motion.div
                    variants={item}
                    className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 shadow-sm"
                  >
                    <div className="space-y-0.5">
                      <Label htmlFor="challenge-reminders" className="text-base">
                        Challenge Reminders
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Send reminders for upcoming and incomplete challenges
                      </p>
                    </div>
                    <Switch
                      id="challenge-reminders"
                      checked={challengeReminders}
                      onCheckedChange={setChallengeReminders}
                      className="data-[state=checked]:bg-primary"
                    />
                  </motion.div>

                  <motion.div
                    variants={item}
                    className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 shadow-sm"
                  >
                    <div className="space-y-0.5">
                      <Label htmlFor="feedback-alerts" className="text-base">
                        Feedback Alerts
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Notify users when they receive feedback on their submissions
                      </p>
                    </div>
                    <Switch
                      id="feedback-alerts"
                      checked={feedbackAlerts}
                      onCheckedChange={setFeedbackAlerts}
                      className="data-[state=checked]:bg-primary"
                    />
                  </motion.div>

                  <motion.div variants={item}>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="email-templates" className="border rounded-lg shadow-sm">
                        <AccordionTrigger className="text-base font-medium px-4">Email Templates</AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-medium">Welcome Email</h4>
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Active
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">Sent to new users after registration</p>
                                <Button variant="outline" size="sm" className="mt-2">
                                  Edit Template
                                </Button>
                              </div>

                              <div className="p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-medium">Challenge Reminder</h4>
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Active
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Reminds users of upcoming challenge deadlines
                                </p>
                                <Button variant="outline" size="sm" className="mt-2">
                                  Edit Template
                                </Button>
                              </div>

                              <div className="p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-medium">Feedback Notification</h4>
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Active
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Notifies users when they receive feedback
                                </p>
                                <Button variant="outline" size="sm" className="mt-2">
                                  Edit Template
                                </Button>
                              </div>

                              <div className="p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-medium">Password Reset</h4>
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Active
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Sent when users request a password reset
                                </p>
                                <Button variant="outline" size="sm" className="mt-2">
                                  Edit Template
                                </Button>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </motion.div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6 bg-muted/10">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>Email delivery rate: 98.5%</span>
                  </div>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    size="sm"
                    className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0 shadow-neo"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="security" className="mt-6 space-y-6">
            <motion.div variants={container} initial="hidden" animate="show">
              <Card className="shadow-neo overflow-hidden border-2">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>Configure platform security and authentication</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <motion.div
                    variants={item}
                    className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 shadow-sm"
                  >
                    <div className="space-y-0.5">
                      <Label htmlFor="two-factor-auth" className="text-base">
                        Two-Factor Authentication
                      </Label>
                      <p className="text-sm text-muted-foreground">Require two-factor authentication for all users</p>
                    </div>
                    <Switch
                      id="two-factor-auth"
                      checked={twoFactorAuth}
                      onCheckedChange={setTwoFactorAuth}
                      className="data-[state=checked]:bg-primary"
                    />
                  </motion.div>

                  <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="password-expiry" className="text-base">
                        Password Expiry (days)
                      </Label>
                      <Input
                        id="password-expiry"
                        type="number"
                        min="0"
                        max="365"
                        value={passwordExpiry}
                        onChange={(e) => setPasswordExpiry(e.target.value)}
                        className="shadow-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Number of days before passwords expire (0 = never)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="session-timeout" className="text-base">
                        Session Timeout (minutes)
                      </Label>
                      <Input
                        id="session-timeout"
                        type="number"
                        min="5"
                        max="1440"
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(e.target.value)}
                        className="shadow-sm"
                      />
                      <p className="text-xs text-muted-foreground">Inactive session timeout in minutes</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-attempts" className="text-base">
                        Max Login Attempts
                      </Label>
                      <Input
                        id="login-attempts"
                        type="number"
                        min="1"
                        max="10"
                        value={loginAttempts}
                        onChange={(e) => setLoginAttempts(e.target.value)}
                        className="shadow-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum failed login attempts before account lockout
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={item}
                    className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
                  >
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-700 dark:text-blue-400">Password Policy</h4>
                        <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                          Passwords must be at least 8 characters long and include at least one uppercase letter, one
                          lowercase letter, one number, and one special character.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={item}>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="advanced-security" className="border rounded-lg shadow-sm">
                        <AccordionTrigger className="text-base font-medium px-4">
                          Advanced Security Settings
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between p-3 rounded-lg border">
                              <div className="space-y-0.5">
                                <Label className="text-sm font-medium">IP Restriction</Label>
                                <p className="text-xs text-muted-foreground">
                                  Restrict access to specific IP addresses
                                </p>
                              </div>
                              <Switch defaultChecked={false} className="data-[state=checked]:bg-primary" />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg border">
                              <div className="space-y-0.5">
                                <Label className="text-sm font-medium">CAPTCHA on Login</Label>
                                <p className="text-xs text-muted-foreground">
                                  Require CAPTCHA verification on login attempts
                                </p>
                              </div>
                              <Switch defaultChecked={true} className="data-[state=checked]:bg-primary" />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg border">
                              <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Force HTTPS</Label>
                                <p className="text-xs text-muted-foreground">Redirect all HTTP requests to HTTPS</p>
                              </div>
                              <Switch defaultChecked={true} className="data-[state=checked]:bg-primary" />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg border">
                              <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Content Security Policy</Label>
                                <p className="text-xs text-muted-foreground">Enable strict Content Security Policy</p>
                              </div>
                              <Switch defaultChecked={true} className="data-[state=checked]:bg-primary" />
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </motion.div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6 bg-muted/10">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Security status: Strong</span>
                  </div>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    size="sm"
                    className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0 shadow-neo"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="appearance" className="mt-6 space-y-6">
            <motion.div variants={container} initial="hidden" animate="show">
              <Card className="shadow-neo overflow-hidden border-2">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    Appearance Settings
                  </CardTitle>
                  <CardDescription>Customize the look and feel of your platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* Theme Preview */}
                  <motion.div variants={item} className="relative mb-8 overflow-hidden rounded-xl border-2 shadow-neo">
                    <div className="absolute top-2 right-2 z-10 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 bg-white/80 backdrop-blur-sm"
                        onClick={() => setPreviewMode(!previewMode)}
                      >
                        {previewMode ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5 mr-1" />
                            Hide Preview
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Show Preview
                          </>
                        )}
                      </Button>
                    </div>

                    <div
                      className={cn(
                        "transition-all duration-500 ease-in-out",
                        !previewMode && "opacity-0 h-0",
                        previewMode && "opacity-100 h-[300px]",
                      )}
                    >
                      <div className="p-4 bg-gradient-to-br from-background to-muted/50">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                              E
                            </div>
                            <h3 className="font-semibold">English Learning Platform</h3>
                          </div>
                          <div className="flex gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <Bell className="h-4 w-4" />
                            </div>
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-4 w-4" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="col-span-2">
                            <div className="rounded-lg border bg-card p-4 shadow-sm">
                              <h4 className="font-medium mb-2 text-primary">Welcome Back!</h4>
                              <p className="text-sm text-card-foreground mb-3">
                                Continue your learning journey with today's recommended activities.
                              </p>
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-primary text-primary-foreground">
                                  Start Learning
                                </Button>
                                <Button size="sm" variant="outline">
                                  View Progress
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="rounded-lg border bg-card p-4 shadow-sm">
                              <h4 className="font-medium mb-2 flex items-center gap-1">
                                <Sparkles className="h-4 w-4 text-accent" />
                                <span>Daily Challenge</span>
                              </h4>
                              <div className="text-sm text-card-foreground">
                                <span className="block mb-2">Complete today's challenge!</span>
                                <div className="w-full bg-muted rounded-full h-2 mb-2">
                                  <div className="bg-accent h-2 rounded-full" style={{ width: "45%" }}></div>
                                </div>
                                <span className="text-xs text-muted-foreground">45% completed</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2">
                          <Badge className="bg-primary text-primary-foreground">All Topics</Badge>
                          <Badge variant="outline">Grammar</Badge>
                          <Badge variant="outline">Vocabulary</Badge>
                          <Badge variant="outline">Speaking</Badge>
                          <Badge variant="outline">Writing</Badge>
                        </div>
                      </div>
                    </div>

                    {!previewMode && (
                      <div className="h-16 flex items-center justify-center bg-muted/20">
                        <Button
                          variant="outline"
                          onClick={() => setPreviewMode(true)}
                          className="bg-white/80 backdrop-blur-sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Show Theme Preview
                        </Button>
                      </div>
                    )}
                  </motion.div>

                  {/* Theme Presets */}
                  <motion.div variants={item} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Theme Presets</Label>
                      {colorPreview && (
                        <Button variant="outline" size="sm" onClick={clearPreview} className="h-8">
                          <X className="h-3.5 w-3.5 mr-1" />
                          Clear Preview
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      {themePresets.map((preset, index) => {
                        // Find the color objects for this preset
                        const primaryObj = themeColors.find((c) => c.name === preset.primary) || { value: "#3B82F6" }
                        const secondaryObj = themeColors.find((c) => c.name === preset.secondary) || {
                          value: "#7FFFD4",
                        }
                        const accentObj = themeColors.find((c) => c.name === preset.accent) || { value: "#BB2649" }

                        return (
                          <div
                            key={index}
                            className={cn(
                              "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                              theme.primaryColor === preset.primary &&
                                theme.secondaryColor === preset.secondary &&
                                theme.accentColor === preset.accent
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                : "",
                            )}
                            onClick={() => applyThemePreset(preset)}
                            onMouseEnter={() => previewThemeColors(preset.primary, preset.secondary, preset.accent)}
                            onMouseLeave={clearPreview}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="flex gap-1">
                                <div
                                  className="h-6 w-6 rounded-full border"
                                  style={{ backgroundColor: primaryObj.value }}
                                ></div>
                                <div
                                  className="h-6 w-6 rounded-full border"
                                  style={{ backgroundColor: secondaryObj.value }}
                                ></div>
                                <div
                                  className="h-6 w-6 rounded-full border"
                                  style={{ backgroundColor: accentObj.value }}
                                ></div>
                              </div>
                              <span className="font-medium text-sm">{preset.name}</span>
                              {theme.primaryColor === preset.primary &&
                                theme.secondaryColor === preset.secondary &&
                                theme.accentColor === preset.accent && (
                                  <Badge className="bg-primary text-primary-foreground text-xs">Active</Badge>
                                )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>

                  {/* Custom Colors */}
                  <motion.div variants={item} className="space-y-4 pt-4">
                    <Label className="text-base font-medium">Custom Colors</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label>Primary Color</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {themeColors.map((color, index) => (
                            <div
                              key={index}
                              className={cn(
                                "h-10 rounded-lg cursor-pointer transition-all border",
                                theme.primaryColor === color.name ? "ring-4 ring-offset-2" : "",
                              )}
                              style={{ backgroundColor: color.value }}
                              onClick={() => updateTheme({ primaryColor: color.name })}
                              onMouseEnter={() =>
                                previewThemeColors(color.name, theme.secondaryColor, theme.accentColor)
                              }
                              onMouseLeave={clearPreview}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">Used for buttons, links, and active states</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Secondary Color</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {themeColors.map((color, index) => (
                            <div
                              key={index}
                              className={cn(
                                "h-10 rounded-lg cursor-pointer transition-all border",
                                theme.secondaryColor === color.name ? "ring-4 ring-offset-2" : "",
                              )}
                              style={{ backgroundColor: color.value }}
                              onClick={() => updateTheme({ secondaryColor: color.name })}
                              onMouseEnter={() => previewThemeColors(theme.primaryColor, color.name, theme.accentColor)}
                              onMouseLeave={clearPreview}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">Used for backgrounds and secondary elements</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Accent Color</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {themeColors.map((color, index) => (
                            <div
                              key={index}
                              className={cn(
                                "h-10 rounded-lg cursor-pointer transition-all border",
                                theme.accentColor === color.name ? "ring-4 ring-offset-2" : "",
                              )}
                              style={{ backgroundColor: color.value }}
                              onClick={() => updateTheme({ accentColor: color.name })}
                              onMouseEnter={() =>
                                previewThemeColors(theme.primaryColor, theme.secondaryColor, color.name)
                              }
                              onMouseLeave={clearPreview}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">Used for highlights and accents</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Display Mode */}
                  <motion.div variants={item} className="space-y-4 pt-4">
                    <Label className="text-base font-medium">Display Mode</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div
                        className={cn(
                          "p-4 rounded-lg border cursor-pointer transition-all",
                          theme.mode === "light" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "",
                        )}
                        onClick={() => updateTheme({ mode: "light" })}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-12 w-12 rounded-full bg-white border flex items-center justify-center">
                            <Sun className="h-6 w-6 text-amber-500" />
                          </div>
                          <span className="font-medium">Light</span>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "p-4 rounded-lg border cursor-pointer transition-all",
                          theme.mode === "dark" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "",
                        )}
                        onClick={() => updateTheme({ mode: "dark" })}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-12 w-12 rounded-full bg-gray-900 border flex items-center justify-center">
                            <Moon className="h-6 w-6 text-gray-100" />
                          </div>
                          <span className="font-medium">Dark</span>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "p-4 rounded-lg border cursor-pointer transition-all",
                          theme.mode === "system" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "",
                        )}
                        onClick={() => updateTheme({ mode: "system" })}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-white to-gray-900 border flex items-center justify-center">
                            <Smartphone className="h-6 w-6 text-gray-600" />
                          </div>
                          <span className="font-medium">System</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Advanced Appearance */}
                  <motion.div variants={item} className="pt-4">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="advanced-appearance" className="border rounded-lg shadow-sm">
                        <AccordionTrigger className="text-base font-medium px-4">
                          Advanced Appearance Settings
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-6 pt-2">
                            {/* Font Size */}
                            <div className="space-y-2">
                              <Label>Font Size</Label>
                              <div className="grid grid-cols-3 gap-4">
                                <div
                                  className={cn(
                                    "p-4 rounded-lg border cursor-pointer transition-all",
                                    theme.fontSize === "small"
                                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                      : "",
                                  )}
                                  onClick={() => updateTheme({ fontSize: "small" })}
                                >
                                  <div className="flex flex-col items-center">
                                    <span className="text-sm font-medium">Small</span>
                                  </div>
                                </div>

                                <div
                                  className={cn(
                                    "p-4 rounded-lg border cursor-pointer transition-all",
                                    theme.fontSize === "medium"
                                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                      : "",
                                  )}
                                  onClick={() => updateTheme({ fontSize: "medium" })}
                                >
                                  <div className="flex flex-col items-center">
                                    <span className="text-base font-medium">Medium</span>
                                  </div>
                                </div>

                                <div
                                  className={cn(
                                    "p-4 rounded-lg border cursor-pointer transition-all",
                                    theme.fontSize === "large"
                                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                      : "",
                                  )}
                                  onClick={() => updateTheme({ fontSize: "large" })}
                                >
                                  <div className="flex flex-col items-center">
                                    <span className="text-lg font-medium">Large</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Border Radius */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Border Radius: {theme.borderRadius}px</Label>
                                <span className="text-xs text-muted-foreground">
                                  {theme.borderRadius === 8
                                    ? "Default"
                                    : theme.borderRadius === 0
                                      ? "Square"
                                      : theme.borderRadius >= 16
                                        ? "Rounded"
                                        : "Custom"}
                                </span>
                              </div>
                              <Slider
                                value={[theme.borderRadius]}
                                min={0}
                                max={20}
                                step={1}
                                onValueChange={(value) => updateTheme({ borderRadius: value[0] })}
                                className="py-4"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Square</span>
                                <span>Default</span>
                                <span>Rounded</span>
                              </div>
                              <div className="h-16 flex items-center justify-center mt-2">
                                <div
                                  className="w-16 h-16 bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl transition-all"
                                  style={{ borderRadius: `${theme.borderRadius}px` }}
                                >
                                  A
                                </div>
                              </div>
                            </div>

                            {/* Shadow Intensity */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Shadow Intensity: {theme.shadowIntensity}%</Label>
                                <span className="text-xs text-muted-foreground">
                                  {theme.shadowIntensity < 25
                                    ? "Subtle"
                                    : theme.shadowIntensity < 50
                                      ? "Moderate"
                                      : theme.shadowIntensity < 75
                                        ? "Pronounced"
                                        : "Strong"}
                                </span>
                              </div>
                              <Slider
                                value={[theme.shadowIntensity]}
                                min={0}
                                max={100}
                                step={5}
                                onValueChange={(value) => updateTheme({ shadowIntensity: value[0] })}
                                className="py-4"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>None</span>
                                <span>Medium</span>
                                <span>Strong</span>
                              </div>
                              <div className="h-16 flex items-center justify-center gap-4 mt-2">
                                <div
                                  className="w-16 h-16 bg-card border transition-all flex items-center justify-center"
                                  style={{
                                    borderRadius: `${theme.borderRadius}px`,
                                    boxShadow: `0 4px ${theme.shadowIntensity / 5}px rgba(0,0,0,${theme.shadowIntensity / 200})`,
                                  }}
                                >
                                  <Sparkles className="h-6 w-6 text-primary" />
                                </div>
                              </div>
                            </div>

                            {/* Reduced Motion */}
                            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 shadow-sm">
                              <div className="space-y-0.5">
                                <Label htmlFor="reduced-motion" className="text-base">
                                  Reduced Motion
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Minimize animations for users who prefer reduced motion
                                </p>
                              </div>
                              <Switch
                                id="reduced-motion"
                                checked={theme.reducedMotion}
                                onCheckedChange={(checked) => updateTheme({ reducedMotion: checked })}
                                className="data-[state=checked]:bg-primary"
                              />
                            </div>

                            {/* Branding */}
                            <div className="space-y-2">
                              <Label>Logo</Label>
                              <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-lg border flex items-center justify-center bg-muted/30">
                                  <Upload className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div className="space-y-2">
                                  <Button variant="outline" size="sm">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Logo
                                  </Button>
                                  <p className="text-xs text-muted-foreground">
                                    Recommended size: 512x512px, PNG or SVG
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Favicon</Label>
                              <div className="flex items-center gap-4">
                                <div className="h-8 w-8 rounded-lg border flex items-center justify-center bg-muted/30">
                                  <Upload className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="space-y-2">
                                  <Button variant="outline" size="sm">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Favicon
                                  </Button>
                                  <p className="text-xs text-muted-foreground">Recommended size: 32x32px, ICO or PNG</p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="custom-css">Custom CSS</Label>
                              <Textarea
                                id="custom-css"
                                placeholder=":root { --custom-color: #ff0000; }"
                                className="font-mono text-sm"
                              />
                              <p className="text-xs text-muted-foreground">Add custom CSS to override default styles</p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </motion.div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6 bg-muted/10">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>Changes will apply to all users</span>
                  </div>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    size="sm"
                    className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0 shadow-neo"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Confirm Reset Dialog */}
      {confirmReset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="max-w-md w-full shadow-neo border-2">
              <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                  Reset All Settings
                </CardTitle>
                <CardDescription>
                  Are you sure you want to reset all settings to their default values? This action cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">The following settings will be reset:</p>
                <ScrollArea className="h-[200px] mt-4 rounded-md border p-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span>General Settings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <span>Notification Settings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span>Security Settings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-muted-foreground" />
                      <span>Appearance Settings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>Language and Localization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>Email Templates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span>Branding and Customization</span>
                    </li>
                  </ul>
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-between p-6 bg-muted/10 border-t">
                <Button variant="outline" onClick={() => setConfirmReset(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleResetToDefaults} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Reset All Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  )
}
