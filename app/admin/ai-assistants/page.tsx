"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Plus,
  Search,
  Filter,
  X,
  Edit,
  Trash2,
  Zap,
  ArrowUpDown,
  AlertCircle,
  Copy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { dbHelpers } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Define types for our assistants
interface Assistant {
  id: string
  name: string
  description: string
  avatar: string | null
  model: string
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
  system_prompt: string
  capabilities: string[] | null
  category: string | null
  conversation_count: number | null
  message_count: number | null
  token_consumption: number | null
  created_by: string | null
  creator?: {
    id: string
    name: string | null
    email: string
  } | null
}

// AI model options
const modelOptions = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "gemini-pro", label: "Gemini Pro" },
  { value: "claude-3", label: "Claude 3" },
  { value: "llama-3", label: "Llama 3" },
]

// Category options
const categoryOptions = [
  { value: "education", label: "Education" },
  { value: "practice", label: "Practice" },
  { value: "assessment", label: "Assessment" },
  { value: "utility", label: "Utility" },
]

// Common capability options
const capabilityOptions = [
  { value: "grammar", label: "Grammar" },
  { value: "vocabulary", label: "Vocabulary" },
  { value: "pronunciation", label: "Pronunciation" },
  { value: "speaking", label: "Speaking" },
  { value: "writing", label: "Writing" },
  { value: "reading", label: "Reading" },
  { value: "listening", label: "Listening" },
  { value: "conversation", label: "Conversation" },
  { value: "test-prep", label: "Test Preparation" },
  { value: "feedback", label: "Feedback" },
  { value: "roleplay", label: "Role Play" },
  { value: "strategies", label: "Learning Strategies" },
  { value: "style", label: "Writing Style" },
]

