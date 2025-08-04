"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { updateVideoSettings } from "@/app/actions/admin-settings"
import type { VideoSettings } from "@/app/actions/admin-settings"

interface VideoSettingsFormProps {
  initialSettings: VideoSettings
}

export default function VideoSettingsForm({ initialSettings }: VideoSettingsFormProps) {
  const [settings, setSettings] = useState<VideoSettings>(initialSettings)
  const [saving, setSaving] = useState(false)

  const handleChange = (field: keyof VideoSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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

      // Save settings
      await updateVideoSettings(settings)

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="minWatchTime">Minimum Watch Time (seconds)</Label>
        <Input
          id="minWatchTime"
          type="number"
          min={30}
          value={settings.minWatchTime}
          onChange={(e) => handleChange("minWatchTime", Number(e.target.value))}
        />
        <p className="text-xs text-muted-foreground">
          Users must watch videos for at least this amount of time before proceeding. Recommended: 180 seconds (3
          minutes).
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxVideoDuration">Maximum Video Duration (seconds)</Label>
        <Input
          id="maxVideoDuration"
          type="number"
          min={60}
          value={settings.maxVideoDuration}
          onChange={(e) => handleChange("maxVideoDuration", Number(e.target.value))}
        />
        <p className="text-xs text-muted-foreground">
          Videos longer than this will be automatically trimmed. Recommended: 300 seconds (5 minutes).
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="autoPublish">Auto-publish Submissions</Label>
          <p className="text-xs text-muted-foreground">Automatically publish user submissions to the community feed</p>
        </div>
        <Switch
          id="autoPublish"
          checked={settings.autoPublish}
          onCheckedChange={(checked) => handleChange("autoPublish", checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="enforceWatchTime">Enforce Watch Time</Label>
          <p className="text-xs text-muted-foreground">
            Require users to watch videos for the minimum time before proceeding
          </p>
        </div>
        <Switch
          id="enforceWatchTime"
          checked={settings.enforceWatchTime}
          onCheckedChange={(checked) => handleChange("enforceWatchTime", checked)}
        />
      </div>

      <Button
        type="submit"
        disabled={saving}
        className="w-full bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
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
    </form>
  )
}
