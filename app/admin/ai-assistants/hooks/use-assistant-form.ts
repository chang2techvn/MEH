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

  return {
    formData,
    formErrors,
    resetForm,
    validateForm,
    updateFormData,
    handleCapabilityToggle,
    setFormData,
  }
}
