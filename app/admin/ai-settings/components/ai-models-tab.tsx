"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Check,
  Edit,
  Loader2,
  Plus,
  Save,
  Search,
  Sparkles,
  Zap,
  Globe,
  Cpu,
  Database,
  HelpCircle,
  Info,
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
import { motion } from "framer-motion"
import type { AIModel } from "../types"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface AIModelsTabProps {
  aiModels: AIModel[]
  setAiModels: (aiModels: AIModel[]) => void
  searchQuery: string
  filterProvider: string
  setSearchQuery: (searchQuery: string) => void
  setFilterProvider: (filterProvider: string) => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
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
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
}

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

const getProviderColor = (provider: string) => {
  switch (provider) {
    case "openai":
      return "bg-green-500"
    case "gemini":
      return "bg-blue-500"
    case "anthropic":
      return "bg-red-500"
    case "mistral":
      return "bg-orange-500"
    case "cohere":
      return "bg-purple-500"
    default:
      return "bg-gray-500"
  }
}

const getProviderIcon = (provider: string) => {
  switch (provider) {
    case "openai":
      return <Sparkles className="h-4 w-4 text-white" />
    case "gemini":
      return <Globe className="h-4 w-4 text-white" />
    case "anthropic":
      return <Cpu className="h-4 w-4 text-white" />
    case "mistral":
      return <Zap className="h-4 w-4 text-white" />
    case "cohere":
      return <Database className="h-4 w-4 text-white" />
    default:
      return <HelpCircle className="h-4 w-4 text-white" />
  }
}

const getCapabilityBadge = (capability: string) => {
  switch (capability) {
    case "text":
      return <div className="rounded-full px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium">Text</div>
    case "image":
      return <div className="rounded-full px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium">Image</div>
    case "code":
      return <div className="rounded-full px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium">Code</div>
    default:
      return <div className="rounded-full px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium">{capability}</div>
  }
}

const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export const AIModelsTab: React.FC<AIModelsTabProps> = ({
  aiModels,
  setAiModels,
  searchQuery,
  filterProvider,
  setSearchQuery,
  setFilterProvider,
  isLoading,
  setIsLoading,
}) => {
  const [showAddModelDialog, setShowAddModelDialog] = useState(false)
  const [showEditModelDialog, setShowEditModelDialog] = useState(false)
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)
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

  // Filter AI models based on search and provider filter
  const filteredAiModels = aiModels.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProvider = filterProvider === "all" || model.provider === filterProvider
    return matchesSearch && matchesProvider
  })

  // Handle adding a new AI model
  const handleAddAiModel = () => {
    if (!newModelName || !newModelProvider || !newModelDescription) {
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
      const newModel: AIModel = {
        id: `model${aiModels.length + 1}`,
        name: newModelName,
        provider: newModelProvider,
        description: newModelDescription,
        capabilities: newModelCapabilities,
        isEnabled: true,
        contextLength: Number.parseInt(newModelContextLength),
        costPer1kTokens: Number.parseFloat(newModelCost),
        strengths: newModelStrengths,
        apiEndpoint: newModelEndpoint || undefined,
      }

      setAiModels([...aiModels, newModel])
      setIsLoading(false)
      setShowAddModelDialog(false)
      resetModelForm()

      toast({
        title: "AI Model added",
        description: "Your new AI model has been added successfully",
      })
    }, 1000)
  }

  // Handle editing an AI model
  const handleEditAiModel = () => {
    if (!selectedModel || !newModelName || !newModelDescription) {
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
    }, 1000)
  }

  // Handle toggling a model's enabled status
  const handleToggleModelEnabled = (modelId: string, newStatus: boolean) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
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
    }, 500)
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

  return (
    <>
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
              <SelectItem value="gemini">Gemini (Google)</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
              <SelectItem value="mistral">Mistral AI</SelectItem>
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
            <motion.div key={`skeleton-${i}`} variants={itemVariants} className="rounded-lg border p-4 space-y-3">
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
          <motion.div variants={fadeInVariants} className="text-center py-12 border rounded-lg col-span-full">
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
                model.isEnabled ? "" : "bg-gray-50 dark:bg-gray-900/50 opacity-75"
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
                    checked={model.isEnabled}
                    onCheckedChange={(checked) => handleToggleModelEnabled(model.id, checked)}
                  />
                </div>

                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{model.description}</p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {model.capabilities.map((capability) => (
                    <div key={capability}>{getCapabilityBadge(capability)}</div>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="block">Context Length</span>
                    <span className="font-medium text-foreground">{formatNumber(model.contextLength)} tokens</span>
                  </div>
                  <div>
                    <span className="block">Cost per 1K tokens</span>
                    <span className="font-medium text-foreground">${model.costPer1kTokens.toFixed(4)}</span>
                  </div>
                </div>

                <Accordion type="single" collapsible className="mt-3">
                  <AccordionItem value="strengths" className="border-b-0">
                    <AccordionTrigger className="py-2 text-sm">Strengths & Capabilities</AccordionTrigger>
                    <AccordionContent>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        {model.strengths.map((strength, i) => (
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
                      setNewModelProvider(model.provider)
                      setNewModelDescription(model.description)
                      setNewModelCapabilities(model.capabilities)
                      setNewModelContextLength(model.contextLength.toString())
                      setNewModelCost(model.costPer1kTokens.toString())
                      setNewModelStrengths(model.strengths)
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
    </>
  )
}
