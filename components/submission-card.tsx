"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageSquare, Share2, ChevronDown, ChevronUp, Award } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { UserSubmission } from "@/app/actions/user-submissions"

interface SubmissionCardProps {
  submission: UserSubmission
}

export default function SubmissionCard({ submission }: SubmissionCardProps) {
  const [liked, setLiked] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 70) return "text-blue-500"
    if (score >= 50) return "text-yellow-500"
    return "text-red-500"
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-800">
              <AvatarImage src={submission.userImage} alt={submission.username} />
              <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
                {submission.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{submission.username}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(submission.createdAt)}</p>
                </div>
                <Badge className="bg-gradient-to-r from-neo-mint to-purist-blue text-white border-0">
                  <Award className="h-3 w-3 mr-1" />
                  Score: {submission.overallScore}
                </Badge>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Rewritten Content</h3>
                <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm p-4 rounded-xl">
                  <p className="text-sm">{submission.rewrittenContent}</p>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Video Submission</h3>
                <div className="aspect-video rounded-xl overflow-hidden bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm">
                  <video className="w-full h-full object-cover" controls src={submission.videoSubmission} />
                </div>
              </div>

              <div className="mt-4">
                <Button
                  variant="ghost"
                  onClick={() => setExpanded(!expanded)}
                  className="w-full flex items-center justify-center gap-2 py-2"
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      <span>Hide AI Evaluation</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      <span>Show AI Evaluation</span>
                    </>
                  )}
                </Button>

                {expanded && (
                  <div className="mt-4 space-y-4">
                    <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm p-4 rounded-xl">
                      <h4 className="font-medium mb-2">Content Evaluation</h4>
                      <p className="text-sm mb-3">{submission.contentEvaluation.feedback}</p>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Grammar & Language</span>
                            <span className={getScoreColor(submission.contentEvaluation.grammarScore)}>
                              {submission.contentEvaluation.grammarScore}/100
                            </span>
                          </div>
                          <Progress value={submission.contentEvaluation.grammarScore} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Content Accuracy</span>
                            <span className={getScoreColor(submission.contentEvaluation.contentScore)}>
                              {submission.contentEvaluation.contentScore}/100
                            </span>
                          </div>
                          <Progress value={submission.contentEvaluation.contentScore} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Originality</span>
                            <span className={getScoreColor(submission.contentEvaluation.originalityScore)}>
                              {submission.contentEvaluation.originalityScore}/100
                            </span>
                          </div>
                          <Progress value={submission.contentEvaluation.originalityScore} className="h-2" />
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium mb-2 text-green-500">Strengths</h5>
                          <ul className="text-xs space-y-1">
                            {submission.contentEvaluation.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-green-500">•</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium mb-2 text-red-500">Areas to Improve</h5>
                          <ul className="text-xs space-y-1">
                            {submission.contentEvaluation.weaknesses.map((weakness, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-red-500">•</span>
                                <span>{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm p-4 rounded-xl">
                      <h4 className="font-medium mb-2">Video Evaluation</h4>
                      <p className="text-sm mb-3">{submission.videoEvaluation.feedback}</p>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Pronunciation & Fluency</span>
                            <span className={getScoreColor(submission.videoEvaluation.grammarScore)}>
                              {submission.videoEvaluation.grammarScore}/100
                            </span>
                          </div>
                          <Progress value={submission.videoEvaluation.grammarScore} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Content Delivery</span>
                            <span className={getScoreColor(submission.videoEvaluation.contentScore)}>
                              {submission.videoEvaluation.contentScore}/100
                            </span>
                          </div>
                          <Progress value={submission.videoEvaluation.contentScore} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Presentation Style</span>
                            <span className={getScoreColor(submission.videoEvaluation.originalityScore)}>
                              {submission.videoEvaluation.originalityScore}/100
                            </span>
                          </div>
                          <Progress value={submission.videoEvaluation.originalityScore} className="h-2" />
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium mb-2 text-green-500">Strengths</h5>
                          <ul className="text-xs space-y-1">
                            {submission.videoEvaluation.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-green-500">•</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium mb-2 text-red-500">Areas to Improve</h5>
                          <ul className="text-xs space-y-1">
                            {submission.videoEvaluation.weaknesses.map((weakness, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-red-500">•</span>
                                <span>{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/20 dark:border-gray-800/20 flex justify-between">
            <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => setLiked(!liked)}>
              <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
              <span>Like</span>
            </Button>

            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Comment</span>
            </Button>

            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
