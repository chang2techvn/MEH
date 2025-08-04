"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, Loader2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { AiAssistantProps as AiAssistantPropsType } from "../types"

export const AiAssistant: React.FC<AiAssistantPropsType> = ({
  onSuggestionApply,
  messageType,
  selectedUsers,
  aiSuggestionPrompts,
  messageContent,
  setMessageContent,
  showAiAssistant,
  setShowAiAssistant,
}) => {
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)

  // Simulate AI response
  const handleAiAssist = () => {
    if (!aiPrompt.trim()) return

    setAiLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      const responses = [
        "We're thrilled to announce our upcoming English Speaking Workshop on [DATE]. Join us for an interactive session where you'll practice conversation skills with native speakers and fellow learners. Spaces are limited, so register now to secure your spot!",
        "Don't miss our special event: 'Mastering English Idioms' happening this weekend. This workshop will help you understand and use common English expressions that native speakers use every day. Click the link below to register and take your English to the next level!",
        "Important announcement: We've just released new learning materials in your dashboard. These resources focus on business English and professional communication. Check them out now to enhance your career prospects and communication skills!",
      ]

      setAiResponse(responses[Math.floor(Math.random() * responses.length)])
      setAiLoading(false)
    }, 1500)
  }

  // Generate AI suggestions
  const generateAiSuggestions = () => {
    setIsGeneratingSuggestions(true)

    // Simulate API call delay
    setTimeout(() => {
      const suggestions = [
        "Try adding a personalized greeting with the recipient's name",
        "Include a clear call-to-action button at the end",
        "Keep your message concise - aim for 150 words or less",
        "Add an engaging subject line with action words",
        "Include social proof or testimonials if relevant",
      ]

      setAiSuggestions(suggestions)
      setIsGeneratingSuggestions(false)
    }, 1200)
  }

  // Handle using AI response
  const handleUseAiResponse = () => {
    onSuggestionApply(aiResponse)
    setShowAiAssistant(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute inset-0 bg-background border rounded-md shadow-lg p-4 z-10"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium flex items-center">
          <Sparkles className="h-4 w-4 text-purple-500 mr-1" />
          AI Writing Assistant
        </h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowAiAssistant(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Describe what you want to write..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAiAssist} disabled={aiLoading || !aiPrompt.trim()}>
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
            Generate
          </Button>
        </div>

        {aiResponse && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-muted rounded-md">
            <p className="text-sm mb-2">{aiResponse}</p>
            <div className="flex justify-end">
              <Button size="sm" variant="secondary" onClick={handleUseAiResponse}>
                <Check className="h-3.5 w-3.5 mr-1" />
                Use This
              </Button>
            </div>
          </motion.div>
        )}

        <div className="flex flex-wrap gap-2 mt-2">
          {aiSuggestionPrompts.map((prompt: string, index: number) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer hover:bg-muted transition-colors"
              onClick={() => setAiPrompt(prompt)}
            >
              {prompt}
            </Badge>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
