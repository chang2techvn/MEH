"use client"

import { useState } from "react"

// Mock data for message templates
const messageTemplates = [
  {
    id: 1,
    name: "New Event Announcement",
    subject: "Join Our Upcoming Event!",
    content: "We're excited to announce our upcoming event on [DATE]. Don't miss out on this opportunity to [BENEFIT].",
  },
  {
    id: 2,
    name: "Weekly Challenge",
    subject: "Your Weekly English Challenge is Here",
    content: "This week's challenge focuses on [TOPIC]. Complete it by [DATE] to earn bonus points!",
  },
  {
    id: 3,
    name: "Course Update",
    subject: "Important Course Update",
    content:
      "We've updated the [COURSE_NAME] with new materials. Check it out now to enhance your learning experience.",
  },
]

export const useTemplateSelection = (
  setMessageSubject: (subject: string) => void,
  setMessageContent: (content: string) => void,
) => {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)

  // Handle template selection
  const handleSelectTemplate = (templateId: number) => {
    const template = messageTemplates.find((t) => t.id === templateId)
    if (template) {
      setMessageSubject(template.subject)
      setMessageContent(template.content)
      setSelectedTemplate(templateId)
    }
  }

  return {
    selectedTemplate,
    setSelectedTemplate,
    messageTemplates,
    handleSelectTemplate,
  }
}
