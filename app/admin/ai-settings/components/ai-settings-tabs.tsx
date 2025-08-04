"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Key, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Brain, Award } from "lucide-react"
import { useRouter } from "next/navigation"

interface AISettingsTabsProps {
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

export const AISettingsTabs: React.FC<AISettingsTabsProps> = ({
  aiProvider,
  setAiProvider,
  aiModel,
  setAiModel,
  autoEvaluationEnabled,
  setAutoEvaluationEnabled,
  minimumScoreThreshold,
  autoPublishThreshold,
  setAutoPublishThreshold,
  setMinimumScoreThreshold,
  isLoading,
  setIsLoading,
}) => {
  const router = useRouter()

  return (
    <>
      {/* AI Provider Settings */}
      <motion.div variants={itemVariants} className="rounded-lg border p-6 space-y-4 bg-white dark:bg-gray-950">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-neo-mint dark:text-purist-blue" />
          <h3 className="text-lg font-medium">AI Provider Settings</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-provider">AI Provider</Label>
            <Select value={aiProvider} onValueChange={setAiProvider}>
              <SelectTrigger id="ai-provider">
                <SelectValue placeholder="Select AI provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="gemini">Gemini (Google)</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="mistral">Mistral AI</SelectItem>
                <SelectItem value="cohere">Cohere</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-model">AI Model</Label>
            <Select value={aiModel} onValueChange={setAiModel}>
              <SelectTrigger id="ai-model">
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                {aiProvider === "openai" ? (
                  <>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  </>
                ) : aiProvider === "gemini" ? (
                  <>
                    <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                    <SelectItem value="gemini-ultra">Gemini Ultra</SelectItem>
                  </>
                ) : aiProvider === "anthropic" ? (
                  <>
                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                  </>
                ) : aiProvider === "mistral" ? (
                  <>
                    <SelectItem value="mistral-large">Mistral Large</SelectItem>
                    <SelectItem value="mistral-medium">Mistral Medium</SelectItem>
                    <SelectItem value="mistral-small">Mistral Small</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="cohere-command">Command</SelectItem>
                    <SelectItem value="cohere-command-r">Command R</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="api-key">API Key</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-5 px-1">
                      <HelpCircle className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Manage API keys in the AI Settings section</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => router.push("/admin/ai-settings")}
            >
              <Key className="h-4 w-4 mr-2" />
              Manage API Keys
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Evaluation Settings */}
      <motion.div variants={itemVariants} className="rounded-lg border p-6 space-y-4 bg-white dark:bg-gray-950">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-neo-mint dark:text-purist-blue" />
          <h3 className="text-lg font-medium">Evaluation Settings</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-evaluation">Automatic Evaluation</Label>
              <p className="text-xs text-muted-foreground">Automatically evaluate submissions when they are created</p>
            </div>
            <Switch id="auto-evaluation" checked={autoEvaluationEnabled} onCheckedChange={setAutoEvaluationEnabled} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="min-score-threshold">Minimum Score Threshold</Label>
              <span className="text-sm">{minimumScoreThreshold}</span>
            </div>
            <Slider
              id="min-score-threshold"
              min={0}
              max={100}
              step={1}
              value={[minimumScoreThreshold]}
              onValueChange={(value) => setMinimumScoreThreshold(value[0])}
            />
            <p className="text-xs text-muted-foreground">
              Submissions below this score will be flagged for manual review
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-publish-threshold">Auto-Publish Threshold</Label>
              <span className="text-sm">{autoPublishThreshold}</span>
            </div>
            <Slider
              id="auto-publish-threshold"
              min={0}
              max={100}
              step={1}
              value={[autoPublishThreshold]}
              onValueChange={(value) => setAutoPublishThreshold(value[0])}
            />
            <p className="text-xs text-muted-foreground">
              Submissions above this score will be automatically published to the feed
            </p>
          </div>
        </div>
      </motion.div>
    </>
  )
}
