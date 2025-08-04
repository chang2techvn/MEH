"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Assistant } from "../types"

interface AssistantDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assistant: Assistant | null
  isLoading: boolean
  onConfirm: () => void
}

export function AssistantDeleteDialog({
  open,
  onOpenChange,
  assistant,
  isLoading,
  onConfirm,
}: AssistantDeleteDialogProps) {
  if (!assistant) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Assistant</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this assistant? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-3 py-3">
          <Avatar className="h-10 w-10">
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
            <h4 className="font-medium">{assistant.name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{assistant.description}</p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
