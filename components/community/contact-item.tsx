"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { ContactItemProps } from "./types"

export function ContactItem({ name, image, online, lastActive }: ContactItemProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 2xl:gap-4 p-2 sm:p-2.5 2xl:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
      <div className="relative flex-shrink-0">
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 2xl:h-12 2xl:w-12 border border-gray-200 dark:border-gray-700">
          <AvatarImage src={image || "/placeholder.svg"} alt={name} />
          <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
            {name.substring(0, 2)}
          </AvatarFallback>
        </Avatar>
        {online && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 2xl:h-3.5 2xl:w-3.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></span>
        )}
      </div>
      <div className="flex-1 flex items-center justify-between min-w-0">
        <span className="font-medium text-sm sm:text-base 2xl:text-lg truncate">{name}</span>
        {!online && lastActive && (
          <span className="text-[10px] sm:text-xs 2xl:text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 ml-1 2xl:ml-2">
            {lastActive}
          </span>
        )}
      </div>
    </div>
  )
}
