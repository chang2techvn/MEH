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

  // Calculate scores for the 6 key English criteria (simplified)
  const speakingCriteria = [
    {
      id: "pronunciation",
      title: "Pronunciation",
      subtitle: "Phát âm",
      icon: <Speaker className="h-4 w-4" />,
      score: Math.round((evaluation.pronunciation + evaluation.intonation + evaluation.stress) / 3),
      color: "bg-blue-500",
      improvement: "Practice word stress and clear articulation"
    },
    {
      id: "fluency",
      title: "Fluency",
      subtitle: "Độ trôi chảy",
      icon: <Clock className="h-4 w-4" />,
      score: Math.round((evaluation.fluency + evaluation.speakingSpeed + evaluation.confidence) / 3),
      color: "bg-green-500",
      improvement: "Reduce pauses and speak more naturally"
    },
    {
      id: "grammar",
      title: "Grammar",
      subtitle: "Ngữ pháp",
      icon: <PenTool className="h-4 w-4" />,
      score: Math.round((evaluation.grammar + evaluation.tenses) / 2),
      color: "bg-purple-500",
      improvement: "Focus on tense consistency and sentence structure"
    },
    {
      id: "vocabulary",
      title: "Vocabulary",
      subtitle: "Từ vựng",
      icon: <BookOpen className="h-4 w-4" />,
      score: Math.round((evaluation.vocabulary + evaluation.collocations + evaluation.appropriateVocabulary) / 3),
      color: "bg-orange-500",
      improvement: "Use more varied and topic-specific words"
    },
    {
      id: "coherence",
      title: "Coherence",
      subtitle: "Mạch lạc",
      icon: <Link className="h-4 w-4" />,
      score: Math.round((evaluation.clarity + (evaluation.audienceInteraction || 75)) / 2),
      color: "bg-teal-500",
      improvement: "Use connecting words and organize ideas better"
    },
    {
      id: "content",
      title: "Content",
      subtitle: "Nội dung",
      icon: <FileText className="h-4 w-4" />,
      score: Math.round((evaluation.creativity + evaluation.clarity + (evaluation.callToAction || 70)) / 3),
      color: "bg-pink-500",
      improvement: "Develop ideas more thoroughly and stay on topic"
    }
  ]

  const overallScore = Math.round(
    speakingCriteria.reduce((sum, criteria) => sum + criteria.score, 0) / speakingCriteria.length
  )

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
        className="p-4 rounded-lg border bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
        whileHover={{ scale: 1.01 }}
        onClick={() => setExpanded(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-5 w-5 text-blue-500" />
            <div>
              <h4 className="font-semibold">English Analysis Ready</h4>
              <p className="text-xs text-gray-500">Tap to see your results</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getScoreBadgeStyle(overallScore)}>
              {overallScore}/100
            </Badge>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <Card className="max-w-4xl mx-auto border-0 shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="h-6 w-6 text-blue-500" />
          <CardTitle className="text-xl font-bold">English Speaking Analysis</CardTitle>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Video: {videoTopic}</p>
        <div className="mt-4">
          <Badge variant="outline" className={`text-lg px-4 py-2 ${getScoreBadgeStyle(overallScore)}`}>
            Overall Score: {overallScore}/100 - {getPerformanceLevel(overallScore)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Overview Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {speakingCriteria.map((criteria, index) => (
            <motion.div
              key={criteria.id}
              className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded ${criteria.color} text-white`}>
                  {criteria.icon}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{criteria.title}</h4>
                  <p className="text-xs text-gray-500">{criteria.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`font-bold ${getScoreColor(criteria.score)}`}>
                  {criteria.score}/100
                </span>
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feedback">
              <MessageSquare className="h-4 w-4 mr-2" />
              Key Points
            </TabsTrigger>
            <TabsTrigger value="improvements">
              <TrendingUp className="h-4 w-4 mr-2" />
              Next Steps
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="mt-4">
            <div className="space-y-4">
              {/* AI Key Points */}
              {evaluation.keyPoints && evaluation.keyPoints.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    AI Key Points
                  </h4>
                  <div className="space-y-2">
                    {evaluation.keyPoints.map((point: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">{idx + 1}</span>
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fallback: Current Level Summary if no AI key points */}
              {(!evaluation.keyPoints || evaluation.keyPoints.length === 0) && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100">Your Current Level</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {getPerformanceLevel(overallScore)} • {overallScore}/100 points
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                    {evaluation.overallFeedback || 
                     `Your English communication shows ${getPerformanceLevel(overallScore).toLowerCase()} proficiency. You're making good progress in your English learning journey!`}
                  </p>
                </div>
              )}

              {/* Additional Strengths (if available) */}
              {evaluation.strengths && evaluation.strengths.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Star className="h-4 w-4 text-green-600" />
                    Your Strengths
                  </h4>
                  <div className="grid gap-2">
                    {evaluation.strengths.slice(0, 3).map((strength: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-400">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-green-600 dark:text-green-400 text-sm font-medium">{idx + 1}</span>
                        </div>
                        <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">{strength}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="improvements" className="mt-4">
            <div className="space-y-4">
              {/* AI Next Steps */}
              {evaluation.nextSteps && evaluation.nextSteps.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    AI Next Steps
                  </h4>
                  <div className="space-y-2">
                    {evaluation.nextSteps.map((step: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">{idx + 1}</span>
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fallback: Priority Areas if no AI next steps */}
              {(!evaluation.nextSteps || evaluation.nextSteps.length === 0) && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-600" />
                    Priority Areas to Improve
                  </h4>
                  <div className="grid gap-3">
                    {speakingCriteria
                      .filter(c => c.score < 75)
                      .slice(0, 3)
                      .map((criteria, idx) => (
                        <div key={criteria.id} className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-1.5 rounded-md ${criteria.color} text-white`}>
                              {criteria.icon}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-orange-900 dark:text-orange-100">{criteria.title}</h5>
                              <p className="text-xs text-orange-700 dark:text-orange-300">Current: {criteria.score}%</p>
                            </div>
                            <div className="px-2 py-1 bg-orange-100 dark:bg-orange-800 rounded text-xs font-medium text-orange-800 dark:text-orange-200">
                              Priority {idx + 1}
                            </div>
                          </div>
                          <p className="text-sm text-orange-800 dark:text-orange-200 leading-relaxed">
                            {criteria.improvement}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Additional AI Recommendations */}
              {evaluation.recommendations && evaluation.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    Additional Recommendations
                  </h4>
                  <div className="grid gap-2">
                    {evaluation.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
                        <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">{idx + 1}</span>
                        </div>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Action Items */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <PlayCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100">Next Practice Session</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Focus on your top improvement area</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 transition-colors">
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Record Again</span>
                    </div>
                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">Practice the same topic</p>
                  </button>
                  <button className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 transition-colors">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-purple-900 dark:text-purple-100">New Challenge</span>
                    </div>
                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">Try a different topic</p>
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Collapse Button */}
        {isCompact && (
          <div className="text-center pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(false)}
              className="text-gray-500"
            >
              <ChevronUp className="h-4 w-4 mr-1" />
              Show Less
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
