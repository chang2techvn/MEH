"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
  Eye, 
  Edit, 
  MoreVertical, 
  Calendar, 
  Clock, 
  FileText, 
  BarChart3, 
  Lock, 
  Unlock, 
  Trash2, 
  Search, 
  RefreshCw 
} from "lucide-react"
import type { UserData } from "@/hooks/use-users"
import { StatusBadge, RoleBadge } from "./user-badges"
import { formatDate, getTimeSince, getInitials } from "./user-utils"

interface UserGridProps {
  isLoading: boolean
  paginatedUsers: UserData[]
  selectedUsers: string[]
  toggleSelection: (userId: string) => void
  lastAddedUser: UserData | null
  activeDropdown: string | null
  toggleDropdown: (id: string) => void
  handleUserDetails: (user: UserData) => void
  setEditMode: (mode: boolean) => void
  handleUserAction: (action: string, user: UserData) => void
  resetFilters: () => void
}

const gridItemVariants = {
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
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
}

export const UserGrid = ({
  isLoading,
  paginatedUsers,
  selectedUsers,
  toggleSelection,
  lastAddedUser,
  activeDropdown,
  toggleDropdown,
  handleUserDetails,
  setEditMode,
  handleUserAction,
  resetFilters,
}: UserGridProps) => {
  return (
    <div className="p-4">
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={`grid-skeleton-${index}`} className="overflow-hidden border shadow">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
              <div className="bg-muted/30 p-3 flex justify-end">
                <Skeleton className="h-8 w-8" />
              </div>
            </Card>
          ))}
        </div>
      ) : paginatedUsers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {paginatedUsers.map((user, index) => (
              <motion.div
                key={user.id}
                custom={index}
                variants={gridItemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover="hover"
                data-user-id={user.id}
                className={lastAddedUser?.id === user.id ? "ring-2 ring-neo-mint dark:ring-purist-blue" : ""}
              >
                <Card className="border shadow h-full flex flex-col">
                  <div className="p-4 flex-grow">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarImage
                          src={user.avatarUrl || "/placeholder.svg?height=48&width=48"}
                          alt={user.name}
                        />
                        <AvatarFallback className="bg-neo-mint/10 dark:bg-purist-blue/10 text-neo-mint dark:text-purist-blue font-medium text-lg">
                          {getInitials(user.name)}
                        </AvatarFallback>
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
                      </div>
                      
                      <div className="pt-2">
                        <div className="text-xs text-muted-foreground mb-1 flex justify-between">
                          <span>Progress</span>
                          <span>{user.completedChallenges}/{user.totalChallenges}</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${user.totalChallenges > 0 ? (user.completedChallenges / user.totalChallenges) * 100 : 0}%`,
                            }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-full bg-neo-mint dark:bg-purist-blue rounded-full"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <div>
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {formatDate(user.joinDate)}
                        </div>
                        <div>
                          <Clock className="h-3 w-3 inline mr-1" />
                          {getTimeSince(user.lastActive)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-2 flex justify-between items-center">
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => toggleSelection(user.id)}
                      aria-label={`Select ${user.name}`}
                      className="ml-2 transition-all duration-300 data-[state=checked]:bg-neo-mint dark:data-[state=checked]:bg-purist-blue data-[state=checked]:text-primary-foreground"
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
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-background/80"
                        onClick={() => {
                          handleUserDetails(user)
                          setEditMode(true)
                        }}
                      >
                        <Edit className="h-4 w-4 text-blue-500" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-background/80"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleDropdown(`user-grid-actions-${user.id}`)
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">More</span>
                        </Button>
                        
                        <AnimatePresence>
                          {activeDropdown === `user-grid-actions-${user.id}` && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 z-[60] mt-1 w-48 rounded-md bg-popover p-2 shadow-lg ring-1 ring-black/5 dark:ring-white/10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-left font-normal px-2 py-1.5 h-auto"
                                onClick={() => handleUserAction("view-submissions", user)}
                              >
                                <FileText className="mr-2 h-4 w-4 text-green-500" />
                                Submissions
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-left font-normal px-2 py-1.5 h-auto"
                                onClick={() => handleUserAction("view-progress", user)}
                              >
                                <BarChart3 className="mr-2 h-4 w-4 text-purple-500" />
                                Progress
                              </Button>
                              <div className="h-px bg-muted my-1"></div>
                              {user.status === "active" ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-left font-normal px-2 py-1.5 h-auto text-amber-600"
                                  onClick={() => handleUserAction("suspend", user)}
                                >
                                  <Lock className="mr-2 h-4 w-4" />
                                  Suspend
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-left font-normal px-2 py-1.5 h-auto text-green-600"
                                  onClick={() => handleUserAction("activate", user)}
                                >
                                  <Unlock className="mr-2 h-4 w-4" />
                                  Activate
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-left font-normal px-2 py-1.5 h-auto text-red-600"
                                onClick={() => handleUserAction("delete", user)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-muted/30 p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No users found</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            We couldn't find any users matching your search criteria. Try adjusting your filters or
            search term.
          </p>
          <Button variant="outline" onClick={resetFilters} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  )
}
