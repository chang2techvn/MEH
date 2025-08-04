"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatDuration } from "../utils/format-utils"
import { DIFFICULTY_OPTIONS } from "../constants"
import type { ChallengeFormState } from "../types"

interface EditChallengeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formState: ChallengeFormState
  formError: string | null
  formLoading: boolean
  allTopics: string[]
  onSubmit: () => void
  onYoutubeUrlChange: (url: string) => void
}

export default function EditChallengeModal({
  open,
  onOpenChange,
  formState,
  formError,
  formLoading,
  allTopics,
  onSubmit,
  onYoutubeUrlChange,
}: EditChallengeModalProps) {
  const [localFormState, setLocalFormState] = useState(formState)

  const updateFormState = (updates: Partial<ChallengeFormState>) => {
    setLocalFormState({ ...localFormState, ...updates })
  }

  const handleSubmit = () => {
    onSubmit()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Challenge</DialogTitle>
          <DialogDescription>Update the challenge details.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Challenge title"
                value={localFormState.title}
                onChange={(e) => updateFormState({ title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-difficulty">Difficulty Level</Label>
              <Select
                value={localFormState.difficulty}
                onValueChange={(value) => updateFormState({ difficulty: value })}
              >
                <SelectTrigger id="edit-difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Challenge description"
              value={localFormState.description}
              onChange={(e) => updateFormState({ description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Topics</Label>
            <ScrollArea className="h-[100px] border rounded-md p-2">
              <div className="space-y-2">
                {allTopics.slice(0, 15).map((topic) => (
                  <div key={topic} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-topic-${topic}`}
                      checked={localFormState.topics.includes(topic)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFormState({
                            topics: [...localFormState.topics, topic],
                          })
                        } else {
                          updateFormState({
                            topics: localFormState.topics.filter((t) => t !== topic),
                          })
                        }
                      }}
                    />
                    <label
                      htmlFor={`edit-topic-${topic}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {topic}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-featured"
              checked={localFormState.featured}
              onCheckedChange={(checked) => updateFormState({ featured: !!checked })}
            />
            <label
              htmlFor="edit-featured"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Feature this challenge (will appear prominently on the challenges page)
            </label>
          </div>

          {localFormState.thumbnailUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-16 bg-muted rounded overflow-hidden">
                  <img
                    src={localFormState.thumbnailUrl || "/placeholder.svg"}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{localFormState.title}</p>
                  <p className="text-xs text-muted-foreground">Duration: {formatDuration(localFormState.duration)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!localFormState.title.trim()}
            className="bg-gradient-to-r from-neo-mint to-purist-blue text-white"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
