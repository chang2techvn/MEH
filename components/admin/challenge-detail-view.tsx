"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { getDifficultyBadgeColor, getDifficultyDisplayName } from "@/app/utils/challenge-classifier"
import {
  ArrowLeft,
  Clock,
  Edit,
  ExternalLink,
  Save,
  Trash2,
  BarChart3,
  Users,
  Calendar,
  MessageSquare,
  Tag,
} from "lucide-react"
import type { Challenge } from "@/app/actions/challenge-videos"
import YoutubeVideoPlayer from "@/components/youtube-video-player"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChallengeDetailViewProps {
  challenge: Challenge
  onEdit: (challenge: Challenge) => void
  onBack: () => void
  onDelete: (challenge: Challenge) => void
}

export default function ChallengeDetailView({ challenge, onEdit, onBack, onDelete }: ChallengeDetailViewProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState("")

  // Format duration from seconds to minutes:seconds
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")} minutes`
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  const handleSaveNotes = () => {
    // In a real app, you would save these notes to a database
    toast({
      title: "Notes saved",
      description: "Your notes have been saved successfully",
    })
    setIsEditing(false)
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
  }

  const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="group">
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Challenges
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onDelete(challenge)} className="text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button
            onClick={() => onEdit(challenge)}
            className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Challenge
          </Button>
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={slideUp}>
        <Card className="border-none shadow-neo overflow-hidden">
          <CardHeader className="pb-2 bg-gradient-to-r from-neo-mint/10 to-purist-blue/10">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl bg-gradient-to-r from-neo-mint to-purist-blue bg-clip-text text-transparent">
                  {challenge.title}
                </CardTitle>
                <CardDescription>
                  Created on {formatDate(challenge.createdAt)} • ID: {challenge.id}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={getDifficultyBadgeColor(challenge.difficulty)}>
                  {getDifficultyDisplayName(challenge.difficulty)}
                </Badge>
                {challenge.featured && (
                  <Badge variant="outline" className="bg-amber-500/20 text-amber-600 border-amber-200">
                    Featured
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="aspect-video bg-muted rounded-md overflow-hidden shadow-lg">
              {challenge.embedUrl ? (
                <YoutubeVideoPlayer videoId={challenge.id} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Video preview not available</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1 bg-muted/50 px-3 py-1 rounded-full">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatDuration(challenge.duration)}</span>
              </div>

              {Array.isArray(challenge.topics) && challenge.topics.length > 0 && (
                <div className="flex items-center gap-1 bg-muted/50 px-3 py-1 rounded-full">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span>{challenge.topics.length} topics</span>
                </div>
              )}

              <div className="flex-1"></div>

              <Button variant="outline" size="sm" asChild className="gap-2">
                <a href={challenge.videoUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Open in YouTube
                </a>
              </Button>
            </div>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="submissions"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
                >
                  Submissions
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
                >
                  Admin Notes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{challenge.description}</p>
                </div>

                {Array.isArray(challenge.topics) && challenge.topics.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {challenge.topics.map((topic, index) => (
                        <Badge key={index} variant="outline" className="px-3 py-1">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        User Engagement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">Users attempted this challenge</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                        Feedback
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">Comments received</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        Age
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {Math.floor((Date.now() - new Date(challenge.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                      </div>
                      <p className="text-xs text-muted-foreground">Days since creation</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-4">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Challenge Analytics</h3>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Completion Rate</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[200px] flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-5xl font-bold mb-2">0%</div>
                          <p className="text-sm text-muted-foreground">No data available yet</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">User Engagement</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[200px] flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-5xl font-bold mb-2">0</div>
                          <p className="text-sm text-muted-foreground">No data available yet</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Daily Engagement</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">No analytics data available yet</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="submissions" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">User Submissions</h3>
                    <Button variant="outline" size="sm">
                      Export Submissions
                    </Button>
                  </div>

                  <Card className="border-none shadow-neo">
                    <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
                      <Users className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">No submissions yet</p>
                      <p className="text-sm text-muted-foreground text-center max-w-md">
                        When users complete this challenge, their submissions will appear here for review.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Admin Notes</h3>
                    {!isEditing && (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Notes
                      </Button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          placeholder="Add notes about this challenge..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={6}
                          className="resize-none"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveNotes}
                          className="bg-gradient-to-r from-neo-mint to-purist-blue text-white"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Notes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Card className="border-none shadow-neo">
                      <ScrollArea className="h-[300px]">
                        <CardContent className="p-6">
                          {notes ? (
                            <p className="whitespace-pre-line">{notes}</p>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-[250px]">
                              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                              <p className="text-muted-foreground italic">No notes have been added yet.</p>
                              <p className="text-sm text-muted-foreground text-center max-w-md mt-2">
                                Add notes about this challenge for other administrators to see.
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </ScrollArea>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6 px-6 pb-6 bg-gradient-to-r from-neo-mint/5 to-purist-blue/5">
            <Button variant="outline" onClick={onBack} className="group">
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Challenges
            </Button>
            <Button
              onClick={() => onEdit(challenge)}
              className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Challenge
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
