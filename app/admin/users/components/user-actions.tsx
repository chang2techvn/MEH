"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal } from "lucide-react"

interface UserData {
  id: string
  name: string
  email: string
  role: string
  status: string
}

interface UserActionsProps {
  user: UserData
  handleUserDetails: (user: UserData) => void
  handleUserAction: (action: string, user: UserData) => void
  actionInProgress: string | null
}

export const UserActions = ({ user, handleUserDetails, handleUserAction, actionInProgress }: UserActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleUserDetails(user)}>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleUserAction("view-submissions", user)}>View Submissions</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleUserAction("view-progress", user)}>View Progress</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleUserAction("suspend", user)}>Suspend User</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleUserAction("activate", user)}>Activate User</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleUserAction("delete", user)} className="text-red-600">
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
