'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { 
  User, 
  Search, 
  MoreHorizontal, 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  Edit, 
  Eye, 
  Filter, 
  Grid, 
  List, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  AlertTriangle,
  UserCog,
  Loader2,
  X,
  FileText,
  BarChart3,
  Settings,
  Shield,
  Clock,
  Calendar,
  Mail,
  RefreshCw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUsers } from '@/hooks/use-users'
import type { UserData } from '@/hooks/use-users'
import { StatusBadge, RoleBadge, LevelBadge } from './components/user-badges'
import { useDropdownManager, formatDate, getTimeSince, getInitials, generateConfetti } from './components/user-utils'
import { UserManagementHeader } from './components/user-management-header'
import { UserTabs } from './components/user-tabs'
import { UserFilters } from './components/user-filters'
import { UserTable } from './components/user-table'
import { UserGrid } from './components/user-grid'
import { UserPagination } from './components/user-pagination'
import { UserDetailsDialog } from './components/user-details-dialog'

const ITEMS_PER_PAGE = 10

export default function UsersPage() {
  const { users, loading, deleteUser, updateUser, addUser } = useUsers()
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 Users debug:', { 
      users: users?.length, 
      loading, 
      usersData: users?.slice(0, 2) // Log first 2 users for debugging
    })
  }, [users, loading])
  
  // State management
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [sortField, setSortField] = useState<'name' | 'email' | 'created_at' | 'last_seen_at'>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editedUser, setEditedUser] = useState<UserData | null>(null)
  const [activeDetailTab, setActiveDetailTab] = useState('overview')
  const [showUserProgress, setShowUserProgress] = useState(false)
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null)
  const [bulkActionOpen, setBulkActionOpen] = useState(false)
  const [showUserSubmissions, setShowUserSubmissions] = useState(false)

  // Additional state for component interfaces
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isPageHeaderInView, setIsPageHeaderInView] = useState(true)
  const pageHeaderRef = useRef<HTMLDivElement | null>(null)
  const filtersRef = useRef<HTMLDivElement | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [sortConfig, setSortConfig] = useState<{key: keyof UserData | null; direction: "ascending" | "descending"}>({
    key: 'joinDate',
    direction: 'descending'
  })

  // Dropdown managers
  const actionDropdownManager = useDropdownManager()
  const bulkActionDropdownManager = useDropdownManager()

  // Toggle dropdown handler
  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id)
  }

  // Export handler
  const handleExportUsers = async () => {
    setIsExporting(true)
    try {
      // Export logic here
      console.log('Exporting users...')
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // Reset filters handler
  const resetFilters = () => {
    setRoleFilter('all')
    setStatusFilter('all') 
    setLevelFilter('all')
    setSearchTerm('')
    setCurrentPage(1)
    setSortConfig({ key: 'joinDate', direction: 'descending' })
  }

  // Effects
  useEffect(() => {
    if (selectedUser) {
      setEditedUser({ ...selectedUser })
    }
  }, [selectedUser])

  useEffect(() => {
    if (!editMode) {
      setEditedUser(selectedUser ? { ...selectedUser } : null)
    }
  }, [editMode, selectedUser])

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    if (!users) return []
    
    let filtered = users.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesLevel = levelFilter === 'all' || user.level === levelFilter
      
      return matchesSearch && matchesStatus && matchesRole && matchesLevel
    })

    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortField) {
        case 'name':
          aValue = a.name || a.email
          bValue = b.name || b.email
          break
        case 'email':
          aValue = a.email
          bValue = b.email
          break
        case 'created_at':
          aValue = new Date(a.joinDate)
          bValue = new Date(b.joinDate)
          break
        case 'last_seen_at':
          aValue = a.lastActive ? new Date(a.lastActive) : new Date(0)
          bValue = b.lastActive ? new Date(b.lastActive) : new Date(0)
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [users, searchTerm, statusFilter, roleFilter, levelFilter, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const pendingUsersCount = users?.filter(user => user.status === 'pending').length || 0

  // Handlers
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === paginatedUsers.length 
        ? [] 
        : paginatedUsers.map(user => user.id)
    )
  }

  const handleQuickAction = async (userId: string, action: string) => {
    const user = users?.find(u => u.id === userId)
    if (!user) return

    try {
      switch (action) {
        case 'approve':
          await updateUser(userId, { status: 'active' })
          generateConfetti()
          break
        case 'suspend':
          await updateUser(userId, { status: 'suspended' })
          break
        case 'delete':
          setUserToDelete(user)
          setShowDeleteConfirm(true)
          break
      }
    } catch (error) {
      console.error('Action failed:', error)
    }
  }

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id)
        setShowDeleteConfirm(false)
        setUserToDelete(null)
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }

  const handleBulkAction = async (action: string) => {
    try {
      switch (action) {
        case 'approve':
          await Promise.all(selectedUsers.map(id => updateUser(id, { status: 'active' })))
          generateConfetti()
          break
        case 'suspend':
          await Promise.all(selectedUsers.map(id => updateUser(id, { status: 'suspended' })))
          break
        case 'delete':
          await Promise.all(selectedUsers.map(id => deleteUser(id)))
          break
      }
      setSelectedUsers([])
      setBulkActionOpen(false)
    } catch (error) {
      console.error('Bulk action failed:', error)
    }
  }

  const saveUserEdits = async () => {
    if (!editedUser || !selectedUser) return

    try {
      await updateUser(selectedUser.id, editedUser)
      setSelectedUser(editedUser)
      setEditMode(false)
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  return (
    <div className="space-y-6 p-6" ref={pageHeaderRef}>
      <UserManagementHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedUsers={selectedUsers}
        activeDropdown={activeDropdown}
        toggleDropdown={toggleDropdown}
        handleBulkAction={handleBulkAction}
        handleExportUsers={handleExportUsers}
        setAddUserOpen={setAddUserOpen}
        isExporting={isExporting}
        isLoading={loading}
        isPageHeaderInView={isPageHeaderInView}
        pageHeaderRef={pageHeaderRef}
      />

      <UserTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingApprovalsCount={pendingUsersCount}
      />

      <UserFilters
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        selectedRole={roleFilter === 'all' ? null : roleFilter}
        setSelectedRole={(role) => setRoleFilter(role || 'all')}
        selectedStatus={statusFilter === 'all' ? null : statusFilter}
        setSelectedStatus={(status) => setStatusFilter(status || 'all')}
        selectedLevel={levelFilter === 'all' ? null : levelFilter}
        setSelectedLevel={(level) => setLevelFilter(level || 'all')}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        searchTerm={searchTerm}
        resetFilters={resetFilters}
        isRefreshing={isRefreshing}
        filtersRef={filtersRef}
      />

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {paginatedUsers.length} of {filteredAndSortedUsers.length} users
        </p>
      </div>

      {/* User List */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Loading Users...</h3>
          </div>
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading users data...</p>
          </div>
        </div>
      ) : !users || users.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">No Users Found</h3>
          </div>
          <div className="p-8 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No users available</h3>
            <p className="text-gray-500 mb-4">
              There are no users in the system yet, or they couldn't be loaded.
            </p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Users Table View</h3>
          </div>
          <div className="p-4">
            <div className="grid gap-4">
              {paginatedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name || user.email)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name || user.email}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={user.status} />
                    <RoleBadge role={user.role} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Users Grid View</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedUsers.map((user) => (
                <Card key={user.id} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name || user.email)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{user.name || user.email}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <StatusBadge status={user.status} />
                      <RoleBadge role={user.role} />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      <UserPagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        startIndex={(currentPage - 1) * ITEMS_PER_PAGE}
        itemsPerPage={ITEMS_PER_PAGE}
        filteredUsersLength={filteredAndSortedUsers.length}
      />

      {/* User Details Dialog */}
      <UserDetailsDialog
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        selectedUser={selectedUser}
        editedUser={editedUser}
        editMode={editMode}
        setEditMode={setEditMode}
        isLoading={loading}
        saveUserEdits={saveUserEdits}
        activeDetailTab={activeDetailTab}
        setActiveDetailTab={setActiveDetailTab}
      />

      {/* User Progress Modal */}
      <Dialog open={showUserProgress} onOpenChange={setShowUserProgress}>
        <DialogContent className="max-w-6xl h-[80vh] p-0 overflow-hidden">
          <DialogHeader className="p-6">
            <DialogTitle>Detailed Progress Report</DialogTitle>
            <DialogDescription>
              Comprehensive learning analytics and performance metrics
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {/* Progress content would go here */}
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Progress Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Detailed progress tracking coming soon...
              </p>
            </div>
          </div>
          <DialogFooter className="p-6">
            <Button variant="outline" onClick={() => setShowUserProgress(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {userToDelete?.name || userToDelete?.email}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
