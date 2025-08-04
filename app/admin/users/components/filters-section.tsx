"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, Search } from "lucide-react"

interface FiltersSectionProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedRole: string | null
  setSelectedRole: (role: string | null) => void
  selectedStatus: string | null
  setSelectedStatus: (status: string | null) => void
  selectedLevel: string | null
  setSelectedLevel: (level: string | null) => void
  resetFilters: () => void
  showFilters: boolean
  setShowFilters: (show: boolean) => void
}

export const FiltersSection = ({
  searchTerm,
  setSearchTerm,
  selectedRole,
  setSelectedRole,
  selectedStatus,
  setSelectedStatus,
  selectedLevel,
  setSelectedLevel,
  resetFilters,
  showFilters,
  setShowFilters,
}: FiltersSectionProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search users..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
        <Filter className="h-4 w-4 mr-2" />
        {showFilters ? "Hide Filters" : "Show Filters"}
      </Button>
    </div>
  )
}
