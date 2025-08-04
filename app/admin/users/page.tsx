"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  Loader2,
  UserCog,
  FileText,
  BarChart3,
  Lock,
  Unlock,
  Trash2,
  X,
  Check,
  RefreshCw,
  Zap,
  Award,
  BookOpen,
  Calendar,
  MessageSquare,
  Settings,
  ChevronDown,
  Eye,
  Edit,
  ArrowUpDown,
  SlidersHorizontal,
  FileSpreadsheet,
  Users,
  MapPin,
  Phone,
  Tag,
  Pencil,
  MoreVertical,
  LayoutGrid,
  LayoutList,
  Plus,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { exportToExcel, type ExportableUser } from "@/utils/excel-export"
import { AdminHeader } from "@/components/admin/admin-header"
import { Switch } from "@/components/ui/switch"

// Types for our user data
interface UserData {
  id: string
  name: string
  email: string
  role: "student" | "teacher" | "admin"
  status: "active" | "pending" | "suspended" | "inactive"
  level: "beginner" | "intermediate" | "advanced"
  joinDate: string
  lastActive: string
  completedChallenges: number
  totalChallenges: number
  avatarUrl?: string
  bio?: string
  location?: string
  phone?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
  }
  tags?: string[]
  achievements?: {
    name: string
    date: string
    icon: string
  }[]
  recentActivity?: {
    type: string
    description: string
    date: string
  }[]
}

// Form schema for adding new users
const userFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.string(),
  status: z.string(),
  level: z.string(),
  bio: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
})

type UserFormValues = z.infer<typeof userFormSchema>

// Sample user data - we'll use this as our "database"
const SAMPLE_USERS: UserData[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "student",
    status: "active",
    level: "intermediate",
    joinDate: "2023-04-15",
    lastActive: "2023-05-10T14:30:00",
    completedChallenges: 15,
    totalChallenges: 20,
    bio: "Passionate language learner with a focus on conversational English.",
    location: "New York, USA",
    phone: "+1 (555) 123-4567",
    tags: ["grammar", "conversation", "business-english"],
    achievements: [
      { name: "5-Day Streak", date: "2023-05-05", icon: "zap" },
      { name: "Conversation Master", date: "2023-04-20", icon: "message-square" },
    ],
    recentActivity: [
      { type: "challenge", description: "Completed Business English Challenge", date: "2023-05-10T10:30:00" },
      { type: "lesson", description: "Attended Advanced Grammar Webinar", date: "2023-05-08T15:45:00" },
    ],
  },
  {
    id: "2",
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    role: "student",
    status: "active",
    level: "advanced",
    joinDate: "2023-01-22",
    lastActive: "2023-05-11T09:15:00",
    completedChallenges: 18,
    totalChallenges: 20,
    bio: "English literature graduate focusing on academic writing and research.",
    location: "Boston, USA",
    tags: ["academic", "writing", "research"],
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.j@example.com",
    role: "student",
    status: "pending",
    level: "beginner",
    joinDate: "2023-05-01",
    lastActive: "2023-05-01T11:45:00",
    completedChallenges: 2,
    totalChallenges: 5,
    location: "Toronto, Canada",
  },
  {
    id: "4",
    name: "Lisa Wong",
    email: "lisa.w@example.com",
    role: "teacher",
    status: "active",
    level: "advanced",
    joinDate: "2022-11-15",
    lastActive: "2023-05-11T16:20:00",
    completedChallenges: 45,
    totalChallenges: 50,
    bio: "TEFL certified instructor with 8 years of experience teaching English in Asia and Europe.",
    location: "London, UK",
    tags: ["TEFL", "business-english", "pronunciation"],
  },
  {
    id: "5",
    name: "David Smith",
    email: "david.smith@example.com",
    role: "student",
    status: "inactive",
    level: "intermediate",
    joinDate: "2023-02-10",
    lastActive: "2023-04-05T10:30:00",
    completedChallenges: 8,
    totalChallenges: 20,
  },
  {
    id: "6",
    name: "Emma Wilson",
    email: "emma.w@example.com",
    role: "student",
    status: "active",
    level: "beginner",
    joinDate: "2023-03-22",
    lastActive: "2023-05-10T13:45:00",
    completedChallenges: 6,
    totalChallenges: 10,
  },
  {
    id: "7",
    name: "James Brown",
    email: "james.b@example.com",
    role: "student",
    status: "suspended",
    level: "intermediate",
    joinDate: "2022-12-05",
    lastActive: "2023-04-20T09:10:00",
    completedChallenges: 12,
    totalChallenges: 20,
  },
  {
    id: "8",
    name: "Olivia Garcia",
    email: "olivia.g@example.com",
    role: "teacher",
    status: "active",
    level: "advanced",
    joinDate: "2022-10-18",
    lastActive: "2023-05-11T11:30:00",
    completedChallenges: 38,
    totalChallenges: 40,
  },
  {
    id: "9",
    name: "Robert Kim",
    email: "robert.k@example.com",
    role: "student",
    status: "active",
    level: "intermediate",
    joinDate: "2023-01-30",
    lastActive: "2023-05-09T15:20:00",
    completedChallenges: 14,
    totalChallenges: 20,
  },
  {
    id: "10",
    name: "Sophia Martinez",
    email: "sophia.m@example.com",
    role: "admin",
    status: "active",
    level: "advanced",
    joinDate: "2022-09-12",
    lastActive: "2023-05-11T17:45:00",
    completedChallenges: 52,
    totalChallenges: 55,
  },
  {
    id: "11",
    name: "Daniel Lee",
    email: "daniel.l@example.com",
    role: "student",
    status: "active",
    level: "beginner",
    joinDate: "2023-04-05",
    lastActive: "2023-05-08T10:15:00",
    completedChallenges: 4,
    totalChallenges: 10,
  },
  {
    id: "12",
    name: "Ava Thompson",
    email: "ava.t@example.com",
    role: "student",
    status: "pending",
    level: "beginner",
    joinDate: "2023-05-02",
    lastActive: "2023-05-02T14:30:00",
    completedChallenges: 0,
    totalChallenges: 0,
  },
]

