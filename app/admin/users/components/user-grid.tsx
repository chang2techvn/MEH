"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { UserData } from "../types"
import { StatusBadge, RoleBadge, LevelBadge } from "./user-badges"
import { formatDate, getTimeSince } from "../utils"

interface UserGridProps {
  users: UserData[]
  selectedUsers: string[]
  toggleSelection: (userId: string) => void
  handleUserDetails: (user: UserData) => void
  handleUserAction: (action: string, user: UserData) => void
}

export const UserGrid = ({
  users,
  selectedUsers,
  toggleSelection,
  handleUserDetails,
  handleUserAction,
}: UserGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {users.map((user) => (
        <Card key={user.id} className="overflow-hidden border shadow h-full flex flex-col">
          <div className="p-4 flex-grow">
            <div className="flex items-start gap-3 mb-4">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                <AvatarImage src={user.avatarUrl || "/placeholder.svg?height=48&width=48"} alt={user.name} />
                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-base">{user.name}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <RoleBadge role={user.role} />
                <StatusBadge status={user.status} />
                <LevelBadge level={user.level} />
              </div>

              <div className="text-xs text-muted-foreground">
                Joined: {formatDate(user.joinDate)}
                <br />
                Last Active: {getTimeSince(user.lastActive)}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neo-mint dark:bg-purist-blue rounded-full"
                      style={{ width: `${(user.completedChallenges / user.totalChallenges) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {user.completedChallenges}/{user.totalChallenges}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 p-2 flex justify-between items-center">
            <Checkbox
              checked={selectedUsers.includes(user.id)}
              onCheckedChange={() => toggleSelection(user.id)}
              aria-label={`Select ${user.name}`}
            />

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-background/80"
                onClick={() => handleUserDetails(user)}
              >
                <Eye className="h-4 w-4 text-neo-mint dark:text-purist-blue" />
                <span className="sr-only">View</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-background/80">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleUserAction("view-submissions", user)}>
                    View Submissions
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUserAction("view-progress", user)}>
                    View Progress
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleUserAction("suspend", user)}>Suspend User</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUserAction("activate", user)}>Activate User</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUserAction("delete", user)} className="text-red-600">
                    Delete User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
