"use client"

import { useChat } from "@/contexts/chat-context"
import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import MessageDropdown from "./message-dropdown"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function MessageButton() {
  const { toggleDropdown, totalUnreadCount, isDropdownOpen } = useChat()

  return (
    <TooltipProvider>
      <div className="relative chat-button">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative group hover:bg-muted transition-colors"
              onClick={toggleDropdown}
            >
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-0 group-hover:opacity-70 transition-opacity"></div>
              <MessageSquare className="relative h-5 w-5" />
              {totalUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-neo-mint to-purist-blue text-[10px] text-white shadow-glow-sm">
                  {totalUnreadCount}
                </span>
              )}
              <span className="sr-only">Messages</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Messages</p>
          </TooltipContent>
        </Tooltip>

        <MessageDropdown />
      </div>
    </TooltipProvider>
  )
}
