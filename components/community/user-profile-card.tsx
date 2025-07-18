"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthState } from "@/contexts/auth-context"

export function UserProfileCard() {
  const { user, isLoading } = useAuthState()

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 2xl:gap-4 p-2 2xl:p-3 rounded-lg mb-2 2xl:mb-3">
        <div className="h-9 w-9 2xl:h-10 2xl:w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="space-y-1 2xl:space-y-2">
          <div className="h-4 2xl:h-5 w-20 2xl:w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-3 2xl:h-4 w-16 2xl:w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  // Show default state if no user
  if (!user) {
    return (
      <div className="flex items-center gap-3 2xl:gap-4 p-2 2xl:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer mb-2 2xl:mb-3">
        <Avatar className="h-9 w-9 2xl:h-10 2xl:w-10">
          <AvatarFallback className="bg-gradient-to-br from-vibrant-orange to-cantaloupe text-white">
            ?
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium 2xl:text-lg">Guest</p>
          <p className="text-xs 2xl:text-sm text-gray-500 dark:text-gray-400">Please sign in</p>
        </div>
      </div>
    )
  }

  // Generate initials from user name
  const getInitials = (name?: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Determine user level based on points or level
  const getUserLevel = () => {
    if (user.level) return `Level ${user.level}`
    if (user.points) {
      if (user.points >= 1000) return "Advanced Learner"
      if (user.points >= 500) return "Intermediate Learner"
      return "Beginner Learner"
    }
    return "New Learner"
  }

  return (
    <div className="flex items-center gap-3 2xl:gap-4 p-2 2xl:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer mb-2 2xl:mb-3">
      <Avatar className="h-9 w-9 2xl:h-10 2xl:w-10">
        {user.avatar && (
          <AvatarImage 
            src={user.avatar} 
            alt={user.name || "User avatar"}
          />
        )}
        <AvatarFallback className="bg-gradient-to-br from-vibrant-orange to-cantaloupe text-white">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium 2xl:text-lg">{user.name || "User"}</p>
        <p className="text-xs 2xl:text-sm text-gray-500 dark:text-gray-400">{getUserLevel()}</p>
      </div>
    </div>
  )
}
