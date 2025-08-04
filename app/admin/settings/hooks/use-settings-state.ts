"use client"

import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import type { GeneralSettings, NotificationSettings, SecuritySettings } from "../types"

export function useSettingsState() {
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [isLoading, setIsLoading] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // General settings state
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    platformName: "English Learning Platform",
    supportEmail: "support@example.com",
    defaultLanguage: "en",
    timeZone: "UTC",
    maintenanceMode: false,
  })

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    challengeReminders: true,
    feedbackAlerts: true,
  })

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    passwordExpiry: "90",
    sessionTimeout: "30",
    loginAttempts: "5",
  })

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

  // Handle reset to defaults
  const handleResetToDefaults = async () => {
    try {
      setIsLoading(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Reset all settings to defaults
      setGeneralSettings({
        platformName: "English Learning Platform",
        supportEmail: "support@example.com",
        defaultLanguage: "en",
        timeZone: "UTC",
        maintenanceMode: false,
      })

      setNotificationSettings({
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        challengeReminders: true,
        feedbackAlerts: true,
      })

      setSecuritySettings({
        twoFactorAuth: false,
        passwordExpiry: "90",
        sessionTimeout: "30",
        loginAttempts: "5",
      })

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

  return {
    saving,
    activeTab,
    setActiveTab,
    isLoading,
    confirmReset,
    setConfirmReset,
    previewMode,
    setPreviewMode,
    refreshing,
    generalSettings,
    setGeneralSettings,
    notificationSettings,
    setNotificationSettings,
    securitySettings,
    setSecuritySettings,
    handleSave,
    handleResetToDefaults,
    handleRefreshData,
  }
}
