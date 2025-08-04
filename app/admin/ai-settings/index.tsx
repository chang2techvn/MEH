"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Key, Loader2, Save, Cpu, HelpCircle, BarChart } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ApiKey, AIModel } from "./types"
import { useAISettings } from "./hooks/use-ai-settings"
import { ApiKeysTab } from "./components/api-keys-tab"
import { AIModelsTab } from "./components/ai-models-tab"
import { UsageAnalyticsTab } from "./components/usage-analytics-tab"

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

interface AISettingsPageProps {
  initialApiKeys?: ApiKey[]
  initialAiModels?: AIModel[]
}

export default function AISettingsPage({ initialApiKeys = [], initialAiModels = [] }: AISettingsPageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("api-keys")
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterProvider, setFilterProvider] = useState<string>("all")
  const [aiProvider, setAiProvider] = useState<string>("gemini")
  const [aiModel, setAiModel] = useState<string>("gemini-pro")
  const [autoEvaluationEnabled, setAutoEvaluationEnabled] = useState(true)
  const [minimumScoreThreshold, setMinimumScoreThreshold] = useState(60)
  const [autoPublishThreshold, setAutoPublishThreshold] = useState(75)
  const [timeRange, setTimeRange] = useState<string>("7d")

  const { apiKeys, aiModels, usageData, setApiKeys, setAiModels, generateUsageData } = useAISettings({
    initialApiKeys,
    initialAiModels,
  })

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
                  <ApiKeysTab
                    apiKeys={apiKeys}
                    setApiKeys={setApiKeys}
                    searchQuery={searchQuery}
                    filterProvider={filterProvider}
                    setSearchQuery={setSearchQuery}
                    setFilterProvider={setFilterProvider}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                  />
                </TabsContent>
              </motion.div>
            )}

            {activeTab === "models" && (
              <motion.div
                key="models"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="models" className="space-y-6 mt-0">
                  <AIModelsTab
                    aiModels={aiModels}
                    setAiModels={setAiModels}
                    searchQuery={searchQuery}
                    filterProvider={filterProvider}
                    setSearchQuery={setSearchQuery}
                    setFilterProvider={setFilterProvider}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                  />
                </TabsContent>
              </motion.div>
            )}

            {activeTab === "usage" && (
              <motion.div
                key="usage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="usage" className="space-y-6 mt-0">
                  <UsageAnalyticsTab
                    usageData={usageData}
                    generateUsageData={generateUsageData}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    timeRange={timeRange}
                    setTimeRange={setTimeRange}
                  />
                </TabsContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
      </motion.div>

      <motion.div variants={fadeInVariants} initial="hidden" animate="visible" className="mt-8 flex justify-end">
        <Button
          className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
          onClick={() => {
            toast({
              title: "Settings saved",
              description: "AI settings have been saved successfully",
            })
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save All Settings
            </>
          )}
        </Button>
      </motion.div>
    </div>
  )
}
