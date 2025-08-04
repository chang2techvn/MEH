"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

interface SettingsTabProps {
  onSave: () => void
}

export function SettingsTab({ onSave }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle>General Safety Settings</CardTitle>
              <CardDescription>Configure general AI safety and moderation settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Moderation</Label>
                    <p className="text-sm text-muted-foreground">Automatically moderate content using AI</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Content Safety Level</Label>
                  <p className="text-sm text-muted-foreground">Set the overall safety level for content filtering</p>
                  <Select defaultValue="balanced">
                    <SelectTrigger>
                      <SelectValue placeholder="Select safety level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal (Less Filtering)</SelectItem>
                      <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                      <SelectItem value="strict">Strict (More Filtering)</SelectItem>
                      <SelectItem value="maximum">Maximum (Highest Security)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Manual Review Threshold</Label>
                  <p className="text-sm text-muted-foreground">
                    Content with a safety score below this threshold will require manual review
                  </p>
                  <div className="flex items-center gap-4">
                    <Slider defaultValue={[70]} max={100} step={1} className="flex-1" />
                    <span className="font-medium w-8">70%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>User Reporting</Label>
                    <p className="text-sm text-muted-foreground">Allow users to report inappropriate content</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Content Redaction</Label>
                    <p className="text-sm text-muted-foreground">Automatically redact sensitive information</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle>AI Model Settings</CardTitle>
              <CardDescription>Configure AI model settings for content moderation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>AI Provider</Label>
                  <Select defaultValue="openai">
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="gemini">Google Gemini</SelectItem>
                      <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                      <SelectItem value="custom">Custom Provider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select defaultValue="gpt-4">
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                      <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Response Format</Label>
                  <Select defaultValue="json">
                    <SelectTrigger>
                      <SelectValue placeholder="Select response format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="text">Plain Text</SelectItem>
                      <SelectItem value="markdown">Markdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Temperature</Label>
                  <p className="text-sm text-muted-foreground">
                    Controls randomness in AI responses (lower = more consistent)
                  </p>
                  <div className="flex items-center gap-4">
                    <Slider defaultValue={[0.3]} max={1} step={0.1} className="flex-1" />
                    <span className="font-medium w-8">0.3</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cache Responses</Label>
                    <p className="text-sm text-muted-foreground">Cache AI responses to improve performance</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure notifications for content moderation events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Admin Notifications</h3>
                <div className="space-y-2">
                  {[
                    { label: "Critical Content Flags", defaultChecked: true },
                    { label: "High Severity Flags", defaultChecked: true },
                    { label: "Medium Severity Flags", defaultChecked: false },
                    { label: "Low Severity Flags", defaultChecked: false },
                    { label: "User Reports", defaultChecked: true },
                    { label: "System Alerts", defaultChecked: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Label htmlFor={`admin-notif-${i}`} className="flex-1">
                        {item.label}
                      </Label>
                      <Switch id={`admin-notif-${i}`} defaultChecked={item.defaultChecked} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">User Notifications</h3>
                <div className="space-y-2">
                  {[
                    { label: "Content Rejection", defaultChecked: true },
                    { label: "Content Approval", defaultChecked: true },
                    { label: "Content Modification", defaultChecked: true },
                    { label: "Safety Warnings", defaultChecked: true },
                    { label: "Report Status Updates", defaultChecked: true },
                    { label: "Educational Feedback", defaultChecked: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Label htmlFor={`user-notif-${i}`} className="flex-1">
                        {item.label}
                      </Label>
                      <Switch id={`user-notif-${i}`} defaultChecked={item.defaultChecked} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={onSave} className="ml-auto">
              Save Settings
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
