"use client"

import { useState } from "react"
import { initialScheduledMessages } from "../constants"
import type { ScheduledMessage } from "../types"
import { toast } from "@/hooks/use-toast"

export const useNotificationState = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [messageType, setMessageType] = useState("email")
  const [messageSubject, setMessageSubject] = useState("")
  const [messageContent, setMessageContent] = useState("")
  const [selectedTime, setSelectedTime] = useState("12:00")
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>(initialScheduledMessages)
  const [selectedScheduleType, setSelectedScheduleType] = useState("once")
  const [selectedTimezone, setSelectedTimezone] = useState("utc+7")
  const [calendarView, setCalendarView] = useState<Date>(new Date())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [showScheduleDetails, setShowScheduleDetails] = useState<number | null>(null)
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState("")
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progressValues, setProgressValues] = useState({
    openRate: 0,
    clickRate: 0,
    deliveryRate: 0,
  })
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [showAiAssistant, setShowAiAssistant] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [showUserSelector, setShowUserSelector] = useState(false)

  // Handle AI assist
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
    setMessageContent(aiResponse)
    setShowAiAssistant(false)
  }

  // Handle send message
  const handleSendMessage = () => {
    if (selectedUsers.length === 0) return

    setIsSending(true)

    // Simulate sending delay
    setTimeout(() => {
      setIsSending(false)
      setShowSuccess(true)

      // If scheduling, add to scheduled messages
      if (date && activeTab === "compose") {
        const [hours, minutes] = selectedTime.split(":").map(Number)
        const scheduleDate = new Date(date)
        scheduleDate.setHours(hours, minutes)

        const newScheduledMessage: ScheduledMessage = {
          id: scheduledMessages.length + 1,
          title: messageSubject || "Untitled Message",
          type: messageType as "email" | "zalo",
          recipients: selectedUsers.length,
          date: scheduleDate,
          status: "scheduled",
          recurring: selectedScheduleType as "none" | "daily" | "weekly" | "monthly",
        }

        setScheduledMessages([...scheduledMessages, newScheduledMessage])
      }

      // Reset form after success
      setTimeout(() => {
        setShowSuccess(false)
        if (activeTab === "compose") {
          setMessageSubject("")
          setMessageContent("")
          setSelectedUsers([])
          setSelectAll(false)
          setSelectedTemplate(null)
        }
      }, 3000)
    }, 2000)
  }

  // Handle delete scheduled message
  const handleDeleteScheduledMessage = (id: number) => {
    setScheduledMessages(scheduledMessages.filter((message) => message.id !== id))
    setShowDeleteConfirm(null)
  }

  // Handle save template
  const handleSaveTemplate = () => {
    if (!newTemplateName.trim() || !messageContent.trim()) return

    // In a real app, you would save this to your database
    // For now, we'll just close the dialog
    setShowNewTemplateDialog(false)
    setNewTemplateName("")

    toast({
      title: "Template saved",
      description: "Your message template has been saved successfully",
    })
  }

  // Refresh data
  const refreshData = () => {
    setIsLoading(true)

    // Reset progress values to create animation effect
    setProgressValues({
      openRate: 0,
      clickRate: 0,
      deliveryRate: 0,
    })

    // Simulate API call
    setTimeout(() => {
      setProgressValues({
        openRate: 68,
        clickRate: 24,
        deliveryRate: 98,
      })
      setIsLoading(false)
      toast({
        title: "Dashboard refreshed",
        description: "Latest notification data has been loaded",
      })
    }, 1500)
  }

  return {
    activeTab,
    setActiveTab,
    messageType,
    setMessageType,
    messageSubject,
    setMessageSubject,
    messageContent,
    setMessageContent,
    selectedTime,
    setSelectedTime,
    selectedTemplate,
    setSelectedTemplate,
    isSending,
    setIsSending,
    showSuccess,
    setShowSuccess,
    scheduledMessages,
    setScheduledMessages,
    selectedScheduleType,
    setSelectedScheduleType,
    selectedTimezone,
    setSelectedTimezone,
    calendarView,
    setCalendarView,
    showDeleteConfirm,
    setShowDeleteConfirm,
    showScheduleDetails,
    setShowScheduleDetails,
    showNewTemplateDialog,
    setShowNewTemplateDialog,
    newTemplateName,
    setNewTemplateName,
    selectedUsers,
    setSelectedUsers,
    selectAll,
    setSelectAll,
    searchQuery,
    setSearchQuery,
    date,
    setDate,
    showAiAssistant,
    setShowAiAssistant,
    aiPrompt,
    setAiPrompt,
    aiResponse,
    setAiResponse,
    aiLoading,
    setAiLoading,
    showUserSelector,
    setShowUserSelector,
    aiSuggestions,
    setAiSuggestions,
    isGeneratingSuggestions,
    setIsGeneratingSuggestions,
    isLoading,
    setIsLoading,
    progressValues,
    setProgressValues,
    handleAiAssist,
    generateAiSuggestions,
    handleUseAiResponse,
    handleSendMessage,
    handleDeleteScheduledMessage,
    handleSaveTemplate,
    refreshData,
  }
}
