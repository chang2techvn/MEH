"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Award } from "lucide-react"
import VideoEvaluationDisplay from "@/components/ai-evaluation-display/video-evaluation-display"
import type { UserSubmission } from "@/app/actions/user-submissions"
import type { VideoEvaluation } from "@/lib/gemini-video-evaluation"

// Extended submission type to support both old and new formats
type ExtendedSubmission = UserSubmission | {
  id: string
  userId: string
  username: string
  userImage: string
  originalVideoId: string
  type: 'video_submission'
  videoUrl: string
  content: string
  evaluation: VideoEvaluation
  createdAt: Date
}

interface PostAISubmissionProps {
  submission: ExtendedSubmission
  videoEvaluation?: VideoEvaluation | null
  showEvaluation: boolean
  onShowEvaluationChange: (show: boolean) => void
}

export function PostAISubmission({
  submission,
  videoEvaluation,
  showEvaluation,
  onShowEvaluationChange,
}: PostAISubmissionProps) {  // Helper functions to get data from either format
  const getContent = (sub: ExtendedSubmission): string => {
    if ('content' in sub && sub.content) return sub.content
    if ('rewrittenContent' in sub && sub.rewrittenContent) return sub.rewrittenContent
    return ''
  }

  const getVideoUrl = (sub: ExtendedSubmission): string => {
    if ('videoUrl' in sub && sub.videoUrl) return sub.videoUrl
    if ('videoSubmission' in sub && sub.videoSubmission) return sub.videoSubmission
    return ''
  }

  // Helper function to get evaluation data
  const getContentEvaluation = (sub: ExtendedSubmission) => {
    if ('contentEvaluation' in sub && sub.contentEvaluation) return sub.contentEvaluation
    // For new format, use the VideoEvaluation as fallback
    if ('evaluation' in sub && sub.evaluation) {
      return {
        feedback: sub.evaluation.feedback || '',
        grammarScore: sub.evaluation.pronunciationScore || 0,
        contentScore: sub.evaluation.score || 0,
        originalityScore: sub.evaluation.fluencyScore || 0
      }
    }
    return null
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 70) return "text-blue-500"
    if (score >= 50) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <motion.div
      className="mt-4 space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >      <motion.div
        className="p-4 rounded-xl border border-white/20 dark:border-gray-800/20 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm"
        whileHover={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
      >
        <div
          className="prose dark:prose-invert prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: getContent(submission) }}
        />
      </motion.div>

      {getVideoUrl(submission) && getVideoUrl(submission).trim() !== "" && (
        <motion.div
          className="rounded-xl overflow-hidden bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm"
          whileHover={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <video
              className="absolute top-0 left-0 w-full h-full object-contain"
              controls
              poster="/placeholder.svg?height=400&width=600"
            >
              <source src={getVideoUrl(submission)} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showEvaluation ? (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="ghost"
              onClick={() => onShowEvaluationChange(false)}
              className="w-full flex items-center justify-center gap-2 py-2"
            >
              Hide AI Evaluation
            </Button>            {/* Display comprehensive video evaluation if available */}
            {videoEvaluation ? (
              <VideoEvaluationDisplay evaluation={videoEvaluation} showFullDetails={true} />
            ) : (
              /* Fallback to legacy content evaluation */
              (() => {
                const contentEval = getContentEvaluation(submission)
                if (!contentEval) return null
                
                return (
                  <motion.div
                    className="p-4 rounded-xl border border-white/20 dark:border-gray-800/20 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h4 className="font-medium mb-3">AI Evaluation</h4>
                    <p className="text-sm mb-4">{contentEval.feedback}</p>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Grammar & Language</span>
                          <span className={getScoreColor(contentEval.grammarScore)}>
                            {contentEval.grammarScore}/100
                          </span>
                        </div>
                        <Progress value={contentEval.grammarScore} className="h-2">
                          <motion.div
                            className="h-full bg-gradient-to-r from-neo-mint to-purist-blue rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${contentEval.grammarScore}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                          />
                        </Progress>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Content Quality</span>
                          <span className={getScoreColor(contentEval.contentScore)}>
                            {contentEval.contentScore}/100
                          </span>
                        </div>
                        <Progress value={contentEval.contentScore} className="h-2">
                          <motion.div
                            className="h-full bg-gradient-to-r from-neo-mint to-purist-blue rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${contentEval.contentScore}%` }}
                            transition={{ duration: 1, delay: 0.4 }}
                          />
                        </Progress>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Originality</span>
                          <span className={getScoreColor(contentEval.originalityScore)}>
                            {contentEval.originalityScore}/100
                          </span>
                        </div>
                        <Progress value={contentEval.originalityScore} className="h-2">
                          <motion.div
                            className="h-full bg-gradient-to-r from-neo-mint to-purist-blue rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${contentEval.originalityScore}%` }}
                            transition={{ duration: 1, delay: 0.6 }}
                          />
                        </Progress>
                      </div>
                    </div>
                  </motion.div>
                )
              })()
            )}
          </motion.div>
        ) : (
          <motion.div
            
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Button
              variant="ghost"
              onClick={() => onShowEvaluationChange(true)}
              className="w-full flex items-center justify-center gap-2 py-2 bg-white/10 dark:bg-gray-800/10 hover:bg-white/20 dark:hover:bg-gray-800/20"
            >
              <Award className="h-4 w-4 mr-1" />
              {videoEvaluation ? "Show Comprehensive AI Evaluation" : "Show AI Evaluation"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
