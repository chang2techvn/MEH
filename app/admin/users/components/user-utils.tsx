"use client"

import { useState } from "react"

export const useDropdownManager = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [showDropdownBackdrop, setShowDropdownBackdrop] = useState(false)

  const toggleDropdown = (dropdownId: string) => {
    if (activeDropdown === dropdownId) {
      setActiveDropdown(null)
      setShowDropdownBackdrop(false)
    } else {
      setActiveDropdown(dropdownId)
      setShowDropdownBackdrop(false) // Không dùng backdrop nữa
    }
  }

  const closeAllDropdowns = () => {
    setActiveDropdown(null)
    setShowDropdownBackdrop(false)
  }

  return {
    activeDropdown,
    showDropdownBackdrop,
    toggleDropdown,
    closeAllDropdowns,
  }
}

// Helper function to format date
export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

// Helper function to calculate time since last active
export const getTimeSince = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes} minutes ago`
    }
    return `${diffHours} hours ago`
  } else if (diffDays === 1) {
    return "Yesterday"
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else if (diffDays < 30) {
    const diffWeeks = Math.floor(diffDays / 7)
    return `${diffWeeks} ${diffWeeks === 1 ? "week" : "weeks"} ago`
  } else {
    return formatDate(dateString)
  }
}

// Get initials for avatar
export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

// Generate random confetti
export const generateConfetti = () => {
  const confetti = []
  const colors = ["#FF5733", "#33FF57", "#3357FF", "#F3FF33", "#FF33F3"]

  for (let i = 0; i < 50; i++) {
    const left = Math.random() * 100
    const top = Math.random() * 100
    const size = Math.random() * 10 + 5
    const color = colors[Math.floor(Math.random() * colors.length)]
    const delay = Math.random() * 0.5

    confetti.push(
      <div
        key={i}
        className="confetti absolute rounded-full"
        style={{
          left: `${left}%`,
          top: `${top}%`,
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          animationDelay: `${delay}s`,
        }}
      />,
    )
  }

  return confetti
}
