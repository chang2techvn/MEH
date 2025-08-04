"use client"

import { useState } from "react"

// Mock data for users
const mockUsers = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "Student",
    lastActive: "2 hours ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Sarah Williams",
    email: "sarah@example.com",
    role: "Student",
    lastActive: "5 mins ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael@example.com",
    role: "Teacher",
    lastActive: "1 day ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily@example.com",
    role: "Student",
    lastActive: "Just now",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david@example.com",
    role: "Student",
    lastActive: "3 days ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 6,
    name: "Jessica Taylor",
    email: "jessica@example.com",
    role: "Teacher",
    lastActive: "1 hour ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 7,
    name: "Ryan Martinez",
    email: "ryan@example.com",
    role: "Student",
    lastActive: "2 days ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 8,
    name: "Olivia Anderson",
    email: "olivia@example.com",
    role: "Student",
    lastActive: "4 hours ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export const useUserSelection = () => {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showUserSelector, setShowUserSelector] = useState(false)

  // Filter users based on search query
  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle select all users
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id))
    }
    setSelectAll(!selectAll)
  }

  // Handle individual user selection
  const handleSelectUser = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
      setSelectAll(false)
    } else {
      setSelectedUsers([...selectedUsers, userId])
      if (selectedUsers.length + 1 === filteredUsers.length) {
        setSelectAll(true)
      }
    }
  }

  return {
    selectedUsers,
    setSelectedUsers,
    selectAll,
    setSelectAll,
    searchQuery,
    setSearchQuery,
    showUserSelector,
    setShowUserSelector,
    filteredUsers,
    handleSelectAll,
    handleSelectUser,
    mockUsers,
  }
}
