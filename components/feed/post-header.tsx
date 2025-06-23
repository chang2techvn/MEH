"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MoreHorizontal,
  Bookmark,
  EyeOff,
  Flag,
  Award,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import type { UserSubmission } from "@/app/actions/user-submissions"

interface PostHeaderProps {
  username: string
  userImage: string
  timeAgo: string
  mediaType: string
  submission?: UserSubmission
  saved: boolean
  onSavedChange: (saved: boolean) => void
}

export function PostHeader({
  username,
  userImage,
  timeAgo,
  mediaType,
  submission,
  saved,
  onSavedChange,
}: PostHeaderProps) {  return (
    <div className="flex items-start gap-4">
      <div className="hover-scale-small">
        <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-800"><Image
            src={userImage || "/placeholder.svg"}
            alt={username}
            width={48}
            height={48}
            className="h-full w-full object-cover"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
          <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
            {username.substring(0, 2).toUpperCase()}
          </AvatarFallback>        </Avatar>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{username}</p>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>          {mediaType === "ai-submission" && submission && (
            <div className="hover-scale">
              <Badge className="bg-gradient-to-r from-neo-mint to-purist-blue text-white border-0">
                <Award className="h-3 w-3 mr-1" />
                <span className="animate-fade-in">
                  Score: {submission.overallScore}
                </span>
              </Badge>
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-white/20 dark:hover:bg-gray-800/20"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-white/20 dark:border-gray-800/20"
            >
              <DropdownMenuItem
                className="flex items-center gap-2 focus:bg-white/20 dark:focus:bg-gray-800/20"
                onClick={() => onSavedChange(!saved)}
              >
                <Bookmark className="h-4 w-4" />
                {saved ? "Unsave post" : "Save post"}
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 focus:bg-white/20 dark:focus:bg-gray-800/20">
                <EyeOff className="h-4 w-4" />
                Hide
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 focus:bg-white/20 dark:focus:bg-gray-800/20">
                <Flag className="h-4 w-4" />
                Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
