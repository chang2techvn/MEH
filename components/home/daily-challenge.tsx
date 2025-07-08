"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, Film, Pencil, Video, CheckCircle2, Loader2, AlertTriangle, RefreshCw, Eye } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { type VideoData, getTodayVideo } from "@/app/actions/youtube-video"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import YouTubeVideoPlayer from "@/components/youtube/youtube-video-player"
import ContentCreationStep from "@/components/challenge/content-creation-step"
import PostPreview from "../feed/post-preview"
import PublishSuccess from "../ui/publish-success"
import ContentComparisonFeedback from "../ai-evaluation-display/content-comparison-feedback"
import { submitUserContent, publishSubmission } from "@/app/actions/user-submissions"
import { createCommunityPost } from "@/app/actions/community-posts"
import { formatTime } from "@/components/youtube/youtube-api"
import { getVideoSettings } from "@/app/actions/admin-settings"
import { compareVideoContentWithUserContent, type ContentComparison } from "@/app/actions/content-comparison"
import { v4 as uuidv4 } from "uuid"
import type { VideoEvaluation } from "@/lib/gemini-video-evaluation"
import { uploadVideoToStorage, type VideoUploadResult } from "@/lib/video-storage"
import { useAuthState } from "@/contexts/auth-context"

interface DailyChallengeProps {
  userId: string
  username: string
  userImage: string
  onSubmissionComplete: (submissionId: string) => void
}

