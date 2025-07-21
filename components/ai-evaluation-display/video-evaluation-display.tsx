"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ChevronDown, 
  ChevronUp, 
  Mic,
  MessageSquare,
  BookOpen,
  Target,
  TrendingUp,
  Star,
  CheckCircle2,
  AlertCircle,
  Brain,
  Volume2,
  Zap,
  ArrowRight,
  PlayCircle,
  BarChart3,
  Globe,
  Link,
  Layers,
  FileText,
  Award,
  Speaker,
  Clock,
  PenTool,
  Lightbulb
} from "lucide-react"
import type { VideoEvaluation } from "@/lib/gemini-video-evaluation"

interface EnhancedVideoEvaluationDisplayProps {
  evaluation: VideoEvaluation
  title?: string
  showFullDetails?: boolean
  isCompact?: boolean
  videoTopic?: string
}

export default function EnhancedVideoEvaluationDisplay({ 
  evaluation, 
  title = "🎯 English Speaking Analysis",
  showFullDetails = false,
  isCompact = false,
  videoTopic = "General English Practice"
}: EnhancedVideoEvaluationDisplayProps) {
  const [expanded, setExpanded] = useState(showFullDetails)
  const [activeTab, setActiveTab] = useState("overview")

  // Use AI's direct scores for the 6 key English criteria
  const speakingCriteria = [
    {
      id: "pronunciation",
      title: "Pronunciation",
      subtitle: "Phát âm",
      icon: <Speaker className="h-4 w-4" />,
      score: evaluation.pronunciation || 0,
      color: "bg-blue-500",
      improvement: "Practice word stress and clear articulation"
    },
    {
      id: "fluency",
      title: "Fluency",
      subtitle: "Độ trôi chảy",
      icon: <Clock className="h-4 w-4" />,
      score: evaluation.fluency || 0,
      color: "bg-green-500",
      improvement: "Reduce pauses and speak more naturally"
    },
    {
      id: "grammar",
      title: "Grammar",
      subtitle: "Ngữ pháp",
      icon: <PenTool className="h-4 w-4" />,
      score: evaluation.grammar || 0,
      color: "bg-purple-500",
      improvement: "Focus on tense consistency and sentence structure"
    },
    {
      id: "vocabulary",
      title: "Vocabulary",
      subtitle: "Từ vựng",
      icon: <BookOpen className="h-4 w-4" />,
      score: evaluation.vocabulary || 0,
      color: "bg-orange-500",
      improvement: "Use more varied and topic-specific words"
    },
    {
      id: "coherence",
      title: "Coherence",
      subtitle: "Mạch lạc",
      icon: <Link className="h-4 w-4" />,
      score: evaluation.coherence || 0,
      color: "bg-teal-500",
      improvement: "Use connecting words and organize ideas better"
    },
    {
      id: "content",
      title: "Content",
      subtitle: "Nội dung",
      icon: <FileText className="h-4 w-4" />,
      score: evaluation.content || 0,
      color: "bg-pink-500",
      improvement: "Develop ideas more thoroughly and stay on topic"
    }
  ]

  // Use AI's direct overall score
  const overallScore = evaluation.score || 0

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600 dark:text-green-400"
    if (score >= 70) return "text-blue-600 dark:text-blue-400"
    if (score >= 55) return "text-yellow-600 dark:text-yellow-400"
    if (score >= 40) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  const getPerformanceLevel = (score: number) => {
    if (score >= 85) return "Excellent"
    if (score >= 70) return "Good"
    if (score >= 55) return "Fair"
    if (score >= 40) return "Need Practice"
    return "Need Improvement"
  }

  const getScoreBadgeStyle = (score: number) => {
    if (score >= 85) return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300"
    if (score >= 70) return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300"
    if (score >= 55) return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300"
    if (score >= 40) return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300"
    return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300"
  }

  const getPracticetips = (criteria: any[]) => {
    const tips = []
    
    // Add specific tips based on low-scoring areas
    const lowScoring = criteria.filter(c => c.score < 70)
    
    if (lowScoring.some(c => c.id === "pronunciation")) {
      tips.push("Practice with pronunciation apps daily")
    }
    
    if (lowScoring.some(c => c.id === "fluency")) {
      tips.push("Read aloud for 5 minutes daily")
    }
    
    if (lowScoring.some(c => c.id === "grammar")) {
      tips.push("Review basic grammar rules")
    }
    
    if (lowScoring.some(c => c.id === "vocabulary")) {
      tips.push("Learn 5 new words daily")
    }
    
    if (lowScoring.some(c => c.id === "coherence")) {
      tips.push("Use linking words: first, then, finally")
    }
    
    if (lowScoring.some(c => c.id === "content")) {
      tips.push("Practice storytelling techniques")
    }
    
    // Add general tips if not enough specific ones
    if (tips.length < 4) {
      tips.push("Record yourself speaking daily")
      tips.push("Watch English videos with subtitles")
      tips.push("Practice with native speakers")
      tips.push("Join English conversation groups")
    }
    
    return tips.slice(0, 4)
  }

  if (isCompact && !expanded) {
    return (
      <motion.div
        className="p-2 sm:p-4 rounded-lg border bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
        whileHover={{ scale: 1.01 }}
        onClick={() => setExpanded(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Brain className="h-3 w-3 sm:h-5 sm:w-5 text-blue-500" />
            <div>
              <h4 className="font-semibold text-xs sm:text-base">English Analysis Ready</h4>
              <p className="text-[10px] sm:text-xs text-gray-500">Tap to see your results</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Badge variant="outline" className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 ${getScoreBadgeStyle(overallScore)}`}>
              {overallScore}/100
            </Badge>
            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <Card className="w-full border-0 shadow-lg">
      <CardHeader className="text-center pb-3 sm:pb-4 px-3 sm:px-6">
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2">
          <Brain className="h-4 w-4 sm:h-6 sm:w-6 text-blue-500" />
          <CardTitle className="text-base sm:text-xl font-bold">English Speaking Analysis</CardTitle>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Video: {videoTopic}</p>
        <div className="mt-3 sm:mt-4">
          <Badge variant="outline" className={`text-sm sm:text-lg px-2 sm:px-4 py-1 sm:py-2 ${getScoreBadgeStyle(overallScore)}`}>
            Overall Score: {overallScore}/100 - {getPerformanceLevel(overallScore)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
        {/* Quick Overview Grid - Mobile Responsive: 2 rows x 3 columns on mobile */}
        <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-3 md:gap-4">
          {speakingCriteria.map((criteria, index) => (
            <motion.div
              key={criteria.id}
              className="p-1.5 sm:p-3 md:p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-1 sm:gap-2 mb-1.5 sm:mb-2">
                <div className={`p-1 sm:p-1.5 rounded ${criteria.color} text-white`}>
                  {criteria.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-xs sm:text-sm truncate">{criteria.title}</h4>
                  <p className="text-xs text-gray-500 hidden sm:block">{criteria.subtitle}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                <span className={`font-bold text-xs sm:text-sm ${getScoreColor(criteria.score)} text-center sm:text-left`}>
                  {criteria.score}/100
                </span>
                <div className="w-full sm:w-16 h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <motion.div
                    className={`h-full ${criteria.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${criteria.score}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabbed Details */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 h-6 sm:h-auto p-0.5 sm:p-1">
            <TabsTrigger value="feedback" className="text-xs sm:text-sm flex-col sm:flex-row gap-0 sm:gap-2 px-0.5 sm:px-3 py-0.5 sm:py-2 h-5 sm:h-auto">
              <MessageSquare className="h-2 w-2 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Key Points</span>
              <span className="sm:hidden text-xs">Points</span>
            </TabsTrigger>
            <TabsTrigger value="assessment" className="text-xs sm:text-sm flex-col sm:flex-row gap-0 sm:gap-2 px-0.5 sm:px-3 py-0.5 sm:py-2 h-5 sm:h-auto">
              <BarChart3 className="h-2 w-2 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Assessment</span>
              <span className="sm:hidden text-xs">Review</span>
            </TabsTrigger>
            <TabsTrigger value="improvements" className="text-xs sm:text-sm flex-col sm:flex-row gap-0 sm:gap-2 px-0.5 sm:px-3 py-0.5 sm:py-2 h-5 sm:h-auto">
              <TrendingUp className="h-2 w-2 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Next Steps</span>
              <span className="sm:hidden text-xs">Steps</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="mt-1.5 sm:mt-4">
            <div className="space-y-1.5 sm:space-y-4">
              {/* AI Key Points */}
              {evaluation.keyPoints && evaluation.keyPoints.length > 0 && (
                <div className="space-y-1.5 sm:space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
                    <CheckCircle2 className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-blue-600" />
                    Your Key Points
                  </h4>
                  <div className="space-y-1 sm:space-y-2">
                    {evaluation.keyPoints.map((point: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-1 sm:gap-3 p-1 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
                        <div className="flex-shrink-0 w-3.5 h-3.5 sm:w-6 sm:h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium">{idx + 1}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 leading-relaxed">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fallback: Current Level Summary if no AI key points */}
              {(!evaluation.keyPoints || evaluation.keyPoints.length === 0) && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-2 sm:p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-1.5 sm:gap-3 mb-1.5 sm:mb-3">
                    <div className="p-1 sm:p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <Brain className="h-3 w-3 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm sm:text-base">Your Current Level</h3>
                      <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                        {getPerformanceLevel(overallScore)} • {overallScore}/100 points
                      </p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                    {evaluation.overallFeedback || 
                     `Your English communication shows ${getPerformanceLevel(overallScore).toLowerCase()} proficiency. You're making good progress in your English learning journey!`}
                  </p>
                </div>
              )}

            </div>
          </TabsContent>

          <TabsContent value="assessment" className="mt-1.5 sm:mt-4">
            <div className="grid grid-cols-1 gap-2 sm:gap-6 lg:grid-cols-2">
              {/* Strengths */}
              <div className="space-y-1.5 sm:space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
                  <CheckCircle2 className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-green-600" />
                  Your Strengths
                </h4>
                <div className="space-y-1 sm:space-y-2">
                  {evaluation.strengths && evaluation.strengths.length > 0 ? (
                    evaluation.strengths.map((strength: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-1 sm:gap-3 p-1 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-400">
                        <div className="flex-shrink-0 w-3.5 h-3.5 sm:w-6 sm:h-6 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-green-600 dark:text-green-400 text-xs sm:text-sm font-medium">{idx + 1}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-green-800 dark:text-green-200 leading-relaxed">{strength}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-1.5 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 text-center">
                        No specific strengths identified. Keep practicing to improve your English skills!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Weaknesses */}
              <div className="space-y-1.5 sm:space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
                  <AlertCircle className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-red-600" />
                  Your Weaknesses
                </h4>
                <div className="space-y-1 sm:space-y-2">
                  {evaluation.weaknesses && evaluation.weaknesses.length > 0 ? (
                    evaluation.weaknesses.map((weakness: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-1 sm:gap-3 p-1 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-400">
                        <div className="flex-shrink-0 w-3.5 h-3.5 sm:w-6 sm:h-6 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium">{idx + 1}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-red-800 dark:text-red-200 leading-relaxed">{weakness}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-1.5 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 text-center">
                        No major weaknesses identified. Great job with your English!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="improvements" className="mt-1.5 sm:mt-4">
            <div className="space-y-1.5 sm:space-y-4">
              {/* AI Next Steps */}
              {evaluation.nextSteps && evaluation.nextSteps.length > 0 && (
                <div className="space-y-1.5 sm:space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
                    <TrendingUp className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-purple-600" />
                    Your Next Move
                  </h4>
                  <div className="space-y-1 sm:space-y-2">
                    {evaluation.nextSteps.map((step: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-1 sm:gap-3 p-1 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-400">
                        <div className="flex-shrink-0 w-3.5 h-3.5 sm:w-6 sm:h-6 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-purple-600 dark:text-purple-400 text-xs sm:text-sm font-medium">{idx + 1}</span>
                        </div>
                                                <p className="text-xs sm:text-sm text-purple-800 dark:text-purple-200 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Speaking Criteria Improvements */}
              {speakingCriteria.length > 0 && (
                <div className="space-y-1.5 sm:space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
                    <Target className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-orange-600" />
                    Your Priority Areas
                  </h4>
                  <div className="grid gap-1 sm:gap-3">
                    {speakingCriteria
                      .filter(criteria => criteria.score < 7) // Only show areas needing improvement
                      .map((criteria, idx) => (
                        <div key={idx} className="p-1 sm:p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-400">
                          <div className="flex items-center gap-1 sm:gap-3 mb-1 sm:mb-2">
                            <div className={`p-0.5 sm:p-1.5 rounded-md ${criteria.color} text-white`}>
                              {criteria.icon}
                            </div>
                            <span className="font-medium text-xs sm:text-sm text-orange-900 dark:text-orange-100">{criteria.title}</span>
                            <Badge variant="outline" className="bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300 text-xs px-1 py-0.5 sm:px-2 sm:py-0.5 border-orange-300">
                              {criteria.score}/100
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-orange-800 dark:text-orange-200 leading-relaxed">
                            {criteria.improvement}
                          </p>
                        </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fallback: Priority Areas if no AI next steps */}
              {(!evaluation.nextSteps || evaluation.nextSteps.length === 0) && (
                <div className="space-y-1.5 sm:space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
                    <Target className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                    Priority Areas to Improve
                  </h4>
                  <div className="grid gap-1.5 sm:gap-3">
                    {speakingCriteria
                      .filter(c => c.score < 75)
                      .slice(0, 3)
                      .map((criteria, idx) => (
                        <div key={criteria.id} className="p-2 sm:p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                          <div className="flex items-center gap-1.5 sm:gap-3 mb-1.5 sm:mb-2">
                            <div className={`p-0.5 sm:p-1.5 rounded-md ${criteria.color} text-white`}>
                              {criteria.icon}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-orange-900 dark:text-orange-100 text-xs sm:text-base">{criteria.title}</h5>
                              <p className="text-xs text-orange-700 dark:text-orange-300">Current: {criteria.score}%</p>
                            </div>
                            <div className="px-1 sm:px-2 py-0.5 sm:py-1 bg-orange-100 dark:bg-orange-800 rounded text-xs font-medium text-orange-800 dark:text-orange-200">
                              Priority {idx + 1}
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-orange-800 dark:text-orange-200 leading-relaxed">
                            {criteria.improvement}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}


            </div>
          </TabsContent>
        </Tabs>

        {/* Collapse Button */}
        {isCompact && (
          <div className="text-center pt-2 sm:pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(false)}
              className="text-gray-500 h-6 sm:h-auto px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
            >
              <ChevronUp className="h-2.5 w-2.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
              Show Less
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
