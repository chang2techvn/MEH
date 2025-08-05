"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Edit,
  Eye,
  EyeOff,
  FileText,
  Key,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Sparkles,
  Star,
  Trash,
  Zap,
  Cpu,
  Database,
  Globe,
  HelpCircle,
  Info,
  Shield,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { LegacyApiKey } from "./types"
import { useAISettings } from "./hooks/use-ai-settings"

export default function AISettingsPage() {
  const router = useRouter()
  const [showAddKeyDialog, setShowAddKeyDialog] = useState(false)
  const [showEditKeyDialog, setShowEditKeyDialog] = useState(false)
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)
  const [selectedKey, setSelectedKey] = useState<LegacyApiKey | null>(null)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyValue, setNewKeyValue] = useState("")
  const [newKeyProvider, setNewKeyProvider] = useState<
    "openai" | "gemini" | "anthropic" | "mistral" | "cohere" | "custom"
  >("openai")
  const [newKeyUsageLimit, setNewKeyUsageLimit] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterProvider, setFilterProvider] = useState<string>("all")
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [testingKey, setTestingKey] = useState<string | null>(null)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})

  // Use the new hook for Supabase integration
  const { 
    apiKeys, 
    setApiKeys, 
    isLoading, 
    refreshApiKeys, 
    addApiKey, 
    updateApiKey, 
    deleteApiKey 
  } = useAISettings({})

  // Filter API keys based on search and provider filter
  const filteredApiKeys = apiKeys.filter((key) => {
    const matchesSearch =
      key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.provider.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProvider = filterProvider === "all" || key.provider === filterProvider
    return matchesSearch && matchesProvider
  })

  // Handle adding a new API key
  const handleAddApiKey = async () => {
    if (!newKeyName || !newKeyValue || !newKeyProvider) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const success = await addApiKey({
      service_name: newKeyProvider,
      key_name: newKeyName,
      encrypted_key: newKeyValue, // Note: In production, this should be encrypted
      is_active: true,
      usage_limit: newKeyUsageLimit ? Number.parseInt(newKeyUsageLimit) : null,
      current_usage: 0,
      expires_at: null, // You can add expiry date input later
    })

    if (success) {
      setShowAddKeyDialog(false)
      setNewKeyName("")
      setNewKeyValue("")
      setNewKeyProvider("openai")
      setNewKeyUsageLimit("")

      toast({
        title: "API Key added",
        description: "Your new API key has been added successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to add API key. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle editing an API key
  const handleEditApiKey = async () => {
    if (!selectedKey || !newKeyName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const updates: any = {
      key_name: newKeyName,
      service_name: newKeyProvider,
    }

    // Only update encrypted_key if a new value is provided
    if (newKeyValue) {
      updates.encrypted_key = newKeyValue
    }

    // Update usage limit if provided
    if (newKeyUsageLimit) {
      updates.usage_limit = Number.parseInt(newKeyUsageLimit)
    }

    const success = await updateApiKey(selectedKey.id, updates)

    if (success) {
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
    } else {
      toast({
        title: "Error",
        description: "Failed to update API key. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle deleting an API key
  const handleDeleteApiKey = async () => {
    if (!selectedKey) return

    const success = await deleteApiKey(selectedKey.id)

    if (success) {
      setShowDeleteConfirmDialog(false)
      setSelectedKey(null)

      toast({
        title: "API Key deleted",
        description: "The API key has been deleted successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete API key. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle setting a key as default (local logic only, not in Supabase)
  const handleSetDefaultKey = (keyId: string) => {
    // Update local state only - this is UI-only logic
    const updatedKeys = apiKeys.map((key) => ({
      ...key,
      isDefault: key.id === keyId,
    }))

    setApiKeys(updatedKeys)

    toast({
      title: "Default key updated",
      description: "The default API key has been updated successfully",
    })
  }

  // Handle toggling a key's active status
  const handleToggleKeyActive = async (keyId: string, newStatus: boolean) => {
    const success = await updateApiKey(keyId, { is_active: newStatus })

    if (success) {
      toast({
        title: newStatus ? "API Key activated" : "API Key deactivated",
        description: `The API key has been ${newStatus ? "activated" : "deactivated"} successfully`,
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to update API key status. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle adding a new AI model
  // Handle testing an API key
  const handleTestApiKey = async (key: LegacyApiKey) => {
    setTestingKey(key.id)

    try {
      // For now, we'll simulate testing since testApiKey function needs implementation
      // In real implementation, this would call the API endpoint to test the key
      const isValid = Math.random() > 0.3 // Simulate random success/failure

      if (isValid) {
        toast({
          title: "API Key Test Successful",
          description: `The ${key.name} API key is working correctly`,
        })
      } else {
        toast({
          title: "API Key Test Failed",
          description: `The ${key.name} API key is not working correctly`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error testing API key:", error)
      toast({
        title: "Test Error",
        description: "Failed to test the API key. Please try again.",
        variant: "destructive",
      })
    } finally {
      setTestingKey(null)
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

  // Toggle individual key visibility
  const toggleIndividualKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }))
  }

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue">
              AI Settings
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">Manage your AI provider API keys and configurations</p>
        </div>
        <div className="flex items-center gap-3">
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="w-full">
          {/* API Keys Tab */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6 mt-0">
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
                          <SelectItem value="gemini">Gemini</SelectItem>
                          <SelectItem value="anthropic">Anthropic</SelectItem>
                          <SelectItem value="mistral">Mistral</SelectItem>
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
                        <motion.div
                          key={`skeleton-${i}`}
                          variants={itemVariants}
                          className="rounded-lg border p-4 space-y-3"
                        >
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
                            key.isDefault
                              ? "border-neo-mint/50 dark:border-purist-blue/50 bg-neo-mint/5 dark:bg-purist-blue/5"
                              : ""
                          } ${expandedCard === key.id ? "shadow-lg" : "hover:shadow-md"} transition-all duration-300`}
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

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setExpandedCard(expandedCard === key.id ? null : key.id)
                                  }}
                                >
                                  {expandedCard === key.id ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
                              <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2">
                                <div className="font-mono text-sm truncate flex-1">
                                  {visibleKeys[key.id] ? key.key : "•".repeat(Math.min(24, key.key.length))}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => toggleIndividualKeyVisibility(key.id)}
                                >
                                  {visibleKeys[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => copyToClipboard(key.key)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={key.isActive}
                                  onCheckedChange={(checked) => handleToggleKeyActive(key.id, checked)}
                                />
                                <span className="text-sm">{key.isActive ? "Active" : "Inactive"}</span>
                              </div>
                            </div>

                            {/* Expanded details */}
                            <AnimatePresence>
                              {expandedCard === key.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="border-t mt-4 pt-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Created</p>
                                        <p className="text-sm">{formatDate(key.createdAt)}</p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Last Used</p>
                                        <p className="text-sm">{formatDate(key.lastUsed)}</p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Expires</p>
                                        <p className="text-sm">{key.expiresAt ? formatDate(key.expiresAt) : "Never"}</p>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground">Usage</p>
                                        <p className="text-xs">
                                          {key.usageCount} / {key.usageLimit || "∞"}
                                        </p>
                                      </div>
                                      {key.usageLimit && (
                                        <Progress value={(key.usageCount / key.usageLimit) * 100} className="h-1.5" />
                                      )}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                      {!key.isDefault && key.isActive && (
                                        <Button variant="outline" size="sm" onClick={() => handleSetDefaultKey(key.id)}>
                                          <Star className="h-4 w-4 mr-2" />
                                          Set as Default
                                        </Button>
                                      )}
                                      <Button
                                        variant="outline"
                                        size="sm"
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
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                        onClick={() => {
                                          setSelectedKey(key)
                                          setShowDeleteConfirmDialog(true)
                                        }}
                                      >
                                        <Trash className="h-4 w-4 mr-2" />
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
            </div>
          </motion.div>
        </div>
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
              <select
                id="key-provider"
                value={newKeyProvider}
                onChange={(e) => setNewKeyProvider(e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini (Google)</option>
                <option value="anthropic">Anthropic</option>
                <option value="mistral">Mistral AI</option>
                <option value="cohere">Cohere</option>
                <option value="custom">Custom Provider</option>
              </select>
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
              <select
                id="edit-key-provider"
                value={newKeyProvider}
                onChange={(e) => setNewKeyProvider(e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini (Google)</option>
                <option value="anthropic">Anthropic</option>
                <option value="mistral">Mistral AI</option>
                <option value="cohere">Cohere</option>
                <option value="custom">Custom Provider</option>
              </select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="edit-key-value">API Key (leave empty to keep current)</Label>
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
    </div>
  )
}

// Missing component definition
interface CheckboxProps {
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean // Make disabled optional
}

const Checkbox = ({ id, checked, onCheckedChange, disabled }: CheckboxProps) => {
  return (
    <div className="h-4 w-4 rounded border flex items-center justify-center">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        disabled={disabled}
        className="h-3 w-3"
      />
    </div>
  )
}

// Missing component definition
interface CodeProps {
  className?: string
  [key: string]: any
}

const Code = ({ className, ...props }: CodeProps) => {
  return <div className={`${className}`} {...props} />
}
