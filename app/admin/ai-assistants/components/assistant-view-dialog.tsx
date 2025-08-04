"use client"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Copy, Edit, Trash2 } from "lucide-react"
import type { Assistant } from "../types"
import { categoryOptions } from "../constants"
import { formatDate, formatUsageStats } from "../utils/format"
import { toast } from "@/hooks/use-toast"

interface AssistantViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assistant: Assistant | null
  onEdit: (assistant: Assistant) => void
  onDelete: (assistant: Assistant) => void
}

export function AssistantViewDialog({ open, onOpenChange, assistant, onEdit, onDelete }: AssistantViewDialogProps) {
  if (!assistant) return null

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt)
    toast({
      title: "Copied to clipboard",
      description: "The system prompt has been copied to your clipboard",
    })
  }

  const usage = assistant.usage ? formatUsageStats(assistant.usage) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={assistant.avatar || "/placeholder.svg"} alt={assistant.name} />
                <AvatarFallback>
                  {assistant.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">{assistant.name}</DialogTitle>
                <div className="flex items-center mt-1 space-x-2">
                  <Badge variant="secondary">{assistant.model}</Badge>
                  <Badge variant={assistant.isActive ? "default" : "destructive"}>
                    {assistant.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={() => onEdit(assistant)} className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</h3>
            <p className="text-sm">{assistant.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Category</h3>
              <p className="text-sm capitalize">
                {categoryOptions.find((c) => c.value === assistant.category)?.label || assistant.category}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created</h3>
              <p className="text-sm">{formatDate(assistant.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Updated</h3>
              <p className="text-sm">{formatDate(assistant.updatedAt)}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">System Prompt</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => handleCopyPrompt(assistant.systemPrompt)}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
            <div className="rounded-md bg-muted p-3 text-sm font-mono whitespace-pre-wrap">
              {assistant.systemPrompt}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Capabilities</h3>
            <div className="flex flex-wrap gap-2">
              {assistant.capabilities.map((capability) => (
                <Badge key={capability} variant="outline">
                  {capability}
                </Badge>
              ))}
            </div>
          </div>

          {usage && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Usage Statistics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Conversations</p>
                    <p className="text-2xl font-bold mt-1">{usage.conversations}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Messages</p>
                    <p className="text-2xl font-bold mt-1">{usage.messages}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tokens</p>
                    <p className="text-2xl font-bold mt-1">{usage.tokens}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={() => onDelete(assistant)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>

            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
