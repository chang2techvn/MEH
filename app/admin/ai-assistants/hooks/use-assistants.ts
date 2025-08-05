"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Assistant, AssistantFormData, SupabaseAssistant } from "../types"
import { toast } from "@/hooks/use-toast"

// Convert Supabase data to frontend format
function convertToFrontendFormat(data: SupabaseAssistant): Assistant {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    avatar: data.avatar || "/placeholder.svg?height=80&width=80",
    model: data.model,
    isActive: data.is_active ?? true,
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
    systemPrompt: data.system_prompt,
    capabilities: data.capabilities || [],
    category: data.category || "education",
    conversationCount: data.conversation_count || 0,
    messageCount: data.message_count || 0,
    tokenConsumption: data.token_consumption || 0,
    personalityTraits: data.personality_traits || [],
    responseThreshold: data.response_threshold || 0.5,
    field: data.field || "General",
    role: data.role || "Assistant",
    experience: data.experience || "Professional",
    tags: data.tags || [],
    createdBy: data.created_by || undefined,
    usage: {
      conversations: data.conversation_count || 0,
      messages: data.message_count || 0,
      tokensConsumed: data.token_consumption || 0,
    },
  }
}

// Convert form data to Supabase format
function convertToSupabaseFormat(formData: AssistantFormData): Partial<SupabaseAssistant> {
  return {
    name: formData.name,
    description: formData.description,
    model: formData.model,
    system_prompt: formData.systemPrompt,
    capabilities: formData.capabilities,
    category: formData.category,
    is_active: formData.isActive,
    avatar: formData.avatar,
    personality_traits: formData.personalityTraits,
    response_threshold: formData.responseThreshold,
    field: formData.field,
    role: formData.role,
    experience: formData.experience,
    tags: formData.tags,
    updated_at: new Date().toISOString(),
  }
}

export function useAssistants() {
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch assistants from Supabase
  const fetchAssistants = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("ai_assistants")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching assistants:", error)
        toast({
          title: "Error",
          description: "Failed to fetch AI assistants",
          variant: "destructive",
        })
        return
      }

      const formattedAssistants = (data || []).map(convertToFrontendFormat)
      setAssistants(formattedAssistants)
    } catch (error) {
      console.error("Error fetching assistants:", error)
      toast({
        title: "Error",
        description: "Failed to fetch AI assistants",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAssistants()
  }, [])

  const addAssistant = async (formData: AssistantFormData) => {
    try {
      setIsLoading(true)

      const supabaseData = convertToSupabaseFormat(formData)
      const { data, error } = await supabase
        .from("ai_assistants")
        .insert(supabaseData)
        .select()
        .single()

      if (error) {
        console.error("Error adding assistant:", error)
        toast({
          title: "Error",
          description: "Failed to create AI assistant",
          variant: "destructive",
        })
        return
      }

      if (data) {
        const newAssistant = convertToFrontendFormat(data)
        setAssistants((prev) => [newAssistant, ...prev])

        toast({
          title: "Assistant created",
          description: "Your new AI assistant has been created successfully",
        })
      }
    } catch (error) {
      console.error("Error adding assistant:", error)
      toast({
        title: "Error",
        description: "Failed to create AI assistant",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateAssistant = async (id: string, formData: AssistantFormData) => {
    try {
      setIsLoading(true)

      const supabaseData = convertToSupabaseFormat(formData)
      const { data, error } = await supabase
        .from("ai_assistants")
        .update(supabaseData)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error updating assistant:", error)
        toast({
          title: "Error",
          description: "Failed to update AI assistant",
          variant: "destructive",
        })
        return
      }

      if (data) {
        const updatedAssistant = convertToFrontendFormat(data)
        setAssistants((prev) =>
          prev.map((assistant) => (assistant.id === id ? updatedAssistant : assistant))
        )

        toast({
          title: "Assistant updated",
          description: "The AI assistant has been updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating assistant:", error)
      toast({
        title: "Error",
        description: "Failed to update AI assistant",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAssistant = async (id: string) => {
    try {
      setIsLoading(true)

      const { error } = await supabase.from("ai_assistants").delete().eq("id", id)

      if (error) {
        console.error("Error deleting assistant:", error)
        toast({
          title: "Error",
          description: "Failed to delete AI assistant",
          variant: "destructive",
        })
        return
      }

      setAssistants((prev) => prev.filter((assistant) => assistant.id !== id))

      toast({
        title: "Assistant deleted",
        description: "The AI assistant has been deleted successfully",
        variant: "destructive",
      })
    } catch (error) {
      console.error("Error deleting assistant:", error)
      toast({
        title: "Error",
        description: "Failed to delete AI assistant",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAssistantActive = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus
      const { error } = await supabase
        .from("ai_assistants")
        .update({ 
          is_active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)

      if (error) {
        console.error("Error toggling assistant status:", error)
        toast({
          title: "Error",
          description: "Failed to update assistant status",
          variant: "destructive",
        })
        return
      }

      setAssistants((prev) =>
        prev.map((assistant) =>
          assistant.id === id 
            ? { ...assistant, isActive: newStatus, updatedAt: new Date() } 
            : assistant
        )
      )

      toast({
        title: `Assistant ${newStatus ? "activated" : "deactivated"}`,
        description: `The assistant has been ${newStatus ? "activated" : "deactivated"} successfully.`,
        variant: newStatus ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error toggling assistant status:", error)
      toast({
        title: "Error",
        description: "Failed to update assistant status",
        variant: "destructive",
      })
    }
  }

  return {
    assistants,
    isLoading,
    addAssistant,
    updateAssistant,
    deleteAssistant,
    toggleAssistantActive,
    refreshAssistants: fetchAssistants,
  }
}
