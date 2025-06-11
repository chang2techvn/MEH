"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"
import { usePostInteractions } from "./feed/use-post-interactions"
import { PostHeader } from "./feed/post-header"
import { PostMedia } from "./feed/post-media"
import { PostAISubmission } from "./feed/post-ai-submission"
import { PostActions } from "./feed/post-actions"
import { PostComments } from "./feed/post-comments"
import type { FeedPostProps } from "./feed/types"

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
        initial={isNew ? { opacity: 0, y: 20, scale: 0.95 } : { opacity: 0, y: 20 }}
        animate={
          isNew
            ? {
                opacity: 1,
                y: 0,
                scale: 1,
                boxShadow: ["0 0 0 rgba(0,0,0,0)", "0 0 20px rgba(var(--neo-mint), 0.5)", "0 0 0 rgba(0,0,0,0)"],
              }
            : state.hasBeenViewed
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 20 }
        }
        whileHover={{
          scale: 1.01,
          transition: { duration: 0.2 },
        }}
        transition={
          isNew
            ? {
                duration: 0.5,
                type: "spring",
                stiffness: 100,
                boxShadow: { duration: 2, repeat: 3, repeatType: "reverse" },
              }
            : { duration: 0.3, type: "spring", stiffness: 100 }
        }
        onHoverStart={() => updateState({ isHovered: true })}
        onHoverEnd={() => updateState({ isHovered: false })}
        className={`animation-gpu ${isNew ? "relative z-10 mb-8" : "mb-6"}`}
      >
        <Card
          className={`neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo ${
            isNew ? "ring-2 ring-neo-mint dark:ring-purist-blue" : ""
          } ${state.isHovered ? "shadow-lg" : ""}`}
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
              saved={state.saved}
              onSavedChange={(saved) => updateState({ saved })}
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
                showEvaluation={state.showEvaluation}
                onShowEvaluationChange={(show) => updateState({ showEvaluation: show })}
              />
            )}

            <div className="mt-6 pt-4 border-t border-white/20 dark:border-gray-800/20 flex flex-col gap-4">
              <PostActions
                liked={state.liked}
                likeCount={state.likeCount}
                commentCount={state.commentCount}
                saved={state.saved}
                selectedReaction={state.selectedReaction}
                showReactions={state.showReactions}
                username={username}
                onLike={handleLike}
                onComment={() => updateState({ showComments: !state.showComments })}
                onShare={handleShare}
                onSavedChange={(saved) => updateState({ saved })}
                onReaction={handleReaction}
                onShowReactionsChange={(show) => updateState({ showReactions: show })}
              />

              <PostComments
                showComments={state.showComments}
                newComment={state.newComment}
                onNewCommentChange={(comment) => updateState({ newComment: comment })}
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

