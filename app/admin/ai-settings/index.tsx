"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Loader2, Save, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ApiKey, LegacyApiKey } from "./types"
import { useAISettings } from "./hooks/use-ai-settings"
import { ApiKeysTab } from "./components/api-keys-tab"

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
  initialApiKeys?: LegacyApiKey[]
}

export default function AISettingsPage({ initialApiKeys = [] }: AISettingsPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterProvider, setFilterProvider] = useState<string>("all")

  const { apiKeys, setApiKeys, addApiKey, updateApiKey, deleteApiKey, refreshApiKeys } = useAISettings({
    initialApiKeys,
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
          <p className="text-muted-foreground mt-1">Manage your AI provider API keys and configurations</p>
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

      {/* API Keys Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-6"
      >
        <ApiKeysTab
          apiKeys={apiKeys}
          setApiKeys={setApiKeys}
          searchQuery={searchQuery}
          filterProvider={filterProvider}
          setSearchQuery={setSearchQuery}
          setFilterProvider={setFilterProvider}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onAddKey={async (keyData: any) => {
            try {
              const success = await addApiKey({
                service_name: keyData.provider,
                key_name: keyData.name,
                encrypted_key: keyData.key,
                is_active: true,
                usage_limit: keyData.usageLimit || null,
                current_usage: 0,
                expires_at: null,
              })
              
              if (success) {
                await refreshApiKeys() // Refresh the list
                return
              }
              throw new Error("Failed to add API key")
            } catch (error) {
              console.error("Error adding API key:", error)
              throw error
            }
          }}
          onUpdateKey={async (keyId: string, updates: any) => {
            try {
              const supabaseUpdates: any = {}
              if (updates.name) supabaseUpdates.key_name = updates.name
              if (updates.key) supabaseUpdates.encrypted_key = updates.key
              if (updates.usageLimit !== undefined) supabaseUpdates.usage_limit = updates.usageLimit
              
              const success = await updateApiKey(keyId, supabaseUpdates)
              
              if (success) {
                await refreshApiKeys() // Refresh the list
                return
              }
              throw new Error("Failed to update API key")
            } catch (error) {
              console.error("Error updating API key:", error)
              throw error
            }
          }}
          onDeleteKey={async (keyId: string) => {
            try {
              const success = await deleteApiKey(keyId)
              
              if (success) {
                await refreshApiKeys() // Refresh the list
                return
              }
              throw new Error("Failed to delete API key")
            } catch (error) {
              console.error("Error deleting API key:", error)
              throw error
            }
          }}
          onToggleKeyActive={async (keyId: string, isActive: boolean) => {
            try {
              const success = await updateApiKey(keyId, { is_active: isActive })
              
              if (success) {
                await refreshApiKeys() // Refresh the list
                return
              }
              throw new Error("Failed to toggle API key status")
            } catch (error) {
              console.error("Error toggling API key status:", error)
              throw error
            }
          }}
          onTestKey={async (key: any) => {
            // For now, simulate testing - you can implement real API testing later
            console.log("Testing key:", key)
            
            // Simulate a delay
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            // Return success or failure randomly for demo
            const success = Math.random() > 0.3
            if (!success) {
              throw new Error("API key test failed")
            }
          }}
        />
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
