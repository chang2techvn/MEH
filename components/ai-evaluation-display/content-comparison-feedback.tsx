import React, { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, XCircle, AlertTriangle, Lightbulb, FileText, ChevronDown, ChevronUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { type ContentComparison } from "@/app/actions/content-comparison"

interface ContentComparisonFeedbackProps {
  comparison: ContentComparison | null
  isLoading: boolean
  onRetry: () => void
  onProceed: () => void
  onGoBack: () => void
}

export default function ContentComparisonFeedback({
  comparison,
  isLoading,
  onRetry,
  onProceed,
  onGoBack,
}: ContentComparisonFeedbackProps) {
  const [showTranscript, setShowTranscript] = useState(false)
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false)
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Card className="p-6 neo-card">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neo-mint" />
            <span className="text-lg">Analyzing your content...</span>
          </div>          <p className="text-center text-muted-foreground mt-2">
            Using AI to compare your rewritten content with the video transcript
          </p>
        </Card>
      </motion.div>
    )
  }

  if (!comparison) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to analyze content at this time. Please try again.
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button onClick={onRetry} variant="outline">
            Retry Analysis
          </Button>
          <Button onClick={onGoBack} variant="outline">
            Go Back
          </Button>
        </div>
      </motion.div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getScoreIcon = (isAboveThreshold: boolean) => {
    return isAboveThreshold ? (
      <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
    ) : (
      <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
       {/* Action Buttons */}
       {/* <div className="flex gap-3 justify-end items-center w-full mb-4"> */}
      <div className="flex gap-3 justify-center">
        <Button onClick={onGoBack} variant="outline">
          Go Back & Edit
        </Button>
        
        {comparison.isAboveThreshold ? (
          <Button onClick={onProceed} className="bg-neo-mint hover:bg-neo-mint/90">
            Continue to Next Step
          </Button>
        ) : (
          <Button onClick={onRetry} variant="outline">
            Retry Analysis
          </Button>
        )}
      </div>

      {!comparison.isAboveThreshold && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your content similarity is below the 80% threshold required to proceed. 
            Please review the video again and improve your content based on the suggestions above.
          </AlertDescription>
        </Alert>
      )}
      {/* Main Score Card */}
      <Card className="p-6 neo-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Content Analysis Results</h3>
          {getScoreIcon(comparison.isAboveThreshold)}
        </div>
        
        <div className="text-center mb-6">
          <div className={`text-4xl font-bold ${getScoreColor(comparison.similarityScore)}`}>
            {comparison.similarityScore}%
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Similarity Score</p>
          <Badge 
            variant={comparison.isAboveThreshold ? "default" : "destructive"}
            className="mt-2"
          >
            {comparison.isAboveThreshold ? "Passed ✓" : "Needs Improvement"}
          </Badge>
        </div>        <Alert className={comparison.isAboveThreshold ? "border-green-200 bg-green-50 dark:bg-green-900/10" : "border-red-200 bg-red-50 dark:bg-red-900/10"}>
          <AlertDescription className="text-sm">
            {comparison.feedback}
          </AlertDescription>
        </Alert>
      </Card>

      {/* Failed Analysis - Show improvement message when < 80% */}
      {!comparison.isAboveThreshold && (
        <Card className="p-6 neo-card border-red-200 dark:border-red-800">
          <div className="text-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">
              Content Needs Improvement
            </h3>
            <p className="text-red-600 dark:text-red-400">
              Your similarity score is {comparison.similarityScore}%, which is below the required 80% threshold.
            </p>            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                📋 What you need to do:
              </h4>
              <ol className="text-sm text-red-700 dark:text-red-300 space-y-2 text-left">
                <li>1. Watch the video again carefully</li>
                <li>2. Take detailed notes while watching</li>
                <li>3. Focus on specific concepts, facts, and examples mentioned</li>
                <li>4. Rewrite your content to include more specific details</li>
                <li>5. Try again when you feel more confident</li>
              </ol>
              <div className="mt-3 p-3 bg-red-100 dark:bg-red-800/20 rounded border-l-4 border-red-400">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                  🔒 <strong>Access to detailed transcript requires 80%+ similarity score</strong>
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  You must demonstrate proper understanding before viewing the complete transcript.
                </p>
              </div>            </div>
            
            {/* Clear message about transcript access */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                🔒 Transcript Access Locked
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                You need to achieve at least 80% similarity score to unlock access to the complete video transcript. 
                This ensures you truly understand the content before moving forward.
              </p>
            </div>
            
            {/* No transcript access when failed - must achieve 80% to view transcript */}
          </div>
        </Card>
      )}{/* Detailed Analysis - Only show when passed (≥80%) */}
      {comparison.detailedAnalysis && comparison.isAboveThreshold && (
        <div className="space-y-4">
          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/10">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              🎉 Excellent work! Your content demonstrates good understanding. Here's the detailed analysis:
            </AlertDescription>
          </Alert>

          {/* Original Transcript Preview */}
          <Card className="p-6 neo-card">
            <h4 className="font-semibold mb-3 text-blue-600 dark:text-blue-400">
              📝 Original Video Transcript (Preview)
            </h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4">
                {comparison.detailedAnalysis.originalTranscript.substring(0, 300)}
                {comparison.detailedAnalysis.originalTranscript.length > 300 && "..."}
              </p>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Full transcript: {comparison.detailedAnalysis.originalTranscript.length} characters
            </div>
          </Card>

          {/* Analysis Details */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Correct Points */}
            {comparison.detailedAnalysis.correctPoints.length > 0 && (
              <Card className="p-4 neo-card border-green-200 dark:border-green-800">
                <h5 className="font-semibold mb-2 flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Correct Points
                </h5>
                <ul className="space-y-1">
                  {comparison.detailedAnalysis.correctPoints.map((point, index) => (
                    <li key={index} className="text-sm text-green-700 dark:text-green-300">
                      ✓ {point}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Missed Concepts */}
            {comparison.detailedAnalysis.missedConcepts.length > 0 && (
              <Card className="p-4 neo-card border-yellow-200 dark:border-yellow-800">
                <h5 className="font-semibold mb-2 flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  Missed Concepts
                </h5>
                <ul className="space-y-1">
                  {comparison.detailedAnalysis.missedConcepts.map((concept, index) => (
                    <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                      ⚠ {concept}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Matched Concepts */}
            {comparison.detailedAnalysis.matchedConcepts.length > 0 && (
              <Card className="p-4 neo-card border-blue-200 dark:border-blue-800">
                <h5 className="font-semibold mb-2 flex items-center gap-2 text-blue-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Matched Concepts
                </h5>
                <ul className="space-y-1">
                  {comparison.detailedAnalysis.matchedConcepts.map((concept, index) => (
                    <li key={index} className="text-sm text-blue-700 dark:text-blue-300">
                      ✓ {concept}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Incorrect Points */}
            {comparison.detailedAnalysis.incorrectPoints.length > 0 && (
              <Card className="p-4 neo-card border-red-200 dark:border-red-800">
                <h5 className="font-semibold mb-2 flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  Issues to Address
                </h5>
                <ul className="space-y-1">
                  {comparison.detailedAnalysis.incorrectPoints.map((point, index) => (
                    <li key={index} className="text-sm text-red-700 dark:text-red-300">
                      ✗ {point}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {/* Statistics */}
          <Card className="p-4 neo-card">
            <h5 className="font-semibold mb-3">📊 Content Statistics</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{comparison.detailedAnalysis.wordCount}</div>
                <div className="text-xs text-gray-500">Words Written</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{comparison.detailedAnalysis.keywordMatches}</div>
                <div className="text-xs text-gray-500">Keyword Matches</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{comparison.detailedAnalysis.matchedConcepts.length}</div>
                <div className="text-xs text-gray-500">Matched Concepts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{comparison.detailedAnalysis.missedConcepts.length}</div>
                <div className="text-xs text-gray-500">Missed Concepts</div>
              </div>
            </div>          </Card>

          {/* Full Transcript Collapsible - Only for successful users */}
          {comparison.detailedAnalysis?.originalTranscript && (
            <Card className="p-6 neo-card">
              <Collapsible open={showTranscript} onOpenChange={setShowTranscript}>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      View Complete Video Transcript
                    </span>
                    {showTranscript ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-80 overflow-y-auto">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {comparison.detailedAnalysis.originalTranscript}
                    </p>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    🎉 Congratulations! You can now access the complete transcript for reference.
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )}
        </div>
      )}

      {/* Key Matches */}
      {comparison.keyMatches.length > 0 && (
        <Card className="p-6 neo-card">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Analysis Summary
          </h4>
          <div className="flex flex-wrap gap-2">
            {comparison.keyMatches.map((match, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {match}
              </Badge>
            ))}
          </div>
        </Card>
      )}      {/* Suggestions */}
      {comparison.suggestions.length > 0 && (
        <Card className="p-6 neo-card">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            {comparison.isAboveThreshold ? "Enhancement Suggestions" : "Improvement Suggestions"}
          </h4>
          <ul className="space-y-2">
            {comparison.suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <span className="text-neo-mint mt-1">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </motion.div>
  )
}
