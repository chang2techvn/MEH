"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdminHeader } from "@/components/admin/admin-header"
import {
  Search,
  SlidersHorizontal,
  LayoutList,
  LayoutGrid,
  Users,
  ChevronDown,
  CheckCircle,
  XCircle,
  Mail,
  Trash2,
  FileSpreadsheet,
  UserPlus,
  Loader2,
} from "lucide-react"

interface UserManagementHeaderProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  viewMode: "table" | "grid"
  setViewMode: (mode: "table" | "grid") => void
  selectedUsers: string[]
  activeDropdown: string | null
  toggleDropdown: (id: string) => void
  handleBulkAction: (action: string) => void
  handleExportUsers: () => void
  setAddUserOpen: (open: boolean) => void
  isExporting: boolean
  isLoading: boolean
  isPageHeaderInView: boolean
  pageHeaderRef: React.RefObject<HTMLDivElement | null>
}

export const UserManagementHeader = ({
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
  viewMode,
  setViewMode,
  selectedUsers,
  activeDropdown,
  toggleDropdown,
  handleBulkAction,
  handleExportUsers,
  setAddUserOpen,
  isExporting,
  isLoading,
  isPageHeaderInView,
  pageHeaderRef,
}: UserManagementHeaderProps) => {
  return (
    <div ref={pageHeaderRef} className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b pb-2">
      <AdminHeader 
        title="User Management" 
        description="Manage your platform users and their permissions"
      />
      
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={isPageHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex flex-wrap items-center justify-between gap-4 px-6 py-2"
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="w-[200px] md:w-[300px] pl-8 bg-background/50 focus:bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showFilters ? "Hide Filters" : "Filters"}
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1 ${viewMode === 'table' ? 'bg-muted' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <LayoutList className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:inline-block">Table</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1 ${viewMode === 'grid' ? 'bg-muted' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:inline-block">Grid</span>
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {selectedUsers.length > 0 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="relative">
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2 bg-primary/90 hover:bg-primary"
                  onClick={() => toggleDropdown('bulk-actions')}
                >
                  <Users className="h-4 w-4" />
                  Bulk Actions ({selectedUsers.length})
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
                
                <AnimatePresence>
                  {activeDropdown === 'bulk-actions' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 z-50 mt-1 w-56 rounded-md bg-popover p-2 shadow-lg ring-1 ring-black/5 dark:ring-white/10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                        Select Action
                      </div>
                      <div className="h-px bg-muted my-1"></div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left font-normal px-2 py-1.5 h-auto text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                        onClick={() => handleBulkAction("activate")}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Activate Users
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left font-normal px-2 py-1.5 h-auto text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                        onClick={() => handleBulkAction("deactivate")}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Deactivate Users
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left font-normal px-2 py-1.5 h-auto text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        onClick={() => handleBulkAction("email")}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </Button>
                      <div className="h-px bg-muted my-1"></div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left font-normal px-2 py-1.5 h-auto text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleBulkAction("delete")}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Users
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportUsers}
            className="gap-2"
            disabled={isExporting || isLoading}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          
          <Button
            size="sm"
            onClick={() => setAddUserOpen(true)}
            className="gap-2 bg-neo-mint text-white hover:bg-neo-mint/90 dark:bg-purist-blue dark:hover:bg-purist-blue/90"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
