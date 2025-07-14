"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Heart, MessageCircle } from "lucide-react"

interface Comment {
  id: string
  user_id: string
  content: string
  created_at: string
  user_name?: string
  user_avatar?: string
  likes_count: number
  parent_id?: string | null
  replies?: Comment[]
  liked_by_user?: boolean
  user_reaction?: string | null
  top_reaction?: string | null
  reactions_summary?: Record<string, number>
}

import { CommentReactions } from "./comment-reactions"

interface PostCommentsProps {
  showComments: boolean
  newComment: string
  comments: Comment[]
  currentUser?: any
  onNewCommentChange: (comment: string) => void
  onSubmitComment: () => void
  onFocusCommentInput: () => void
  onLikeComment?: (commentId: string, reaction?: string) => void
  onReplyComment?: (commentId: string, content: string) => void
  commentInputRef: React.RefObject<HTMLTextAreaElement | null>
}

function CommentItem({ 
  comment, 
  currentUser, 
  onLikeComment, 
  onReplyComment 
}: { 
  comment: Comment
  currentUser?: any
  onLikeComment?: (commentId: string, reaction?: string) => void
  onReplyComment?: (commentId: string, content: string) => void
}) {
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [showReplies, setShowReplies] = useState(false) // State to control replies visibility
  const [showReactions, setShowReactions] = useState(false) // State for hover reactions
  const hideReactionsTimeout = useRef<NodeJS.Timeout | null>(null)

  const handleReplySubmit = () => {
    if (replyText.trim() && onReplyComment) {
      onReplyComment(comment.id, replyText.trim())
      setReplyText("")
      setShowReplyInput(false)
      // Auto show replies after adding a new one
      setShowReplies(true)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const commentDate = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return `${Math.floor(diffInMinutes / 1440)}d`
  }

  const hasReplies = comment.replies && comment.replies.length > 0

  const handleShowReactions = (show: boolean) => {
    if (hideReactionsTimeout.current) {
      clearTimeout(hideReactionsTimeout.current)
      hideReactionsTimeout.current = null
    }
    
    if (show) {
      setShowReactions(true)
    } else {
      // Add delay when hiding to allow mouse movement - same logic as post
      hideReactionsTimeout.current = setTimeout(() => {
        setShowReactions(false)
      }, 150)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideReactionsTimeout.current) {
        clearTimeout(hideReactionsTimeout.current)
      }
    }
  }, [])

  return (
    <div className="flex items-start gap-3 relative">
      <Avatar className="h-8 w-8 flex-shrink-0 relative z-10">
        {comment.user_avatar && (
          <AvatarImage src={comment.user_avatar} alt={comment.user_name || 'User'} />
        )}
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
          {comment.user_name ? comment.user_name.charAt(0).toUpperCase() : 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        {/* Comment bubble */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-3 py-2 inline-block">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {comment.user_name || 'Anonymous User'}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-4 mt-1 ml-3">
          <CommentReactions
            liked={comment.liked_by_user || false}
            likeCount={0} // Don't show count in the button itself
            selectedReaction={comment.user_reaction && comment.user_reaction !== 'like' ? comment.user_reaction : null}
            showReactions={showReactions}
            commentId={comment.id}
            onLike={() => onLikeComment?.(comment.id)}
            onReaction={(reaction) => onLikeComment?.(comment.id, reaction)}
            onShowReactionsChange={handleShowReactions}
          />
          
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:underline transition-colors"
          >
            Reply
          </button>
          
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTimeAgo(comment.created_at)}
          </span>
          
          {/* Show reaction count separately like in the image */}
          {comment.likes_count > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {comment.likes_count}
              </span>
              {comment.top_reaction ? (
                <span className="text-sm">{comment.top_reaction}</span>
              ) : (
                <Heart className="h-3 w-3 text-red-500 fill-current" />
              )}
            </div>
          )}
        </div>

        {/* View replies button - only show if there are replies and they're hidden */}
        {hasReplies && !showReplies && (
          <button
            onClick={() => setShowReplies(true)}
            className="flex items-center gap-2 mt-2 ml-3 text-xs font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <div className="w-6 h-px bg-gray-300 dark:bg-gray-600"></div>
            <span>View all {comment.replies?.length || 0} {(comment.replies?.length || 0) === 1 ? 'reply' : 'replies'}</span>
          </button>
        )}
        
        {/* Reply input */}
        <AnimatePresence>
          {showReplyInput && (
            <motion.div
              className="flex items-center gap-2 mt-2 ml-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Avatar className="h-6 w-6 flex-shrink-0">
                {currentUser?.avatar && (
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name || 'User'} />
                )}
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 relative">
                <Textarea
                  placeholder="Write a reply..."
                  className="min-h-0 h-8 py-1 px-3 text-sm resize-none bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-full focus-visible:ring-1 focus-visible:ring-blue-500"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleReplySubmit()
                    }
                    if (e.key === "Escape") {
                      setShowReplyInput(false)
                      setReplyText("")
                    }
                  }}
                />
                {replyText.trim() && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 absolute right-1 top-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={handleReplySubmit}
                  >
                    <Send className="h-3 w-3 text-blue-500" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Replies with connecting lines - only show when showReplies is true */}
        <AnimatePresence>
          {hasReplies && showReplies && (
            <motion.div 
              className="mt-3 relative"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Vertical connecting line */}
              <div className="absolute left-[-20px] top-0 bottom-4 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              <div className="ml-6 space-y-3">
                {comment.replies?.map((reply, index) => (
                  <motion.div 
                    key={reply.id} 
                    className="relative"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Horizontal connecting line */}
                    <div className="absolute left-[-26px] top-4 w-6 h-px bg-gray-300 dark:bg-gray-600"></div>
                    
                    <CommentItem
                      comment={reply}
                      currentUser={currentUser}
                      onLikeComment={onLikeComment}
                      onReplyComment={onReplyComment}
                    />
                  </motion.div>
                )) || []}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export function PostComments({
  showComments,
  newComment,
  comments,
  currentUser,
  onNewCommentChange,
  onSubmitComment,
  onFocusCommentInput,
  onLikeComment,
  onReplyComment,
  commentInputRef,
}: PostCommentsProps) {
  // Filter out replies (only show top-level comments)
  const topLevelComments = comments.filter(comment => !comment.parent_id)
  
  // Create a helper function to build the tree structure
  const buildCommentTree = (parentComments: Comment[]): Comment[] => {
    return parentComments.map(parent => {
      const replies = comments
        .filter(comment => comment.parent_id === parent.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) // Sort replies by time
      
      return {
        ...parent,
        replies: replies.length > 0 ? buildCommentTree(replies) : []
      }
    }).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) // Sort top-level comments by time
  }
  
  const commentsWithReplies = buildCommentTree(topLevelComments)

  return (
    <>
      <AnimatePresence>
        {showComments && (
          <motion.div
            className="w-full space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              {commentsWithReplies.length > 0 ? (
                commentsWithReplies.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CommentItem
                      comment={comment}
                      currentUser={currentUser}
                      onLikeComment={onLikeComment}
                      onReplyComment={onReplyComment}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No comments yet. Be the first to comment!
                  </p>
                </div>
              )}
            </div>

            {/* Add comment input */}
            <motion.div
              className="flex items-start gap-3 pt-2 border-t border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                {currentUser?.avatar && (
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name || 'User'} />
                )}
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 relative">
                <Textarea
                  ref={commentInputRef}
                  placeholder="Write a comment..."
                  className="min-h-0 h-10 py-2 px-3 resize-none bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-full focus-visible:ring-1 focus-visible:ring-blue-500"
                  value={newComment}
                  onChange={(e) => onNewCommentChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      onSubmitComment()
                    }
                  }}
                />
                {newComment.trim() && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 absolute right-1 top-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={onSubmitComment}
                  >
                    <Send className="h-4 w-4 text-blue-500" />
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showComments && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onFocusCommentInput}
            className="w-full text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Write a comment...
          </Button>
        </motion.div>
      )}
    </>
  )
}
