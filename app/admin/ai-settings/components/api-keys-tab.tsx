"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertCircle,
  Check,
  Copy,
  Edit,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Plus,
  Save,
  Search,
  Settings,
  Sparkles,
  Trash,
  Zap,
  Globe,
  Cpu,
  Database,
  HelpCircle,
  MoreHorizontal,
  Star,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"
import type { ApiKey } from "../types"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ApiKeysTabProps {
  apiKeys: ApiKey[]
  setApiKeys: (apiKeys: ApiKey[]) => void
  searchQuery: string
  filterProvider: string
  setSearchQuery: (searchQuery: string) => void
  setFilterProvider: (filterProvider: string) => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
}

export const ApiKeysTab: React.FC<ApiKeysTabProps> = ({
  apiKeys,
  setApiKeys,
  searchQuery,
  filterProvider,
  setSearchQuery,
  setFilterProvider,
  isLoading,
  setIsLoading,
}) => {
  const [showAddKeyDialog, setShowAddKeyDialog] = useState(false)
  const [showEditKeyDialog, setShowEditKeyDialog] = useState(false)
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)
  const [showTestResultDialog, setShowTestResultDialog] = useState(false)
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyValue, setNewKeyValue] = useState("")
  const [newKeyProvider, setNewKeyProvider] = useState<
    "openai" | "gemini" | "anthropic" | "mistral" | "cohere" | "custom"
  >("openai")
  const [newKeyUsageLimit, setNewKeyUsageLimit] = useState<string>("")
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; response?: string }>({
    success: false,
    message: "",
  })
  const [testingKey, setTestingKey] = useState<string | null>(null)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  // AI Model State
  const [showAddModelDialog, setShowAddModelDialog] = useState(false)
  const [showEditModelDialog, setShowEditModelDialog] = useState(false)
  const [selectedModel, setSelectedModel] = useState<any | null>(null)
  const [newModelName, setNewModelName] = useState("")
  const [newModelProvider, setNewModelProvider] = useState<
    "openai" | "gemini" | "anthropic" | "mistral" | "cohere" | "custom"
  >("openai")
  const [newModelDescription, setNewModelDescription] = useState("")
  const [newModelCapabilities, setNewModelCapabilities] = useState<string[]>([])
  const [newModelContextLength, setNewModelContextLength] = useState("")
  const [newModelCost, setNewModelCost] = useState("")
  const [newModelStrengths, setNewModelStrengths] = useState<string[]>([])
  const [newModelEndpoint, setNewModelEndpoint] = useState("")

  // Filter API keys based on search and provider filter
  const filteredApiKeys = apiKeys.filter((key) => {
    const matchesSearch =
      key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.provider.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProvider = filterProvider === "all" || key.provider === filterProvider
    return matchesSearch && matchesProvider
  })

  // Handle adding a new API key
  const handleAddApiKey = () => {
    if (!newKeyName || !newKeyValue || !newKeyProvider) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const newKey: ApiKey = {
        id: `key${apiKeys.length + 1}`,
        name: newKeyName,
        key: newKeyValue,
        provider: newKeyProvider,
        isActive: true,
        isDefault: apiKeys.length === 0, // Make default if it's the first key
        createdAt: new Date(),
        lastUsed: null,
        usageCount: 0,
        usageLimit: newKeyUsageLimit ? Number.parseInt(newKeyUsageLimit) : null,
        expiresAt: null,
      }

      setApiKeys([...apiKeys, newKey])
      setIsLoading(false)
      setShowAddKeyDialog(false)
      setNewKeyName("")
      setNewKeyValue("")
      setNewKeyProvider("openai")
      setNewKeyUsageLimit("")

      toast({
        title: "API Key added",
        description: "Your new API key has been added successfully",
      })
    }, 1000)
  }

  // Handle editing an API key
  const handleEditApiKey = () => {
    if (!selectedKey || !newKeyName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const updatedKeys = apiKeys.map((key) => {
        if (key.id === selectedKey.id) {
          return {
            ...key,
            name: newKeyName,
            key: newKeyValue || key.key,
            provider: newKeyProvider,
            usageLimit: newKeyUsageLimit ? Number.parseInt(newKeyUsageLimit) : key.usageLimit,
          }
        }
        return key
      })

      setApiKeys(updatedKeys)
      setIsLoading(false)
      setShowEditKeyDialog(false)
      setSelectedKey(null)
      setNewKeyName("")
      setNewKeyValue("")
      setNewKeyProvider("openai")
      setNewKeyUsageLimit("")

      toast({
        title: "API Key updated",
        description: "Your API key has been updated successfully",
      })
    }, 1000)
  }

  // Handle deleting an API key
  const handleDeleteApiKey = () => {
    if (!selectedKey) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const updatedKeys = apiKeys.filter((key) => key.id !== selectedKey.id)

      // If we deleted the default key, make another one default
      if (selectedKey.isDefault && updatedKeys.length > 0) {
        updatedKeys[0].isDefault = true
      }

      setApiKeys(updatedKeys)
      setIsLoading(false)
      setShowDeleteConfirmDialog(false)
      setSelectedKey(null)

      toast({
        title: "API Key deleted",
        description: "The API key has been deleted successfully",
      })
    }, 1000)
  }

  // Handle setting a key as default
  const handleSetDefaultKey = (keyId: string) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const updatedKeys = apiKeys.map((key) => ({
        ...key,
        isDefault: key.id === keyId,
      }))

      setApiKeys(updatedKeys)
      setIsLoading(false)

      toast({
        title: "Default key updated",
        description: "The default API key has been updated successfully",
      })
    }, 500)
  }

  // Handle toggling a key's active status
  const handleToggleKeyActive = (keyId: string, newStatus: boolean) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const updatedKeys = apiKeys.map((key) => {
        if (key.id === keyId) {
          return {
            ...key,
            isActive: newStatus,
          }
        }
        return key
      })

      setApiKeys(updatedKeys)
      setIsLoading(false)

      toast({
        title: newStatus ? "API Key activated" : "API Key deactivated",
        description: `The API key has been ${newStatus ? "activated" : "deactivated"} successfully`,
      })
    }, 500)
  }

  // Handle testing an API key
  const handleTestApiKey = (key: ApiKey) => {
    setTestingKey(key.id)

    // Simulate API call
    setTimeout(() => {
      // Randomly succeed or fail for demo purposes
      const success = Math.random() > 0.3

      setTestResult({
        success,
        message: success
          ? `API key validated successfully with ${key.provider}`
          : `Failed to validate API key: ${getRandomErrorMessage(key.provider)}`,
        response: success ? getRandomSuccessResponse(key.provider) : undefined,
      })

      setTestingKey(null)
      setShowTestResultDialog(true)

      if (success) {
        // Update last used date and usage count
        const updatedKeys = apiKeys.map((k) => {
          if (k.id === key.id) {
            return {
              ...k,
              lastUsed: new Date(),
              usageCount: k.usageCount + 1,
            }
          }
          return k
        })
        setApiKeys(updatedKeys)
      }
    }, 2000)
  }

  // Handle adding a new AI Model
  const handleAddAiModel = () => {
    // Simulate API call
    setTimeout(() => {
      // Reset state after adding
      setIsLoading(false)
      setShowAddModelDialog(false)
    }, 1000)
  }

  // Handle editing an AI Model
  const handleEditAiModel = () => {
    // Simulate API call
    setTimeout(() => {
      // Reset state after editing
      setIsLoading(false)
      setShowEditModelDialog(false)
    }, 1000)
  }

  // Get a random error message for demo
  const getRandomErrorMessage = (provider: string) => {
    const errors = [
      `Invalid authentication with ${provider} API`,
      `Rate limit exceeded for ${provider} API`,
      `${provider} API key has expired`,
      `Network error while connecting to ${provider} API`,
      `${provider} service is currently unavailable`,
    ]
    return errors[Math.floor(Math.random() * errors.length)]
  }

  // Get a random success response for demo
  const getRandomSuccessResponse = (provider: string) => {
    if (provider === "openai") {
      return `{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": ${Date.now()},
  "model": "gpt-4o",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Hello! I'm an AI assistant powered by OpenAI. Your API key is working correctly."
    },
    "finish_reason": "stop"
  }]
}`
    } else if (provider === "gemini") {
      return `{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "Hello! I'm Gemini AI. Your API key is valid and working correctly."
      }]
    },
    "finishReason": "STOP"
  }]
}`
    } else {
      return `{
  "success": true,
  "message": "API key validated successfully",
  "model": "${provider}-latest",
  "timestamp": "${new Date().toISOString()}"
}`
    }
  }

  // Copy API key to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The API key has been copied to your clipboard",
    })
  }

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return "Never"
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Get provider color
  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "openai":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "gemini":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "anthropic":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "mistral":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      case "cohere":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  // Get provider icon
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "openai":
        return <Sparkles className="h-4 w-4" />
      case "gemini":
        return <Zap className="h-4 w-4" />
      case "anthropic":
        return <Globe className="h-4 w-4" />
      case "mistral":
        return <Cpu className="h-4 w-4" />
      case "cohere":
        return <Database className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  // Toggle API key visibility
  const toggleApiKeyVisibility = () => {
    setShowApiKeys(!showApiKeys)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  }

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  }

  return (
    <>
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search API keys..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={filterProvider} onValueChange={setFilterProvider}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="gemini">Gemini (Google)</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
              <SelectItem value="mistral">Mistral AI</SelectItem>
              <SelectItem value="cohere">Cohere</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowAddKeyDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Key
          </Button>
        </div>
      </div>

      {/* API Keys List */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <motion.div key={`skeleton-${i}`} variants={itemVariants} className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-20" />
              </div>
            </motion.div>
          ))
        ) : filteredApiKeys.length === 0 ? (
          // Empty state
          <motion.div variants={fadeInVariants} className="text-center py-12 border rounded-lg">
            <Key className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
            <h3 className="mt-4 text-lg font-medium">No API keys found</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              {searchQuery || filterProvider !== "all"
                ? "Try adjusting your search or filters"
                : "Add your first API key to get started"}
            </p>
            <Button onClick={() => setShowAddKeyDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add API Key
            </Button>
          </motion.div>
        ) : (
          // API keys list
          filteredApiKeys.map((key, index) => (
            <motion.div
              key={key.id}
              variants={itemVariants}
              className={`rounded-lg border ${
                key.isDefault ? "border-neo-mint/50 dark:border-purist-blue/50 bg-neo-mint/5 dark:bg-purist-blue/5" : ""
              } hover:shadow-md transition-all duration-300`}
            >
              <div className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${getProviderColor(
                        key.provider,
                      )}`}
                    >
                      {getProviderIcon(key.provider)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{key.name}</h3>
                        {key.isDefault && (
                          <Badge
                            variant="outline"
                            className="bg-neo-mint/20 text-neo-mint-foreground border-neo-mint/30"
                          >
                            Default
                          </Badge>
                        )}
                        {!key.isActive && (
                          <Badge
                            variant="outline"
                            className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                          >
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {key.provider.charAt(0).toUpperCase() + key.provider.slice(1)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestApiKey(key)}
                            disabled={testingKey === key.id || !key.isActive}
                          >
                            {testingKey === key.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Zap className="h-4 w-4 mr-2" />
                            )}
                            Test
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Test if this API key is valid</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedKey(key)
                            setNewKeyName(key.name)
                            setNewKeyProvider(key.provider)
                            setNewKeyUsageLimit(key.usageLimit ? key.usageLimit.toString() : "")
                            setShowEditKeyDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleKeyActive(key.id, !key.isActive)}>
                          {key.isActive ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Disable
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Enable
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSetDefaultKey(key.id)}>
                          <Star className="h-4 w-4 mr-2" />
                          Set as Default
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedKey(key)
                            setShowDeleteConfirmDialog(true)
                          }}
                          className="text-red-600"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2">
                    <div className="font-mono text-sm truncate flex-1">
                      {showApiKeys ? key.key : "•".repeat(Math.min(24, key.key.length))}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleApiKeyVisibility}>
                      {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(key.key)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Add API Key Dialog */}
      <Dialog open={showAddKeyDialog} onOpenChange={setShowAddKeyDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New API Key</DialogTitle>
            <DialogDescription>Add a new API key for AI model integration</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key Name</Label>
              <Input
                id="key-name"
                placeholder="e.g., Production OpenAI Key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key-provider">Provider</Label>
              <Select value={newKeyProvider} onValueChange={(value: any) => setNewKeyProvider(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="gemini">Gemini (Google)</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="mistral">Mistral AI</SelectItem>
                  <SelectItem value="cohere">Cohere</SelectItem>
                  <SelectItem value="custom">Custom Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="key-value">API Key</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-5 px-1">
                        <HelpCircle className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Your API key is stored securely and encrypted. Only administrators can view and manage API keys.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex">
                <Input
                  id="key-value"
                  type={showApiKeys ? "text" : "password"}
                  placeholder={`Enter ${newKeyProvider} API key`}
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  className="rounded-r-none"
                />
                <Button variant="outline" size="icon" className="rounded-l-none" onClick={toggleApiKeyVisibility}>
                  {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="key-usage-limit">Usage Limit (Optional)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-5 px-1">
                        <HelpCircle className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Set a maximum number of requests for this API key</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="key-usage-limit"
                type="number"
                placeholder="Leave empty for unlimited usage"
                value={newKeyUsageLimit}
                onChange={(e) => setNewKeyUsageLimit(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddKeyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddApiKey} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save API Key
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit API Key Dialog */}
      <Dialog open={showEditKeyDialog} onOpenChange={setShowEditKeyDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit API Key</DialogTitle>
            <DialogDescription>Update your API key details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-key-name">Key Name</Label>
              <Input
                id="edit-key-name"
                placeholder="e.g., Production OpenAI Key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-key-provider">Provider</Label>
              <Select value={newKeyProvider} onValueChange={(value: any) => setNewKeyProvider(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="gemini">Gemini (Google)</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="mistral">Mistral AI</SelectItem>
                  <SelectItem value="cohere">Cohere</SelectItem>
                  <SelectItem value="custom">Custom Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="edit-key-value">API Key</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-5 px-1">
                        <HelpCircle className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Leave this field empty if you don't want to change the API key</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex">
                <Input
                  id="edit-key-value"
                  type={showApiKeys ? "text" : "password"}
                  placeholder="Enter new API key or leave empty"
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  className="rounded-r-none"
                />
                <Button variant="outline" size="icon" className="rounded-l-none" onClick={toggleApiKeyVisibility}>
                  {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="edit-key-usage-limit">Usage Limit (Optional)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-5 px-1">
                        <HelpCircle className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Set a maximum number of requests for this API key</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="edit-key-usage-limit"
                type="number"
                placeholder="Leave empty for unlimited usage"
                value={newKeyUsageLimit}
                onChange={(e) => setNewKeyUsageLimit(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditKeyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditApiKey} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update API Key
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add AI Model Dialog */}
      <Dialog open={showAddModelDialog} onOpenChange={setShowAddModelDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New AI Model</DialogTitle>
            <DialogDescription>Configure a new AI model for your platform</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 py-4 px-1">
              <div className="space-y-2">
                <Label htmlFor="model-name">Model Name</Label>
                <Input
                  id="model-name"
                  placeholder="e.g., GPT-4o"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model-provider">Provider</Label>
                <Select value={newModelProvider} onValueChange={(value: any) => setNewModelProvider(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="gemini">Gemini (Google)</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="mistral">Mistral AI</SelectItem>
                    <SelectItem value="cohere">Cohere</SelectItem>
                    <SelectItem value="custom">Custom Provider</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model-description">Description</Label>
                <Textarea
                  id="model-description"
                  placeholder="Describe the model's capabilities and use cases"
                  value={newModelDescription}
                  onChange={(e) => setNewModelDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Capabilities</Label>
                <div className="flex flex-wrap gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="capability-text"
                            checked={newModelCapabilities.includes("text")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewModelCapabilities([...newModelCapabilities, "text"])
                              } else {
                                setNewModelCapabilities(newModelCapabilities.filter((c) => c !== "text"))
                              }
                            }}
                          />
                          <label
                            htmlFor="capability-text"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Text Generation
                          </label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Can generate and process text</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="capability-image"
                            checked={newModelCapabilities.includes("image")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewModelCapabilities([...newModelCapabilities, "image"])
                              } else {
                                setNewModelCapabilities(newModelCapabilities.filter((c) => c !== "image"))
                              }
                            }}
                          />
                          <label
                            htmlFor="capability-image"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Vision/Image
                          </label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Can process and understand images</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="capability-code"
                            checked={newModelCapabilities.includes("code")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewModelCapabilities([...newModelCapabilities, "code"])
                              } else {
                                setNewModelCapabilities(newModelCapabilities.filter((c) => c !== "code"))
                              }
                            }}
                          />
                          <label
                            htmlFor="capability-code"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Code Generation
                          </label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Specialized in generating and understanding code</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model-context-length">Context Length (tokens)</Label>
                  <Input
                    id="model-context-length"
                    type="number"
                    placeholder="e.g., 4096"
                    value={newModelContextLength}
                    onChange={(e) => setNewModelContextLength(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model-cost">Cost per 1K tokens ($)</Label>
                  <Input
                    id="model-cost"
                    type="number"
                    step="0.0001"
                    placeholder="e.g., 0.001"
                    value={newModelCost}
                    onChange={(e) => setNewModelCost(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model-strengths">Strengths (comma separated)</Label>
                <Textarea
                  id="model-strengths"
                  placeholder="e.g., Creative writing, Code generation, Reasoning"
                  value={newModelStrengths.join(", ")}
                  onChange={(e) =>
                    setNewModelStrengths(
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    )
                  }
                />
              </div>
              {newModelProvider === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="model-endpoint">API Endpoint</Label>
                  <Input
                    id="model-endpoint"
                    placeholder="e.g., https://api.example.com/v1/completions"
                    value={newModelEndpoint}
                    onChange={(e) => setNewModelEndpoint(e.target.value)}
                  />
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModelDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAiModel} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Model
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit AI Model Dialog */}
      <Dialog open={showEditModelDialog} onOpenChange={setShowEditModelDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit AI Model</DialogTitle>
            <DialogDescription>Update AI model configuration</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 py-4 px-1">
              <div className="space-y-2">
                <Label htmlFor="edit-model-name">Model Name</Label>
                <Input
                  id="edit-model-name"
                  placeholder="e.g., GPT-4o"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-model-provider">Provider</Label>
                <Select value={newModelProvider} onValueChange={(value: any) => setNewModelProvider(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="gemini">Gemini (Google)</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="mistral">Mistral AI</SelectItem>
                    <SelectItem value="cohere">Cohere</SelectItem>
                    <SelectItem value="custom">Custom Provider</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-model-description">Description</Label>
                <Textarea
                  id="edit-model-description"
                  placeholder="Describe the model's capabilities and use cases"
                  value={newModelDescription}
                  onChange={(e) => setNewModelDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Capabilities</Label>
                <div className="flex flex-wrap gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-capability-text"
                            checked={newModelCapabilities.includes("text")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewModelCapabilities([...newModelCapabilities, "text"])
                              } else {
                                setNewModelCapabilities(newModelCapabilities.filter((c) => c !== "text"))
                              }
                            }}
                          />
                          <label
                            htmlFor="edit-capability-text"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Text Generation
                          </label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Can generate and process text</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-capability-image"
                            checked={newModelCapabilities.includes("image")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewModelCapabilities([...newModelCapabilities, "image"])
                              } else {
                                setNewModelCapabilities(newModelCapabilities.filter((c) => c !== "image"))
                              }
                            }}
                          />
                          <label
                            htmlFor="edit-capability-image"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Vision/Image
                          </label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Can process and understand images</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-capability-code"
                            checked={newModelCapabilities.includes("code")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewModelCapabilities([...newModelCapabilities, "code"])
                              } else {
                                setNewModelCapabilities(newModelCapabilities.filter((c) => c !== "code"))
                              }
                            }}
                          />
                          <label
                            htmlFor="edit-capability-code"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Code Generation
                          </label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Specialized in generating and understanding code</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-model-context-length">Context Length (tokens)</Label>
                  <Input
                    id="edit-model-context-length"
                    type="number"
                    placeholder="e.g., 4096"
                    value={newModelContextLength}
                    onChange={(e) => setNewModelContextLength(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-model-cost">Cost per 1K tokens ($)</Label>
                  <Input
                    id="edit-model-cost"
                    type="number"
                    step="0.0001"
                    placeholder="e.g., 0.001"
                    value={newModelCost}
                    onChange={(e) => setNewModelCost(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-model-strengths">Strengths (comma separated)</Label>
                <Textarea
                  id="edit-model-strengths"
                  placeholder="e.g., Creative writing, Code generation, Reasoning"
                  value={newModelStrengths.join(", ")}
                  onChange={(e) =>
                    setNewModelStrengths(
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    )
                  }
                />
              </div>
              {newModelProvider === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-model-endpoint">API Endpoint</Label>
                  <Input
                    id="edit-model-endpoint"
                    placeholder="e.g., https://api.example.com/v1/completions"
                    value={newModelEndpoint}
                    onChange={(e) => setNewModelEndpoint(e.target.value)}
                  />
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModelDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditAiModel} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Model
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this API key? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedKey && (
              <div className="rounded-md bg-destructive/10 p-4 text-destructive">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">{selectedKey.name}</p>
                    <p className="text-sm opacity-80">
                      {selectedKey.provider.charAt(0).toUpperCase() + selectedKey.provider.slice(1)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirmDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteApiKey} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete API Key
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Result Dialog */}
      <Dialog open={showTestResultDialog} onOpenChange={setShowTestResultDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {testResult.success ? (
                <>
                  <Check className="h-5 w-5 text-green-500" />
                  <span>API Key Test Successful</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span>API Key Test Failed</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>{testResult.message}</DialogDescription>
          </DialogHeader>
          {testResult.response && (
            <div className="py-4">
              <Label>API Response</Label>
              <div className="mt-2 p-3 bg-muted rounded-md font-mono text-xs overflow-x-auto">
                <pre>{testResult.response}</pre>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowTestResultDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
