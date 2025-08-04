"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw, Loader2 } from "lucide-react"

interface TopicSearchProps {
  searchTerm: string
  loadingTopics: boolean
  onSearchChange: (term: string) => void
  onRefresh: () => Promise<void>
}

export function TopicSearch({ searchTerm, loadingTopics, onSearchChange, onRefresh }: TopicSearchProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search topics..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button variant="outline" onClick={onRefresh} disabled={loadingTopics}>
        {loadingTopics ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      </Button>
    </div>
  )
}
