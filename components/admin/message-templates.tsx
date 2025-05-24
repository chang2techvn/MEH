"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, X, Plus, Edit, Trash2, Save, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"

interface MessageTemplatesProps {
  isOpen: boolean
  onClose: () => void
}

// Sample template data
const sampleTemplates = [
  {
    id: "t1",
    title: "General Acknowledgment",
    content: "Thank you for reaching out. I'll look into this and get back to you shortly.",
  },
  {
    id: "t2",
    title: "Assignment Feedback",
    content:
      "I've reviewed your submission and provided feedback in the comments section. Please let me know if you have any questions about the feedback.",
  },
  {
    id: "t3",
    title: "Resource Recommendation",
    content:
      "For additional practice on this topic, I recommend checking out the resources in Module  \"For additional practice on this topic, I recommend checking out the resources in Module 3. You'll find exercises specifically designed to address this challenge.",
  },
  {
    id: "t4",
    title: "Technical Issue Response",
    content:
      "I'm sorry you're experiencing technical difficulties. Could you please provide more details about the issue, including what device and browser you're using? This will help us troubleshoot more effectively.",
  },
  {
    id: "t5",
    title: "Lesson Reminder",
    content:
      "This is a friendly reminder that your next scheduled lesson is on [DATE] at [TIME]. Please make sure you've completed the pre-lesson assignments.",
  },
  {
    id: "t6",
    title: "Progress Update",
    content:
      "I wanted to take a moment to update you on your progress. You've shown significant improvement in [AREA], and I encourage you to continue practicing regularly.",
  },
]

export function MessageTemplates({ isOpen, onClose }: MessageTemplatesProps) {
  const [templates, setTemplates] = useState(sampleTemplates)
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)
  const [newTemplate, setNewTemplate] = useState(false)
  const [templateTitle, setTemplateTitle] = useState("")
  const [templateContent, setTemplateContent] = useState("")
  const { toast } = useToast()

  // Start creating a new template
  const handleNewTemplate = () => {
    setNewTemplate(true)
    setEditingTemplate(null)
    setTemplateTitle("")
    setTemplateContent("")
  }

  // Start editing an existing template
  const handleEditTemplate = (template: any) => {
    setNewTemplate(false)
    setEditingTemplate(template.id)
    setTemplateTitle(template.title)
    setTemplateContent(template.content)
  }

  // Save template (new or edited)
  const handleSaveTemplate = () => {
    if (!templateTitle.trim() || !templateContent.trim()) {
      toast({
        title: "Error",
        description: "Template title and content are required.",
        variant: "destructive",
      })
      return
    }

    if (newTemplate) {
      // Add new template
      const newId = `t${templates.length + 1}`
      setTemplates([
        ...templates,
        {
          id: newId,
          title: templateTitle,
          content: templateContent,
        },
      ])

      toast({
        title: "Template created",
        description: "Your new message template has been created.",
      })
    } else if (editingTemplate) {
      // Update existing template
      setTemplates(
        templates.map((template) =>
          template.id === editingTemplate ? { ...template, title: templateTitle, content: templateContent } : template,
        ),
      )

      toast({
        title: "Template updated",
        description: "Your message template has been updated.",
      })
    }

    // Reset form
    setNewTemplate(false)
    setEditingTemplate(null)
    setTemplateTitle("")
    setTemplateContent("")
  }

  // Delete a template
  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter((template) => template.id !== id))

    if (editingTemplate === id) {
      setEditingTemplate(null)
      setTemplateTitle("")
      setTemplateContent("")
    }

    toast({
      title: "Template deleted",
      description: "Your message template has been deleted.",
    })
  }

  // Copy template content to clipboard
  const handleCopyTemplate = (content: string) => {
    navigator.clipboard.writeText(content)

    toast({
      title: "Copied to clipboard",
      description: "Template content has been copied to your clipboard.",
    })
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setNewTemplate(false)
    setEditingTemplate(null)
    setTemplateTitle("")
    setTemplateContent("")
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : 300 }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-background border-l shadow-lg z-50 ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Message Templates
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 border-b">
          <Button
            onClick={handleNewTemplate}
            className="w-full bg-gradient-to-r from-neo-mint to-purist-blue hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Template
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          {newTemplate || editingTemplate ? (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">{newTemplate ? "Create New Template" : "Edit Template"}</h3>

              <div className="space-y-2">
                <label htmlFor="template-title" className="text-xs font-medium">
                  Template Title
                </label>
                <Input
                  id="template-title"
                  value={templateTitle}
                  onChange={(e) => setTemplateTitle(e.target.value)}
                  placeholder="Enter template title..."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="template-content" className="text-xs font-medium">
                  Template Content
                </label>
                <Textarea
                  id="template-content"
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                  placeholder="Enter template content..."
                  className="min-h-[150px]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No templates yet</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mb-4">
                    Create message templates to quickly respond to common inquiries.
                  </p>
                  <Button onClick={handleNewTemplate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Template
                  </Button>
                </div>
              ) : (
                templates.map((template) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="bg-muted p-4 rounded-lg border border-border/50 hover:border-border/80 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">{template.title}</h3>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => handleCopyTemplate(template.content)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{template.content}</p>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </motion.div>
  )
}
