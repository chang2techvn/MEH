"use client"

import { useState, useEffect, useMemo } from "react"
import type { Assistant, AssistantFilters } from "../types"

export function useAssistantFilters(assistants: Assistant[]) {
  const [filters, setFilters] = useState<AssistantFilters>({
    searchQuery: "",
    activeTab: "all",
    sortField: "name",
    sortDirection: "asc",
    currentPage: 1,
    itemsPerPage: 8,
  })

  const filteredAndSortedAssistants = useMemo(() => {
    return assistants
      .filter((assistant) => {
        const matchesSearch =
          assistant.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          assistant.description.toLowerCase().includes(filters.searchQuery.toLowerCase())
        const matchesTab =
          filters.activeTab === "all" ||
          (filters.activeTab === "active" && assistant.isActive) ||
          (filters.activeTab === "inactive" && !assistant.isActive) ||
          filters.activeTab === assistant.category
        return matchesSearch && matchesTab
      })
      .sort((a, b) => {
        const fieldA = a[filters.sortField]
        const fieldB = b[filters.sortField]

        if (typeof fieldA === "string" && typeof fieldB === "string") {
          return filters.sortDirection === "asc" ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA)
        }

        if (fieldA instanceof Date && fieldB instanceof Date) {
          return filters.sortDirection === "asc"
            ? fieldA.getTime() - fieldB.getTime()
            : fieldB.getTime() - fieldA.getTime()
        }

        if (typeof fieldA === "boolean" && typeof fieldB === "boolean") {
          return filters.sortDirection === "asc"
            ? fieldA === fieldB
              ? 0
              : fieldA
                ? -1
                : 1
            : fieldA === fieldB
              ? 0
              : fieldA
                ? 1
                : -1
        }

        return 0
      })
  }, [assistants, filters])

  const totalPages = Math.ceil(filteredAndSortedAssistants.length / filters.itemsPerPage)
  const paginatedAssistants = filteredAndSortedAssistants.slice(
    (filters.currentPage - 1) * filters.itemsPerPage,
    filters.currentPage * filters.itemsPerPage,
  )

  useEffect(() => {
    setFilters((prev) => ({ ...prev, currentPage: 1 }))
  }, [filters.searchQuery, filters.activeTab])

  const handleSort = (field: keyof Assistant) => {
    setFilters((prev) => ({
      ...prev,
      sortField: field,
      sortDirection: prev.sortField === field && prev.sortDirection === "asc" ? "desc" : "asc",
    }))
  }

  const updateFilters = (updates: Partial<AssistantFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }

  return {
    filters,
    filteredAndSortedAssistants,
    paginatedAssistants,
    totalPages,
    handleSort,
    updateFilters,
  }
}
