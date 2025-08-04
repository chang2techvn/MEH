"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, X, Filter, ArrowUpDown } from "lucide-react"
import type { AssistantFilters, Assistant } from "../types"
import { categoryOptions } from "../constants"

interface AssistantFiltersProps {
  filters: AssistantFilters
  onFiltersChange: (updates: Partial<AssistantFilters>) => void
  onSort: (field: keyof Assistant) => void
}

export function AssistantFiltersComponent({ filters, onFiltersChange, onSort }: AssistantFiltersProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search assistants..."
            className="pl-9"
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
          />
          {filters.searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
              onClick={() => onFiltersChange({ searchQuery: "" })}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Tabs
          defaultValue="all"
          className="w-full sm:w-auto"
          value={filters.activeTab}
          onValueChange={(value) => onFiltersChange({ activeTab: value })}
        >
          <TabsList className="grid grid-cols-4 md:w-[400px]">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full h-9 px-2 flex items-center justify-center">
                  <Filter className="h-4 w-4 mr-1" />
                  <span className="truncate">Category</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {categoryOptions.map((category) => (
                  <DropdownMenuItem
                    key={category.value}
                    onClick={() => onFiltersChange({ activeTab: category.value })}
                    className={filters.activeTab === category.value ? "bg-muted" : ""}
                  >
                    {category.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Sort by
              {filters.sortField === "name" && " Name"}
              {filters.sortField === "createdAt" && " Date"}
              {filters.sortField === "model" && " Model"}
              {filters.sortField === "isActive" && " Status"}
              <span className="ml-1">({filters.sortDirection === "asc" ? "A-Z" : "Z-A"})</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onClick={() => onSort("name")}>
              Name
              {filters.sortField === "name" && (
                <span className="ml-auto">{filters.sortDirection === "asc" ? "↑" : "↓"}</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSort("createdAt")}>
              Date created
              {filters.sortField === "createdAt" && (
                <span className="ml-auto">{filters.sortDirection === "asc" ? "↑" : "↓"}</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSort("model")}>
              Model
              {filters.sortField === "model" && (
                <span className="ml-auto">{filters.sortDirection === "asc" ? "↑" : "↓"}</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSort("isActive")}>
              Status
              {filters.sortField === "isActive" && (
                <span className="ml-auto">{filters.sortDirection === "asc" ? "↑" : "↓"}</span>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
