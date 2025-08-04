"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface AddTopicFormProps {
  newTopic: string
  onNewTopicChange: (topic: string) => void
  onAddTopic: () => void
}

export function AddTopicForm({ newTopic, onNewTopicChange, onAddTopic }: AddTopicFormProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Input
        placeholder="Add new topic..."
        value={newTopic}
        onChange={(e) => onNewTopicChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            onAddTopic()
          }
        }}
      />
      <Button onClick={onAddTopic}>
        <Plus className="h-4 w-4 mr-2" />
        Add
      </Button>
    </div>
  )
}
