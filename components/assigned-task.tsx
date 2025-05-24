"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, Film, Pencil, Video, CheckCircle2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import DailyChallenge from "./daily-challenge"
import YouTubeVideoPlayer from "./youtube-video-player"

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
  userId = "user-1",
  username = "John Doe",
  userImage = "/placeholder.svg?height=40&width=40",
}: AssignedTaskProps) {
  const [submissionComplete, setSubmissionComplete] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const [progress, setProgress] = useState(25)
  const [videoWatched, setVideoWatched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle submission completion
  const handleSubmissionComplete = (submissionId: string) => {
    console.log("Submission completed:", submissionId)
    setSubmissionComplete(true)
  }

  // If we have a userId, use the new DailyChallenge component
  if (userId) {
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

  return (
    <TooltipProvider>
      <Card className="neo-card overflow-hidden border-none bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm shadow-neo">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {activeStep === 1 && (
              <div className="md:w-1/3 aspect-video rounded-xl overflow-hidden flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-neo-mint/20 to-purist-blue/20 backdrop-blur-sm"></div>
                <YouTubeVideoPlayer
                  videoId="dQw4w9WgXcQ" // Replace with actual video ID from props
                  title={title}
                  requiredWatchTime={180} // 3 minutes
                  onWatchComplete={() => setVideoWatched(true)}
                />
              </div>
            )}
            <div className="md:w-2/3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <h3 className="text-xl font-bold">{title}</h3>
                <div className="flex items-center gap-2 text-sm bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Clock className="h-4 w-4 text-cantaloupe dark:text-cassis" />
                  <span>
                    Due: <strong>{formattedDate}</strong>
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6">{description}</p>

              <div className="mb-6">
                <div className="flex justify-between mb-2 text-sm">
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
                <h4 className="font-medium text-sm">4-Skill Process:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {steps.map((step) => {
                    const StepIcon = step.icon
                    const isActive = step.id === activeStep
                    const isCompleted = step.id < activeStep

                    return (
                      <Tooltip key={step.id}>
                        <TooltipTrigger asChild>
                          <motion.div
                            className={`flex flex-col items-center p-3 rounded-xl cursor-pointer transition-colors ${
                              isActive
                                ? "bg-gradient-to-br from-neo-mint to-purist-blue text-white shadow-glow-sm"
                                : isCompleted
                                  ? "bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm text-foreground"
                                  : "bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm text-muted-foreground"
                            }`}
                            onClick={() => setActiveStep(step.id)}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <div className="relative">
                              <StepIcon className="h-5 w-5 mb-1" />
                              {isCompleted && (
                                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3 flex items-center justify-center">
                                  <CheckCircle2 className="h-2 w-2 text-white" />
                                </div>
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
            </div>
          </div>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="px-6 py-4 border-t border-white/10 dark:border-gray-800/10 flex flex-wrap gap-3 justify-between bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Current Step:</span>
            <span className="text-sm">{steps[activeStep - 1].name}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-800/30"
            >
              View Details
            </Button>
            <Button
              size="sm"
              onClick={handleNextStep}
              disabled={activeStep === 4}
              className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
            >
              {activeStep === 4 ? "Complete" : "Next Step"}
            </Button>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  )
}