export default function DailyChallenge({ userId, username, userImage, onSubmissionComplete }: DailyChallengeProps) {
  const { user } = useAuthState() // Get authenticated user
  const [loading, setLoading] = useState(true)
  const [videoData, setVideoData] = useState<VideoData | null>(null)
  const [activeStep, setActiveStep] = useState(1)
  const [progress, setProgress] = useState(25)
  const [rewrittenContent, setRewrittenContent] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [videoStorageUrl, setVideoStorageUrl] = useState<string | null>(null)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [submitting, setSubmitting] = useState(false)  
  const [error, setError] = useState<string | null>(null)
  const [videoWatched, setVideoWatched] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [richTextContent, setRichTextContent] = useState("")
  const [publishedPostId, setPublishedPostId] = useState<string | null>(null)
  const [isPublished, setIsPublished] = useState(false)
  
  // Video evaluation state
  const [videoEvaluation, setVideoEvaluation] = useState<VideoEvaluation | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)
  
  // Refs for scrolling
  const challengeHeaderRef = useRef<HTMLDivElement>(null)
  const rewriteContentRef = useRef<HTMLDivElement>(null)
  const comparisonResultsRef = useRef<HTMLDivElement>(null)
  
  // Scroll utility functions
  const scrollToElement = (ref: React.RefObject<HTMLDivElement | null>, offset = -100) => {
    if (ref.current) {
      const elementPosition = ref.current.offsetTop + offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
  const [adminSettings, setAdminSettings] = useState({
    minWatchTime: 180, // Default 3 minutes
    enforceWatchTime: true,
    autoPublish: true,
  })
  const [loadingSettings, setLoadingSettings] = useState(true)
  
  // Content comparison state
  const [contentComparison, setContentComparison] = useState<ContentComparison | null>(null)
  const [isComparingContent, setIsComparingContent] = useState(false)
  const [showComparisonFeedback, setShowComparisonFeedback] = useState(false)

  // Steps for the challenge
  const steps = [
    { id: 1, name: "Watch Video", icon: Video, description: "Watch the video and take notes" },
    { id: 2, name: "Rewrite Content", icon: Pencil, description: "Rewrite the content in your own words" },
    { id: 3, name: "Create & Record", icon: Film, description: "Create content and record your video" },
    { id: 4, name: "Preview & Submit", icon: Eye, description: "Preview and submit your post" },
  ]

  // Format the due date (today + 1 day)
  const getDueDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Fetch admin settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoadingSettings(true)
        const settings = await getVideoSettings()
        setAdminSettings({
          minWatchTime: settings.minWatchTime,
          enforceWatchTime: settings.enforceWatchTime,
          autoPublish: settings.autoPublish,
        })
      } catch (err) {
        console.error("Error fetching admin settings:", err)
        // Keep default settings
      } finally {
        setLoadingSettings(false)
      }
    }

    fetchSettings()
  }, [])
  // Fetch today's video
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log("Fetching today's video...")
        const video = await getTodayVideo()
        console.log("Video fetched successfully:", video.id)
        setVideoData(video)
          // Check if video already has transcript from database
        console.log("=== CHECKING VIDEO TRANSCRIPT ===")
        if (video.transcript && video.transcript.length > 100) {
          console.log("✅ Using transcript from database!")
          console.log(`📝 Transcript length: ${video.transcript.length} characters`)
          console.log(`📄 Transcript preview: ${video.transcript.substring(0, 200)}...`)
        } else {
          console.log("⚠️ No transcript in database, would need to extract...")
          console.log("📝 Transcript from database:", video.transcript || "null")
        }
        console.log("=== END TRANSCRIPT CHECK ===")
        
      } catch (err) {
        console.error("Error fetching video:", err)
        setError("Failed to load today's challenge. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (!loadingSettings) {
      fetchVideo()
    }
  }, [retryCount, loadingSettings])

  // Handle video file selection
  // Handle video file selection
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('🎥 Daily Challenge: Video file selected:', file.name, file.size, 'bytes')
      setVideoFile(file)
      const url = URL.createObjectURL(file)
      setVideoPreviewUrl(url)
      
      // Automatically upload to Supabase Storage
      setIsUploadingVideo(true)
      setUploadProgress(0)
      setError(null)
      console.log('🚀 Daily Challenge: Starting video upload to storage...')
      
      try {
        const uploadResult = await uploadVideoToStorage(
          file, 
          userId,
          (progress) => {
            setUploadProgress(progress.percentage)
          }
        )
        
        if (uploadResult.success && uploadResult.publicUrl) {
          setVideoStorageUrl(uploadResult.publicUrl)
          console.log('✅ Daily Challenge: Video uploaded to storage:', uploadResult.publicUrl)
        } else {
          console.error('❌ Daily Challenge: Upload failed:', uploadResult.error)
          throw new Error(uploadResult.error || 'Upload failed')
        }
      } catch (error) {
        console.error('❌ Daily Challenge: Video upload failed:', error)
        setError(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`)
        // Keep the preview URL for local preview even if upload fails
      } finally {
        setIsUploadingVideo(false)
      }
    }
  }
  // Handle next step
  const handleNextStep = async () => {
    if (activeStep < steps.length) {
      // Validate current step before proceeding
      if (activeStep === 1) {
        // Ensure video has been watched for required time if enforced
        if (adminSettings.enforceWatchTime && !videoWatched) {
          setError(
            `Please watch at least ${Math.floor(adminSettings.minWatchTime / 60)} minutes of the video before proceeding.`,
          )
          return
        }
      } else if (activeStep === 2) {
        // Validate rewritten content
        if (rewrittenContent.trim().length < 100) {
          setError("Please write at least 100 characters for your content.")
          return
        }        // Perform content comparison before proceeding to step 3
        if (videoData) {
          setIsComparingContent(true)
          setError(null)
          
          try {
            const comparison = await compareVideoContentWithUserContent(
              videoData.id,
              rewrittenContent,
              80 // 80% threshold
            )
            
            setContentComparison(comparison)
            setShowComparisonFeedback(true)
            setIsComparingContent(false)
            
            // Always return after comparison to show feedback - user must click proceed to continue
            return
          } catch (error) {
            console.error("Error comparing content:", error)
            setError("Failed to analyze content. Please try again.")
            setIsComparingContent(false)
            return
          }
        }      } else if (activeStep === 3) {
        // Validate rich text content and video
        if (richTextContent.trim().length < 100) {
          setError("Please write at least 100 characters for your blog post.")
          return
        }
        if (!videoFile) {
          setError("Please upload a video before proceeding.")
          return
        }
        if (isUploadingVideo) {
          setError("Please wait for video upload to complete.")
          return
        }
        if (!videoStorageUrl) {
          setError("Video upload failed. Please try uploading again.")
          return
        }        // Perform AI evaluation before proceeding to step 4
        if (videoData && videoStorageUrl) {
          setIsEvaluating(true)
          setError(null)
          
          try {
            console.log("🤖 Daily Challenge: Starting AI evaluation...")
            console.log("📹 Daily Challenge: Video URL for AI:", videoStorageUrl)
            console.log("📝 Daily Challenge: Content for AI:", richTextContent.substring(0, 100) + "...")
            
            const { evaluateSubmissionForPublish } = await import("@/lib/gemini-video-evaluation")
            
            // Use the transcript already saved in the database (limited by admin watch time)
            const originalTranscript = videoData.transcript || ""
            
            // Create challenge context including original video info
            const challengeContext = `Daily English Challenge - Original Video: "${videoData.title}" | Topic: ${videoData.topics?.join(', ') || 'General English Learning'} | User is responding to and creating content based on this original video.`
            
            console.log("🔄 Daily Challenge: Calling evaluateSubmissionForPublish...")
            
            // Evaluate with original video transcript as context and user's content as caption
            // Use the Supabase Storage URL for AI evaluation
            const evaluation = await evaluateSubmissionForPublish(
              videoStorageUrl, 
              richTextContent, 
              originalTranscript, 
              challengeContext
            )
            
            console.log("✅ Daily Challenge: AI evaluation completed:", evaluation)
            setVideoEvaluation(evaluation)
            console.log("✅ Video evaluation completed before step 4")
          } catch (error) {
            console.error("❌ Daily Challenge: Error during AI evaluation:", error)
            setError(`AI evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
            // Continue to next step even if evaluation fails
            setVideoEvaluation(null)          } finally {
            setIsEvaluating(false)
          }
        }
      }

      setActiveStep(activeStep + 1)
      setProgress(((activeStep + 1) / steps.length) * 100)
      setError(null)
      setShowComparisonFeedback(false)
    }
  }
  // Handle content comparison feedback actions
  const handleComparisonRetry = async () => {
    if (videoData) {
      setIsComparingContent(true)
      setError(null)
      
      // Scroll to comparison results area with a small delay
      setTimeout(() => {
        scrollToElement(comparisonResultsRef)
      }, 100)
      
      try {
        const comparison = await compareVideoContentWithUserContent(
          videoData.id,
          rewrittenContent,
          80
        )
        
        setContentComparison(comparison)
        setIsComparingContent(false)
      } catch (error) {
        console.error("Error comparing content:", error)
        setError("Failed to analyze content. Please try again.")
        setIsComparingContent(false)
      }
    }
  }
  const handleComparisonProceed = () => {
    setActiveStep(activeStep + 1)
    setProgress(((activeStep + 1) / steps.length) * 100)
    setShowComparisonFeedback(false)
    setError(null)
  }
  const handleComparisonGoBack = () => {
    // Reset all comparison-related state first
    setShowComparisonFeedback(false)
    setContentComparison(null)
    setError(null)
    
    // Ensure we're back at step 2 (Rewrite Content) with proper state
    setActiveStep(2)
    setProgress(50) // Step 2 = 50% progress
    
    // Force a small delay to ensure UI updates properly
    setTimeout(() => {
      // Make sure the comparison feedback is fully hidden
      setIsComparingContent(false)
      
      // Scroll to the rewrite content area after UI updates
      scrollToElement(rewriteContentRef)
    }, 200)
  }

  // Handle submission
  const handleSubmit = async () => {
    if (!videoData || !richTextContent || !videoFile) {
      setError("Please complete all steps before submitting.")
      return
    }

    try {
      setSubmitting(true)

      // In a real implementation, you would:
      // 1. Upload the video file to your storage
      // 2. Process the video to extract a transcript
      // 3. Submit the content and video for evaluation

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate successful submission
      onSubmissionComplete("simulated-submission-id")

      // Auto-publish if enabled
      if (adminSettings.autoPublish) {
        await handlePublish()
      } else {
        // Reset form
        setRichTextContent("")
        setVideoFile(null)
        setVideoPreviewUrl(null)
        setActiveStep(1)
        setProgress(25)
        setVideoWatched(false)
      }
    } catch (err) {
      console.error("Error submitting challenge:", err)
      setError("Failed to submit your challenge. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }  // Handle publishing to feed
  const handlePublish = async () => {
    // Check if user is authenticated
    if (!user) {
      setError("You must be logged in to submit and publish your content.")
      return
    }

    console.log('🚀 Daily Challenge: handlePublish called')
    console.log('📊 Daily Challenge: videoData:', !!videoData)
    console.log('📊 Daily Challenge: richTextContent:', !!richTextContent)
    console.log('📊 Daily Challenge: videoStorageUrl:', videoStorageUrl)

    if (!videoData || !richTextContent || !videoStorageUrl) {
      console.error('❌ Daily Challenge: Missing required content:', {
        videoData: !!videoData,
        richTextContent: !!richTextContent, 
        videoStorageUrl: !!videoStorageUrl
      })
      setError("Missing required content for publishing.")
      return
    }

    // Check if we have AI evaluation from step 3
    if (!videoEvaluation) {
      setError("Please complete step 3 evaluation before publishing.")
      return
    }

    try {
      setSubmitting(true)

      console.log("Publishing post using stored AI evaluation:", videoEvaluation)      
      
      // Create community post using stored evaluation and authenticated user
      console.log('💾 Daily Challenge: Creating community post with video URL:', videoStorageUrl)
      const createdPost = await createCommunityPost(
        user.id, // Use authenticated user ID
        user.name || username,
        user.avatar || userImage,
        richTextContent,
        videoStorageUrl, // Use the Supabase Storage URL
        videoData.id,
        videoEvaluation // Use evaluation from step 3
      )

      console.log("✅ Daily Challenge: Post saved to Supabase:", createdPost.id)
      console.log("✅ Daily Challenge: Post media_url:", createdPost.media_url)

      // Use the real post ID from Supabase response
      const postId = createdPost.id
      setPublishedPostId(postId)

      // Dispatch a custom event to notify other components about the new post
      if (typeof window !== "undefined") {
        const event = new CustomEvent("newPostPublished", { 
          detail: {
            id: postId, // Use real post ID
            username: user.name || username,
            userImage: user.avatar || userImage,
            title: `Video Analysis - ${new Date().toLocaleDateString()}`,
            content: richTextContent,
            videoUrl: videoStorageUrl, // Use the Supabase Storage URL
            mediaType: 'ai-submission',
            mediaUrl: videoStorageUrl, // Use the Supabase Storage URL
            likes: 0,
            comments: 0,
            createdAt: new Date().toISOString(),
            timeAgo: 'Just now',
            videoEvaluation: videoEvaluation,
            submission: {
              type: 'video_submission',
              videoUrl: videoStorageUrl, // Use the Supabase Storage URL
              content: richTextContent,
              evaluation: videoEvaluation
            },
            isNew: true
          }
        })
        window.dispatchEvent(event)
      }console.log("✅ Post published successfully to community feed")

      // Set published state
      setIsPublished(true)
    } catch (err) {
      console.error("❌ Error publishing to feed:", err)
      setError("Failed to publish to community feed. Please try again.")
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  // Trigger file input click
  const triggerFileInput = () => {
    console.log('🎬 Daily Challenge: triggerFileInput called')
    fileInputRef.current?.click()
  }

  // Handle retry
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }  // Reset challenge
  const resetChallenge = () => {
    setRichTextContent("")
    setVideoFile(null)
    setVideoPreviewUrl(null)
    setVideoStorageUrl(null)
    setIsUploadingVideo(false)
    setUploadProgress(0)
    setActiveStep(1)
    setProgress(25)
    setVideoWatched(false)
    setIsPublished(false)
    setPublishedPostId(null)
    setContentComparison(null)
    setIsComparingContent(false)
    setShowComparisonFeedback(false)
    setVideoEvaluation(null)
    setIsEvaluating(false)
    setRetryCount((prev) => prev + 1)
  }

  if (isPublished && publishedPostId) {
    return <PublishSuccess postId={publishedPostId} onStartNewChallenge={resetChallenge} />
  }

  if (loading || loadingSettings) {
    return (
      <Card className="neo-card overflow-hidden border-none bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm shadow-neo">
        <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Loader2 className="h-16 w-16 text-neo-mint dark:text-purist-blue animate-spin mb-4" />
          </motion.div>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-muted-foreground text-lg"
          >
            Loading today's challenge...
          </motion.p>
        </div>
      </Card>
    )
  }

  if (error && !videoData) {
    return (
      <Card className="neo-card overflow-hidden border-none bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm shadow-neo">
        <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
          </motion.div>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-red-500 mb-4 text-lg"
          >
            {error}
          </motion.p>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleRetry}
              className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </motion.div>
        </div>
      </Card>
    )
  }
  return (
    <TooltipProvider>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card ref={challengeHeaderRef} className="neo-card overflow-hidden border-none bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm shadow-neo">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {activeStep === 1 && videoData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="md:w-3/5 aspect-video rounded-xl overflow-hidden relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-neo-mint/20 to-purist-blue/20 backdrop-blur-sm z-0"></div>
                  <div className="relative w-full h-full z-10">
                    <YouTubeVideoPlayer
                      videoId={videoData.id}
                      title={videoData.title}
                      requiredWatchTime={adminSettings.minWatchTime}
                      onWatchComplete={() => setVideoWatched(true)}
                    />
                  </div>
                </motion.div>
              )}              {activeStep === 2 && (
                <motion.div
                  ref={rewriteContentRef}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="md:w-1/2 aspect-video rounded-xl overflow-hidden flex items-center justify-center relative"
                >
                  <Textarea
                    value={rewrittenContent}
                    onChange={(e) => setRewrittenContent(e.target.value)}
                    placeholder="Rewrite the content of the video in your own words. Try to be comprehensive and use proper grammar."
                    className="h-full resize-none p-4 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-800/20"
                  />
                </motion.div>
              )}

              {activeStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="md:w-1/2 flex flex-col"
                >
                  {videoPreviewUrl ? (
                    <div className="aspect-video rounded-xl overflow-hidden mb-4">
                      <div className="relative w-full h-full">
                        <video className="w-full h-full object-contain" controls src={videoPreviewUrl} />
                        {isUploadingVideo && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-center text-white">
                              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                              <p className="text-sm">Uploading to storage...</p>
                              <p className="text-xs">{uploadProgress}%</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-xl overflow-hidden flex flex-col items-center justify-center relative bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm mb-4">
                      <div className="flex flex-col items-center justify-center h-full w-full p-4">
                        <Film className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-center text-muted-foreground mb-4">
                          Record a video explaining the content in your own words
                        </p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="video/*"
                          onChange={handleVideoFileChange}
                          className="hidden"
                          disabled={isUploadingVideo}
                        />
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={triggerFileInput}
                            disabled={isUploadingVideo}
                            className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
                          >
                            {isUploadingVideo ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              "Upload Video"
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  )}

                  <ContentCreationStep
                    initialContent={richTextContent}
                    onContentChange={setRichTextContent}
                    onSave={() => {
                      if (!videoFile) {
                        setError("Please upload a video before saving your content.")
                        return
                      }
                      handleNextStep()
                    }}
                    isSaving={submitting}
                  />
                </motion.div>
              )}

              {activeStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="md:w-full"
                >                  <PostPreview
                    title={videoData?.title || "My Video Analysis"}
                    content={richTextContent}
                    videoUrl={videoPreviewUrl || ""}
                    username={user?.name || username}
                    userImage={user?.avatar || userImage}
                    isAuthenticated={!!user}
                    onBack={() => {
                      setActiveStep(3)
                      setProgress(75)
                    }}
                    onSubmit={handleSubmit}
                    onPublish={handlePublish}
                    isSubmitting={submitting}
                    autoPublish={adminSettings.autoPublish}
                    preEvaluation={videoEvaluation}
                  />
                </motion.div>
              )}

              {activeStep !== 4 && (
                <div className="md:w-1/2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <motion.h3
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="text-xl font-bold"
                    >
                      {videoData?.title || "Daily Challenge"}
                    </motion.h3>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="flex items-center gap-2 text-sm bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm px-3 py-1 rounded-full"
                    >
                      <Clock className="h-4 w-4 text-cantaloupe dark:text-cassis" />
                      <span>
                        Due: <strong>{getDueDate()}</strong>
                      </span>
                    </motion.div>
                  </div>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="text-sm text-muted-foreground mb-6"
                  >
                    {videoData?.description ||
                      "Watch this video and complete the 3-step challenge to improve your English skills."}
                  </motion.p>

                  <div className="mb-6">
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="w-full h-3 bg-white/20 dark:bg-gray-800/20 rounded-full overflow-hidden p-0.5"
                    >
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-neo-mint to-purist-blue"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
                      ></motion.div>
                    </motion.div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">4-Step Process:</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {steps.map((step, index) => {
                        const StepIcon = step.icon
                        const isActive = step.id === activeStep
                        const isCompleted = step.id < activeStep

                        return (
                          <Tooltip key={step.id}>
                            <TooltipTrigger asChild>
                              <motion.div
                                className={`flex flex-col items-center p-2 rounded-xl cursor-pointer transition-colors ${
                                  isActive
                                    ? "bg-gradient-to-br from-neo-mint to-purist-blue text-white shadow-glow-sm"
                                    : isCompleted
                                      ? "bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm text-foreground"
                                      : "bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm text-muted-foreground"
                                }`}                                onClick={() => {
                                  // Only allow going back to previous steps
                                  if (step.id < activeStep) {
                                    // Reset comparison feedback when navigating away
                                    setShowComparisonFeedback(false)
                                    setContentComparison(null)
                                    setError(null)
                                    setIsComparingContent(false)
                                    
                                    setActiveStep(step.id)
                                    setProgress((step.id / steps.length) * 100)
                                  }
                                }}
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                custom={index}
                                variants={{
                                  animate: (i) => ({
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                      delay: 0.3 + i * 0.1,
                                      duration: 0.3,
                                    },
                                  }),
                                }}
                              >
                                <div className="relative">
                                  <StepIcon className="h-4 w-4 mb-1" />
                                  {isCompleted && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                      className="absolute -top-1 -right-1 bg-green-500 rounded-full w-2 h-2 flex items-center justify-center"
                                    >
                                      <CheckCircle2 className="h-1 w-1 text-white" />
                                    </motion.div>
                                  )}
                                </div>
                                <span className="text-xs font-medium">{step.name}</span>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{step.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {activeStep === 1 && adminSettings.enforceWatchTime && !videoWatched && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 }}
                    >
                      <Alert className="mt-4 bg-amber-500/10 border-amber-500/20">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <AlertTitle>Watch the Video</AlertTitle>
                        <AlertDescription>
                          Please watch at least {formatTime(adminSettings.minWatchTime)} of the video
                          before proceeding to the next step.
                        </AlertDescription>
                      </Alert>
                    </motion.div>                  )}
                </div>
              )}
            </div>
          </div>          {/* Content Comparison Feedback */}
          {showComparisonFeedback && activeStep === 2 && (
            <motion.div
              ref={comparisonResultsRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="px-6 pb-4"
            >
              <ContentComparisonFeedback
                comparison={contentComparison}
                isLoading={isComparingContent}
                onRetry={handleComparisonRetry}
                onProceed={handleComparisonProceed}
                onGoBack={handleComparisonGoBack}
              />
            </motion.div>
          )}

          {activeStep !== 4 && !showComparisonFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.8 }}
              className="px-6 py-4 border-t border-white/10 dark:border-gray-800/10 flex flex-wrap gap-3 justify-between bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Current Step:</span>
                <span className="text-sm">{steps[activeStep - 1].name}</span>
              </div>
              <div className="flex gap-2">                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="sm"
                    onClick={handleNextStep}                    disabled={
                      (activeStep === 1 && adminSettings.enforceWatchTime && !videoWatched) ||
                      isComparingContent ||
                      (activeStep === 2 && showComparisonFeedback) ||
                      isEvaluating
                    }
                    className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
                  >                    {isComparingContent ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : isEvaluating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      "Next Step"
                    )}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}
