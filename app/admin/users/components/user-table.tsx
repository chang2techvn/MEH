"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  FileText, 
  BarChart3, 
  Lock, 
  Unlock, 
  Trash2, 
  ArrowUpDown, 
  Search, 
  RefreshCw, 
  Loader2 
} from "lucide-react"
import type { UserData } from "@/hooks/use-users"
import { StatusBadge, RoleBadge, LevelBadge } from "./user-badges"
import { formatDate, getTimeSince, getInitials } from "./user-utils"

interface UserTableProps {
  isLoading: boolean
  paginatedUsers: UserData[]
  isSelectAll: boolean
  handleSelectAll: () => void
  selectedUsers: string[]
  handleSelectUser: (userId: string) => void
  sortConfig: { key: keyof UserData | null; direction: "ascending" | "descending" }
  requestSort: (key: keyof UserData) => void
  lastAddedUser: UserData | null
  activeDropdown: string | null
  toggleDropdown: (id: string) => void
  handleUserDetails: (user: UserData) => void
  setEditMode: (mode: boolean) => void
  actionInProgress: string | null
  handleUserAction: (action: string, user: UserData) => void
  resetFilters: () => void
}

const tableRowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: "easeOut",
    },
  }),
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
}

export const UserTable = ({
  isLoading,
  paginatedUsers,
  isSelectAll,
  handleSelectAll,
  selectedUsers,
  handleSelectUser,
  sortConfig,
  requestSort,
  lastAddedUser,
  activeDropdown,
  toggleDropdown,
  handleUserDetails,
  setEditMode,
  actionInProgress,
  handleUserAction,
  resetFilters,
}: UserTableProps) => {
  return (
    <div className="overflow-hidden rounded-md border border-muted/30">
      <Table>
        <TableHeader className="bg-muted/50 backdrop-blur-sm">
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isSelectAll}
                onCheckedChange={handleSelectAll}
                aria-label="Select all users"
                className="transition-all duration-300 data-[state=checked]:bg-neo-mint dark:data-[state=checked]:bg-purist-blue data-[state=checked]:text-primary-foreground"
              />
            </TableHead>
            <TableHead
              className="cursor-pointer hover:text-neo-mint dark:hover:text-purist-blue transition-colors duration-200"
              onClick={() => requestSort("name")}
            >
              <div className="flex items-center">
                User
                {sortConfig.key === "name" && (
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead
              className="hidden md:table-cell cursor-pointer hover:text-neo-mint dark:hover:text-purist-blue transition-colors duration-200"
              onClick={() => requestSort("role")}
            >
              <div className="flex items-center">
                Role
                {sortConfig.key === "role" && (
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead
              className="hidden md:table-cell cursor-pointer hover:text-neo-mint dark:hover:text-purist-blue transition-colors duration-200"
              onClick={() => requestSort("status")}
            >
              <div className="flex items-center">
                Status
                {sortConfig.key === "status" && (
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead
              className="hidden md:table-cell cursor-pointer hover:text-neo-mint dark:hover:text-purist-blue transition-colors duration-200"
              onClick={() => requestSort("level")}
            >
              <div className="flex items-center">
                Level
                {sortConfig.key === "level" && (
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead
              className="hidden lg:table-cell cursor-pointer hover:text-neo-mint dark:hover:text-purist-blue transition-colors duration-200"
              onClick={() => requestSort("joinDate")}
            >
              <div className="flex items-center">
                Joined
                {sortConfig.key === "joinDate" && (
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead className="hidden lg:table-cell">Last Active</TableHead>
            <TableHead className="hidden xl:table-cell">Progress</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-2 w-24" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8 ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : paginatedUsers.length > 0 ? (
            <AnimatePresence>
              {paginatedUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  data-user-id={user.id}
                  custom={index}
                  variants={tableRowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`group border-b border-muted/30 hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors duration-200 ${
                    lastAddedUser?.id === user.id ? "bg-neo-mint/10 dark:bg-purist-blue/10" : ""
                  }`}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleSelectUser(user.id)}
                      aria-label={`Select ${user.name}`}
                      className="transition-all duration-300 data-[state=checked]:bg-neo-mint dark:data-[state=checked]:bg-purist-blue data-[state=checked]:text-primary-foreground"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border-2 border-white shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                        <AvatarImage
                          src={user.avatarUrl || "/placeholder.svg?height=36&width=36"}
                          alt={user.name}
                        />
                        <AvatarFallback className="bg-neo-mint/10 dark:bg-purist-blue/10 text-neo-mint dark:text-purist-blue font-medium">
                          {getInitials(user.name)}
                        </AvatarFallback>
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
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${user.totalChallenges > 0 ? (user.completedChallenges / user.totalChallenges) * 100 : 0}%`,
                          }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="h-full bg-neo-mint dark:bg-purist-blue rounded-full"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {user.completedChallenges}/{user.totalChallenges}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-70 group-hover:opacity-100 hover:bg-neo-mint/10 dark:hover:bg-purist-blue/10 transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleDropdown(`user-actions-${user.id}`)
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                      
                      <AnimatePresence>
                        {activeDropdown === `user-actions-${user.id}` && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 z-[60] mt-1 w-56 rounded-md bg-popover p-2 shadow-lg ring-1 ring-black/5 dark:ring-white/10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                              User Actions
                            </div>
                            <div className="h-px bg-muted my-1"></div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-left font-normal px-2 py-1.5 h-auto"
                              onClick={() => handleUserDetails(user)}
                            >
                              <Eye className="mr-2 h-4 w-4 text-neo-mint dark:text-purist-blue" />
                              View Details
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-left font-normal px-2 py-1.5 h-auto"
                              onClick={() => {
                                handleUserDetails(user)
                                setEditMode(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4 text-blue-500" />
                              Edit User
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-left font-normal px-2 py-1.5 h-auto"
                              onClick={() => handleUserAction("view-submissions", user)}
                            >
                              {actionInProgress === user.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin text-green-500" />
                              ) : (
                                <FileText className="mr-2 h-4 w-4 text-green-500" />
                              )}
                              View Submissions
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-left font-normal px-2 py-1.5 h-auto"
                              onClick={() => handleUserAction("view-progress", user)}
                            >
                              {actionInProgress === user.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin text-purple-500" />
                              ) : (
                                <BarChart3 className="mr-2 h-4 w-4 text-purple-500" />
                              )}
                              View Progress
                            </Button>
                            <div className="h-px bg-muted my-1"></div>
                            {user.status === "active" ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-left font-normal px-2 py-1.5 h-auto text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                onClick={() => handleUserAction("suspend", user)}
                              >
                                {actionInProgress === user.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Lock className="mr-2 h-4 w-4" />
                                )}
                                Suspend User
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-left font-normal px-2 py-1.5 h-auto text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                                onClick={() => handleUserAction("activate", user)}
                              >
                                {actionInProgress === user.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Unlock className="mr-2 h-4 w-4" />
                                )}
                                Activate User
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-left font-normal px-2 py-1.5 h-auto text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => handleUserAction("delete", user)}
                            >
                              {actionInProgress === user.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                              )}
                              Delete User
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center space-y-3 py-4">
                  <div className="rounded-full bg-muted/30 p-3">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-lg font-medium">No users found</div>
                  <div className="text-sm text-muted-foreground max-w-sm text-center">
                    We couldn't find any users matching your search criteria. Try adjusting your filters or
                    search term.
                  </div>
                  <Button variant="outline" onClick={resetFilters} className="mt-2 gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Reset Filters
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
