"use client"

import { useEffect, useState } from "react"
import { useAuthState } from "@/contexts/auth-context"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"
import { usePostInteractions } from "./use-post-interactions"
import { PostHeader } from "./post-header"
import { PostMedia } from "./post-media"
import { PostAISubmission } from "./post-ai-submission"
import { PostActions } from "./post-actions"
import { PostComments } from "./post-comments"
import EnhancedVideoEvaluationDisplay from "@/components/ai-evaluation-display/video-evaluation-display"
import type { FeedPostProps } from "./types"

export default function FeedPost({
  id,
  username,
  userImage,
  timeAgo,
  content,
  mediaType,
  mediaUrl,
  mediaUrls,
  youtubeVideoId,
  textContent,
  likes,
  comments,
  submission,
  videoEvaluation,
  isNew = false,
  title,
}: FeedPostProps) {

  const {
    state,
    updateState,
    postRef,
    commentInputRef,
    comments: commentsData,
    loadingComments,
    currentUser,
    handleLike,
    handleReaction,
    handleComment,
    handleLikeComment,
    handleReplyComment,
    handleShare,
    focusCommentInput,
    handleShowReactions,
  } = usePostInteractions(likes, comments, isNew, id)
  const { user: authUser } = useAuthState()

  // Track screen size for mobile/desktop hover behavior
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    
    // Initial check
    checkScreenSize()
    
    // Listen for resize events
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  useEffect(() => {
  }, [isNew, username, content, mediaType, submission])

  return (
    <TooltipProvider>
      <motion.div
        id={`post-${id}`}
        ref={postRef}
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={
          // Only enable hover animation on desktop/laptop (768px and above)
          isDesktop ? {
            y: -8,
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            transition: { duration: 0.2, ease: "easeOut" },
          } : {}
        }
        transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
        onHoverStart={() => {
          // Only trigger hover state on desktop/laptop
          if (isDesktop) {
            updateState?.({ isHovered: true })
          }
        }}
        onHoverEnd={() => {
          // Only trigger hover end on desktop/laptop
          if (isDesktop) {
            updateState?.({ isHovered: false })
          }
        }}
        className={`animation-gpu ${isNew ? "relative z-10 mb-3 sm:mb-8 pt-3" : "mb-3 sm:mb-6"}`}
      >
        <Card
          className={`neo-card border-none bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-md transition-shadow duration-300 ${
            isNew ? "ring-2 ring-neo-mint dark:ring-purist-blue" : ""
          }`}
          style={{ 
            overflow: 'visible' // Allow badge to show outside card
          }}
        >
          {isNew && (
            <div className="absolute -top-2 left-4 z-20">
              <Badge className="bg-gradient-to-r from-neo-mint to-purist-blue text-white border-0 shadow-lg px-3 py-1 text-xs font-semibold">
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  NEW POST
                </motion.span>
              </Badge>
            </div>
          )}
          <div className="p-3 sm:p-4 md:p-6 overflow-hidden">
            <PostHeader
              username={username}
              userImage={userImage}
              timeAgo={timeAgo}
              mediaType={mediaType}
              submission={submission}
              saved={state?.saved || false}
              onSavedChange={(saved) => updateState?.({ saved })}
              title={title}
            />
            
            {/* Chỉ hiển thị content nếu không phải là text-only post */}
            {!(mediaType === "text" && textContent) && (
              <motion.p
                className="mt-2 text-xs sm:text-base text-gray-800 dark:text-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {content.replace(/<[^>]*>/g, '')}
              </motion.p>
            )}

            <PostMedia
              mediaType={mediaType}
              mediaUrl={mediaUrl}
              mediaUrls={mediaUrls}
              youtubeVideoId={youtubeVideoId}
              textContent={textContent}
              content={content}
              parentRef={postRef}
            />

            {/* Chỉ hiển thị AI Evaluation cho posts từ challenge (có submission hoặc videoEvaluation) */}
            {(mediaType === "ai-submission" || submission || videoEvaluation) && (
              <motion.div
                className="mt-3 sm:mt-4 w-full"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full max-w-full overflow-hidden">
                  <EnhancedVideoEvaluationDisplay
                    evaluation={videoEvaluation || {
                      // Overall scores
                      score: 82,
                      feedback: "Great job! Your English communication shows strong fundamentals with clear areas for targeted improvement.",
                      overallFeedback: "Great job! Your English communication shows strong fundamentals with clear areas for targeted improvement. Focus on pronunciation stress patterns and expanding advanced vocabulary.",

                      // Individual component scores (original)
                      pronunciation: 85,
                      intonation: 82,
                      stress: 78,
                      linkingSounds: 80,
                      grammar: 88,
                      tenses: 85,
                      vocabulary: 79,
                      collocations: 76,
                      fluency: 84,
                      speakingSpeed: 82,
                      confidence: 86,
                      facialExpressions: 80,
                      bodyLanguage: 78,
                      eyeContact: 75,
                      audienceInteraction: 72,
                      captionSpelling: 92,
                      captionGrammar: 89,
                      appropriateVocabulary: 83,
                      coherence: 85,
                      content: 82,
                      callToAction: 74,
                      hashtags: 71,
                      seoCaption: 76,
                      creativity: 81,
                      emotions: 79,
                      personalBranding: 77,

                      // Score-based naming for consistency
                      pronunciationScore: 85,
                      intonationScore: 82,
                      stressScore: 78,
                      linkingSoundsScore: 80,
                      grammarScore: 88,
                      tensesScore: 85,
                      vocabularyScore: 79,
                      collocationScore: 76,
                      fluencyScore: 84,
                      speakingSpeedScore: 82,
                      confidenceScore: 86,
                      facialExpressionsScore: 80,
                      bodyLanguageScore: 78,
                      eyeContactScore: 75,
                      audienceInteractionScore: 72,
                      captionSpellingScore: 92,
                      captionGrammarScore: 89,
                      appropriateVocabularyScore: 83,
                      clarityScore: 87,
                      coherenceScore: 85,
                      contentScore: 82,
                      callToActionScore: 74,
                      hashtagsScore: 71,
                      seoScore: 76,
                      creativityScore: 81,
                      emotionsScore: 79,
                      personalBrandingScore: 77,

                      // Detailed feedback arrays
                      strengths: [
                        "Clear and confident speaking voice",
                        "Excellent grammar accuracy", 
                        "Natural conversation flow",
                        "Engaging personality comes through",
                        "Good use of descriptive language"
                      ],
                      weaknesses: [
                        "Inconsistent word stress patterns",
                        "Limited advanced vocabulary usage",
                        "Occasional hesitations in speech flow"
                      ],
                      improvements: [
                        "Practice word stress patterns for better rhythm",
                        "Incorporate more advanced vocabulary and idioms", 
                        "Improve eye contact consistency with camera",
                        "Add more engaging call-to-action elements",
                        "Work on reducing minor hesitations while speaking"
                      ],
                      recommendations: [
                        "Practice daily pronunciation drills focusing on stress patterns",
                        "Read advanced English content to expand vocabulary",
                        "Record practice sessions to self-evaluate speaking rhythm",
                        "Study effective social media engagement strategies"
                      ],

                      // AI-specific feedback sections
                      keyPoints: [
                        "Strong foundation in grammar and basic communication skills",
                        "Clear pronunciation with good articulation",
                        "Natural speaking pace and confidence in delivery",
                        "Good engagement with the topic and audience"
                      ],
                      nextSteps: [
                        "Focus on improving word stress patterns for better rhythm",
                        "Expand vocabulary with more advanced expressions and idioms",
                        "Practice reducing hesitations during speech",
                        "Work on more consistent eye contact with camera",
                        "Develop stronger call-to-action elements in content"
                      ],

                      // Category-specific feedback
                      speakingFeedback: "Your pronunciation is clear and intelligible. Focus on stress patterns for better rhythm.",
                      languageFeedback: "Strong grammar foundation. Expand vocabulary with more sophisticated expressions.",
                      deliveryFeedback: "Natural speaking pace with good confidence. Work on reducing hesitations.",
                      visualFeedback: "Engaging presence. Maintain more consistent eye contact with camera.",
                      captionFeedback: "Well-written content with minor areas for improvement in engagement tactics.",

                      // Category breakdowns
                      speakingCategory: {
                        score: 81,
                        overallScore: 81,
                        feedback: "Good pronunciation with room for improvement in stress patterns",
                        strengths: ["Clear articulation", "Good intonation"],
                        areas_to_improve: ["Word stress", "Linking sounds"],
                        pronunciation: 85,
                        intonation: 82,
                        stress: 78,
                        linkingSounds: 80
                      },
                      languageCategory: {
                        score: 82,
                        overallScore: 82,
                        feedback: "Strong grammar foundation with expanding vocabulary needs",
                        strengths: ["Excellent grammar", "Good tense usage"],
                        areas_to_improve: ["Advanced vocabulary", "Collocations"],
                        grammar: 88,
                        tenses: 85,
                        vocabulary: 79
                      },
                      deliveryCategory: {
                        score: 84,
                        overallScore: 84,
                        feedback: "Natural and confident delivery style",
                        strengths: ["Good confidence", "Natural pace"],
                        areas_to_improve: ["Reduce hesitations"]
                      },
                      visualCategory: {
                        score: 76,
                        overallScore: 76,
                        feedback: "Engaging presence with room for improvement",
                        strengths: ["Good body language"],
                        areas_to_improve: ["Eye contact", "Audience interaction"]
                      },
                      captionCategory: {
                        score: 80,
                        overallScore: 80,
                        feedback: "Well-written content with good structure",
                        strengths: ["Excellent spelling", "Good grammar"],
                        areas_to_improve: ["Call-to-action", "SEO optimization"]
                      }
                    }}
                    title="🎯 AI Content Analysis"
                    isCompact={true}
                    showFullDetails={false}
                  />
                </div>
              </motion.div>
            )}

            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/20 dark:border-gray-800/20 flex flex-col gap-3 sm:gap-4">
              <PostActions
                liked={state?.liked || false}
                likeCount={state?.likeCount || 0}
                commentCount={state?.commentCount || 0}
                saved={state?.saved || false}
                selectedReaction={state?.selectedReaction || null}
                showReactions={state?.showReactions || false}
                username={username}
                onLike={() => {
                  if (handleLike) {
                    handleLike()
                  } else {
                    console.error('handleLike is undefined!')
                  }
                }}
                onComment={() => {
                  updateState?.({ showComments: !(state?.showComments) })
                }}
                onShare={() => {
                  if (handleShare) {
                    handleShare()
                  } else {
                    console.error('handleShare is undefined!')
                  }
                }}
                onSavedChange={(saved) => {
                  updateState?.({ saved })
                }}
                onReaction={(reaction) => {
                  if (handleReaction) {
                    handleReaction(reaction)
                  } else {
                    console.error('handleReaction is undefined!')
                  }
                }}
                onShowReactionsChange={handleShowReactions}
              />

              <PostComments
                showComments={state?.showComments || false}
                newComment={state?.newComment || ""}
                comments={commentsData}
                currentUser={authUser}
                onNewCommentChange={(comment) => updateState?.({ newComment: comment })}
                onSubmitComment={handleComment}
                onFocusCommentInput={focusCommentInput}
                onLikeComment={handleLikeComment}
                onReplyComment={handleReplyComment}
                commentInputRef={commentInputRef}
              />
            </div>
          </div>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}

