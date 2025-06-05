"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database.types"
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
  BarChart,
  Cpu,
  Globe,
  HelpCircle,
  Info,
  Shield,
  Server,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Define types based on our Supabase schema
type ApiKeyRow = Database['public']['Tables']['api_keys']['Row']
type AIModelRow = Database['public']['Tables']['ai_models']['Row']

interface ApiKey extends ApiKeyRow {
  key?: string // For display purposes, we'll mask the actual key
  isDefault?: boolean
}

interface AIModel extends AIModelRow {
  strengths?: string[]
  apiEndpoint?: string
}

interface UsageData {
  date: string
  requests: number
  tokens: number
  cost: number
}

export default function AISettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("api-keys")
  const [isLoading, setIsLoading] = useState(true)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [aiModels, setAiModels] = useState<AIModel[]>([])
  const [usageData, setUsageData] = useState<UsageData[]>([])
  const [showAddKeyDialog, setShowAddKeyDialog] = useState(false)
  const [showEditKeyDialog, setShowEditKeyDialog] = useState(false)
  const [showAddModelDialog, setShowAddModelDialog] = useState(false)
  const [showEditModelDialog, setShowEditModelDialog] = useState(false)
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)
  const [showTestResultDialog, setShowTestResultDialog] = useState(false)
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null)
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyValue, setNewKeyValue] = useState("")
  const [newKeyProvider, setNewKeyProvider] = useState<
    "openai" | "gemini" | "anthropic" | "mistral" | "cohere" | "custom"
  >("openai")
  const [newKeyUsageLimit, setNewKeyUsageLimit] = useState<string>("")
  const [newModelName, setNewModelName] = useState("")
  const [newModelProvider, setNewModelProvider] = useState<
    "openai" | "gemini" | "anthropic" | "mistral" | "cohere" | "custom"
  >("openai")
  const [newModelDescription, setNewModelDescription] = useState("")
  const [newModelCapabilities, setNewModelCapabilities] = useState<string[]>(["text"])
  const [newModelContextLength, setNewModelContextLength] = useState("4096")
  const [newModelCost, setNewModelCost] = useState("0.001")
  const [newModelEndpoint, setNewModelEndpoint] = useState("")
  const [newModelStrengths, setNewModelStrengths] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterProvider, setFilterProvider] = useState<string>("all")
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; response?: string }>({
    success: false,
    message: "",
  })
  const [testingKey, setTestingKey] = useState<string | null>(null)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState("7d")

  // Load data from Supabase
  useEffect(() => {
    loadApiKeys()
    loadAiModels()
    loadUsageData()
  }, [])

  const loadApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('createdAt', { ascending: false })

      if (error) throw error

      // Transform data and mask keys for security
      const transformedKeys: ApiKey[] = data.map(key => ({
        ...key,
        key: `${key.keyHash.substring(0, 8)}...${key.keyHash.substring(key.keyHash.length - 8)}`,
        isDefault: false, // We'll need to implement default key logic
        createdAt: key.createdAt,
        lastUsed: key.lastUsed,
        expiresAt: key.expiresAt,
        usageLimit: key.rateLimit
      }))

      setApiKeys(transformedKeys)
    } catch (error) {
      console.error('Error loading API keys:', error)
      toast({
        title: "Error",
        description: "Failed to load API keys",
        variant: "destructive",
      })
    }
  }

  const loadAiModels = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_models')
        .select('*')
        .order('createdAt', { ascending: false })

      if (error) throw error

      // Transform data to match our interface
      const transformedModels: AIModel[] = data.map(model => ({
        ...model,
        contextLength: model.maxTokens || 4096,
        costPer1kTokens: model.costPerToken || 0.001,
        isEnabled: model.isActive,
        strengths: [], // We'll need to implement strengths logic
        capabilities: model.capabilities || ['text']
      }))

      setAiModels(transformedModels)
    } catch (error) {
      console.error('Error loading AI models:', error)
      toast({
        title: "Error",
        description: "Failed to load AI models",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsageData = () => {
    // For now, we'll generate sample usage data until we implement real usage tracking
    setUsageData(generateUsageData())
  }

  // Sample usage data
  const generateUsageData = () => {
    const data: UsageData[] = []
    const now = new Date()
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90

    for (let i = 0; i < days; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      // Generate random but somewhat realistic data
      const baseRequests = Math.floor(Math.random() * 100) + 50
      const dayOfWeek = date.getDay()
      // Less usage on weekends
      const multiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.6 : 1
      const requests = Math.floor(baseRequests * multiplier)
      const tokensPerRequest = Math.floor(Math.random() * 1000) + 500
      const tokens = requests * tokensPerRequest
      const cost = tokens * 0.00002

      data.push({
        date: dateStr,
        requests,
        tokens,
        cost,
      })
    }

    // Sort by date ascending
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Data loading is now handled by individual functions called in useEffect above

  // Filter API keys based on search and provider filter
  const filteredApiKeys = apiKeys.filter((key) => {
    const matchesSearch =
      key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.provider.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProvider = filterProvider === "all" || key.provider === filterProvider
    return matchesSearch && matchesProvider
  })

  // Filter AI models based on search and provider filter
  const filteredAiModels = aiModels.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProvider = filterProvider === "all" || model.provider === filterProvider
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

    setIsLoading(true)

    try {
      // Hash the key for security (in production, this should be done server-side)
      const keyHash = btoa(newKeyValue).substring(0, 32)
      
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          name: newKeyName,
          provider: newKeyProvider,
          keyHash: keyHash,
          isActive: true,
          usageCount: 0,
          rateLimit: newKeyUsageLimit ? Number.parseInt(newKeyUsageLimit) : null,
          expiresAt: null,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Transform the new key for display
      const newKey: ApiKey = {
        ...data,
        key: `${keyHash.substring(0, 8)}...${keyHash.substring(keyHash.length - 8)}`,
        isDefault: apiKeys.length === 0,
        usageLimit: data.rateLimit,
        createdAt: data.createdAt,
        lastUsed: data.lastUsed,
        expiresAt: data.expiresAt,
      }

      setApiKeys([...apiKeys, newKey])
      setShowAddKeyDialog(false)
      setNewKeyName("")
      setNewKeyValue("")
      setNewKeyProvider("openai")
      setNewKeyUsageLimit("")

      toast({
        title: "API Key added",
        description: "Your new API key has been added successfully",
      })
    } catch (error) {
      console.error('Error adding API key:', error)
      toast({
        title: "Error",
        description: "Failed to add API key. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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

    setIsLoading(true)

    try {
      const updateData: any = {
        name: newKeyName,
        provider: newKeyProvider,
        rateLimit: newKeyUsageLimit ? Number.parseInt(newKeyUsageLimit) : null,
      }

      // Only update keyHash if a new key value is provided
      if (newKeyValue) {
        updateData.keyHash = btoa(newKeyValue).substring(0, 32)
      }

      const { data, error } = await supabase
        .from('api_keys')
        .update(updateData)
        .eq('id', selectedKey.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      const updatedKeys = apiKeys.map((key) => {
        if (key.id === selectedKey.id) {
          return {
            ...key,
            name: newKeyName,
            key: newKeyValue ? `${updateData.keyHash.substring(0, 8)}...${updateData.keyHash.substring(updateData.keyHash.length - 8)}` : key.key,
            provider: newKeyProvider,
            usageLimit: data.rateLimit,
          }
        }
        return key
      })

      setApiKeys(updatedKeys)
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
    } catch (error) {
      console.error('Error updating API key:', error)
      toast({
        title: "Error",
        description: "Failed to update API key. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle deleting an API key
  const handleDeleteApiKey = async () => {
    if (!selectedKey) return

    setIsLoading(true)

    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', selectedKey.id)

      if (error) {
        throw error
      }

      // Update local state
      const updatedKeys = apiKeys.filter((key) => key.id !== selectedKey.id)

      // If we deleted the default key, make another one default
      if (selectedKey.isDefault && updatedKeys.length > 0) {
        updatedKeys[0].isDefault = true
        
        // Update the new default key in database
        await supabase
          .from('api_keys')
          .update({ isDefault: true })
          .eq('id', updatedKeys[0].id)
      }

      setApiKeys(updatedKeys)
      setIsLoading(false)
      setShowDeleteConfirmDialog(false)
      setSelectedKey(null)

      toast({
        title: "API Key deleted",
        description: "The API key has been deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting API key:', error)
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to delete API key. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle setting a key as default
  const handleSetDefaultKey = async (keyId: string) => {
    setIsLoading(true)

    try {
      // First, set all keys to non-default
      await supabase
        .from('api_keys')
        .update({ isDefault: false })
        .neq('id', keyId)

      // Then set the selected key as default
      const { error } = await supabase
        .from('api_keys')
        .update({ isDefault: true })
        .eq('id', keyId)

      if (error) {
        throw error
      }

      // Update local state
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
    } catch (error) {
      console.error('Error setting default key:', error)
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to set default API key. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle toggling a key's active status
  const handleToggleKeyActive = async (keyId: string, newStatus: boolean) => {
    setIsLoading(true)

    try {
      // Update in Supabase
      const { error } = await supabase
        .from('api_keys')
        .update({ isActive: newStatus })
        .eq('id', keyId)

      if (error) {
        throw error
      }

      // Update local state
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
    } catch (error) {
      console.error('Error toggling key status:', error)
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to update API key status. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle adding a new AI model
  const handleAddAiModel = async () => {
    if (!newModelName || !newModelProvider || !newModelDescription) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Insert into Supabase
      const { data, error } = await supabase
        .from('ai_models')
        .insert({
          name: newModelName,
          provider: newModelProvider,
          description: newModelDescription,
          capabilities: newModelCapabilities,
          isActive: true,
          maxTokens: Number.parseInt(newModelContextLength),
          costPerToken: Number.parseFloat(newModelCost),
          configuration: {
            strengths: newModelStrengths,
            apiEndpoint: newModelEndpoint || undefined,
          }
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Create new model object for local state
      const newModel: AIModel = {
        id: data.id,
        name: data.name,
        provider: data.provider,
        description: data.description,
        capabilities: data.capabilities,
        isActive: data.isActive,
        maxTokens: data.maxTokens,
        costPerToken: data.costPerToken,
        modelId: data.modelId,
        version: data.version,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        configuration: data.configuration,
        strengths: data.configuration?.strengths || [],
        apiEndpoint: data.configuration?.apiEndpoint,
      }

      setAiModels([...aiModels, newModel])
      setIsLoading(false)
      setShowAddModelDialog(false)
      resetModelForm()

      toast({
        title: "AI Model added",
        description: "Your new AI model has been added successfully",
      })
    } catch (error) {
      console.error('Error adding AI model:', error)
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to add AI model. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle editing an AI model
  const handleEditAiModel = async () => {
    if (!selectedModel || !newModelName || !newModelDescription) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Update in Supabase
      const { data, error } = await supabase
        .from('ai_models')
        .update({
          name: newModelName,
          provider: newModelProvider,
          description: newModelDescription,
          capabilities: newModelCapabilities,
          maxTokens: Number.parseInt(newModelContextLength),
          costPerToken: Number.parseFloat(newModelCost),
          configuration: {
            strengths: newModelStrengths,
            apiEndpoint: newModelEndpoint || selectedModel.apiEndpoint,
          }
        })
        .eq('id', selectedModel.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Update local state
      const updatedModels = aiModels.map((model) => {
        if (model.id === selectedModel.id) {
          return {
            ...model,
            name: newModelName,
            provider: newModelProvider,
            description: newModelDescription,
            capabilities: newModelCapabilities,
            contextLength: Number.parseInt(newModelContextLength),
            costPer1kTokens: Number.parseFloat(newModelCost),
            strengths: newModelStrengths,
            apiEndpoint: newModelEndpoint || model.apiEndpoint,
          }
        }
        return model
      })

      setAiModels(updatedModels)
      setIsLoading(false)
      setShowEditModelDialog(false)
      setSelectedModel(null)
      resetModelForm()

      toast({
        title: "AI Model updated",
        description: "Your AI model has been updated successfully",
      })
    } catch (error) {
      console.error('Error updating AI model:', error)
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to update AI model. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle toggling a model's enabled status
  const handleToggleModelEnabled = async (modelId: string, newStatus: boolean) => {
    setIsLoading(true)

    try {
      // Update in Supabase
      const { error } = await supabase
        .from('ai_models')
        .update({ isActive: newStatus })
        .eq('id', modelId)

      if (error) {
        throw error
      }

      // Update local state
      const updatedModels = aiModels.map((model) => {
        if (model.id === modelId) {
          return {
            ...model,
            isEnabled: newStatus,
          }
        }
        return model
      })

      setAiModels(updatedModels)
      setIsLoading(false)

      toast({
        title: newStatus ? "Model enabled" : "Model disabled",
        description: `The AI model has been ${newStatus ? "enabled" : "disabled"} successfully`,
      })
    } catch (error) {
      console.error('Error toggling model status:', error)
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to update model status. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Reset model form
  const resetModelForm = () => {
    setNewModelName("")
    setNewModelProvider("openai")
    setNewModelDescription("")
    setNewModelCapabilities(["text"])
    setNewModelContextLength("4096")
    setNewModelCost("0.001")
    setNewModelEndpoint("")
    setNewModelStrengths([])
  }

  // Handle testing an API key
  const handleTestApiKey = async (key: ApiKey) => {
    setTestingKey(key.id)

    try {
      // Validate API key with real API call
      const response = await fetch('/api/ai/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: key.provider,
          apiKey: key.key,
        }),
      })

      const result = await response.json()

      setTestResult({
        success: result.success,
        message: result.success
          ? `API key validated successfully with ${key.provider}`
          : `Failed to validate API key: ${result.error || 'Unknown error'}`,
        response: result.response,
      })

      if (result.success) {
        // Update last used date and usage count in database
        const { error } = await supabase
          .from('api_keys')
          .update({
            lastUsed: new Date().toISOString(),
            usageCount: (key.usageCount || 0) + 1,
          })
          .eq('id', key.id)

        if (error) {
          console.error('Error updating API key usage:', error)
        } else {
          // Update local state
          const updatedKeys = apiKeys.map((k) => {
            if (k.id === key.id) {
              return {
                ...k,
                lastUsed: new Date().toISOString(),
                usageCount: (k.usageCount || 0) + 1,
              }
            }
            return k
          })
          setApiKeys(updatedKeys)
        }
      }
    } catch (error) {
      console.error('Error testing API key:', error)
      setTestResult({
        success: false,
        message: `Network error while testing ${key.provider} API key`,
        response: undefined,
      })
    } finally {
      setTestingKey(null)
      setShowTestResultDialog(true)
    }
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
  const formatDate = (date: Date | string | null) => {
    if (!date) return "Never"
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj)
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
        return <Server className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  // Get capability badge
  const getCapabilityBadge = (capability: string) => {
    switch (capability) {
      case "text":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800"
          >
            <FileText className="h-3 w-3 mr-1" />
            Text
          </Badge>
        )
      case "image":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800"
          >
            <Eye className="h-3 w-3 mr-1" />
            Vision
          </Badge>
        )
      case "code":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800"
          >
            <Code className="h-3 w-3 mr-1" />
            Code
          </Badge>
        )
      default:
        return <Badge variant="outline">{capability}</Badge>
    }
  }

  // Toggle API key visibility
  const toggleApiKeyVisibility = () => {
    setShowApiKeys(!showApiKeys)
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

  // Calculate total usage
  const calculateTotalUsage = () => {
    const totalRequests = usageData.reduce((sum, day) => sum + day.requests, 0)
    const totalTokens = usageData.reduce((sum, day) => sum + day.tokens, 0)
    const totalCost = usageData.reduce((sum, day) => sum + day.cost, 0)

    return {
      requests: totalRequests,
      tokens: totalTokens,
      cost: totalCost,
    }
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
          <p className="text-muted-foreground mt-1">Manage your AI providers, API keys, and model configurations</p>
        </div>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => router.push("/admin/ai-documentation")}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Documentation
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View documentation on AI integration</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            size="sm"
            className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
          >
            <Shield className="h-4 w-4 mr-2" />
            AI Safety Settings
          </Button>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger
              value="api-keys"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
            >
              <Key className="h-4 w-4" />
              <span>API Keys</span>
            </TabsTrigger>
            <TabsTrigger
              value="models"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
            >
              <Cpu className="h-4 w-4" />
              <span>AI Models</span>
            </TabsTrigger>
            <TabsTrigger
              value="usage"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
            >
              <BarChart className="h-4 w-4" />
              <span>Usage Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* API Keys Tab */}
          <AnimatePresence mode="wait">
            {activeTab === "api-keys" && (
              <motion.div
                key="api-keys"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="api-keys" className="space-y-6 mt-0">
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
                                  {showApiKeys ? (key.key || "•••••••••••••••••••••••") : "•".repeat(Math.min(24, (key.key || "•••••••••••••••••••••••").length))}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={toggleApiKeyVisibility}
                                >
                                  {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => copyToClipboard(key.key || "")}
                                  disabled={!key.key}
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
                                    </div>                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <p className="text-xs text-muted-foreground">Usage</p>
                                          <p className="text-xs">
                                            {key.usageCount} / {key.rateLimit || "∞"}
                                          </p>
                                        </div>
                                        {key.rateLimit && (
                                          <Progress value={(key.usageCount / key.rateLimit) * 100} className="h-1.5" />
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
                                          setNewKeyProvider(key.provider as "openai" | "gemini" | "anthropic" | "mistral" | "cohere" | "custom")
                                          setNewKeyUsageLimit(key.rateLimit ? key.rateLimit.toString() : "")
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
                </TabsContent>
              </motion.div>
            )}

            {/* AI Models Tab */}
            {activeTab === "models" && (
              <motion.div
                key="models"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="models" className="space-y-6 mt-0">
                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search AI models..."
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
                      <Button onClick={() => setShowAddModelDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Model
                      </Button>
                    </div>
                  </div>

                  {/* AI Models Grid */}
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {isLoading ? (
                      // Loading skeletons
                      Array.from({ length: 6 }).map((_, i) => (
                        <motion.div
                          key={`skeleton-${i}`}
                          variants={itemVariants}
                          className="rounded-lg border p-4 space-y-3"
                        >
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <div className="flex gap-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                        </motion.div>
                      ))
                    ) : filteredAiModels.length === 0 ? (
                      // Empty state
                      <motion.div
                        variants={fadeInVariants}
                        className="text-center py-12 border rounded-lg col-span-full"
                      >
                        <Cpu className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                        <h3 className="mt-4 text-lg font-medium">No AI models found</h3>
                        <p className="text-muted-foreground mt-2 mb-4">
                          {searchQuery || filterProvider !== "all"
                            ? "Try adjusting your search or filters"
                            : "Add your first AI model to get started"}
                        </p>
                        <Button onClick={() => setShowAddModelDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add AI Model
                        </Button>
                      </motion.div>
                    ) : (
                      // AI models grid
                      filteredAiModels.map((model) => (
                        <motion.div
                          key={model.id}
                          variants={itemVariants}
                          className={`rounded-lg border ${
                            model.isActive ? "" : "bg-gray-50 dark:bg-gray-900/50 opacity-75"
                          } hover:shadow-md transition-all duration-300`}
                        >
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${getProviderColor(
                                    model.provider,
                                  )}`}
                                >
                                  {getProviderIcon(model.provider)}
                                </div>
                                <h3 className="font-medium">{model.name}</h3>
                              </div>
                              <Switch
                                checked={model.isActive}
                                onCheckedChange={(checked) => handleToggleModelEnabled(model.id, checked)}
                              />
                            </div>

                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{model.description}</p>

                            <div className="flex flex-wrap gap-2 mt-3">
                              {model.capabilities?.map((capability) => (
                                <div key={capability}>{getCapabilityBadge(capability)}</div>
                              ))}
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <div>
                                <span className="block">Context Length</span>
                                <span className="font-medium text-foreground">
                                  {formatNumber(model.maxTokens || 0)} tokens
                                </span>
                              </div>
                              <div>
                                <span className="block">Cost per 1K tokens</span>
                                <span className="font-medium text-foreground">${model.costPerToken?.toFixed(6)}</span>
                              </div>
                            </div>

                            <Accordion type="single" collapsible className="mt-3">
                              <AccordionItem value="strengths" className="border-b-0">
                                <AccordionTrigger className="py-2 text-sm">Strengths & Capabilities</AccordionTrigger>
                                <AccordionContent>
                                  <ul className="text-xs space-y-1 text-muted-foreground">
                                    {model.strengths?.map((strength, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <Check className="h-3 w-3 mt-0.5 text-green-500" />
                                        <span>{strength}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>

                            <div className="flex gap-2 mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => {
                                  setSelectedModel(model)
                                  setNewModelName(model.name)
                                  setNewModelProvider(model.provider as any)
                                  setNewModelDescription(model.description || "")
                                  setNewModelCapabilities(model.capabilities || ["text"])
                                  setNewModelContextLength(model.maxTokens?.toString() || "4096")
                                  setNewModelCost(model.costPerToken?.toString() || "0.001")
                                  setNewModelStrengths(model.strengths || [])
                                  setNewModelEndpoint(model.apiEndpoint || "")
                                  setShowEditModelDialog(true)
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex-1"
                                      onClick={() => {
                                        toast({
                                          title: "Model documentation",
                                          description: `Viewing documentation for ${model.name}`,
                                        })
                                      }}
                                    >
                                      <Info className="h-4 w-4 mr-2" />
                                      Docs
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View model documentation</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                </TabsContent>
              </motion.div>
            )}

            {/* Usage Analytics Tab */}
            {activeTab === "usage" && (
              <motion.div
                key="usage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="usage" className="space-y-6 mt-0">
                  {/* Time Range Selector */}
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Usage Analytics</h2>
                    <div className="flex items-center gap-2">
                      <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Time range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7d">Last 7 days</SelectItem>
                          <SelectItem value="30d">Last 30 days</SelectItem>
                          <SelectItem value="90d">Last 90 days</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={() => setTimeRange(timeRange)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </div>

                  {/* Usage Stats Cards */}
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                  >
                    {isLoading ? (
                      // Loading skeletons
                      Array.from({ length: 3 }).map((_, i) => (
                        <motion.div
                          key={`skeleton-${i}`}
                          variants={itemVariants}
                          className="rounded-lg border p-4 space-y-3"
                        >
                          <Skeleton className="h-6 w-32" />
                          <Skeleton className="h-8 w-24" />
                          <Skeleton className="h-4 w-full" />
                        </motion.div>
                      ))
                    ) : (
                      // Usage stats cards
                      <>
                        <motion.div
                          variants={itemVariants}
                          className="rounded-lg border p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
                        >
                          <h3 className="text-sm font-medium text-muted-foreground">Total Requests</h3>
                          <p className="text-2xl font-bold mt-1">{formatNumber(calculateTotalUsage().requests)}</p>
                          <div className="mt-2">
                            <Progress value={75} className="h-1.5" />
                          </div>
                        </motion.div>
                        <motion.div
                          variants={itemVariants}
                          className="rounded-lg border p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
                        >
                          <h3 className="text-sm font-medium text-muted-foreground">Total Tokens</h3>
                          <p className="text-2xl font-bold mt-1">{formatNumber(calculateTotalUsage().tokens)}</p>
                          <div className="mt-2">
                            <Progress value={60} className="h-1.5" />
                          </div>
                        </motion.div>
                        <motion.div
                          variants={itemVariants}
                          className="rounded-lg border p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
                        >
                          <h3 className="text-sm font-medium text-muted-foreground">Total Cost</h3>
                          <p className="text-2xl font-bold mt-1">{formatCurrency(calculateTotalUsage().cost)}</p>
                          <div className="mt-2">
                            <Progress value={40} className="h-1.5" />
                          </div>
                        </motion.div>
                      </>
                    )}
                  </motion.div>

                  {/* Usage Chart */}
                  <motion.div
                    variants={fadeInVariants}
                    className="rounded-lg border p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
                  >
                    <h3 className="text-lg font-medium mb-4">Usage Over Time</h3>
                    {isLoading ? (
                      <Skeleton className="h-[300px] w-full" />
                    ) : (
                      <div className="h-[300px] w-full relative">
                        {/* Chart visualization */}
                        <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
                          {usageData.map((day, i) => (
                            <motion.div
                              key={i}
                              className="relative group"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: `${(day.requests / 100) * 80}%` }}
                              transition={{ delay: i * 0.03, duration: 0.5, type: "spring" }}
                            >
                              <div className="w-2 sm:w-3 bg-gradient-to-t from-purist-blue to-neo-mint rounded-t-md group-hover:w-3 sm:group-hover:w-4 transition-all duration-200"></div>
                              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-foreground text-background text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {day.date.split("-")[2]}/{day.date.split("-")[1]}: {day.requests} requests
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-border"></div>
                      </div>
                    )}
                  </motion.div>

                  {/* Usage by Provider */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      variants={fadeInVariants}
                      className="rounded-lg border p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
                    >
                      <h3 className="text-lg font-medium mb-4">Usage by Provider</h3>
                      {isLoading ? (
                        <Skeleton className="h-[200px] w-full" />
                      ) : (
                        <div className="h-[200px] w-full relative">
                          {/* Pie chart visualization */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-32 h-32">
                              <motion.div
                                className="absolute inset-0 rounded-full border-8 border-t-neo-mint border-r-purist-blue border-b-cassis border-l-mellow-yellow"
                                initial={{ rotate: 0 }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 100, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                              ></motion.div>
                              <div className="absolute inset-2 bg-background rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold">100%</span>
                              </div>
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 flex justify-around">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-neo-mint"></div>
                              <span className="text-xs">OpenAI (45%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-purist-blue"></div>
                              <span className="text-xs">Gemini (30%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-cassis"></div>
                              <span className="text-xs">Others (25%)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>

                    <motion.div
                      variants={fadeInVariants}
                      className="rounded-lg border p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
                    >
                      <h3 className="text-lg font-medium mb-4">Usage by Model</h3>
                      {isLoading ? (
                        <Skeleton className="h-[200px] w-full" />
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>GPT-4o</span>
                              <span>42%</span>
                            </div>
                            <Progress value={42} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Gemini Pro</span>
                              <span>28%</span>
                            </div>
                            <Progress value={28} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>GPT-3.5 Turbo</span>
                              <span>18%</span>
                            </div>
                            <Progress value={18} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Claude 3</span>
                              <span>8%</span>
                            </div>
                            <Progress value={8} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Others</span>
                              <span>4%</span>
                            </div>
                            <Progress value={4} className="h-2" />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Cost Breakdown */}
                  <motion.div
                    variants={fadeInVariants}
                    className="rounded-lg border p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
                  >
                    <h3 className="text-lg font-medium mb-4">Cost Breakdown</h3>
                    {isLoading ? (
                      <Skeleton className="h-[200px] w-full" />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-4 text-sm font-medium">Provider</th>
                              <th className="text-left py-2 px-4 text-sm font-medium">Model</th>
                              <th className="text-right py-2 px-4 text-sm font-medium">Requests</th>
                              <th className="text-right py-2 px-4 text-sm font-medium">Tokens</th>
                              <th className="text-right py-2 px-4 text-sm font-medium">Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="py-2 px-4 text-sm">OpenAI</td>
                              <td className="py-2 px-4 text-sm">GPT-4o</td>
                              <td className="py-2 px-4 text-sm text-right">1,245</td>
                              <td className="py-2 px-4 text-sm text-right">2.4M</td>
                              <td className="py-2 px-4 text-sm text-right font-medium">$24.00</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 px-4 text-sm">OpenAI</td>
                              <td className="py-2 px-4 text-sm">GPT-3.5 Turbo</td>
                              <td className="py-2 px-4 text-sm text-right">3,567</td>
                              <td className="py-2 px-4 text-sm text-right">5.2M</td>
                              <td className="py-2 px-4 text-sm text-right font-medium">$7.80</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 px-4 text-sm">Google</td>
                              <td className="py-2 px-4 text-sm">Gemini Pro</td>
                              <td className="py-2 px-4 text-sm text-right">2,890</td>
                              <td className="py-2 px-4 text-sm text-right">4.1M</td>
                              <td className="py-2 px-4 text-sm text-right font-medium">$10.25</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 px-4 text-sm">Anthropic</td>
                              <td className="py-2 px-4 text-sm">Claude 3</td>
                              <td className="py-2 px-4 text-sm text-right">845</td>
                              <td className="py-2 px-4 text-sm text-right">1.8M</td>
                              <td className="py-2 px-4 text-sm text-right font-medium">$27.00</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 px-4 text-sm">Mistral</td>
                              <td className="py-2 px-4 text-sm">Mistral Large</td>
                              <td className="py-2 px-4 text-sm text-right">432</td>
                              <td className="py-2 px-4 text-sm text-right">0.9M</td>
                              <td className="py-2 px-4 text-sm text-right font-medium">$7.20</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-4 text-sm font-medium" colSpan={2}>
                                Total
                              </td>
                              <td className="py-2 px-4 text-sm text-right font-medium">8,979</td>
                              <td className="py-2 px-4 text-sm text-right font-medium">14.4M</td>
                              <td className="py-2 px-4 text-sm text-right font-bold">$76.25</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </motion.div>
                </TabsContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
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
    </div>
  )
}

// Custom Checkbox component with proper TypeScript types
interface CheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
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
  className?: string;
  [key: string]: any;
}

const Code = ({ className, ...props }: CodeProps) => {
  return <div className={`${className}`} {...props} />
}
