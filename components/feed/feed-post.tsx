"use client"

import { useEffect } from "react"
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
import type { FeedPostProps } from "./types"

export default function FeedPost({
  username,
  userImage,
  timeAgo,
  content,
  mediaType,
  mediaUrl,
  youtubeVideoId,
  textContent,
  likes,
  comments,
  submission,
  videoEvaluation,
  isNew = false,
}: FeedPostProps) {
  console.log('🎨 Rendering FeedPost:', { username, content, mediaType, likes, comments })
  
  const {
    state,
    updateState,
    postRef,
    commentInputRef,
    handleLike,
    handleReaction,
    handleComment,
    handleShare,
    focusCommentInput,
  } = usePostInteractions(likes, comments, isNew)

  useEffect(() => {
    if (isNew) {
      console.log("Rendering new post:", { username, content, mediaType, submission })
    }
  }, [isNew, username, content, mediaType, submission])

  return (
    <TooltipProvider>
      <motion.div
        ref={postRef}
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          scale: 1.01,
          transition: { duration: 0.2 },
        }}
        transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
        onHoverStart={() => updateState?.({ isHovered: true })}
        onHoverEnd={() => updateState?.({ isHovered: false })}
        className={`animation-gpu ${isNew ? "relative z-10 mb-8" : "mb-6"}`}
      >
        <Card
          className={`neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo ${
            isNew ? "ring-2 ring-neo-mint dark:ring-purist-blue" : ""
          } ${state?.isHovered ? "shadow-lg" : ""}`}
        >
          {isNew && (
            <div className="absolute -top-3 left-4 z-10">
              <Badge className="bg-gradient-to-r from-neo-mint to-purist-blue text-white border-0 shadow-glow-sm px-3 py-1">
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  New Post
                </motion.span>
              </Badge>
            </div>
          )}
          <div className="p-6">
            <PostHeader
              username={username}
              userImage={userImage}
              timeAgo={timeAgo}
              mediaType={mediaType}
              submission={submission}
              saved={state?.saved || false}
              onSavedChange={(saved) => updateState?.({ saved })}
            />
            
            <motion.p
              className="mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {content}
            </motion.p>

            <PostMedia
              mediaType={mediaType}
              mediaUrl={mediaUrl}
              youtubeVideoId={youtubeVideoId}
              textContent={textContent}
              content={content}
            />

            {mediaType === "ai-submission" && submission && (
              <PostAISubmission
                submission={submission}
                videoEvaluation={videoEvaluation}
                showEvaluation={state?.showEvaluation || false}
                onShowEvaluationChange={(show) => updateState?.({ showEvaluation: show })}
              />
            )}

            <div className="mt-6 pt-4 border-t border-white/20 dark:border-gray-800/20 flex flex-col gap-4">
              <PostActions
                liked={state?.liked || false}
                likeCount={state?.likeCount || 0}
                commentCount={state?.commentCount || 0}
                saved={state?.saved || false}
                selectedReaction={state?.selectedReaction || null}
                showReactions={state?.showReactions || false}
                username={username}
                onLike={handleLike}
                onComment={() => updateState?.({ showComments: !(state?.showComments) })}
                onShare={handleShare}
                onSavedChange={(saved) => updateState?.({ saved })}
                onReaction={handleReaction}
                onShowReactionsChange={(show) => updateState?.({ showReactions: show })}
              />

              <PostComments
                showComments={state?.showComments || false}
                newComment={state?.newComment || ""}
                onNewCommentChange={(comment) => updateState?.({ newComment: comment })}
                onSubmitComment={handleComment}
                onFocusCommentInput={focusCommentInput}
                commentInputRef={commentInputRef}
              />
            </div>
          </div>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}

