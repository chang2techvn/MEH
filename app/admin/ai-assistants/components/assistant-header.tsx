"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface AssistantHeaderProps {
  onAddClick: () => void
}

export function AssistantHeader({ onAddClick }: AssistantHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue">
          AI Assistants
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your language learning AI assistants</p>
      </div>

      <Button
        onClick={onAddClick}
        size="default"
        className="self-start bg-gradient-to-r from-neo-mint to-purist-blue hover:opacity-90 transition-opacity"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Assistant
      </Button>
    </div>
  )
}
