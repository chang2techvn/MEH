"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

interface BulkActionsBarProps {
  selectedCount: number
  bulkActionOpen: boolean
  setBulkActionOpen: (open: boolean) => void
  onBulkChangeDifficulty: (difficulty: string) => void
  onBulkDelete: () => void
  onClearSelection: () => void
}

export default function BulkActionsBar({
  selectedCount,
  bulkActionOpen,
  setBulkActionOpen,
  onBulkChangeDifficulty,
  onBulkDelete,
  onClearSelection,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center justify-between bg-muted/50 p-2 rounded-md"
    >
      <div className="text-sm">
        <span className="font-medium">{selectedCount}</span> challenges selected
      </div>
      <div className="flex gap-2">
        <DropdownMenu open={bulkActionOpen} onOpenChange={setBulkActionOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Bulk Actions
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onBulkChangeDifficulty("beginner")}>Set as Beginner</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkChangeDifficulty("intermediate")}>
              Set as Intermediate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkChangeDifficulty("advanced")}>Set as Advanced</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onBulkDelete} className="text-red-600">
              Delete Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          Clear Selection
        </Button>
      </div>
    </motion.div>
  )
}
