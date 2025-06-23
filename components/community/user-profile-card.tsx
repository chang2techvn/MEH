"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function UserProfileCard() {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer mb-2">
      <Avatar className="h-9 w-9">
        <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">JD</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">John Doe</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Advanced Learner</p>
      </div>
    </div>
  )
}
