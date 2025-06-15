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
  Users,
  BookOpen,
  Volume2,
  Zap,
  PenTool,
  Camera,
  ThumbsUp,
  ArrowRight,
  PlayCircle,
  BarChart3
} from "lucide-react"
import type { VideoEvaluation } from "@/lib/gemini-video-evaluation"

interface EnhancedVideoEvaluationDisplayProps {
  evaluation: VideoEvaluation
  title?: string
  showFullDetails?: boolean
  isCompact?: boolean
}

export default function EnhancedVideoEvaluationDisplay({ 
  evaluation, 
  title = "🎯 AI Video Analysis",
  showFullDetails = false,
  isCompact = false
}: EnhancedVideoEvaluationDisplayProps) {
  const [expanded, setExpanded] = useState(showFullDetails)
  const [activeTab, setActiveTab] = useState("overview")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400"
    if (score >= 80) return "text-blue-600 dark:text-blue-400"
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400"
    if (score >= 60) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-500/20 text-green-600 border-green-500/30 dark:text-green-400"
    if (score >= 80) return "bg-blue-500/20 text-blue-600 border-blue-500/30 dark:text-blue-400"
    if (score >= 70) return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30 dark:text-yellow-400"
    if (score >= 60) return "bg-orange-500/20 text-orange-600 border-orange-500/30 dark:text-orange-400"
    return "bg-red-500/20 text-red-600 border-red-500/30 dark:text-red-400"
  }

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return "Outstanding"
    if (score >= 80) return "Very Good"
    if (score >= 70) return "Good"
    if (score >= 60) return "Needs Practice"
    return "Requires Improvement"
  }

  const getProgressBarColor = (score: number) => {
    if (score >= 90) return "bg-gradient-to-r from-green-500 to-emerald-600"
    if (score >= 80) return "bg-gradient-to-r from-blue-500 to-cyan-600"
    if (score >= 70) return "bg-gradient-to-r from-yellow-500 to-amber-600"
    if (score >= 60) return "bg-gradient-to-r from-orange-500 to-red-500"
    return "bg-gradient-to-r from-red-500 to-red-700"
  }

  const categoryData = [
    {
      key: "speaking",
      title: "Speaking & Pronunciation",
      icon: <Mic className="h-5 w-5" />,
      color: "from-blue-500 to-purple-600",
      scores: {
        pronunciation: evaluation.pronunciation,
        intonation: evaluation.intonation,
        stress: evaluation.stress,
        linkingSounds: evaluation.linkingSounds
      },
      feedback: evaluation.speakingFeedback,
      tips: [
        "Practice with tongue twisters daily",
        "Record yourself and compare with native speakers",
        "Focus on word stress patterns"
      ]
    },
    {
      key: "language",
      title: "Grammar & Vocabulary",
      icon: <MessageSquare className="h-5 w-5" />,
      color: "from-green-500 to-teal-600",
      scores: {
        grammar: evaluation.grammar,
        tenses: evaluation.tenses,
        vocabulary: evaluation.vocabulary,
        collocations: evaluation.collocations
      },
      feedback: evaluation.languageFeedback,
      tips: [
        "Read diverse English content daily",
        "Practice complex sentence structures",
        "Learn common word combinations"
      ]
    },
    {
      key: "delivery",
      title: "Fluency & Confidence",
      icon: <Target className="h-5 w-5" />,
      color: "from-orange-500 to-red-600",
      scores: {
        fluency: evaluation.fluency,
        speakingSpeed: evaluation.speakingSpeed,
        confidence: evaluation.confidence
      },
      feedback: evaluation.deliveryFeedback,
      tips: [
        "Practice speaking without preparation",
        "Join conversation groups",
        "Record daily speaking exercises"
      ]
    },
    {
      key: "visual",
      title: "Visual Presentation",
      icon: <Eye className="h-5 w-5" />,
      color: "from-purple-500 to-pink-600",
      scores: {
        facialExpressions: evaluation.facialExpressions,
        bodyLanguage: evaluation.bodyLanguage,
        eyeContact: evaluation.eyeContact,
        audienceInteraction: evaluation.audienceInteraction
      },
      feedback: evaluation.visualFeedback,
      tips: [
        "Maintain natural eye contact with camera",
        "Use gestures to emphasize points",
        "Practice expressive facial communication"
      ]
    },
    {
      key: "content",
      title: "Content & Writing",
      icon: <PenTool className="h-5 w-5" />,
      color: "from-cyan-500 to-blue-600",
      scores: {
        captionSpelling: evaluation.captionSpelling,
        captionGrammar: evaluation.captionGrammar,
        clarity: evaluation.clarity,
        creativity: evaluation.creativity
      },
      feedback: evaluation.captionFeedback,
      tips: [
        "Use clear, engaging language",
        "Check spelling and grammar carefully",
        "Add compelling call-to-action"
      ]
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

  if (isCompact && !expanded) {
    return (
      <motion.div
        className="p-4 rounded-xl border border-white/20 dark:border-gray-800/20 bg-gradient-to-br from-white/30 to-white/10 dark:from-gray-800/30 dark:to-gray-800/10 backdrop-blur-sm"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className="h-6 w-6 text-blue-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">AI Analysis Complete</h4>
              <p className="text-xs text-muted-foreground">Click to view detailed feedback</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getScoreBadgeColor(averageScore)} font-bold text-sm px-3 py-1`}>
              {averageScore}/100
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(true)}
              className="hover:bg-white/20 dark:hover:bg-gray-800/20"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <Card className="neo-card overflow-hidden border-none bg-gradient-to-br from-white/20 to-white/5 dark:from-gray-800/20 dark:to-gray-800/5 backdrop-blur-md shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className="h-6 w-6 text-blue-500" />
              <motion.div 
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </CardTitle>
          </div>
          <Badge className={`${getScoreBadgeColor(averageScore)} font-bold text-lg px-4 py-2`}>
            {averageScore}/100 - {getPerformanceLevel(averageScore)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Overall Score Section */}
        <motion.div 
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900 dark:text-blue-100">Overall Performance</span>
            </div>
            <span className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
              {averageScore}/100
            </span>
          </div>
          <div className="relative">
            <Progress value={averageScore} className="h-4 mb-3 bg-white/50 dark:bg-gray-800/50" />
            <motion.div
              className={`absolute top-0 left-0 h-4 rounded-full ${getProgressBarColor(averageScore)}`}
              initial={{ width: 0 }}
              animate={{ width: `${averageScore}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {evaluation.overallFeedback}
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("strengths")}
            className="bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300"
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            View Strengths
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("improvements")}
            className="bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 text-orange-700 dark:text-orange-300"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Areas to Improve
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("tips")}
            className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Get Tips
          </Button>
        </div>

        {/* Detailed Analysis Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-gray-800/50">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="strengths" className="text-xs">Strengths</TabsTrigger>
            <TabsTrigger value="improvements" className="text-xs">Improve</TabsTrigger>
            <TabsTrigger value="tips" className="text-xs">Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryData.map((category, index) => {
                const categoryAverage = Math.round(
                  Object.values(category.scores).reduce((sum, score) => sum + score, 0) / 
                  Object.values(category.scores).length
                )
                
                return (
                  <motion.div
                    key={category.key}
                    className="p-4 rounded-xl border border-white/20 dark:border-gray-700/20 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm hover:bg-white/40 dark:hover:bg-gray-800/40 transition-all cursor-pointer"
                    onClick={() => setActiveCategory(category.key)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color} text-white`}>
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{category.title}</h4>
                        <span className={`text-lg font-bold ${getScoreColor(categoryAverage)}`}>
                          {categoryAverage}/100
                        </span>
                      </div>
                    </div>
                    <Progress value={categoryAverage} className="h-2 mb-2" />
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {category.feedback}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="strengths" className="mt-4">
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <div className="font-semibold mb-2">🎉 Your Key Strengths:</div>
                <ul className="space-y-2">
                  {evaluation.strengths.map((strength, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Star className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm leading-relaxed">{strength}</span>
                    </motion.li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="improvements" className="mt-4">
            <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <AlertDescription className="text-orange-800 dark:text-orange-200">
                <div className="font-semibold mb-2">🎯 Focus Areas for Growth:</div>
                <ul className="space-y-3">
                  {evaluation.improvements.map((improvement, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-sm leading-relaxed">{improvement}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-orange-500 opacity-50" />
                    </motion.li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="tips" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {categoryData.map((category, index) => (
                <motion.div
                  key={category.key}
                  className="p-4 rounded-xl border border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    {category.icon}
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200">
                      {category.title}
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {category.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-2 text-sm">
                        <Zap className="h-3 w-3 text-purple-600 mt-1 flex-shrink-0" />
                        <span className="text-purple-700 dark:text-purple-300">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Recommendations Section */}
        {evaluation.recommendations && evaluation.recommendations.length > 0 && (
          <motion.div
            className="mt-6 p-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h5 className="font-semibold text-blue-800 dark:text-blue-200">📚 Recommended Next Steps</h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {evaluation.recommendations.map((recommendation, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <PlayCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">{recommendation}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Collapse Button */}
        {isCompact && (
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => setExpanded(false)}
              className="w-full flex items-center justify-center gap-2 py-2 hover:bg-white/20 dark:hover:bg-gray-800/20"
            >
              <ChevronUp className="h-4 w-4" />
              <span>Show Less</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
