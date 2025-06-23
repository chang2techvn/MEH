"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { GroupNavItemProps } from "./types"

export function GroupNavItem({ name, image, active = false }: GroupNavItemProps) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
      <Avatar className="h-9 w-9">
        <AvatarImage src={image || "/placeholder.svg"} alt={name} />
        <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
          {name.substring(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 flex items-center justify-between">
        <span className="font-medium">{name}</span>
        {active && <span className="h-2 w-2 rounded-full bg-green-500"></span>}
      </div>
    </div>
  )
}
