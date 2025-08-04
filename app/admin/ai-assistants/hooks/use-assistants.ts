"use client"

import { useState, useEffect } from "react"
import type { Assistant, AssistantFormData } from "../types"
import { sampleAssistants } from "../constants"
import { toast } from "@/hooks/use-toast"

export function useAssistants() {
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1200))
      setAssistants(sampleAssistants)
      setIsLoading(false)
    }
    loadData()
  }, [])

  const addAssistant = async (formData: AssistantFormData) => {
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 800))

    const newAssistant: Assistant = {
      id: `assistant${Date.now()}`,
      name: formData.name,
      description: formData.description,
      avatar: "/placeholder.svg?height=80&width=80",
      model: formData.model,
      isActive: formData.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
      systemPrompt: formData.systemPrompt,
      capabilities: formData.capabilities,
      category: formData.category,
      usage: {
        conversations: 0,
        messages: 0,
        tokensConsumed: 0,
      },
    }

    setAssistants((prev) => [...prev, newAssistant])
    setIsLoading(false)

    toast({
      title: "Assistant created",
      description: "Your new AI assistant has been created successfully",
    })
  }

  const updateAssistant = async (id: string, formData: AssistantFormData) => {
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 800))

    setAssistants((prev) =>
      prev.map((assistant) =>
        assistant.id === id
          ? {
              ...assistant,
              ...formData,
              updatedAt: new Date(),
            }
          : assistant,
      ),
    )

    setIsLoading(false)

    toast({
      title: "Assistant updated",
      description: "The AI assistant has been updated successfully",
    })
  }

  const deleteAssistant = async (id: string) => {
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 800))

    setAssistants((prev) => prev.filter((assistant) => assistant.id !== id))
    setIsLoading(false)

    toast({
      title: "Assistant deleted",
      description: "The AI assistant has been deleted successfully",
      variant: "destructive",
    })
  }

  const toggleAssistantActive = (id: string, currentStatus: boolean) => {
    setAssistants((prev) =>
      prev.map((assistant) =>
        assistant.id === id ? { ...assistant, isActive: !currentStatus, updatedAt: new Date() } : assistant,
      ),
    )

    toast({
      title: `Assistant ${currentStatus ? "deactivated" : "activated"}`,
      description: `The assistant has been ${currentStatus ? "deactivated" : "activated"} successfully.`,
      variant: currentStatus ? "destructive" : "default",
    })
  }

  return {
    assistants,
    isLoading,
    addAssistant,
    updateAssistant,
    deleteAssistant,
    toggleAssistantActive,
  }
}
