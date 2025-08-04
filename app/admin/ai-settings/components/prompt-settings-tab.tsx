"use client"

import type React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare } from "lucide-react"
import { motion } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface PromptSettingsTabProps {
  aiProvider: string
  setAiProvider: (aiProvider: string) => void
  aiModel: string
  setAiModel: (aiModel: string) => void
  autoEvaluationEnabled: boolean
  setAutoEvaluationEnabled: (autoEvaluationEnabled: boolean) => void
  minimumScoreThreshold: number
  setMinimumScoreThreshold: (minimumScoreThreshold: number) => void
  autoPublishThreshold: number
  setAutoPublishThreshold: (autoPublishThreshold: number) => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export const PromptSettingsTab: React.FC<PromptSettingsTabProps> = ({
  aiProvider,
  setAiProvider,
  aiModel,
  setAiModel,
  autoEvaluationEnabled,
  setAutoEvaluationEnabled,
  minimumScoreThreshold,
  setAutoPublishThreshold,
  setMinimumScoreThreshold,
  isLoading,
  setIsLoading,
}) => {
  return (
    <>
      {/* Prompt Settings */}
      <motion.div variants={itemVariants} className="rounded-lg border p-6 space-y-4 bg-white dark:bg-gray-950">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-neo-mint dark:text-purist-blue" />
          <h3 className="text-lg font-medium">Prompt Settings</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="system-prompt">System Prompt</Label>
            <Textarea
              id="system-prompt"
              className="min-h-[100px]"
              placeholder="Enter system prompt for AI evaluation"
              defaultValue="You are an expert English language evaluator. Your task is to evaluate the user's submission based on the provided criteria. Be fair, objective, and provide constructive feedback."
            />
            <p className="text-xs text-muted-foreground">
              This prompt will be used as the system instruction for the AI
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-style">Feedback Style</Label>
            <Select defaultValue="balanced">
              <SelectTrigger id="feedback-style">
                <SelectValue placeholder="Select feedback style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="encouraging">Encouraging</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="concise">Concise</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Determines the tone and detail level of the feedback</p>
          </div>
        </div>
      </motion.div>
    </>
  )
}
