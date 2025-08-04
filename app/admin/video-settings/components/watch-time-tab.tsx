"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function WatchTimeTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Watch Time Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="track-watch-time">Enable Watch Time Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Track how long users spend watching videos
              </p>
            </div>
            <Switch id="track-watch-time" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="track-progress">Track Video Progress</Label>
              <p className="text-sm text-muted-foreground">
                Save user progress through videos
              </p>
            </div>
            <Switch id="track-progress" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-watch-time">Minimum Watch Time (seconds)</Label>
              <Input
                id="min-watch-time"
                type="number"
                placeholder="30"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="completion-threshold">Completion Threshold (%)</Label>
              <Input
                id="completion-threshold"
                type="number"
                placeholder="80"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="analytics-retention">Analytics Data Retention (days)</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select retention period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
                <SelectItem value="0">Forever</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button>Save Watch Time Settings</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Watch Time Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">2,450</div>
              <div className="text-sm text-muted-foreground">Total Hours Watched</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">75%</div>
              <div className="text-sm text-muted-foreground">Average Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">12m 30s</div>
              <div className="text-sm text-muted-foreground">Average Watch Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
