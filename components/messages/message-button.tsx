"use client"

import { useChat } from "@/contexts/chat-context-realtime"
import { useAuthState } from "@/contexts/auth-context"
import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import MessageDropdown from "./message-dropdown"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function MessageButton() {
  const { toggleDropdown, totalUnreadCount, isDropdownOpen } = useChat()
  const { isAuthenticated, user } = useAuthState()

  return (
    <TooltipProvider>
      <div className="relative chat-button">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`relative group transition-colors ${
                isAuthenticated 
                  ? "hover:bg-muted" 
                  : "opacity-50 cursor-not-allowed pointer-events-none"
              }`}
              onClick={isAuthenticated ? toggleDropdown : undefined}
              disabled={!isAuthenticated}
            >
              <div className={`absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm transition-opacity ${
                isAuthenticated 
                  ? "opacity-0 group-hover:opacity-70" 
                  : "opacity-0"
              }`}></div>
              <MessageSquare className="relative h-5 w-5" />
              {isAuthenticated && totalUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-neo-mint to-purist-blue text-[10px] text-white shadow-glow-sm">
                  {totalUnreadCount}
                </span>
              )}
              <span className="sr-only">
                {isAuthenticated ? "Messages" : "Sign in to view messages"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isAuthenticated ? "Messages" : "Sign in to view messages"}</p>
          </TooltipContent>
        </Tooltip>

        {isAuthenticated && <MessageDropdown />}
      </div>
    </TooltipProvider>
  )
}
