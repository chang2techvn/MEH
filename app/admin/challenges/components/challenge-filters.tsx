"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Tag, ArrowUpDown, Filter, CheckCircle2 } from "lucide-react"
import { ANIMATION_VARIANTS, SORT_OPTIONS } from "../constants"
import type { ChallengeFilters, ViewMode } from "../types"

interface ChallengeFiltersProps {
  filters: ChallengeFilters
  onFiltersChange: (filters: ChallengeFilters) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  allTopics: string[]
}

export default function ChallengeFiltersComponent({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  allTopics,
}: ChallengeFiltersProps) {
  const [topicFilterOpen, setTopicFilterOpen] = useState(false)

  const updateFilters = (updates: Partial<ChallengeFilters>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const toggleTopic = (topic: string) => {
    const newTopics = filters.selectedTopics.includes(topic)
      ? filters.selectedTopics.filter((t) => t !== topic)
      : [...filters.selectedTopics, topic]
    updateFilters({ selectedTopics: newTopics })
  }

  return (
    <motion.div variants={ANIMATION_VARIANTS.slideUp}>
      <Card className="border-none shadow-neo">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search challenges..."
                className="pl-8 w-full"
                value={filters.searchTerm}
                onChange={(e) => updateFilters({ searchTerm: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu open={topicFilterOpen} onOpenChange={setTopicFilterOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[150px]">
                    <Tag className="h-4 w-4 mr-2" />
                    <span>Topics</span>
                    <Badge className="ml-2 bg-primary/20 text-primary hover:bg-primary/30" variant="secondary">
                      {filters.selectedTopics.length}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[220px]" align="end">
                  <div className="p-2">
                    <ScrollArea className="h-[300px] pr-3">
                      <div className="space-y-2">
                        {allTopics.map((topic) => (
                          <div key={topic} className="flex items-center space-x-2">
                            <Checkbox
                              id={`topic-${topic}`}
                              checked={filters.selectedTopics.includes(topic)}
                              onCheckedChange={() => toggleTopic(topic)}
                            />
                            <label
                              htmlFor={`topic-${topic}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {topic}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="p-2 flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateFilters({ selectedTopics: [] })}
                      className="text-xs h-8"
                    >
                      Clear All
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setTopicFilterOpen(false)}
                      className="text-xs h-8 bg-gradient-to-r from-neo-mint to-purist-blue text-white"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Select value={filters.sortOrder} onValueChange={(value) => updateFilters({ sortOrder: value as any })}>
                <SelectTrigger className="w-[180px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <span>Sort by</span>
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[120px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <span>View</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div
                    className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
                    onClick={() => onViewModeChange("table")}
                  >
                    <div className={`w-4 h-4 mr-2 ${viewMode === "table" ? "text-primary" : ""}`}>
                      {viewMode === "table" ? <CheckCircle2 className="h-4 w-4" /> : <div className="w-4" />}
                    </div>
                    Table View
                  </div>
                  <div
                    className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
                    onClick={() => onViewModeChange("grid")}
                  >
                    <div className={`w-4 h-4 mr-2 ${viewMode === "grid" ? "text-primary" : ""}`}>
                      {viewMode === "grid" ? <CheckCircle2 className="h-4 w-4" /> : <div className="w-4" />}
                    </div>
                    Grid View
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
