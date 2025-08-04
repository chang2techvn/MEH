"use client"

import { useState } from "react"
import type { UserData } from "../types"

export const useUsers = (initialUsers: UserData[]) => {
  const [users, setUsers] = useState<UserData[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isSelectAll, setIsSelectAll] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof UserData | null
    direction: "ascending" | "descending"
  }>({ key: null, direction: "ascending" })

  // Filter users based on search term, role, status, and level
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = selectedRole === null || user.role === selectedRole
    const matchesStatus = selectedStatus === null || user.status === selectedStatus
    const matchesLevel = selectedLevel === null || user.level === selectedLevel

    return matchesSearch && matchesRole && matchesStatus && matchesLevel
  })

  // Sort users based on sort configuration
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig.key) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (aValue === bValue) return 0

    // Handle different types of values
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "ascending" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    // For numbers or other comparable types
    if (aValue! < bValue!) {
      return sortConfig.direction === "ascending" ? -1 : 1
    }
    return sortConfig.direction === "ascending" ? 1 : -1
  })

  const toggleSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  const toggleSelectAll = (users: UserData[]) => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
      setIsSelectAll(false)
    } else {
      setSelectedUsers(users.map((user) => user.id))
      setIsSelectAll(true)
    }
  }

  const requestSort = (key: keyof UserData) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  return {
    users,
    setUsers,
    searchTerm,
    setSearchTerm,
    selectedRole,
    setSelectedRole,
    selectedStatus,
    setSelectedStatus,
    selectedLevel,
    setSelectedLevel,
    selectedUsers,
    setSelectedUsers,
    isSelectAll,
    setIsSelectAll,
    currentPage,
    setCurrentPage,
    sortConfig,
    setSortConfig,
    filteredUsers,
    sortedUsers,
    toggleSelection,
    toggleSelectAll,
    requestSort,
  }
}
