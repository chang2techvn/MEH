"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Send,
  Bookmark,
  Flag,
  EyeOff,
  Award,
  ThumbsUp,
  Smile,
  Lightbulb,
  Zap,
  Star,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { UserSubmission } from "@/app/actions/user-submissions"
import { toast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"

// Reactions array for the new reaction feature
const reactions = [
  { emoji: "👍", label: "Like", icon: ThumbsUp },
  { emoji: "😊", label: "Happy", icon: Smile },
  { emoji: "💡", label: "Insightful", icon: Lightbulb },
  { emoji: "⚡", label: "Energetic", icon: Zap },
  { emoji: "⭐", label: "Excellent", icon: Star },
]

interface FeedPostProps {
  username: string
  userImage: string
  timeAgo: string
  content: string
  mediaType: "video" | "text" | "none" | "ai-submission" | "youtube" | string
  mediaUrl?: string | null
  youtubeVideoId?: string
  textContent?: string
  likes: number
  comments: number
  submission?: UserSubmission
  isNew?: boolean
}

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
  isNew = false,
}: FeedPostProps) {
  useEffect(() => {
    if (isNew) {
      console.log("Rendering new post:", { username, content, mediaType, submission })
    }
  }, [isNew, username, content, mediaType, submission])

  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(likes)
  const [commentCount, setCommentCount] = useState(comments)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [saved, setSaved] = useState(false)
  const [showEvaluation, setShowEvaluation] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [hasBeenViewed, setHasBeenViewed] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const postRef = useRef<HTMLDivElement>(null)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)

  // Intersection Observer to detect when post is in view
  useEffect(() => {
    if (!hasBeenViewed && postRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setHasBeenViewed(true)
            observer.disconnect()
          }
        },
        { threshold: 0.5 },
      )

      observer.observe(postRef.current)
      return () => observer.disconnect()
    }
  }, [hasBeenViewed])

  // Highlight effect for new posts
  useEffect(() => {
    if (isNew && postRef.current) {
      postRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [isNew])

  const handleLike = () => {
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    if (liked) {
      setLikeCount(likeCount - 1)
    } else {
      setLikeCount(likeCount + 1)

      // Show a small confetti effect
      const confetti = document.createElement("div")
      confetti.className = "absolute z-10 text-2xl"
      confetti.innerHTML = "❤️"
      confetti.style.left = `${Math.random() * 80 + 10}%`
      confetti.style.top = "0"
      confetti.style.position = "absolute"
      confetti.style.animation = "float-up 1s ease-out forwards"
      if (postRef.current) postRef.current.appendChild(confetti)

      setTimeout(() => {
        if (postRef.current && postRef.current.contains(confetti)) {
          postRef.current.removeChild(confetti)
        }
      }, 1000)
    }
    setLiked(!liked)
  }

  const handleReaction = (reaction: string) => {
    setSelectedReaction(reaction)
    setLiked(true)
    setLikeCount(likeCount + 1)
    setShowReactions(false)

    toast({
      title: "Reaction added",
      description: `You reacted with ${reaction}`,
    })
  }

  const handleComment = () => {
    if (newComment.trim()) {
      setCommentCount(commentCount + 1)

      // Add animation to the comment count
      const commentCountEl = document.querySelector(`#comment-count-${username.replace(/\s+/g, "-")}`)
      if (commentCountEl) {
        commentCountEl.classList.add("animate-ping")
        setTimeout(() => {
          commentCountEl.classList.remove("animate-ping")
        }, 500)
      }

      setNewComment("")
      toast({
        title: "Comment added",
        description: "Your comment has been added to the post",
      })
    }
  }

  const handleShare = () => {
    toast({
      title: "Link copied",
      description: "Post link has been copied to clipboard",
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 70) return "text-blue-500"
    if (score >= 50) return "text-yellow-500"
    return "text-red-500"
  }

  const focusCommentInput = () => {
    setShowComments(true)
    setTimeout(() => {
      commentInputRef.current?.focus()
    }, 100)
  }

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
            : hasBeenViewed
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
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={`animation-gpu ${isNew ? "relative z-10 mb-8" : "mb-6"}`}
      >
        <Card
          className={`neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo ${
            isNew ? "ring-2 ring-neo-mint dark:ring-purist-blue" : ""
          } ${isHovered ? "shadow-lg" : ""}`}
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
            <div className="flex items-start gap-4">
              <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-800">
                  <Image
                    src={userImage || "/placeholder.svg"}
                    alt={username}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
                    {username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{username}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo}</p>
                  </div>
                  {mediaType === "ai-submission" && submission && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Badge className="bg-gradient-to-r from-neo-mint to-purist-blue text-white border-0">
                        <Award className="h-3 w-3 mr-1" />
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                          Score: {submission.overallScore}
                        </motion.span>
                      </Badge>
                    </motion.div>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-white/20 dark:hover:bg-gray-800/20"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-white/20 dark:border-gray-800/20"
                    >
                      <DropdownMenuItem
                        className="flex items-center gap-2 focus:bg-white/20 dark:focus:bg-gray-800/20"
                        onClick={() => setSaved(!saved)}
                      >
                        <Bookmark className="h-4 w-4" />
                        {saved ? "Unsave post" : "Save post"}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 focus:bg-white/20 dark:focus:bg-gray-800/20">
                        <EyeOff className="h-4 w-4" />
                        Hide
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 focus:bg-white/20 dark:focus:bg-gray-800/20">
                        <Flag className="h-4 w-4" />
                        Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <motion.p
                  className="mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {content}
                </motion.p>

                {mediaType === "video" && mediaUrl && (
                  <motion.div
                    className="mt-4 rounded-xl overflow-hidden bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                      {" "}
                      {/* 16:9 aspect ratio */}
                      <video
                        ref={videoRef}
                        className="absolute top-0 left-0 w-full h-full object-contain"
                        controls
                        poster="/placeholder.svg?height=400&width=600"
                        preload="none"
                      >
                        <source src={mediaUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </motion.div>
                )}

                {mediaType === "youtube" && youtubeVideoId && (
                  <motion.div
                    className="mt-4 rounded-xl overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                      {" "}
                      {/* 16:9 aspect ratio */}
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1&fs=1&playsinline=1&origin=${encodeURIComponent(window.location.origin)}`}
                        title={content}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </motion.div>
                )}

                {mediaType === "text" && textContent && (
                  <motion.div
                    className="mt-4 p-4 rounded-xl border border-white/20 dark:border-gray-800/20 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-sm">{textContent}</p>
                  </motion.div>
                )}

                {mediaType === "ai-submission" && submission && (
                  <motion.div
                    className="mt-4 space-y-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      className="p-4 rounded-xl border border-white/20 dark:border-gray-800/20 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm"
                      whileHover={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
                    >
                      <div
                        className="prose dark:prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: submission.rewrittenContent }}
                      />
                    </motion.div>

                    <motion.div
                      className="rounded-xl overflow-hidden bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm"
                      whileHover={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
                    >
                      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                        {" "}
                        {/* 16:9 aspect ratio */}
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
                            onClick={() => setShowEvaluation(false)}
                            className="w-full flex items-center justify-center gap-2 py-2"
                          >
                            Hide AI Evaluation
                          </Button>

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
                        </motion.div>
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Button
                            variant="ghost"
                            onClick={() => setShowEvaluation(true)}
                            className="w-full flex items-center justify-center gap-2 py-2 bg-white/10 dark:bg-gray-800/10 hover:bg-white/20 dark:hover:bg-gray-800/20"
                          >
                            <Award className="h-4 w-4 mr-1" />
                            Show AI Evaluation
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/20 dark:border-gray-800/20 flex flex-col gap-4">
              <div className="flex justify-between w-full">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 rounded-full px-4 hover:bg-white/20 dark:hover:bg-gray-800/20"
                    onClick={handleLike}
                    onMouseEnter={() => setShowReactions(true)}
                    onMouseLeave={() => setTimeout(() => setShowReactions(false), 500)}
                  >
                    {selectedReaction ? (
                      <span className="text-lg mr-1">{selectedReaction}</span>
                    ) : (
                      <Heart
                        className={`h-4 w-4 ${liked ? "fill-cassis text-cassis" : ""} transition-colors`}
                        style={{
                          transform: liked ? "scale(1.2)" : "scale(1)",
                          transition: "transform 0.3s ease",
                        }}
                      />
                    )}
                    <span id={`like-count-${username.replace(/\s+/g, "-")}`}>{likeCount}</span>
                  </Button>

                  {/* Reactions popup */}
                  <AnimatePresence>
                    {showReactions && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: -50, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 -top-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-full p-1 shadow-lg z-10 flex gap-1"
                        onMouseEnter={() => setShowReactions(true)}
                        onMouseLeave={() => setShowReactions(false)}
                      >
                        {reactions.map((reaction, index) => (
                          <Tooltip key={reaction.label}>
                            <TooltipTrigger asChild>
                              <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 dark:hover:bg-gray-700/20"
                                onClick={() => handleReaction(reaction.emoji)}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ 
                                  opacity: 1, 
                                  scale: 1
                                }}
                                transition={{ 
                                  type: "spring", 
                                  stiffness: 400, 
                                  damping: 10,
                                  delay: index * 0.05 
                                }}
                              >
                                <span className="text-lg">{reaction.emoji}</span>
                              </motion.button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>{reaction.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 rounded-full px-4 hover:bg-white/20 dark:hover:bg-gray-800/20"
                  onClick={() => setShowComments(!showComments)}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span id={`comment-count-${username.replace(/\s+/g, "-")}`}>{commentCount}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 rounded-full px-4 hover:bg-white/20 dark:hover:bg-gray-800/20"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-2 rounded-full px-4 hover:bg-white/20 dark:hover:bg-gray-800/20 ${saved ? "text-neo-mint dark:text-purist-blue" : ""}`}
                  onClick={() => setSaved(!saved)}
                >
                  <Bookmark
                    className={`h-4 w-4 ${saved ? "fill-neo-mint dark:fill-purist-blue" : ""}`}
                    style={{
                      transform: saved ? "scale(1.2)" : "scale(1)",
                      transition: "transform 0.3s ease",
                    }}
                  />
                  <span>{saved ? "Saved" : "Save"}</span>
                </Button>
              </div>

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
                      <motion.div
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800">
                          <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white text-xs">
                            U1
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm p-3 rounded-xl">
                          <p className="text-xs font-medium">user123</p>
                          <p className="text-xs">
                            Great job on the pronunciation! I noticed your intonation has improved a lot.
                          </p>
                        </div>
                      </motion.div>
                      <motion.div
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800">
                          <AvatarFallback className="bg-gradient-to-br from-cantaloupe to-cassis text-white text-xs">
                            U2
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm p-3 rounded-xl">
                          <p className="text-xs font-medium">teacher_emma</p>
                          <p className="text-xs">
                            Try to slow down a bit when pronouncing technical terms. Otherwise, excellent work!
                          </p>
                        </div>
                      </motion.div>
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
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              handleComment()
                            }
                          }}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 absolute right-1 top-1 rounded-full hover:bg-white/20 dark:hover:bg-gray-800/20"
                          onClick={handleComment}
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
                    onClick={focusCommentInput}
                    className="w-full text-sm text-muted-foreground hover:bg-white/10 dark:hover:bg-gray-800/10"
                  >
                    Add a comment...
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}
