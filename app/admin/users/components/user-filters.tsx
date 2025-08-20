"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, X, RefreshCw } from "lucide-react"
import { UserData } from "@/hooks/use-users"

interface UserFiltersProps {
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  selectedRole: string | null
  setSelectedRole: (role: string | null) => void
  selectedStatus: string | null
  setSelectedStatus: (status: string | null) => void
  selectedLevel: string | null
  setSelectedLevel: (level: string | null) => void
  sortConfig: {
    key: keyof UserData | null
    direction: "ascending" | "descending"
  }
  setSortConfig: (config: { key: keyof UserData | null; direction: "ascending" | "descending" }) => void
  searchTerm: string
  resetFilters: () => void
  isRefreshing: boolean
  filtersRef: React.RefObject<HTMLDivElement | null>
}

export const UserFilters = ({
  showFilters,
  setShowFilters,
  selectedRole,
  setSelectedRole,
  selectedStatus,
  setSelectedStatus,
  selectedLevel,
  setSelectedLevel,
  sortConfig,
  setSortConfig,
  searchTerm,
  resetFilters,
  isRefreshing,
  filtersRef,
}: UserFiltersProps) => {
  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          ref={filtersRef}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 overflow-hidden"
        >
          <Card className="border-none shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center text-lg">
                    <Filter className="h-5 w-5 mr-2 text-neo-mint dark:text-purist-blue" />
                    Advanced Filters
                  </CardTitle>
                  <CardDescription>Refine your user list with specific criteria</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only md:not-sr-only md:ml-2">Close</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pb-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="filter-role" className="text-sm font-medium mb-1.5 block">
                    Role
                  </Label>
                  <Select
                    value={selectedRole || "all"}
                    onValueChange={(value) => setSelectedRole(value === "all" ? null : value)}
                  >
                    <SelectTrigger id="filter-role" className="bg-white/50 dark:bg-gray-800/50">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="filter-status" className="text-sm font-medium mb-1.5 block">
                    Status
                  </Label>
                  <Select
                    value={selectedStatus || "all"}
                    onValueChange={(value) => setSelectedStatus(value === "all" ? null : value)}
                  >
                    <SelectTrigger id="filter-status" className="bg-white/50 dark:bg-gray-800/50">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="filter-level" className="text-sm font-medium mb-1.5 block">
                    Level
                  </Label>
                  <Select
                    value={selectedLevel || "all"}
                    onValueChange={(value) => setSelectedLevel(value === "all" ? null : value)}
                  >
                    <SelectTrigger id="filter-level" className="bg-white/50 dark:bg-gray-800/50">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="filter-sort" className="text-sm font-medium mb-1.5 block">
                    Sort By
                  </Label>
                  <Select
                    value={sortConfig.key ? `${sortConfig.key}-${sortConfig.direction}` : "default"}
                    onValueChange={(value) => {
                      if (value !== "default") {
                        const [key, direction] = value.split("-") as [keyof UserData, "ascending" | "descending"]
                        setSortConfig({ key, direction })
                      } else {
                        setSortConfig({ key: null, direction: "ascending" })
                      }
                    }}
                  >
                    <SelectTrigger id="filter-sort" className="bg-white/50 dark:bg-gray-800/50">
                      <SelectValue placeholder="Default Sorting" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Sorting</SelectItem>
                      <SelectItem value="name-ascending">Name (A-Z)</SelectItem>
                      <SelectItem value="name-descending">Name (Z-A)</SelectItem>
                      <SelectItem value="joinDate-ascending">Join Date (Oldest)</SelectItem>
                      <SelectItem value="joinDate-descending">Join Date (Newest)</SelectItem>
                      <SelectItem value="lastActive-descending">Last Active (Recent)</SelectItem>
                      <SelectItem value="lastActive-ascending">Last Active (Oldest)</SelectItem>
                      <SelectItem value="completedChallenges-descending">Most Completed</SelectItem>
                      <SelectItem value="completedChallenges-ascending">Least Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(searchTerm || selectedRole || selectedStatus || selectedLevel || sortConfig.key) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex justify-end"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    className="text-sm flex items-center gap-1 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors duration-300"
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? (
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <X className="h-3 w-3 mr-1" />
                    )}
                    Reset Filters
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
