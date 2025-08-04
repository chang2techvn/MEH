"use client"

import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { UserData } from "../types"
import { StatusBadge, RoleBadge, LevelBadge } from "./user-badges"
import { formatDate, getTimeSince } from "../utils"

interface UserTableProps {
  users: UserData[]
  selectedUsers: string[]
  toggleSelection: (userId: string) => void
  toggleSelectAll: () => void
  handleUserDetails: (user: UserData) => void
  handleUserAction: (action: string, user: UserData) => void
  isSelectAll: boolean
  actionInProgress: string | null
}

export const UserTable = ({
  users,
  selectedUsers,
  toggleSelection,
  toggleSelectAll,
  handleUserDetails,
  handleUserAction,
  isSelectAll,
  actionInProgress,
}: UserTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox checked={isSelectAll} onCheckedChange={toggleSelectAll} aria-label="Select all users" />
          </TableHead>
          <TableHead>User</TableHead>
          <TableHead className="hidden md:table-cell">Role</TableHead>
          <TableHead className="hidden md:table-cell">Status</TableHead>
          <TableHead className="hidden md:table-cell">Level</TableHead>
          <TableHead className="hidden lg:table-cell">Joined</TableHead>
          <TableHead className="hidden lg:table-cell">Last Active</TableHead>
          <TableHead className="hidden xl:table-cell">Progress</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="w-12">
              <Checkbox
                checked={selectedUsers.includes(user.id)}
                onCheckedChange={() => toggleSelection(user.id)}
                aria-label={`Select ${user.name}`}
              />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatarUrl || "/placeholder.svg?height=36&width=36"} alt={user.name} />
                  <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <RoleBadge role={user.role} />
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <StatusBadge status={user.status} />
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <LevelBadge level={user.level} />
            </TableCell>
            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
              {formatDate(user.joinDate)}
            </TableCell>
            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
              {getTimeSince(user.lastActive)}
            </TableCell>
            <TableCell className="hidden xl:table-cell">
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
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleUserDetails(user)}>
                    <Eye className="h-4 w-4 mr-2" /> View Details
                  </DropdownMenuItem>
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
