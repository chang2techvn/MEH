"use client"

import { AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Topic } from "../types"
import { TopicSearch } from "./topic-search"
import { AddTopicForm } from "./add-topic-form"
import { TopicListItem } from "./topic-list-item"
import { EmptyTopicState } from "./empty-topic-state"

interface TopicsTabProps {
  topics: Topic[]
  filteredTopics: Topic[]
  searchTerm: string
  newTopic: string
  loadingTopics: boolean
  onSearchChange: (term: string) => void
  onNewTopicChange: (topic: string) => void
  onAddTopic: () => void
  onRemoveTopic: (id: string) => void
  onToggleTrending: (id: string) => void
  onRefreshTopics: () => Promise<void>
}

export function TopicsTab({
  topics,
  filteredTopics,
  searchTerm,
  newTopic,
  loadingTopics,
  onSearchChange,
  onNewTopicChange,
  onAddTopic,
  onRemoveTopic,
  onToggleTrending,
  onRefreshTopics,
}: TopicsTabProps) {
  return (
    <div className="space-y-6">
      <TopicSearch
        searchTerm={searchTerm}
        loadingTopics={loadingTopics}
        onSearchChange={onSearchChange}
        onRefresh={onRefreshTopics}
      />

      <AddTopicForm newTopic={newTopic} onNewTopicChange={onNewTopicChange} onAddTopic={onAddTopic} />

      <div className="border rounded-md">
        <div className="p-3 border-b bg-muted/20 flex items-center justify-between">
          <div className="font-medium">Topic Name</div>
          <div className="font-medium">Actions</div>
        </div>

        <ScrollArea className="h-[300px]">
          <AnimatePresence>
            {filteredTopics.length > 0 ? (
              filteredTopics.map((topic) => (
                <TopicListItem
                  key={topic.id}
                  topic={topic}
                  onToggleTrending={onToggleTrending}
                  onRemoveTopic={onRemoveTopic}
                />
              ))
            ) : (
              <EmptyTopicState />
            )}
          </AnimatePresence>
        </ScrollArea>
      </div>

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Total topics: {topics.length}</span>
        <span>Trending topics: {topics.filter((t) => t.trending).length}</span>
      </div>
    </div>
  )
}
