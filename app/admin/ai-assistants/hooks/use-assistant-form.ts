"use client"

import { useState } from "react"
import type { AssistantFormData, FormErrors } from "../types"

export function useAssistantForm() {
  const [formData, setFormData] = useState<AssistantFormData>({
    name: "",
    description: "",
    model: "gpt-4o",
    systemPrompt: "",
    capabilities: [],
    category: "education",
    isActive: true,
    avatar: "",
    personalityTraits: [],
    responseThreshold: 0.5,
    field: "General",
    role: "Assistant",
    experience: "Professional",
    tags: [],
  })

  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      model: "gpt-4o",
      systemPrompt: "",
      capabilities: [],
      category: "education",
      isActive: true,
      avatar: "",
      personalityTraits: [],
      responseThreshold: 0.5,
      field: "General",
      role: "Assistant",
      experience: "Professional",
      tags: [],
    })
    setFormErrors({})
  }

  const validateForm = () => {
    const errors: FormErrors = {}

    if (!formData.name.trim()) {
      errors.name = "Name is required"
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required"
    }

    if (!formData.systemPrompt.trim()) {
      errors.systemPrompt = "System prompt is required"
    } else if (formData.systemPrompt.length < 20) {
      errors.systemPrompt = "System prompt should be at least 20 characters"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const updateFormData = (updates: Partial<AssistantFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const handleCapabilityToggle = (capability: string) => {
    setFormData((prev) => ({
      ...prev,
      capabilities: prev.capabilities.includes(capability)
        ? prev.capabilities.filter((c) => c !== capability)
        : [...prev.capabilities, capability],
    }))
  }

  const handlePersonalityToggle = (trait: string) => {
    setFormData((prev) => ({
      ...prev,
      personalityTraits: prev.personalityTraits.includes(trait)
        ? prev.personalityTraits.filter((t) => t !== trait)
        : [...prev.personalityTraits, trait],
    }))
  }

  const handleTagAdd = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, tag],
    }))
  }

  const handleTagRemove = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  return {
    formData,
    formErrors,
    resetForm,
    validateForm,
    updateFormData,
    handleCapabilityToggle,
    handlePersonalityToggle,
    handleTagAdd,
    handleTagRemove,
    setFormData,
  }
}
