"use client"

import { Globe } from "lucide-react"

export function EmptyTopicState() {
  return (
    <div className="p-8 text-center text-muted-foreground">
      <Globe className="h-12 w-12 mx-auto mb-3 opacity-20" />
      <p>No topics found</p>
      <p className="text-sm">Try a different search term or add a new topic</p>
    </div>
  )
}