// Format date for display
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function AIAssistantsPage() {  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(8)
  const [sortField, setSortField] = useState<keyof Assistant>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null)

  // Form state
  const [formName, setFormName] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formModel, setFormModel] = useState("gpt-4o")
  const [formSystemPrompt, setFormSystemPrompt] = useState("")
  const [formCapabilities, setFormCapabilities] = useState<string[]>([])
  const [formCategory, setFormCategory] = useState("education")
  const [formIsActive, setFormIsActive] = useState(true)

  // Validation state
  const [formErrors, setFormErrors] = useState<{
    name?: string
    description?: string
    systemPrompt?: string
  }>({})
  // Load assistants from database
  useEffect(() => {
    const loadAssistants = async () => {
      setIsLoading(true)
      try {
        const data = await dbHelpers.getAIAssistants()
        setAssistants(data || [])
      } catch (error) {
        console.error('Error loading assistants:', error)
        toast({
          title: "Error loading assistants",
          description: "Failed to load AI assistants from database",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadAssistants()
  }, [])

  // Handle sorting
  const handleSort = (field: keyof Assistant) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }
  // Apply sorting and filtering
  const filteredAndSortedAssistants = assistants
    .filter((assistant) => {
      const matchesSearch =
        assistant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assistant.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "active" && assistant.is_active) ||
        (activeTab === "inactive" && !assistant.is_active) ||
        activeTab === assistant.category
      return matchesSearch && matchesTab
    })    .sort((a, b) => {
      const fieldA = a[sortField]
      const fieldB = b[sortField]

      if (typeof fieldA === "string" && typeof fieldB === "string") {
        // Handle date strings for created_at and updated_at
        if (sortField === "created_at" || sortField === "updated_at") {
          const dateA = new Date(fieldA)
          const dateB = new Date(fieldB)
          return sortDirection === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime()
        }
        return sortDirection === "asc" ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA)
      }

      if (typeof fieldA === "boolean" && typeof fieldB === "boolean") {
        return sortDirection === "asc"
          ? fieldA === fieldB
            ? 0
            : fieldA
              ? -1
              : 1
          : fieldA === fieldB
            ? 0
            : fieldA
              ? 1
              : -1
      }

      return 0
    })

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedAssistants.length / itemsPerPage)
  const paginatedAssistants = filteredAndSortedAssistants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeTab])

  // Reset form fields
  const resetForm = () => {
    setFormName("")
    setFormDescription("")
    setFormModel("gpt-4o")
    setFormSystemPrompt("")
    setFormCapabilities([])
    setFormCategory("education")
    setFormIsActive(true)
    setFormErrors({})
  }
  // Open edit dialog and populate form
  const handleEditClick = (assistant: Assistant) => {
    setSelectedAssistant(assistant)
    setFormName(assistant.name)
    setFormDescription(assistant.description)
    setFormModel(assistant.model.toLowerCase().replace(/\s+/g, "-"))
    setFormSystemPrompt(assistant.system_prompt)
    setFormCapabilities(assistant.capabilities || [])
    setFormCategory(assistant.category || "education")
    setFormIsActive(assistant.is_active ?? true)
    setShowEditDialog(true)
  }

  // Open view dialog
  const handleViewClick = (assistant: Assistant) => {
    setSelectedAssistant(assistant)
    setShowViewDialog(true)
  }

  // Open delete dialog
  const handleDeleteClick = (assistant: Assistant) => {
    setSelectedAssistant(assistant)
    setShowDeleteDialog(true)
  }
  // Toggle assistant active status
  const handleToggleActive = async (id: string, currentStatus: boolean | null) => {
    const newStatus = !currentStatus

    try {
      const { data, error } = await dbHelpers.toggleAIAssistantStatus(id, newStatus)

      if (error) {
        throw error
      }

      if (data) {
        setAssistants((prev) =>
          prev.map((assistant) =>
            assistant.id === id ? data : assistant
          )
        )

        toast({
          title: `Assistant ${currentStatus ? "deactivated" : "activated"}`,
          description: `The assistant has been ${currentStatus ? "deactivated" : "activated"} successfully.`,
          variant: currentStatus ? "destructive" : "default",
        })
      }
    } catch (error) {
      console.error('Error toggling assistant status:', error)
      toast({
        title: "Error updating status",
        description: "Failed to update the assistant status. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Validate form
  const validateForm = () => {
    const errors: {
      name?: string
      description?: string
      systemPrompt?: string
    } = {}

    if (!formName.trim()) {
      errors.name = "Name is required"
    }

    if (!formDescription.trim()) {
      errors.description = "Description is required"
    }

    if (!formSystemPrompt.trim()) {
      errors.systemPrompt = "System prompt is required"
    } else if (formSystemPrompt.length < 20) {
      errors.systemPrompt = "System prompt should be at least 20 characters"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }  // Handle adding a new assistant
  const handleAddAssistant = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await dbHelpers.createAIAssistant({
        name: formName,
        description: formDescription,
        model: formModel,
        system_prompt: formSystemPrompt,
        capabilities: formCapabilities,
        category: formCategory,
        is_active: formIsActive,
        created_by: "admin", // Default user for AI assistant creation
      })

      if (error) {
        throw error
      }

      if (data) {
        setAssistants((prev) => [...prev, data])
        setShowAddDialog(false)
        resetForm()

        toast({
          title: "Assistant created",
          description: "Your new AI assistant has been created successfully",
        })
      }
    } catch (error) {
      console.error('Error creating assistant:', error)
      toast({
        title: "Error creating assistant",
        description: "Failed to create the AI assistant. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  // Handle editing an assistant
  const handleEditAssistant = async () => {
    if (!selectedAssistant || !validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await dbHelpers.updateAIAssistant(selectedAssistant.id, {
        name: formName,
        description: formDescription,
        model: formModel,
        system_prompt: formSystemPrompt,
        capabilities: formCapabilities,
        category: formCategory,
        is_active: formIsActive,
      })

      if (error) {
        throw error
      }

      if (data) {
        setAssistants((prev) =>
          prev.map((assistant) =>
            assistant.id === selectedAssistant.id ? data : assistant
          )
        )
        setShowEditDialog(false)
        resetForm()

        toast({
          title: "Assistant updated",
          description: "The AI assistant has been updated successfully",
        })
      }
    } catch (error) {
      console.error('Error updating assistant:', error)
      toast({
        title: "Error updating assistant",
        description: "Failed to update the AI assistant. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  // Handle deleting an assistant
  const handleDeleteAssistant = async () => {
    if (!selectedAssistant) return

    setIsLoading(true)

    try {
      const { error } = await dbHelpers.deleteAIAssistant(selectedAssistant.id)

      if (error) {
        throw error
      }

      setAssistants((prev) => prev.filter((assistant) => assistant.id !== selectedAssistant.id))
      setShowDeleteDialog(false)

      toast({
        title: "Assistant deleted",
        description: "The AI assistant has been deleted successfully",
        variant: "destructive",
      })
    } catch (error) {
      console.error('Error deleting assistant:', error)
      toast({
        title: "Error deleting assistant",
        description: "Failed to delete the AI assistant. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Copy system prompt to clipboard
  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt)
    toast({
      title: "Copied to clipboard",
      description: "The system prompt has been copied to your clipboard",
    })
  }

  // Handle capability selection
  const handleCapabilityToggle = (capability: string) => {
    setFormCapabilities((prev) =>
      prev.includes(capability) ? prev.filter((c) => c !== capability) : [...prev, capability],
    )
  }

  // Skeleton loading component
  const SkeletonAssistantCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-5 h-[280px] animate-pulse">
      <div className="flex space-x-4 items-center">
        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
      </div>
      <div className="mt-6 space-y-2">
        <div className="flex space-x-2">
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  )

  return (
    <motion.div
      className="container mx-auto px-4 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue">
              AI Assistants
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your language learning AI assistants</p>
          </div>

          <Button
            onClick={() => {
              resetForm()
              setShowAddDialog(true)
            }}
            size="default"
            className="self-start bg-gradient-to-r from-neo-mint to-purist-blue hover:opacity-90 transition-opacity"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Assistant
          </Button>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search assistants..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Tabs defaultValue="all" className="w-full sm:w-auto" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 md:w-[400px]">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full h-9 px-2 flex items-center justify-center">
                      <Filter className="h-4 w-4 mr-1" />
                      <span className="truncate">Category</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    {categoryOptions.map((category) => (
                      <DropdownMenuItem
                        key={category.value}
                        onClick={() => setActiveTab(category.value)}
                        className={activeTab === category.value ? "bg-muted" : ""}
                      >
                        {category.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="h-4 w-4 mr-1" />                  Sort by
                  {sortField === "name" && " Name"}
                  {sortField === "created_at" && " Date"}
                  {sortField === "model" && " Model"}
                  {sortField === "is_active" && " Status"}
                  <span className="ml-1">({sortDirection === "asc" ? "A-Z" : "Z-A"})</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => handleSort("name")}>
                  Name
                  {sortField === "name" && <span className="ml-auto">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </DropdownMenuItem>                <DropdownMenuItem onClick={() => handleSort("created_at")}>
                  Date created
                  {sortField === "created_at" && <span className="ml-auto">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("model")}>
                  Model
                  {sortField === "model" && <span className="ml-auto">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("is_active")}>
                  Status
                  {sortField === "is_active" && <span className="ml-auto">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isLoading ? (
          // Skeleton loading state
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <motion.div key={index} variants={item}>
                <SkeletonAssistantCard />
              </motion.div>
            ))}
          </motion.div>
        ) : filteredAndSortedAssistants.length === 0 ? (
          // Empty state
          <motion.div
            className="flex flex-col items-center justify-center py-20 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <AlertCircle className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium mb-2">No assistants found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
              {searchQuery
                ? `No assistants match "${searchQuery}". Try a different search term.`
                : "There are no assistants in this category. Create your first assistant to get started."}
            </p>
            <Button
              onClick={() => {
                resetForm()
                setShowAddDialog(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Assistant
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Assistant cards */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {paginatedAssistants.map((assistant) => (
                <motion.div
                  key={assistant.id}
                  variants={item}
                  layout
                  className="h-full"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card
                    className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300 overflow-hidden border-t-4 relative"                    style={{
                      borderTopColor: assistant.is_active ? "hsl(var(--neo-mint))" : "hsl(var(--muted-foreground))",
                    }}
                  >
                    {!assistant.is_active && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-500">
                          Inactive
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12 border">
                          <AvatarImage src={assistant.avatar || "/placeholder.svg"} alt={assistant.name} />
                          <AvatarFallback>
                            {assistant.name
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h3 className="font-medium text-lg leading-none">{assistant.name}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="font-normal text-xs">
                              {assistant.model}
                            </Badge>
                            <Badge variant="outline" className="font-normal text-xs">
                              {categoryOptions.find((c) => c.value === assistant.category)?.label || assistant.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2 flex-grow">
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                        {assistant.description}
                      </p>                      <div className="flex flex-wrap gap-1 mt-2">
                        {(assistant.capabilities || []).slice(0, 3).map((cap) => (
                          <Badge key={cap} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                        {(assistant.capabilities || []).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(assistant.capabilities || []).length - 3} more
                          </Badge>
                        )}
                      </div>                      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center justify-between mb-1">
                          <span>Created:</span>
                          <span>{formatDate(assistant.created_at)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Last updated:</span>
                          <span>{formatDate(assistant.updated_at)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-4 pb-3 flex justify-between items-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>                            <div className="flex items-center">
                              <Switch
                                checked={assistant.is_active ?? false}
                                onCheckedChange={() => handleToggleActive(assistant.id, assistant.is_active)}
                              />
                            </div>
                          </TooltipTrigger>                          <TooltipContent side="bottom">
                            {assistant.is_active ? "Deactivate" : "Activate"} assistant
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <div className="flex space-x-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewClick(assistant)}
                                className="h-8 w-8"
                              >
                                <Zap className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">View details</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(assistant)}
                                className="h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Edit assistant</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(assistant)}
                                className="h-8 w-8 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Delete assistant</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center text-sm">
                    <span className="px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <Select
                    value={String(itemsPerPage)}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value))
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Items per page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 per page</SelectItem>
                      <SelectItem value="8">8 per page</SelectItem>
                      <SelectItem value="12">12 per page</SelectItem>
                      <SelectItem value="16">16 per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Assistant Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Assistant</DialogTitle>
            <DialogDescription>Configure your new AI assistant for language learning.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="assistant-name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="assistant-name"
                  placeholder="Enter assistant name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="assistant-model" className="text-sm font-medium">
                  AI Model
                </label>
                <Select value={formModel} onValueChange={setFormModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {modelOptions.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="assistant-description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="assistant-description"
                  placeholder="Enter a brief description"
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className={formErrors.description ? "border-red-500" : ""}
                />
                {formErrors.description && <p className="text-xs text-red-500">{formErrors.description}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="assistant-prompt" className="text-sm font-medium">
                  System Prompt
                </label>
                <Textarea
                  id="assistant-prompt"
                  placeholder="Define how your assistant should behave"
                  rows={5}
                  value={formSystemPrompt}
                  onChange={(e) => setFormSystemPrompt(e.target.value)}
                  className={formErrors.systemPrompt ? "border-red-500" : ""}
                />
                {formErrors.systemPrompt && <p className="text-xs text-red-500">{formErrors.systemPrompt}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Capabilities</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {capabilityOptions.map((capability) => (
                  <Badge
                    key={capability.value}
                    variant={formCapabilities.includes(capability.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleCapabilityToggle(capability.value)}
                  >
                    {capability.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="assistant-category" className="text-sm font-medium">
                  Category
                </label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex items-end">
                <div className="flex items-center space-x-2">
                  <Switch id="assistant-active" checked={formIsActive} onCheckedChange={setFormIsActive} />
                  <label htmlFor="assistant-active" className="text-sm font-medium cursor-pointer">
                    Active
                  </label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddAssistant}
              disabled={isLoading}
              className="bg-gradient-to-r from-neo-mint to-purist-blue hover:opacity-90 transition-opacity"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>Create Assistant</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Assistant Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Assistant</DialogTitle>
            <DialogDescription>Update your AI assistant configuration.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-assistant-name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="edit-assistant-name"
                  placeholder="Enter assistant name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-assistant-model" className="text-sm font-medium">
                  AI Model
                </label>
                <Select value={formModel} onValueChange={setFormModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {modelOptions.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="edit-assistant-description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="edit-assistant-description"
                  placeholder="Enter a brief description"
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className={formErrors.description ? "border-red-500" : ""}
                />
                {formErrors.description && <p className="text-xs text-red-500">{formErrors.description}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="edit-assistant-prompt" className="text-sm font-medium">
                  System Prompt
                </label>
                <Textarea
                  id="edit-assistant-prompt"
                  placeholder="Define how your assistant should behave"
                  rows={5}
                  value={formSystemPrompt}
                  onChange={(e) => setFormSystemPrompt(e.target.value)}
                  className={formErrors.systemPrompt ? "border-red-500" : ""}
                />
                {formErrors.systemPrompt && <p className="text-xs text-red-500">{formErrors.systemPrompt}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Capabilities</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {capabilityOptions.map((capability) => (
                  <Badge
                    key={capability.value}
                    variant={formCapabilities.includes(capability.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleCapabilityToggle(capability.value)}
                  >
                    {capability.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-assistant-category" className="text-sm font-medium">
                  Category
                </label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex items-end">
                <div className="flex items-center space-x-2">
                  <Switch id="edit-assistant-active" checked={formIsActive} onCheckedChange={setFormIsActive} />
                  <label htmlFor="edit-assistant-active" className="text-sm font-medium cursor-pointer">
                    Active
                  </label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditAssistant}
              disabled={isLoading}
              className="bg-gradient-to-r from-neo-mint to-purist-blue hover:opacity-90 transition-opacity"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>Save Changes</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Assistant</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assistant? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedAssistant && (
            <div className="flex items-center space-x-3 py-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedAssistant.avatar || "/placeholder.svg"} alt={selectedAssistant.name} />
                <AvatarFallback>
                  {selectedAssistant.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{selectedAssistant.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedAssistant.description}</p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAssistant} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Assistant Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedAssistant && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedAssistant.avatar || "/placeholder.svg"} alt={selectedAssistant.name} />
                      <AvatarFallback>
                        {selectedAssistant.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-xl">{selectedAssistant.name}</DialogTitle>
                      <div className="flex items-center mt-1 space-x-2">
                        <Badge variant="secondary">{selectedAssistant.model}</Badge>                        <Badge variant={selectedAssistant.is_active ? "default" : "destructive"}>
                          {selectedAssistant.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(selectedAssistant)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="py-4 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</h3>
                  <p className="text-sm">{selectedAssistant.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Category</h3>
                    <p className="text-sm capitalize">
                      {categoryOptions.find((c) => c.value === selectedAssistant.category)?.label ||
                        selectedAssistant.category}
                    </p>
                  </div>                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created</h3>
                    <p className="text-sm">{formatDate(selectedAssistant.created_at)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Updated</h3>
                    <p className="text-sm">{formatDate(selectedAssistant.updated_at)}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">System Prompt</h3>                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => handleCopyPrompt(selectedAssistant.system_prompt)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="rounded-md bg-muted p-3 text-sm font-mono whitespace-pre-wrap">
                    {selectedAssistant.system_prompt}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Capabilities</h3>                  <div className="flex flex-wrap gap-2">
                    {(selectedAssistant.capabilities || []).map((capability) => (
                      <Badge key={capability} variant="outline">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Usage Statistics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Conversations</p>
                        <p className="text-2xl font-bold mt-1">
                          {(selectedAssistant.conversation_count || 0).toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Messages</p>
                        <p className="text-2xl font-bold mt-1">{(selectedAssistant.message_count || 0).toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tokens</p>
                        <p className="text-2xl font-bold mt-1">
                          {((selectedAssistant.token_consumption || 0) / 1000).toFixed(1)}K
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <div className="flex justify-between w-full">
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteClick(selectedAssistant)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>

                  <DialogClose asChild>
                    <Button>Close</Button>
                  </DialogClose>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
