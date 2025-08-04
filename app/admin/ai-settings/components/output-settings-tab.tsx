"use client"

import type React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText } from "lucide-react"
import { motion } from "framer-motion"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface OutputSettingsTabProps {
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export const OutputSettingsTab: React.FC<OutputSettingsTabProps> = ({
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
      {/* Output Settings */}
      <motion.div variants={itemVariants} className="rounded-lg border p-6 space-y-4 bg-white dark:bg-gray-950">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-neo-mint dark:text-purist-blue" />
          <h3 className="text-lg font-medium">Output Settings</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="include-strengths">Include Strengths</Label>
              <p className="text-xs text-muted-foreground">Include positive aspects in the evaluation</p>
            </div>
            <Switch id="include-strengths" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="include-weaknesses">Include Areas to Improve</Label>
              <p className="text-xs text-muted-foreground">Include suggestions for improvement</p>
            </div>
            <Switch id="include-weaknesses" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="include-examples">Include Examples</Label>
              <p className="text-xs text-muted-foreground">Include examples to illustrate feedback points</p>
            </div>
            <Switch id="include-examples" defaultChecked />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-feedback-length">Maximum Feedback Length</Label>
            <Select defaultValue="medium">
              <SelectTrigger id="max-feedback-length">
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (100 words)</SelectItem>
                <SelectItem value="medium">Medium (200 words)</SelectItem>
                <SelectItem value="long">Long (300 words)</SelectItem>
                <SelectItem value="detailed">Detailed (500+ words)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>
    </>
  )
}
