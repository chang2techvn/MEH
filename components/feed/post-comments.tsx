"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

interface Comment {
  id: string
  user_id: string
  content: string
  created_at: string
  user_name?: string
  user_avatar?: string
}

interface PostCommentsProps {
  showComments: boolean
  newComment: string
  comments: Comment[]
  onNewCommentChange: (comment: string) => void
  onSubmitComment: () => void
  onFocusCommentInput: () => void
  commentInputRef: React.RefObject<HTMLTextAreaElement | null>
}

export function PostComments({
  showComments,
  newComment,
  comments,
  onNewCommentChange,
  onSubmitComment,
  onFocusCommentInput,
  commentInputRef,
}: PostCommentsProps) {
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
            <div className="space-y-3">
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800">
                      {comment.user_avatar && (
                        <AvatarImage src={comment.user_avatar} alt={comment.user_name || 'User'} />
                      )}
                      <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white text-xs">
                        {comment.user_name ? comment.user_name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm p-3 rounded-xl">
                      <p className="text-xs font-medium">{comment.user_name || 'Anonymous User'}</p>
                      <p className="text-xs">{comment.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground">
                    No comments yet. Be the first to comment!
                  </p>
                </div>
              )}
            </div>

            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800">
                <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white text-xs">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 relative">
                <Textarea
                  ref={commentInputRef}
                  placeholder="Add a comment..."
                  className="min-h-0 h-10 py-2 resize-none pr-10 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-800/20 focus-visible:ring-neo-mint dark:focus-visible:ring-purist-blue focus-visible:ring-offset-0"
                  value={newComment}
                  onChange={(e) => onNewCommentChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      onSubmitComment()
                    }
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 absolute right-1 top-1 rounded-full hover:bg-white/20 dark:hover:bg-gray-800/20"
                  onClick={onSubmitComment}
                  disabled={!newComment.trim()}
                >
                  <Send className="h-4 w-4 text-neo-mint dark:text-purist-blue" />
                  <span className="sr-only">Send</span>
                </Button>
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
            className="w-full text-sm text-muted-foreground hover:bg-white/10 dark:hover:bg-gray-800/10"
          >
            Add a comment...
          </Button>
        </motion.div>
      )}
    </>
  )
}
