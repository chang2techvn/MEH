"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock, ThumbsUp, Award, Filter, X, Video, FileText, MessageSquare } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface FeedFilterProps {
  onFilterChange: (filters: string[]) => void
}

export default function FeedFilter({ onFilterChange }: FeedFilterProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>("recent")

  const handleFilterToggle = (filter: string) => {
    setActiveFilters((prev) => {
      const newFilters = prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]

      onFilterChange(newFilters)
      return newFilters
    })
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    // In a real app, you would trigger a re-sort of the feed
  }

  const handleClearFilters = () => {
    setActiveFilters([])
    onFilterChange([])
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {activeFilters.length > 0 && <Badge className="ml-2 bg-neo-mint text-white">{activeFilters.length}</Badge>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-white/20 dark:border-gray-800/20">
          <DropdownMenuLabel>Filter by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className={`flex items-center gap-2 ${activeFilters.includes("video") ? "bg-neo-mint/10 dark:bg-purist-blue/10" : ""}`}
              onClick={() => handleFilterToggle("video")}
            >
              <Video className="h-4 w-4" />
              <span>Videos</span>
              {activeFilters.includes("video") && (
                <Badge className="ml-auto bg-neo-mint text-white">
                  <CheckIcon className="h-3 w-3" />
                </Badge>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`flex items-center gap-2 ${activeFilters.includes("text") ? "bg-neo-mint/10 dark:bg-purist-blue/10" : ""}`}
              onClick={() => handleFilterToggle("text")}
            >
              <FileText className="h-4 w-4" />
              <span>Written Content</span>
              {activeFilters.includes("text") && (
                <Badge className="ml-auto bg-neo-mint text-white">
                  <CheckIcon className="h-3 w-3" />
                </Badge>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`flex items-center gap-2 ${activeFilters.includes("discussion") ? "bg-neo-mint/10 dark:bg-purist-blue/10" : ""}`}
              onClick={() => handleFilterToggle("discussion")}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Discussions</span>
              {activeFilters.includes("discussion") && (
                <Badge className="ml-auto bg-neo-mint text-white">
                  <CheckIcon className="h-3 w-3" />
                </Badge>
              )}
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm">
            {sortBy === "recent" && <Clock className="h-4 w-4 mr-2" />}
            {sortBy === "trending" && <TrendingUp className="h-4 w-4 mr-2" />}
            {sortBy === "popular" && <ThumbsUp className="h-4 w-4 mr-2" />}
            {sortBy === "top" && <Award className="h-4 w-4 mr-2" />}

            {sortBy === "recent" && "Most Recent"}
            {sortBy === "trending" && "Trending"}
            {sortBy === "popular" && "Most Popular"}
            {sortBy === "top" && "Top Rated"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-white/20 dark:border-gray-800/20">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className={`flex items-center gap-2 ${sortBy === "recent" ? "bg-neo-mint/10 dark:bg-purist-blue/10" : ""}`}
            onClick={() => handleSortChange("recent")}
          >
            <Clock className="h-4 w-4" />
            <span>Most Recent</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className={`flex items-center gap-2 ${sortBy === "trending" ? "bg-neo-mint/10 dark:bg-purist-blue/10" : ""}`}
            onClick={() => handleSortChange("trending")}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Trending</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className={`flex items-center gap-2 ${sortBy === "popular" ? "bg-neo-mint/10 dark:bg-purist-blue/10" : ""}`}
            onClick={() => handleSortChange("popular")}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>Most Popular</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className={`flex items-center gap-2 ${sortBy === "top" ? "bg-neo-mint/10 dark:bg-purist-blue/10" : ""}`}
            onClick={() => handleSortChange("top")}
          >
            <Award className="h-4 w-4" />
            <span>Top Rated</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active filters display */}
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter) => (
          <motion.div
            key={filter}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Badge
              className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm text-foreground flex items-center gap-1 px-3 py-1"
              onClick={() => handleFilterToggle(filter)}
            >
              {filter === "video" && <Video className="h-3 w-3" />}
              {filter === "text" && <FileText className="h-3 w-3" />}
              {filter === "discussion" && <MessageSquare className="h-3 w-3" />}
              <span className="capitalize">{filter}</span>
              <X className="h-3 w-3 ml-1 cursor-pointer" />
            </Badge>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Helper component for the checkmark
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
