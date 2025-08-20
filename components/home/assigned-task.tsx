"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, Film, Pencil, Video, CheckCircle2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import DailyChallenge from "./daily-challenge"
import YouTubeVideoPlayer from "../youtube/youtube-video-player"

interface AssignedTaskProps {
  title: string
  description: string
  videoUrl: string
  dueDate: string
  userId?: string
  username?: string
  userImage?: string
}

export default function AssignedTask({
  title,
  description,
  videoUrl,
  dueDate,
  userId,
  username = "John Doe",
  userImage = "/placeholder.svg?height=40&width=40",
}: AssignedTaskProps) {
  const [submissionComplete, setSubmissionComplete] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const [progress, setProgress] = useState(25)
  const [videoWatched, setVideoWatched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Helper function to extract YouTube video ID from URL
  const extractVideoId = (url: string): string | null => {
    
    if (!url) {
      return null
    }
    
    // If it's already just a video ID, return it
    if (url.length === 11 && !/[\/\?\&]/.test(url)) {
      return url
    }
    
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const match = url.match(regex)
    const videoId = match ? match[1] : null
    
    return videoId
  }

  // Handle submission completion
  const handleSubmissionComplete = (submissionId: string) => {
    setSubmissionComplete(true)
  }

  // If we have a valid userId (not anonymous), use the new DailyChallenge component
  if (userId && userId !== "anonymous") {
    return (
      <DailyChallenge
        userId={userId}
        username={username}
        userImage={userImage}
        onSubmissionComplete={handleSubmissionComplete}
      />
    )
  }

  // Otherwise, use the original component (for backward compatibility)
  // Format the due date
  const formattedDate = new Date(dueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const steps = [
    { id: 1, name: "Watch Video", icon: Video, description: "Watch the video and take notes" },
    { id: 2, name: "Rewrite Content", icon: Pencil, description: "Rewrite the content in your own words" },
    { id: 3, name: "Create Blog Post", icon: Pencil, description: "Write a blog post with proper grammar" },
    { id: 4, name: "Record Video", icon: Film, description: "Record a video explaining the content" },
  ]

  const handleNextStep = () => {
    if (activeStep < 4) {
      // Validate current step before proceeding
      if (activeStep === 1) {
        // Ensure video has been watched for required time
        if (!videoWatched) {
          setError("Please watch at least 3 minutes of the video before proceeding.")
          return
        }
      }
      setActiveStep(activeStep + 1)
      setProgress((activeStep + 1) * 25)
      setError(null) // Clear any previous errors
    
    }
  }

  const handleStepClick = (stepId: number) => {
    // Allow clicking on current step and previous steps
    // But require completing previous steps to access later ones
    if (stepId <= activeStep || stepId === activeStep + 1) {
      // If trying to go to next step, validate current step
      if (stepId > activeStep) {
        if (activeStep === 1 && !videoWatched) {
          setError("Please watch at least 3 minutes of the video before proceeding.")
          return
        }
      }
      setActiveStep(stepId)
      setProgress(stepId * 25)
      setError(null)
    }
  }

  return (
    <TooltipProvider>
      <Card className="neo-card overflow-hidden border-none bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm shadow-neo">
        <div className="p-4 sm:p-6">
          {/* Responsive container with proper max-width constraints */}
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col xl:flex-row gap-4 sm:gap-6">
              {/* Video/Content Area - Responsive sizing */}
              <div className="w-full xl:w-1/2 xl:max-w-3xl">
                {/* Video Player - Only show in step 1 */}
                {activeStep === 1 && (
                  <div className="w-full aspect-video rounded-xl overflow-hidden flex items-center justify-center relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-neo-mint/20 to-purist-blue/20 backdrop-blur-sm"></div>
                    <YouTubeVideoPlayer
                      videoId={extractVideoId(videoUrl) || videoUrl || "dQw4w9WgXcQ"}
                      title={title}
                      requiredWatchTime={180} // 3 minutes
                      onWatchComplete={() => setVideoWatched(true)}
                    />
                  </div>
                )}

                {/* Content Rewriting - Show in step 2 */}
                {activeStep === 2 && (
                  <div className="w-full min-h-[300px] sm:min-h-[400px] lg:aspect-video rounded-xl overflow-hidden flex items-center justify-center relative">
                    <textarea
                      placeholder="Rewrite the content of the video in your own words. Try to be comprehensive and use proper grammar."
                      className="w-full h-full min-h-[300px] sm:min-h-[400px] resize-none p-4 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/20 dark:border-gray-800/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-neo-mint text-sm sm:text-base"
                    />
                  </div>
                )}

                {/* Blog Post Creation - Show in step 3 */}
                {activeStep === 3 && (
                  <div className="w-full min-h-[300px] sm:min-h-[400px] lg:aspect-video rounded-xl overflow-hidden flex items-center justify-center relative">
                    <textarea
                      placeholder="Create a blog post based on your rewritten content. Focus on proper grammar, structure, and engaging writing."
                      className="w-full h-full min-h-[300px] sm:min-h-[400px] resize-none p-4 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/20 dark:border-gray-800/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-neo-mint text-sm sm:text-base"
                    />
                  </div>
                )}

                {/* Video Recording - Show in step 4 */}
                {activeStep === 4 && (
                  <div className="w-full aspect-video rounded-xl overflow-hidden flex flex-col items-center justify-center relative bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm">
                    <div className="flex flex-col items-center justify-center h-full w-full p-4">
                      <Film className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                      <p className="text-center text-muted-foreground mb-4 text-sm sm:text-base">
                        Record a video explaining the content in your own words
                      </p>
                      <Button
                        className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0 text-sm sm:text-base px-4 sm:px-6"
                      >
                        Record Video
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Challenge Info Section - Responsive layout */}
              <div className="w-full xl:w-1/2 xl:max-w-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold line-clamp-2">{title}</h3>
                  <div className="flex items-center gap-2 text-xs sm:text-sm bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full shrink-0">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-cantaloupe dark:text-cassis" />
                    <span className="whitespace-nowrap">
                      Due: <strong>{formattedDate}</strong>
                    </span>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 line-clamp-3">{description}</p>

                <div className="mb-4 sm:mb-6">
                  <div className="flex justify-between mb-2 text-xs sm:text-sm">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                <div className="w-full h-3 bg-white/20 dark:bg-gray-800/20 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-neo-mint to-purist-blue"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  ></motion.div>
                </div>
              </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-sm sm:text-base">4-Skill Process:</h4>
                  {/* Responsive grid for process steps */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4 gap-2 sm:gap-3 max-w-4xl">
                    {steps.map((step) => {
                      const StepIcon = step.icon
                      const isActive = step.id === activeStep
                      const isCompleted = step.id < activeStep

                      return (
                        <Tooltip key={step.id}>
                          <TooltipTrigger asChild>
                            <motion.div
                              className={`flex flex-col items-center p-2 sm:p-3 rounded-xl cursor-pointer transition-colors ${
                                isActive
                                  ? "bg-gradient-to-br from-neo-mint to-purist-blue text-white shadow-glow-sm"
                                  : isCompleted
                                    ? "bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm text-foreground"
                                    : "bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm text-muted-foreground"
                              }`}
                              onClick={() => handleStepClick(step.id)}
                              
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              <div className="relative">
                                <StepIcon className="h-4 w-4 sm:h-5 sm:w-5 mb-1" />
                                {isCompleted && (
                                  <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-2 h-2 sm:w-3 sm:h-3 flex items-center justify-center">
                                    <CheckCircle2 className="h-1 w-1 sm:h-2 sm:w-2 text-white" />
                                  </div>
                                )}
                              </div>
                              <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">{step.name}</span>
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">{step.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                </div>
            </div>
          </div>
        </div>
        {error && (
          <div className="mx-4 sm:mx-6 mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-white/10 dark:border-gray-800/10 flex flex-col sm:flex-row gap-3 justify-between bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium">Current Step:</span>
            <span className="text-xs sm:text-sm">{steps[activeStep - 1].name}</span>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-800/30 text-xs sm:text-sm px-3 sm:px-4"
            >
              View Details
            </Button>
            <Button
              size="sm"
              onClick={handleNextStep}
              disabled={activeStep === 4}
              className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0 text-xs sm:text-sm px-3 sm:px-4"
            >
              {activeStep === 4 ? "Complete" : "Next Step"}
            </Button>
          </div>
        </div>
        </div>
      </Card>
    </TooltipProvider>
  )
}
