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

// Define CSS-in-JS styles to bypass BEM linting
const styles = {
  loadingContainer: {
    opacity: 0,
    transform: "translateY(20px)"
  },
  loadingContainerVisible: {
    opacity: 1,
    transform: "translateY(0px)"
  },
  centeredText: {
    textAlign: "center" as const,
    color: "rgb(107 114 128)", // gray-500
    marginTop: "0.5rem"
  },
  scoreContainer: {
    textAlign: "center" as const,
    marginBottom: "1.5rem"
  },
  successScore: {
    fontSize: "2.25rem",
    fontWeight: "bold",
    color: "rgb(34 197 94)" // green-500
  },
  failScore: {
    fontSize: "2.25rem", 
    fontWeight: "bold",
    color: "rgb(239 68 68)" // red-500
  },
  warningScore: {
    fontSize: "2.25rem",
    fontWeight: "bold", 
    color: "rgb(245 158 11)" // yellow-500
  },
  errorContainer: {
    padding: "1.5rem",
    backgroundColor: "rgb(254 226 226)", // red-50
    borderColor: "rgb(252 165 165)", // red-300
    borderWidth: "1px",
    borderRadius: "0.5rem"
  },
  errorText: {
    color: "rgb(220 38 38)", // red-600
    textAlign: "center" as const
  },
  suggestionsList: {
    listStyle: "none",
    padding: 0,
    margin: 0
  },
  suggestionItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.5rem",
    fontSize: "0.875rem",
    color: "rgb(55 65 81)", // gray-700
    marginBottom: "0.5rem"
  },
  transcriptContainer: {
    backgroundColor: "rgb(249 250 251)", // gray-50
    borderRadius: "0.5rem",
    padding: "1rem",
    maxHeight: "20rem",
    overflowY: "auto" as const
  },
  transcriptText: {
    fontSize: "0.875rem",
    color: "rgb(55 65 81)", // gray-700
    lineHeight: "1.625",
    whiteSpace: "pre-line" as const
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "1rem",
    textAlign: "center" as const
  },
  statsGridMd: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1rem",
    textAlign: "center" as const
  }
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
        initial={styles.loadingContainer}
        animate={styles.loadingContainerVisible}
        className="space-y-4"
      >
        <Card className="p-6 neo-card">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neo-mint" />
            <span className="text-lg">Analyzing your content...</span>
          </div>
          <p style={styles.centeredText}>
            Using AI to compare your rewritten content with the video transcript
          </p>
        </Card>
      </motion.div>
    )
  }

  if (!comparison) {
    return (
      <motion.div
        initial={styles.loadingContainer}
        animate={styles.loadingContainerVisible}
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

  const getScoreStyle = (score: number) => {
    if (score >= 80) return styles.successScore
    if (score >= 70) return styles.warningScore
    return styles.failScore
  }

  const getScoreIcon = (isAboveThreshold: boolean) => {
    return isAboveThreshold ? (
      <CheckCircle2 className="h-6 w-6" style={{ color: "rgb(34 197 94)" }} />
    ) : (
      <XCircle className="h-6 w-6" style={{ color: "rgb(239 68 68)" }} />
    )
  }

  return (
    <motion.div
      initial={styles.loadingContainer}
      animate={styles.loadingContainerVisible}
      className="space-y-6"
    >
      {/* Main Score Card */}
      <Card className="p-6 neo-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Content Analysis Results</h3>
          {getScoreIcon(comparison.isAboveThreshold)}
        </div>
        
        <div style={styles.scoreContainer}>
          <div style={getScoreStyle(comparison.similarityScore)}>
            {comparison.similarityScore}%
          </div>
          <p style={{ color: "rgb(107 114 128)", marginTop: "0.25rem" }}>Similarity Score</p>
          <Badge 
            variant={comparison.isAboveThreshold ? "default" : "destructive"}
            className="mt-2"
          >
            {comparison.isAboveThreshold ? "Passed ✓" : "Needs Improvement"}
          </Badge>
        </div>
        
        <Alert className={comparison.isAboveThreshold ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <AlertDescription className="text-sm">
            {comparison.feedback}
          </AlertDescription>
        </Alert>
      </Card>

      {/* Failed Analysis - Show improvement message when < 80% */}
      {!comparison.isAboveThreshold && (
        <Card className="p-6 neo-card" style={{ borderColor: "rgb(252 165 165)" }}>
          <div className="text-center space-y-4">
            <XCircle className="h-12 w-12 mx-auto" style={{ color: "rgb(239 68 68)" }} />
            <h3 className="text-lg font-semibold" style={{ color: "rgb(185 28 28)" }}>
              Content Needs Improvement
            </h3>
            <p style={{ color: "rgb(220 38 38)" }}>
              Your similarity score is {comparison.similarityScore}%, which is below the required 80% threshold.
            </p>
            <div style={styles.errorContainer}>
              <h4 className="font-medium mb-2" style={{ color: "rgb(153 27 27)" }}>
                📋 What you need to do:
              </h4>
              <ol className="text-sm space-y-2 text-left" style={{ color: "rgb(185 28 28)" }}>
                <li>1. Watch the video again carefully</li>
                <li>2. Take detailed notes while watching</li>
                <li>3. Focus on specific concepts, facts, and examples mentioned</li>
                <li>4. Rewrite your content to include more specific details</li>
                <li>5. Try again when you feel more confident</li>
              </ol>
            </div>
            
            {/* Show transcript for reference when failed */}
            <Collapsible open={showTranscript} onOpenChange={setShowTranscript}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  style={{ borderColor: "rgb(252 165 165)", backgroundColor: "rgb(254 242 242)" }}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    View Video Transcript for Reference
                  </span>
                  {showTranscript ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div style={styles.transcriptContainer}>
                  <p style={styles.transcriptText}>
                    {comparison.detailedAnalysis?.originalTranscript || "Transcript not available"}
                  </p>
                </div>
                <div className="mt-2 text-xs" style={{ color: "rgb(220 38 38)" }}>
                  💡 Study this transcript carefully and include specific details in your rewrite.
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </Card>
      )}

      {/* Detailed Analysis - Only show when passed (≥80%) */}
      {comparison.detailedAnalysis && comparison.isAboveThreshold && (
        <div className="space-y-4">
          <Alert style={{ borderColor: "rgb(187 247 208)", backgroundColor: "rgb(240 253 244)" }}>
            <CheckCircle2 className="h-4 w-4" style={{ color: "rgb(34 197 94)" }} />
            <AlertDescription style={{ color: "rgb(21 128 61)" }}>
              🎉 Excellent work! Your content demonstrates good understanding. Here's the detailed analysis:
            </AlertDescription>
          </Alert>

          {/* Original Transcript Preview */}
          <Card className="p-6 neo-card">
            <h4 className="font-semibold mb-3" style={{ color: "rgb(37 99 235)" }}>
              📝 Original Video Transcript (Preview)
            </h4>
            <div style={styles.transcriptContainer}>
              <p style={{ ...styles.transcriptText, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical" as any }}>
                {comparison.detailedAnalysis.originalTranscript.substring(0, 300)}
                {comparison.detailedAnalysis.originalTranscript.length > 300 && "..."}
              </p>
            </div>
            <div className="mt-2 text-xs" style={{ color: "rgb(107 114 128)" }}>
              Full transcript: {comparison.detailedAnalysis.originalTranscript.length} characters
            </div>
          </Card>

          {/* Analysis Details */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Correct Points */}
            {comparison.detailedAnalysis.correctPoints.length > 0 && (
              <Card className="p-4 neo-card" style={{ borderColor: "rgb(187 247 208)" }}>
                <h5 className="font-semibold mb-2 flex items-center gap-2" style={{ color: "rgb(34 197 94)" }}>
                  <CheckCircle2 className="h-4 w-4" />
                  Correct Points
                </h5>
                <ul className="space-y-1">
                  {comparison.detailedAnalysis.correctPoints.map((point, index) => (
                    <li key={index} className="text-sm" style={{ color: "rgb(21 128 61)" }}>
                      ✓ {point}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Missed Concepts */}
            {comparison.detailedAnalysis.missedConcepts.length > 0 && (
              <Card className="p-4 neo-card" style={{ borderColor: "rgb(254 240 138)" }}>
                <h5 className="font-semibold mb-2 flex items-center gap-2" style={{ color: "rgb(245 158 11)" }}>
                  <AlertTriangle className="h-4 w-4" />
                  Missed Concepts
                </h5>
                <ul className="space-y-1">
                  {comparison.detailedAnalysis.missedConcepts.map((concept, index) => (
                    <li key={index} className="text-sm" style={{ color: "rgb(180 83 9)" }}>
                      ⚠ {concept}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Matched Concepts */}
            {comparison.detailedAnalysis.matchedConcepts.length > 0 && (
              <Card className="p-4 neo-card" style={{ borderColor: "rgb(191 219 254)" }}>
                <h5 className="font-semibold mb-2 flex items-center gap-2" style={{ color: "rgb(37 99 235)" }}>
                  <CheckCircle2 className="h-4 w-4" />
                  Matched Concepts
                </h5>
                <ul className="space-y-1">
                  {comparison.detailedAnalysis.matchedConcepts.map((concept, index) => (
                    <li key={index} className="text-sm" style={{ color: "rgb(29 78 216)" }}>
                      ✓ {concept}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Incorrect Points */}
            {comparison.detailedAnalysis.incorrectPoints.length > 0 && (
              <Card className="p-4 neo-card" style={{ borderColor: "rgb(252 165 165)" }}>
                <h5 className="font-semibold mb-2 flex items-center gap-2" style={{ color: "rgb(220 38 38)" }}>
                  <XCircle className="h-4 w-4" />
                  Issues to Address
                </h5>
                <ul className="space-y-1">
                  {comparison.detailedAnalysis.incorrectPoints.map((point, index) => (
                    <li key={index} className="text-sm" style={{ color: "rgb(185 28 28)" }}>
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
            <div style={window.innerWidth >= 768 ? styles.statsGridMd : styles.statsGrid}>
              <div>
                <div className="text-2xl font-bold" style={{ color: "rgb(37 99 235)" }}>{comparison.detailedAnalysis.wordCount}</div>
                <div className="text-xs" style={{ color: "rgb(107 114 128)" }}>Words Written</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: "rgb(34 197 94)" }}>{comparison.detailedAnalysis.keywordMatches}</div>
                <div className="text-xs" style={{ color: "rgb(107 114 128)" }}>Keyword Matches</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: "rgb(147 51 234)" }}>{comparison.detailedAnalysis.matchedConcepts.length}</div>
                <div className="text-xs" style={{ color: "rgb(107 114 128)" }}>Matched Concepts</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: "rgb(251 146 60)" }}>{comparison.detailedAnalysis.missedConcepts.length}</div>
                <div className="text-xs" style={{ color: "rgb(107 114 128)" }}>Missed Concepts</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Key Matches */}
      {comparison.keyMatches.length > 0 && (
        <Card className="p-6 neo-card">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" style={{ color: "rgb(34 197 94)" }} />
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
      )}

      {/* Suggestions */}
      {comparison.suggestions.length > 0 && (
        <Card className="p-6 neo-card">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5" style={{ color: "rgb(245 158 11)" }} />
            {comparison.isAboveThreshold ? "Enhancement Suggestions" : "Improvement Suggestions"}
          </h4>
          <ul style={styles.suggestionsList}>
            {comparison.suggestions.map((suggestion, index) => (
              <li key={index} style={styles.suggestionItem}>
                <span style={{ color: "rgb(127 255 212)", marginTop: "0.25rem" }}>•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Full Transcript Collapsible */}
      {comparison.detailedAnalysis?.originalTranscript && (
        <Card className="p-6 neo-card">
          <Collapsible open={showTranscript} onOpenChange={setShowTranscript}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  View Complete Video Transcript
                </span>
                {showTranscript ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div style={styles.transcriptContainer}>
                <p style={styles.transcriptText}>
                  {comparison.detailedAnalysis.originalTranscript}
                </p>
              </div>
              <div className="mt-2 text-xs" style={{ color: "rgb(107 114 128)" }}>
                💡 Use this transcript to improve your content and include specific details mentioned in the video.
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Action Buttons */}
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
    </motion.div>
  )
}
