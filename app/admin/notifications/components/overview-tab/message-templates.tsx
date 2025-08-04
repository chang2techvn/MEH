"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Mail } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { MessageTemplate } from "../types"

interface MessageTemplatesProps {
  messageTemplates: MessageTemplate[]
  handleSelectTemplate: (templateId: number) => void
  setActiveTab: (tab: string) => void
}

export const MessageTemplates: React.FC<MessageTemplatesProps> = ({
  messageTemplates,
  handleSelectTemplate,
  setActiveTab,
}) => {
  return (
    <Card className="border-none shadow-neo">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Message Templates</CardTitle>
        <CardDescription>Reusable message templates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messageTemplates.map((template, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neo-mint/20 to-purist-blue/20 flex items-center justify-center">
                <Mail className="h-5 w-5 text-purist-blue" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{template.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{template.subject}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => {
                  handleSelectTemplate(template.id)
                  setActiveTab("compose")
                }}
              >
                Use
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
