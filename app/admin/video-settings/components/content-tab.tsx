"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

export function ContentTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-generate-thumbnails">Auto-generate Thumbnails</Label>
              <p className="text-sm text-muted-foreground">
                Automatically create thumbnails from video frames
              </p>
            </div>
            <Switch id="auto-generate-thumbnails" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-detect-language">Auto-detect Language</Label>
              <p className="text-sm text-muted-foreground">
                Automatically detect video language for categorization
              </p>
            </div>
            <Switch id="auto-detect-language" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="generate-transcripts">Generate Transcripts</Label>
              <p className="text-sm text-muted-foreground">
                Automatically generate video transcripts
              </p>
            </div>
            <Switch id="generate-transcripts" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default-quality">Default Video Quality</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="480p">480p</SelectItem>
                  <SelectItem value="720p">720p (HD)</SelectItem>
                  <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="playback-speed">Default Playback Speed</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select speed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="0.75">0.75x</SelectItem>
                  <SelectItem value="1">1x (Normal)</SelectItem>
                  <SelectItem value="1.25">1.25x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content-filter">Content Filter Settings</Label>
            <Textarea
              id="content-filter"
              placeholder="Enter keywords or phrases to filter content..."
              rows={3}
            />
          </div>

          <Button>Save Content Settings</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Grammar</Badge>
              <Badge variant="default">Vocabulary</Badge>
              <Badge variant="default">Pronunciation</Badge>
              <Badge variant="default">Listening</Badge>
              <Badge variant="default">Speaking</Badge>
              <Badge variant="default">Reading</Badge>
              <Badge variant="default">Writing</Badge>
              <Badge variant="secondary">Conversation</Badge>
              <Badge variant="secondary">Business English</Badge>
              <Badge variant="secondary">Academic English</Badge>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Add new category..." className="flex-1" />
              <Button variant="outline">Add Category</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">1,245</div>
              <div className="text-sm text-muted-foreground">Total Videos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">89</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">456 GB</div>
              <div className="text-sm text-muted-foreground">Storage Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">25</div>
              <div className="text-sm text-muted-foreground">Pending Review</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
