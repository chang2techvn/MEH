"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

interface GeneralSettingsTabProps {
  minDuration: number
  maxDuration: number
  autoPublish: boolean
  onUpdate: (updates: any) => void
}

export function GeneralSettingsTab({ minDuration, maxDuration, autoPublish, onUpdate }: GeneralSettingsTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="min-duration">Minimum Video Duration (seconds)</Label>
        <Input
          id="min-duration"
          type="number"
          min={60}
          max={600}
          value={minDuration}
          onChange={(e) => onUpdate({ minDuration: Number.parseInt(e.target.value) })}
        />
        <p className="text-xs text-muted-foreground">
          Videos shorter than this will not be used. Recommended: 180 seconds (3 minutes).
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="max-duration">Maximum Video Duration (seconds)</Label>
        <Input
          id="max-duration"
          type="number"
          min={60}
          max={900}
          value={maxDuration}
          onChange={(e) => onUpdate({ maxDuration: Number.parseInt(e.target.value) })}
        />
        <p className="text-xs text-muted-foreground">
          Videos longer than this will be automatically trimmed. Recommended: 300 seconds (5 minutes).
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="auto-publish">Auto-publish Submissions</Label>
          <p className="text-xs text-muted-foreground">Automatically publish user submissions to the community feed</p>
        </div>
        <Switch
          id="auto-publish"
          checked={autoPublish}
          onCheckedChange={(checked) => onUpdate({ autoPublish: checked })}
        />
      </div>
    </div>
  )
}
