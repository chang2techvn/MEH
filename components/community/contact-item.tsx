"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { UserProfilePopup } from "./user-profile-popup"

interface ContactItemProps {
  contact: {
    id: string | number
    name: string
    image: string
    online: boolean
    lastActive?: string
  }
  className?: string
  onMessageClick: (userId: string, userName: string) => void
}

export function ContactItem({ contact, className, onMessageClick }: ContactItemProps) {
  const [showPopup, setShowPopup] = useState(false)
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 })

  const handleClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setClickPosition({
      x: rect.left,
      y: rect.top + rect.height / 2,
    })
    setShowPopup(true)
  }

  const handleClosePopup = () => {
    setShowPopup(false)
  }

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg cursor-pointer",
          "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
          "group",
          className
        )}
        onClick={handleClick}
      >
        <div className="relative">
          <Avatar className="h-10 w-10 sm:h-8 sm:w-8">
            <AvatarImage src={contact.image} alt={contact.name} />
            <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white text-sm">
              {contact.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {contact.online && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-neo-mint transition-colors">
            {contact.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {contact.online ? "Online" : `Active ${contact.lastActive || 'recently'}`}
          </p>
        </div>
      </div>

      <UserProfilePopup
        userId={String(contact.id)}
        userName={contact.name}
        userImage={contact.image}
        isOpen={showPopup}
        onClose={handleClosePopup}
        onMessageClick={onMessageClick}
        position={clickPosition}
      />
    </>
  )
}
