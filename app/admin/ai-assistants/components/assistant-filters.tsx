"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, X, Filter, ArrowUpDown, ChevronDown, Users, Zap, ZapOff } from "lucide-react"
import type { AssistantFilters, Assistant } from "../types"
import { categoryOptions } from "../constants"

interface AssistantFiltersProps {
  filters: AssistantFilters
  onFiltersChange: (updates: Partial<AssistantFilters>) => void
  onSort: (field: keyof Assistant) => void
  assistants: Assistant[]
}

export function AssistantFiltersComponent({ filters, onFiltersChange, onSort, assistants }: AssistantFiltersProps) {
  const getActiveTabCount = () => {
    const all = assistants.length
    const active = assistants.filter(a => a.isActive).length
    const inactive = assistants.filter(a => !a.isActive).length
    return { all, active, inactive }
  }

  const counts = getActiveTabCount()

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assistants by name, model, or description..."
            className="pl-9 pr-9 h-10"
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
          />
          {filters.searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-muted"
              onClick={() => onFiltersChange({ searchQuery: "" })}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Sort by {filters.sortField === "name" ? "Name" : 
                      filters.sortField === "createdAt" ? "Date" : 
                      filters.sortField === "model" ? "Model" : "Status"}
              <span className="text-xs opacity-70">
                ({filters.sortDirection === "asc" ? "A-Z" : "Z-A"})
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuItem onClick={() => onSort("name")} className="justify-between">
              Name
              {filters.sortField === "name" && (
                <Badge variant="secondary" className="text-xs">
                  {filters.sortDirection === "asc" ? "A-Z" : "Z-A"}
                </Badge>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSort("createdAt")} className="justify-between">
              Date Created
              {filters.sortField === "createdAt" && (
                <Badge variant="secondary" className="text-xs">
                  {filters.sortDirection === "asc" ? "Old" : "New"}
                </Badge>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSort("model")} className="justify-between">
              Model
              {filters.sortField === "model" && (
                <Badge variant="secondary" className="text-xs">
                  {filters.sortDirection === "asc" ? "A-Z" : "Z-A"}
                </Badge>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSort("isActive")} className="justify-between">
              Status
              {filters.sortField === "isActive" && (
                <Badge variant="secondary" className="text-xs">
                  {filters.sortDirection === "asc" ? "Inactive" : "Active"}
                </Badge>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1">
          {/* All Tab */}
          <Button
            variant={filters.activeTab === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => onFiltersChange({ activeTab: "all" })}
            className="gap-2 h-9"
          >
            <Users className="h-4 w-4" />
            All
            <Badge variant="secondary" className="text-xs">
              {counts.all}
            </Badge>
          </Button>

          {/* Active Tab */}
          <Button
            variant={filters.activeTab === "active" ? "default" : "ghost"}
            size="sm"
            onClick={() => onFiltersChange({ activeTab: "active" })}
            className="gap-2 h-9"
          >
            <Zap className="h-4 w-4" />
            Active
            <Badge variant="secondary" className="text-xs">
              {counts.active}
            </Badge>
          </Button>

          {/* Inactive Tab */}
          <Button
            variant={filters.activeTab === "inactive" ? "default" : "ghost"}
            size="sm"
            onClick={() => onFiltersChange({ activeTab: "inactive" })}
            className="gap-2 h-9"
          >
            <ZapOff className="h-4 w-4" />
            Inactive
            <Badge variant="secondary" className="text-xs">
              {counts.inactive}
            </Badge>
          </Button>
        </div>

        <div className="h-6 w-px bg-border mx-2" />

        {/* Category Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={categoryOptions.some(cat => cat.value === filters.activeTab) ? "default" : "ghost"}
              size="sm"
              className="gap-2 h-9"
            >
              <Filter className="h-4 w-4" />
              Category
              {categoryOptions.find(cat => cat.value === filters.activeTab) && (
                <Badge variant="secondary" className="text-xs">
                  {categoryOptions.find(cat => cat.value === filters.activeTab)?.label}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            <DropdownMenuItem
              onClick={() => onFiltersChange({ activeTab: "all" })}
              className={filters.activeTab === "all" ? "bg-muted font-medium" : ""}
            >
              <Users className="h-4 w-4 mr-2" />
              All Categories
            </DropdownMenuItem>
            <div className="h-px bg-border my-1" />
            {categoryOptions.map((category) => (
              <DropdownMenuItem
                key={category.value}
                onClick={() => onFiltersChange({ activeTab: category.value })}
                className={filters.activeTab === category.value ? "bg-muted font-medium" : ""}
              >
                {category.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        {(filters.searchQuery || filters.activeTab !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({ searchQuery: "", activeTab: "all" })}
            className="text-muted-foreground hover:text-foreground gap-1 h-9"
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
