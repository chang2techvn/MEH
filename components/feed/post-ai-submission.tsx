"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Award } from "lucide-react"
import VideoEvaluationDisplay from "@/components/video-evaluation-display"
import type { UserSubmission } from "@/app/actions/user-submissions"
import type { VideoEvaluation } from "@/lib/gemini-video-evaluation"

interface PostAISubmissionProps {
  submission: UserSubmission
  videoEvaluation?: VideoEvaluation | null
  showEvaluation: boolean
  onShowEvaluationChange: (show: boolean) => void
}

export function PostAISubmission({
  submission,
  videoEvaluation,
  showEvaluation,
  onShowEvaluationChange,
}: PostAISubmissionProps) {
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
    >
      <motion.div
        className="p-4 rounded-xl border border-white/20 dark:border-gray-800/20 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm"
        whileHover={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
      >        <div
          className="prose dark:prose-invert prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: submission.rewrittenContent }}
        />
      </motion.div>

      {submission.videoSubmission && submission.videoSubmission.trim() !== "" && (
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
              <source src={submission.videoSubmission} type="video/mp4" />
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
            </Button>

            {/* Display comprehensive video evaluation if available */}
            {videoEvaluation ? (
              <VideoEvaluationDisplay evaluation={videoEvaluation} showFullDetails={true} />
            ) : (
              /* Fallback to legacy content evaluation */
              <motion.div
                className="p-4 rounded-xl border border-white/20 dark:border-gray-800/20 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h4 className="font-medium mb-3">AI Evaluation</h4>
                <p className="text-sm mb-4">{submission.contentEvaluation.feedback}</p>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Grammar & Language</span>
                      <span className={getScoreColor(submission.contentEvaluation.grammarScore)}>
                        {submission.contentEvaluation.grammarScore}/100
                      </span>
                    </div>
                    <Progress value={submission.contentEvaluation.grammarScore} className="h-2">
                      <motion.div
                        className="h-full bg-gradient-to-r from-neo-mint to-purist-blue rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${submission.contentEvaluation.grammarScore}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </Progress>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Content Quality</span>
                      <span className={getScoreColor(submission.contentEvaluation.contentScore)}>
                        {submission.contentEvaluation.contentScore}/100
                      </span>
                    </div>
                    <Progress value={submission.contentEvaluation.contentScore} className="h-2">
                      <motion.div
                        className="h-full bg-gradient-to-r from-neo-mint to-purist-blue rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${submission.contentEvaluation.contentScore}%` }}
                        transition={{ duration: 1, delay: 0.4 }}
                      />
                    </Progress>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Originality</span>
                      <span className={getScoreColor(submission.contentEvaluation.originalityScore)}>
                        {submission.contentEvaluation.originalityScore}/100
                      </span>
                    </div>
                    <Progress value={submission.contentEvaluation.originalityScore} className="h-2">
                      <motion.div
                        className="h-full bg-gradient-to-r from-neo-mint to-purist-blue rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${submission.contentEvaluation.originalityScore}%` }}
                        transition={{ duration: 1, delay: 0.6 }}
                      />
                    </Progress>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.02 }}
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