export default function UsersPage() {
  // State management
  const [users, setUsers] = useState<UserData[]>(SAMPLE_USERS)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isSelectAll, setIsSelectAll] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [userDetailsOpen, setUserDetailsOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [bulkActionOpen, setBulkActionOpen] = useState(false)
  const [bulkAction, setBulkAction] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeDetailTab, setActiveDetailTab] = useState("overview")
  const [editMode, setEditMode] = useState(false)
  const [editedUser, setEditedUser] = useState<UserData | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof UserData | null
    direction: "ascending" | "descending"
  }>({ key: null, direction: "ascending" })
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const [lastAddedUser, setLastAddedUser] = useState<UserData | null>(null)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [showDropdownBackdrop, setShowDropdownBackdrop] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null)
  const [showUserNotes, setShowUserNotes] = useState(false)
  const [userNotes, setUserNotes] = useState("")
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [showUserActivity, setShowUserActivity] = useState(false)
  const [showUserProgress, setShowUserProgress] = useState(false)
  const [showUserSubmissions, setShowUserSubmissions] = useState(false)
  const [showUserSettings, setShowUserSettings] = useState(false)
  const [showUserAchievements, setShowUserAchievements] = useState(false)
  const [showUserTags, setShowUserTags] = useState(false)
  const [showUserSocialLinks, setShowUserSocialLinks] = useState(false)
  const [showUserLocation, setShowUserLocation] = useState(false)
  const [showUserPhone, setShowUserPhone] = useState(false)
  const [showUserBio, setShowUserBio] = useState(false)
  const [showUserRole, setShowUserRole] = useState(false)
  const [showUserStatus, setShowUserStatus] = useState(false)
  const [showUserLevel, setShowUserLevel] = useState(false)
  const [showUserJoinDate, setShowUserJoinDate] = useState(false)
  const [showUserLastActive, setShowUserLastActive] = useState(false)
  const [showUserCompletedChallenges, setShowUserCompletedChallenges] = useState(false)
  const [showUserTotalChallenges, setShowUserTotalChallenges] = useState(false)
  const [showUserAvatar, setShowUserAvatar] = useState(false)
  const [showUserName, setShowUserName] = useState(false)
  const [showUserEmail, setShowUserEmail] = useState(false)
  const [showUserActions, setShowUserActions] = useState(false)
  const [showUserProgress2, setShowUserProgress2] = useState(false)
  const [showUserProgress3, setShowUserProgress3] = useState(false)
  const [showUserProgress4, setShowUserProgress4] = useState(false)
  const [showUserProgress5, setShowUserProgress5] = useState(false)
  const [showUserProgress6, setShowUserProgress6] = useState(false)
  const [showUserProgress7, setShowUserProgress7] = useState(false)
  const [showUserProgress8, setShowUserProgress8] = useState(false)
  const [showUserProgress9, setShowUserProgress9] = useState(false)
  const [showUserProgress10, setShowUserProgress10] = useState(false)

  const itemsPerPage = 10
  const pageHeaderRef = useRef<HTMLDivElement>(null)
  const isPageHeaderInView = useInView(pageHeaderRef, { once: true })
  const filtersRef = useRef<HTMLDivElement>(null)
  const isFiltersInView = useInView(filtersRef, { once: true })
  const tableRef = useRef<HTMLDivElement>(null)
  const isTableInView = useInView(tableRef, { once: true })

  // Initialize form for adding new users
  const form = useForm<UserFormValues>({
    // resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "student",
      status: "active",
      level: "beginner",
      bio: "",
      location: "",
      phone: "",
    },
  })

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Handle sorting
  const requestSort = (key: keyof UserData) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Sort users based on sort configuration
  const sortedUsers = [...users].sort((a, b) => {
    if (!sortConfig.key) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (aValue === bValue) return 0

    // Handle different types of values
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "ascending" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    // For numbers or other comparable types
    if (aValue! < bValue!) {
      return sortConfig.direction === "ascending" ? -1 : 1
    }
    return sortConfig.direction === "ascending" ? 1 : -1
  })

  // Filter users based on search term, role, status, and level
  const filteredUsers = sortedUsers.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = selectedRole === null || user.role === selectedRole
    const matchesStatus = selectedStatus === null || user.status === selectedStatus
    const matchesLevel = selectedLevel === null || user.level === selectedLevel

    // Filter by tab
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && user.status === "active") ||
      (activeTab === "pending" && user.status === "pending") ||
      (activeTab === "inactive" && (user.status === "inactive" || user.status === "suspended"))

    return matchesSearch && matchesRole && matchesStatus && matchesLevel && matchesTab
  })

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

  // Handle select all
  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(paginatedUsers.map((user) => user.id))
    }
    setIsSelectAll(!isSelectAll)
  }

  // Handle select user
  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
      setIsSelectAll(false)
    } else {
      setSelectedUsers([...selectedUsers, userId])
      if (selectedUsers.length + 1 === paginatedUsers.length) {
        setIsSelectAll(true)
      }
    }
  }

  // Handle user details
  const handleUserDetails = (user: UserData) => {
    setSelectedUser(user)
    setEditedUser(JSON.parse(JSON.stringify(user))) // Deep copy for editing
    setUserDetailsOpen(true)
    setActiveDetailTab("overview")
    setEditMode(false)
  }

  // Handle bulk action
  const handleBulkAction = (action: string) => {
    setBulkAction(action)
    setBulkActionOpen(true)
    closeAllDropdowns()
  }

  // Execute bulk action
  const executeBulkAction = async () => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Apply the action to the selected users
      const updatedUsers = [...users]

      switch (bulkAction) {
        case "activate":
          selectedUsers.forEach((userId) => {
            const userIndex = updatedUsers.findIndex((u) => u.id === userId)
            if (userIndex !== -1) {
              updatedUsers[userIndex].status = "active"
            }
          })
          setSuccessMessage(`Successfully activated ${selectedUsers.length} users`)
          break
        case "deactivate":
          selectedUsers.forEach((userId) => {
            const userIndex = updatedUsers.findIndex((u) => u.id === userId)
            if (userIndex !== -1) {
              updatedUsers[userIndex].status = "inactive"
            }
          })
          setSuccessMessage(`Successfully deactivated ${selectedUsers.length} users`)
          break
        case "delete":
          // Filter out the selected users
          const remainingUsers = updatedUsers.filter((user) => !selectedUsers.includes(user.id))
          setUsers(remainingUsers)
          setSuccessMessage(`Successfully deleted ${selectedUsers.length} users`)
          break
        case "email":
          setSuccessMessage(`Email sent to ${selectedUsers.length} users`)
          break
      }

      // Update users if not deleted
      if (bulkAction !== "delete") {
        setUsers(updatedUsers)
      }

      // Show success message with confetti
      setShowConfetti(true)
      setShowSuccessAnimation(true)

      toast({
        title: "Bulk action completed",
        description: `${bulkAction} action applied to ${selectedUsers.length} users.`,
      })

      // Reset selection
      setSelectedUsers([])
      setIsSelectAll(false)
      setBulkActionOpen(false)

      setTimeout(() => {
        setShowConfetti(false)
        setShowSuccessAnimation(false)
      }, 3000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply bulk action. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("")
    setSelectedRole(null)
    setSelectedStatus(null)
    setSelectedLevel(null)
    setCurrentPage(1)
    setShowFilters(false)

    // Add a little animation for feedback
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 500)
  }

  // Export users
  const handleExportUsers = async () => {
    setIsExporting(true)

    try {
      // Convert users to exportable format
      const exportableUsers: ExportableUser[] = filteredUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        level: user.level,
        joinDate: user.joinDate,
        lastActivity: user.lastActive || "Never",
        completedChallenges: user.completedChallenges,
        totalChallenges: user.totalChallenges,
        location: user.location,
      }))

      // Export to Excel
      exportToExcel(exportableUsers, "english-learning-users")

      setSuccessMessage("User data exported successfully")
      setShowSuccessAnimation(true)

      toast({
        title: "Export completed",
        description: "User data has been exported successfully.",
      })

      setTimeout(() => {
        setShowSuccessAnimation(false)
      }, 3000)
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export failed",
        description: "There was an error exporting the user data.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Handle adding a new user
  const handleAddUser = (values: UserFormValues) => {
    setIsLoading(true)

    // Generate a unique ID
    const newId = `new-${Date.now()}`

    // Create new user object
    const newUser: UserData = {
      id: newId,
      name: values.name,
      email: values.email,
      role: values.role as "student" | "teacher" | "admin",
      status: values.status as "active" | "pending" | "suspended" | "inactive",
      level: values.level as "beginner" | "intermediate" | "advanced",
      joinDate: new Date().toISOString().split("T")[0],
      lastActive: new Date().toISOString(),
      completedChallenges: 0,
      totalChallenges: 0,
      bio: values.bio,
      location: values.location,
      phone: values.phone,
    }

    // Simulate API call
    setTimeout(() => {
      // Add to the beginning of the array
      setUsers([newUser, ...users])

      setIsLoading(false)
      setAddUserOpen(false)
      setShowConfetti(true)
      setLastAddedUser(newUser)
      setSuccessMessage(`${newUser.name} added successfully`)
      setShowSuccessAnimation(true)

      // Reset form
      form.reset()

      toast({
        title: "User added successfully",
        description: `${newUser.name} has been added to the system.`,
      })

      setTimeout(() => {
        setShowConfetti(false)
        setShowSuccessAnimation(false)
      }, 3000)
    }, 1000)
  }

  // Handle user actions
  const handleUserAction = (action: string, user: UserData) => {
    setActionInProgress(user.id)
    closeAllDropdowns()

    // Simulate API call
    setTimeout(() => {
      let successMessage = ""
      let description = ""
      const updatedUsers = [...users]
      const userIndex = updatedUsers.findIndex((u) => u.id === user.id)

      switch (action) {
        case "view-submissions":
          successMessage = "Submissions loaded"
          description = `Viewing submissions for ${user.name}`
          setShowUserSubmissions(true)
          break
        case "view-progress":
          successMessage = "Progress data loaded"
          description = `Viewing progress for ${user.name}`
          setShowUserProgress(true)
          break
        case "suspend":
          successMessage = "User suspended"
          description = `${user.name} has been suspended`
          if (userIndex !== -1) {
            updatedUsers[userIndex].status = "suspended"
            setUsers(updatedUsers)
          }
          setSuccessMessage(`${user.name} has been suspended`)
          setShowSuccessAnimation(true)
          break
        case "activate":
          successMessage = "User activated"
          description = `${user.name} has been activated`
          if (userIndex !== -1) {
            updatedUsers[userIndex].status = "active"
            setUsers(updatedUsers)
          }
          setSuccessMessage(`${user.name} has been activated`)
          setShowSuccessAnimation(true)
          break
        case "delete":
          setUserToDelete(user)
          setShowDeleteConfirm(true)
          setActionInProgress(null)
          return
      }

      toast({
        title: successMessage,
        description: description,
        variant: action === "delete" || action === "suspend" ? "destructive" : "default",
      })

      setActionInProgress(null)

      setTimeout(() => {
        setShowSuccessAnimation(false)
      }, 3000)
    }, 800)
  }

  // Confirm user deletion
  const confirmDeleteUser = () => {
    if (!userToDelete) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // Remove the user from the array
      const updatedUsers = users.filter((user) => user.id !== userToDelete.id)
      setUsers(updatedUsers)

      setSuccessMessage(`${userToDelete.name} has been deleted`)
      setShowSuccessAnimation(true)

      toast({
        title: "User deleted",
        description: `${userToDelete.name} has been deleted from the system.`,
        variant: "destructive",
      })

      setShowDeleteConfirm(false)
      setUserToDelete(null)
      setIsLoading(false)

      setTimeout(() => {
        setShowSuccessAnimation(false)
      }, 3000)
    }, 1000)
  }

  // Save user edits
  const saveUserEdits = () => {
    if (!editedUser) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // Update the user in the array
      const updatedUsers = [...users]
      const userIndex = updatedUsers.findIndex((u) => u.id === editedUser.id)

      if (userIndex !== -1) {
        updatedUsers[userIndex] = editedUser
        setUsers(updatedUsers)
        setSelectedUser(editedUser)
      }

      setIsLoading(false)
      setEditMode(false)
      setShowConfetti(true)
      setSuccessMessage(`${editedUser.name}'s information updated`)
      setShowSuccessAnimation(true)

      toast({
        title: "User updated",
        description: "User information has been updated successfully.",
      })

      setTimeout(() => {
        setShowConfetti(false)
        setShowSuccessAnimation(false)
      }, 2000)
    }, 1000)
  }

  // Send email to user
  const handleSendEmail = () => {
    if (!selectedUser) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setSuccessMessage(`Email sent to ${selectedUser.name}`)
      setShowSuccessAnimation(true)

      toast({
        title: "Email sent",
        description: `Your email has been sent to ${selectedUser.name}.`,
      })

      setShowEmailForm(false)
      setEmailSubject("")
      setEmailBody("")
      setIsLoading(false)

      setTimeout(() => {
        setShowSuccessAnimation(false)
      }, 3000)
    }, 1000)
  }

  // Save user notes
  const handleSaveNotes = () => {
    if (!selectedUser) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setSuccessMessage("Notes saved successfully")
      setShowSuccessAnimation(true)

      toast({
        title: "Notes saved",
        description: "Your notes have been saved successfully.",
      })

      setShowUserNotes(false)
      setIsLoading(false)

      setTimeout(() => {
        setShowSuccessAnimation(false)
      }, 3000)
    }, 1000)
  }

  // Toggle dropdown
  const toggleDropdown = (dropdownId: string) => {
    if (activeDropdown === dropdownId) {
      setActiveDropdown(null)
      setShowDropdownBackdrop(false)
    } else {
      setActiveDropdown(dropdownId)
      setShowDropdownBackdrop(true)
    }
  }

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setActiveDropdown(null)
    setShowDropdownBackdrop(false)
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  // Helper function to calculate time since last active
  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        return `${diffMinutes} minutes ago`
      }
      return `${diffHours} hours ago`
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7)
      return `${diffWeeks} ${diffWeeks === 1 ? "week" : "weeks"} ago`
    } else {
      return formatDate(dateString)
    }
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Generate random confetti
  const generateConfetti = () => {
    const confetti = []
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#F3FF33", "#FF33F3"]

    for (let i = 0; i < 50; i++) {
      const left = Math.random() * 100
      const top = Math.random() * 100
      const size = Math.random() * 10 + 5
      const color = colors[Math.floor(Math.random() * colors.length)]
      const delay = Math.random() * 0.5

      confetti.push(
        <div
          key={i}
          className="confetti absolute rounded-full"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: color,
            animationDelay: `${delay}s`,
          }}
        />,
      )
    }

    return confetti
  }

  // Status badge component with enhanced styling and animations
  const StatusBadge = ({ status }: { status: UserData["status"] }) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800/30 dark:text-green-400 transition-all duration-300 hover:scale-105">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
              <CheckCircle className="mr-1 h-3 w-3" />
              Active
            </motion.div>
          </Badge>
        )
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-800/30 dark:text-yellow-400 transition-all duration-300 hover:scale-105"
          >
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              Pending
            </motion.div>
          </Badge>
        )
      case "suspended":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-800/30 dark:text-red-400 transition-all duration-300 hover:scale-105"
          >
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
              <XCircle className="mr-1 h-3 w-3" />
              Suspended
            </motion.div>
          </Badge>
        )
      case "inactive":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800/30 dark:text-gray-400 transition-all duration-300 hover:scale-105"
          >
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
              <AlertCircle className="mr-1 h-3 w-3" />
              Inactive
            </motion.div>
          </Badge>
        )
      default:
        return null
    }
  }

  // Role badge component with enhanced styling
  const RoleBadge = ({ role }: { role: UserData["role"] }) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-800/30 dark:text-purple-400 transition-all duration-300 hover:scale-105">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
              <Shield className="mr-1 h-3 w-3" />
              Admin
            </motion.div>
          </Badge>
        )
      case "teacher":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-800/30 dark:text-blue-400 transition-all duration-300 hover:scale-105">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
              <User className="mr-1 h-3 w-3" />
              Teacher
            </motion.div>
          </Badge>
        )
      case "student":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800/30 dark:text-gray-400 transition-all duration-300 hover:scale-105"
          >
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
              <User className="mr-1 h-3 w-3" />
              Student
            </motion.div>
          </Badge>
        )
      default:
        return null
    }
  }

  // Level badge component with enhanced styling
  const LevelBadge = ({ level }: { level: UserData["level"] }) => {
    switch (level) {
      case "beginner":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 transition-all duration-300 hover:scale-105"
          >
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
              <BookOpen className="mr-1 h-3 w-3" />
              Beginner
            </motion.div>
          </Badge>
        )
      case "intermediate":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 transition-all duration-300 hover:scale-105"
          >
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
              <BookOpen className="mr-1 h-3 w-3" />
              Intermediate
            </motion.div>
          </Badge>
        )
      case "advanced":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800 transition-all duration-300 hover:scale-105"
          >
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
              <BookOpen className="mr-1 h-3 w-3" />
              Advanced
            </motion.div>
          </Badge>
        )
      default:
        return null
    }
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  }

  const slideIn = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.3 } },
  }

  const tableRowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  }

  const gridItemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
    hover: { 
      scale: 1.02, 
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 }
    }
  }

  // Add CSS for confetti animation
  useEffect(() => {
    const style = document.createElement("style")
    style.innerHTML = `
      @keyframes confetti-fall {
        0% { transform: translateY(-100px); opacity: 1; }
        100% { transform: translateY(1000px); opacity: 0; }
      }
      
      .confetti {
        position: absolute;
        animation: confetti-fall 5s ease-out forwards;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdownBackdrop) {
        closeAllDropdowns()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showDropdownBackdrop])

  const toggleSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  return (
    <div className="relative">
      {/* Success Animation */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 dark:bg-green-900/80 text-green-800 dark:text-green-200 px-6 py-3 rounded-lg shadow-lg backdrop-blur-sm flex items-center gap-2 border border-green-200 dark:border-green-800"
          >
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="font-medium">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti Effect */}
      {showConfetti && <div className="fixed inset-0 pointer-events-none z-50">{generateConfetti()}</div>}

      {/* Dropdown Backdrop */}
      {showDropdownBackdrop && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={closeAllDropdowns}
          aria-hidden="true"
        />
      )}

      {/* Page Header */}
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

      <div className="container py-6">
        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6"
        >
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 p-1 rounded-xl bg-muted/80 backdrop-blur-sm">
              <TabsTrigger
                value="all"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-800 transition-all duration-300"
              >
                <Users className="h-4 w-4 mr-2 hidden sm:inline-block" />
                All Users
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-800 transition-all duration-300"
              >
                <CheckCircle className="h-4 w-4 mr-2 hidden sm:inline-block" />
                Active
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-yellow-600 data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-800 transition-all duration-300"
              >
                <Clock className="h-4 w-4 mr-2 hidden sm:inline-block" />
                Pending
              </TabsTrigger>
              <TabsTrigger
                value="inactive"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-600 data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-800 transition-all duration-300"
              >
                <AlertCircle className="h-4 w-4 mr-2 hidden sm:inline-block" />
                Inactive
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Filters */}
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

        {/* User List */}
        <motion.div
          ref={tableRef}
          variants={container}
          initial="hidden"
          animate={isTableInView ? "show" : "hidden"}
          className="mb-6"
        >
          <Card className="overflow-hidden border-none shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center text-lg">
                    <Users className="h-5 w-5 mr-2 text-neo-mint dark:text-purist-blue" />
                    Users
                  </CardTitle>
                  <CardDescription>
                    {isLoading ? (
                      <span className="flex items-center">
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Loading users...
                      </span>
                    ) : (
                      `${filteredUsers.length} users found`
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {viewMode === "table" ? (
                <div className="rounded-md overflow-hidden">
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
                                        className="absolute right-0 z-50 mt-1 w-56 rounded-md bg-popover p-2 shadow-lg ring-1 ring-black/5 dark:ring-white/10"
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
              ) : (
                // Grid View
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
                            <Card className="overflow-hidden border shadow h-full flex flex-col">
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
                                          className="absolute right-0 z-50 mt-1 w-48 rounded-md bg-popover p-2 shadow-lg ring-1 ring-black/5 dark:ring-white/10"
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
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-muted/30">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)} of{" "}
                    {filteredUsers.length} users
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 rounded-full hover:bg-neo-mint/10 dark:hover:bg-purist-blue/10 transition-all duration-300"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                        const pageNumber =
                          currentPage > 3 && totalPages > 5
                            ? currentPage - 3 + index + (index >= 3 ? totalPages - currentPage : 0)
                            : index + 1

                        return (
                          <Button
                            key={index}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="icon"
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`h-8 w-8 rounded-full transition-all duration-300 ${
                              currentPage === pageNumber
                                ? "bg-neo-mint dark:bg-purist-blue text-white shadow-md"
                                : "hover:bg-neo-mint/10 dark:hover:bg-purist-blue/10"
                            }`}
                          >
                            {pageNumber}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 rounded-full hover:bg-neo-mint/10 dark:hover:bg-purist-blue/10 transition-all duration-300"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* User Details Dialog */}
      <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-none shadow-2xl">
          {selectedUser && editedUser && (
            <>
              <DialogHeader className="p-6 pb-2 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <div className="flex justify-between items-center">
                  <div>
                    <DialogTitle className="text-2xl font-bold flex items-center">
                      {editMode ? (
                        <UserCog className="mr-2 h-5 w-5 text-neo-mint dark:text-purist-blue" />
                      ) : (
                        <User className="mr-2 h-5 w-5 text-neo-mint dark:text-purist-blue" />
                      )}
                      {editMode ? "Edit User" : "User Details"}
                    </DialogTitle>
                    <DialogDescription>
                      {editMode
                        ? "Edit user information and settings"
                        : `Detailed information about ${selectedUser.name}`}
                    </DialogDescription>
                  </div>
                  <div className="flex gap-2">
                    {editMode ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setEditMode(false)} className="text-sm gap-1">
                          <X className="h-3 w-3" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={saveUserEdits}
                          className="text-sm bg-green-600 hover:bg-green-700 gap-1"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setEditMode(true)} className="text-sm gap-1">
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="p-6 pt-2">
                <Tabs defaultValue="overview" value={activeDetailTab} onValueChange={setActiveDetailTab}>
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:bg-neo-mint dark:data-[state=active]:bg-purist-blue data-[state=active]:text-white"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="activity"
                      className="data-[state=active]:bg-neo-mint dark:data-[state=active]:bg-purist-blue data-[state=active]:text-white"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Activity
                    </TabsTrigger>
                    <TabsTrigger
                      value="settings"
                      className="data-[state=active]:bg-neo-mint dark:data-[state=active]:bg-purist-blue data-[state=active]:text-white"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </TabsTrigger>
                    <TabsTrigger
                      value="notes"
                      className="data-[state=active]:bg-neo-mint dark:data-[state=active]:bg-purist-blue data-[state=active]:text-white"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Notes
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-1 flex flex-col items-center">
                        <Avatar className="h-32 w-32 mb-4 border-4 border-white shadow-xl">
                          <AvatarImage
                            src={selectedUser.avatarUrl || "/placeholder.svg?height=128&width=128"}
                            alt={selectedUser.name}
                          />
                          <AvatarFallback className="text-3xl bg-neo-mint/10 dark:bg-purist-blue/10 text-neo-mint dark:text-purist-blue font-medium">
                            {getInitials(selectedUser.name)}
                          </AvatarFallback>
                        </Avatar>

                        {editMode ? (
                          <Input
                            value={editedUser.name}
                            onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                            className="text-xl font-semibold text-center mb-1 bg-muted/50"
                          />
                        ) : (
                          <h3 className="text-xl font-semibold text-center">{selectedUser.name}</h3>
                        )}

                        {editMode ? (
                          <Input
                            value={editedUser.email}
                            onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                            className="text-muted-foreground text-center mb-4 bg-muted/50"
                          />
                        ) : (
                          <p className="text-muted-foreground text-center mb-4">{selectedUser.email}</p>
                        )}

                        <div className="flex flex-wrap gap-2 justify-center mb-4">
                          <RoleBadge role={selectedUser.role} />
                          <StatusBadge status={selectedUser.status} />
                          <LevelBadge level={selectedUser.level} />
                        </div>

                        {editMode ? (
                          <div className="w-full space-y-3 mt-2">
                            <div className="space-y-1">
                              <Label htmlFor="user-role">Role</Label>
                              <Select
                                value={editedUser.role}
                                onValueChange={(value: "student" | "teacher" | "admin") => 
                                  setEditedUser({
                                    ...editedUser,
                                    role: value,
                                  })
                                }
                              >
                                <SelectTrigger id="user-role" className="bg-muted/50">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="student">Student</SelectItem>
                                  <SelectItem value="teacher">Teacher</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1">
                              <Label htmlFor="user-status">Status</Label>
                              <Select
                                value={editedUser.status}
                                onValueChange={(value: "active" | "pending" | "suspended" | "inactive") => 
                                  setEditedUser({
                                    ...editedUser,
                                    status: value,
                                  })
                                }
                              >
                                <SelectTrigger id="user-status" className="bg-muted/50">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="suspended">Suspended</SelectItem>
                                  <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1">
                              <Label htmlFor="user-level">Level</Label>
                              <Select
                                value={editedUser.level}
                                onValueChange={(value: "beginner" | "intermediate" | "advanced") => 
                                  setEditedUser({
                                    ...editedUser,
                                    level: value,
                                  })
                                }
                              >
                                <SelectTrigger id="user-level" className="bg-muted/50">
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="beginner">Beginner</SelectItem>
                                  <SelectItem value="intermediate">Intermediate</SelectItem>
                                  <SelectItem value="advanced">Advanced</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ) : (
                          selectedUser.bio && (
                            <div className="mt-4 text-center px-4">
                              <p className="text-sm text-muted-foreground italic">"{selectedUser.bio}"</p>
                            </div>
                          )
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-none shadow-md">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">Joined Date</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-lg font-semibold">{formatDate(selectedUser.joinDate)}</p>
                            </CardContent>
                          </Card>

                          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-none shadow-md">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">Last Active</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-lg font-semibold">{getTimeSince(selectedUser.lastActive)}</p>
                            </CardContent>
                          </Card>

                          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-none shadow-md">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">
                                Completed Challenges
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-lg font-semibold">
                                {selectedUser.completedChallenges} of {selectedUser.totalChallenges}
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-none shadow-md">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">
                                Completion Rate
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-lg font-semibold">
                                {selectedUser.totalChallenges > 0
                                  ? Math.round((selectedUser.completedChallenges / selectedUser.totalChallenges) * 100)
                                  : 0}
                                %
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <h4 className="font-medium mb-2 flex items-center">
                              <BarChart3 className="mr-2 h-4 w-4 text-neo-mint dark:text-purist-blue" />
                              Progress
                            </h4>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Completion</span>
                                <span className="font-medium">
                                  {selectedUser.totalChallenges > 0
                                    ? Math.round(
                                        (selectedUser.completedChallenges / selectedUser.totalChallenges) * 100,
                                      )
                                    : 0}
                                  %
                                </span>
                              </div>
                              <Progress
                                value={
                                  selectedUser.totalChallenges > 0
                                    ? (selectedUser.completedChallenges / selectedUser.totalChallenges) * 100
                                    : 0
                                }
                                className="h-2"
                              />
                            </div>
                          </div>

                          {editMode ? (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="user-bio">Bio</Label>
                                <Textarea
                                  id="user-bio"
                                  value={editedUser.bio || ""}
                                  onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                                  className="w-full bg-muted/50 min-h-[100px]"
                                  placeholder="Enter user bio..."
                                />
                              </div>

                              <div>
                                <Label htmlFor="user-location">Location</Label>
                                <Input
                                  id="user-location"
                                  value={editedUser.location || ""}
                                  onChange={(e) => setEditedUser({ ...editedUser, location: e.target.value })}
                                  className="bg-muted/50"
                                  placeholder="Enter location..."
                                />
                              </div>

                              <div>
                                <Label htmlFor="user-phone">Phone</Label>
                                <Input
                                  id="user-phone"
                                  value={editedUser.phone || ""}
                                  onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                                  className="bg-muted/50"
                                  placeholder="Enter phone number..."
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {selectedUser.location && (
                                <div className="flex items-start">
                                  <div className="mr-2 mt-0.5 text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="font-medium">Location</p>
                                    <p className="text-sm text-muted-foreground">{selectedUser.location}</p>
                                  </div>
                                </div>
                              )}

                              {selectedUser.phone && (
                                <div className="flex items-start">
                                  <div className="mr-2 mt-0.5 text-muted-foreground">
                                    <Phone className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="font-medium">Phone</p>
                                    <p className="text-sm text-muted-foreground">{selectedUser.phone}</p>
                                  </div>
                                </div>
                              )}

                              {selectedUser.tags && selectedUser.tags.length > 0 && (
                                <div className="space-y-2">
                                  <p className="font-medium flex items-center">
                                    <Tag className="h-4 w-4 mr-2 text-neo-mint dark:text-purist-blue" />
                                    Tags
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedUser.tags.map((tag, index) => (
                                      <Badge key={index} variant="outline" className="bg-muted/50">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="activity" className="mt-0">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-4 flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-neo-mint dark:text-purist-blue" />
                          Recent Activity
                        </h4>

                        {selectedUser.recentActivity && selectedUser.recentActivity.length > 0 ? (
                          <div className="space-y-4">
                            {selectedUser.recentActivity.map((activity, index) => (
                              <motion.div 
                                key={index} 
                                className="flex items-start"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <div className="mr-4 mt-0.5">
                                  <div className="h-8 w-8 rounded-full bg-neo-mint/10 dark:bg-purist-blue/10 flex items-center justify-center text-neo-mint dark:text-purist-blue">
                                    {activity.type === "challenge" ? (
                                      <Award className="h-4 w-4" />
                                    ) : activity.type === "lesson" ? (
                                      <BookOpen className="h-4 w-4" />
                                    ) : (
                                      <Calendar className="h-4 w-4" />
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <p className="font-medium">{activity.description}</p>
                                  <p className="text-sm text-muted-foreground">{getTimeSince(activity.date)}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-muted/20 rounded-lg">
                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2 opacity-50" />
                            <p className="text-muted-foreground">No recent activity found</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="font-medium mb-4 flex items-center">
                          <Award className="mr-2 h-4 w-4 text-neo-mint dark:text-purist-blue" />
                          Achievements
                        </h4>

                        {selectedUser.achievements && selectedUser.achievements.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedUser.achievements.map((achievement, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-none shadow-md">
                                  <CardContent className="p-4 flex items-center">
                                    <div className="mr-4">
                                      <div className="h-10 w-10 rounded-full bg-neo-mint/10 dark:bg-purist-blue/10 flex items-center justify-center text-neo-mint dark:text-purist-blue">
                                        {achievement.icon === "zap" ? (
                                          <Zap className="h-5 w-5" />
                                        ) : achievement.icon === "message-square" ? (
                                          <MessageSquare className="h-5 w-5" />
                                        ) : (
                                          <Award className="h-5 w-5" />
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <p className="font-medium">{achievement.name}</p>
                                      <p className="text-sm text-muted-foreground">{formatDate(achievement.date)}</p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-muted/20 rounded-lg">
                            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-2 opacity-50" />
                            <p className="text-muted-foreground">No achievements yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="mt-0">
                    <div className="space-y-4">
                      <h4 className="font-medium mb-2">Profile Settings</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="public-profile">Public Profile</Label>
                          <Switch id="public-profile" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Make your profile visible to other users on the platform
                        </p>
                      </div>

                      <h4 className="font-medium mb-2">Notification Preferences</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <Switch id="email-notifications" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="push-notifications">Push Notifications</Label>
                          <Switch id="push-notifications" />
                        </div>
                      </div>

                      <h4 className="font-medium mb-2">Privacy Settings</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="show-activity">Show Activity</Label>
                          <Switch id="show-activity" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Allow other users to see your recent activity on the platform
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="notes" className="mt-0">
                    <div className="space-y-4">
                      <h4 className="font-medium mb-2">User Notes</h4>
                      <Textarea
                        placeholder="Add notes about this user..."
                        className="min-h-[150px]"
                        value={userNotes}
                        onChange={(e) => setUserNotes(e.target.value)}
                      />
                      <div className="flex justify-end">
                        <Button onClick={handleSaveNotes}>Save Notes</Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Full Name</Label>
              <Input
                id="user-name"
                placeholder="Enter user's full name"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name?.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email Address</Label>
              <Input
                id="user-email"
                type="email"
                placeholder="Enter user's email"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email?.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-role">User Role</Label>
              <Select
                value={form.watch("role")}
                onValueChange={(value: "student" | "teacher" | "admin") => form.setValue("role", value)}
              >
                <SelectTrigger id="user-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p className="text-sm text-red-500">{form.formState.errors.role?.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={form.handleSubmit(handleAddUser)} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
