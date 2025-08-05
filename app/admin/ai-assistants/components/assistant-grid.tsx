"use client"

import { motion } from "framer-motion"
import { AssistantCard } from "./assistant-card-simple"
import { SkeletonAssistantCard } from "./skeleton-assistant-card"
import { EmptyAssistantsState } from "./empty-assistants-state"
import type { Assistant } from "../types"

interface AssistantGridProps {
  assistants: Assistant[]
  isLoading: boolean
  onToggleActive: (id: string, currentStatus: boolean) => void
  onView: (assistant: Assistant) => void
  onEdit: (assistant: Assistant) => void
  onDelete: (assistant: Assistant) => void
  onAddClick: () => void
  searchQuery: string
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export function AssistantGrid({
  assistants,
  isLoading,
  onToggleActive,
  onView,
  onEdit,
  onDelete,
  onAddClick,
  searchQuery,
}: AssistantGridProps) {
  if (isLoading) {
    return (
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonAssistantCard key={index} />
        ))}
      </motion.div>
    )
  }

  if (assistants.length === 0) {
    return <EmptyAssistantsState onAddClick={onAddClick} searchQuery={searchQuery} />
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {assistants.map((assistant) => (
        <AssistantCard
          key={assistant.id}
          assistant={assistant}
          onToggleActive={onToggleActive}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </motion.div>
  )
}
