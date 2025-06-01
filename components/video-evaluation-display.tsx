"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronDown, 
  ChevronUp, 
  Award, 
  Mic,
  MessageSquare,
  Eye,
  Lightbulb,
  Target,
  TrendingUp,
  Star,
  CheckCircle2,
  AlertCircle,
  Brain,
  Hash,
  Users
} from "lucide-react"
import type { VideoEvaluation } from "@/lib/gemini-video-evaluation"

interface VideoEvaluationDisplayProps {
  evaluation: VideoEvaluation
  title?: string
  showFullDetails?: boolean
}

export default function VideoEvaluationDisplay({ 
  evaluation, 
  title = "AI Video Evaluation",
  showFullDetails = false 
}: VideoEvaluationDisplayProps) {
  const [expanded, setExpanded] = useState(showFullDetails)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 80) return "text-blue-500"
    if (score >= 70) return "text-yellow-500"
    if (score >= 60) return "text-orange-500"
    return "text-red-500"
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-500/20 text-green-500 border-green-500/30"
    if (score >= 80) return "bg-blue-500/20 text-blue-500 border-blue-500/30"
    if (score >= 70) return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
    if (score >= 60) return "bg-orange-500/20 text-orange-500 border-orange-500/30"
    return "bg-red-500/20 text-red-500 border-red-500/30"
  }

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return "Excellent"
    if (score >= 80) return "Good"
    if (score >= 70) return "Fair"
    if (score >= 60) return "Needs Improvement"
    return "Poor"
  }

  const categoryData = [
    {
      key: "speaking",
      title: "Speaking & Pronunciation",
      icon: <Mic className="h-4 w-4" />,
      scores: {
        pronunciation: evaluation.pronunciation,
        intonation: evaluation.intonation,
        stress: evaluation.stress,
        linkingSounds: evaluation.linkingSounds
      },
      feedback: evaluation.speakingFeedback
    },
    {
      key: "language",
      title: "Language Usage",
      icon: <MessageSquare className="h-4 w-4" />,
      scores: {
        grammar: evaluation.grammar,
        tenses: evaluation.tenses,
        vocabulary: evaluation.vocabulary,
        collocations: evaluation.collocations
      },
      feedback: evaluation.languageFeedback
    },
    {
      key: "delivery",
      title: "Fluency & Delivery",
      icon: <Target className="h-4 w-4" />,
      scores: {
        fluency: evaluation.fluency,
        speakingSpeed: evaluation.speakingSpeed,
        confidence: evaluation.confidence
      },
      feedback: evaluation.deliveryFeedback
    },
    {
      key: "visual",
      title: "Visual & Presentation",
      icon: <Eye className="h-4 w-4" />,
      scores: {
        facialExpressions: evaluation.facialExpressions,
        bodyLanguage: evaluation.bodyLanguage,
        eyeContact: evaluation.eyeContact,
        audienceInteraction: evaluation.audienceInteraction
      },
      feedback: evaluation.visualFeedback
    },
    {
      key: "caption",
      title: "Caption Quality",
      icon: <Hash className="h-4 w-4" />,
      scores: {
        captionSpelling: evaluation.captionSpelling,
        captionGrammar: evaluation.captionGrammar,
        appropriateVocabulary: evaluation.appropriateVocabulary,
        clarity: evaluation.clarity,
        callToAction: evaluation.callToAction,
        hashtags: evaluation.hashtags,
        seoCaption: evaluation.seoCaption,
        creativity: evaluation.creativity,
        emotions: evaluation.emotions,
        personalBranding: evaluation.personalBranding
      },
      feedback: evaluation.captionFeedback
    }
  ]

  const averageScore = Math.round(
    (evaluation.pronunciation + evaluation.intonation + evaluation.stress + 
     evaluation.linkingSounds + evaluation.grammar + evaluation.tenses + 
     evaluation.vocabulary + evaluation.collocations + evaluation.fluency + 
     evaluation.speakingSpeed + evaluation.confidence + evaluation.facialExpressions + 
     evaluation.bodyLanguage + evaluation.eyeContact + evaluation.audienceInteraction + 
     evaluation.captionSpelling + evaluation.captionGrammar + evaluation.appropriateVocabulary + 
     evaluation.clarity + evaluation.callToAction + evaluation.hashtags + 
     evaluation.seoCaption + evaluation.creativity + evaluation.emotions + 
     evaluation.personalBranding) / 24
  )

  return (
    <Card className="neo-card overflow-hidden border-none bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm shadow-neo">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-neo-mint dark:text-purist-blue" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Badge className={`${getScoreBadgeColor(averageScore)} font-bold`}>
            {averageScore}/100 - {getPerformanceLevel(averageScore)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Overall Score and Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Performance</span>
            <span className={`text-lg font-bold ${getScoreColor(averageScore)}`}>
              {averageScore}/100
            </span>
          </div>
          <Progress value={averageScore} className="h-3 mb-3" />
          <p className="text-sm text-muted-foreground">{evaluation.overallFeedback}</p>
        </div>

        {/* Category Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {categoryData.map((category) => {
            const categoryAverage = Math.round(
              Object.values(category.scores).reduce((sum, score) => sum + score, 0) / 
              Object.values(category.scores).length
            )
            
            return (
              <motion.div
                key={category.key}
                className="p-3 rounded-lg border border-white/20 dark:border-gray-700/20 bg-white/10 dark:bg-gray-800/10 cursor-pointer hover:bg-white/20 dark:hover:bg-gray-700/20 transition-colors"
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveCategory(activeCategory === category.key ? null : category.key)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {category.icon}
                    <span className="text-sm font-medium">{category.title}</span>
                  </div>
                  <Badge variant="outline" className={getScoreBadgeColor(categoryAverage)}>
                    {categoryAverage}
                  </Badge>
                </div>
                <Progress value={categoryAverage} className="h-2" />
              </motion.div>
            )
          })}
        </div>

        {/* Toggle Details Button */}
        <Button
          variant="ghost"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 py-2 mb-4"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              <span>Show Less</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              <span>Show Detailed Analysis</span>
            </>
          )}
        </Button>

        {/* Detailed Analysis */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Detailed Category Breakdown */}
              {categoryData.map((category) => (
                <motion.div
                  key={category.key}
                  className="p-4 rounded-xl border border-white/20 dark:border-gray-700/20 bg-white/10 dark:bg-gray-800/10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    {category.icon}
                    <h4 className="font-medium">{category.title}</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {Object.entries(category.scores).map(([key, score]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className={getScoreColor(score)}>{score}/100</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </div>

                  {category.feedback && (
                    <div className="mt-3 p-3 rounded-lg bg-white/10 dark:bg-gray-700/10">
                      <p className="text-sm">{category.feedback}</p>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Strengths and Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  className="p-4 rounded-xl border border-green-500/20 bg-green-500/10"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <h5 className="font-medium text-green-500">Key Strengths</h5>
                  </div>
                  <ul className="text-sm space-y-1">
                    {evaluation.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Star className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/10"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <h5 className="font-medium text-orange-500">Areas for Improvement</h5>
                  </div>
                  <ul className="text-sm space-y-1">
                    {evaluation.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Recommendations */}
              {evaluation.recommendations && evaluation.recommendations.length > 0 && (
                <motion.div
                  className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="h-4 w-4 text-blue-500" />
                    <h5 className="font-medium text-blue-500">AI Recommendations</h5>
                  </div>
                  <ul className="text-sm space-y-2">
                    {evaluation.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Brain className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Detail Modal */}
        <AnimatePresence>
          {activeCategory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setActiveCategory(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {(() => {
                  const category = categoryData.find(c => c.key === activeCategory)
                  if (!category) return null

                  return (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        {category.icon}
                        <h3 className="text-lg font-semibold">{category.title}</h3>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        {Object.entries(category.scores).map(([key, score]) => (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize font-medium">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <span className={getScoreColor(score)}>{score}/100</span>
                            </div>
                            <Progress value={score} className="h-2" />
                          </div>
                        ))}
                      </div>

                      {category.feedback && (
                        <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                          <p className="text-sm">{category.feedback}</p>
                        </div>
                      )}

                      <Button
                        onClick={() => setActiveCategory(null)}
                        className="w-full mt-4"
                        variant="outline"
                      >
                        Close
                      </Button>
                    </>
                  )
                })()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}