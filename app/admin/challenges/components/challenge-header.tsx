"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, RefreshCw } from "lucide-react"
import { ANIMATION_VARIANTS } from "../constants"

interface ChallengeHeaderProps {
  autoRefresh: boolean
  setAutoRefresh: (value: boolean) => void
  refreshing: boolean
  onRefresh: () => void
  onCreateChallenge: () => void
  lastRefreshed?: string | null
}

export default function ChallengeHeader({
  autoRefresh,
  setAutoRefresh,
  refreshing,
  onRefresh,
  onCreateChallenge,
  lastRefreshed,
}: ChallengeHeaderProps) {
  return (
    <>
      <motion.div
        variants={ANIMATION_VARIANTS.slideUp}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-neo-mint to-purist-blue bg-clip-text text-transparent">
            Challenge Management
          </h1>
          <p className="text-muted-foreground mt-1">Create, edit, and manage learning challenges for your users</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} id="auto-refresh" />
            <Label htmlFor="auto-refresh" className="text-sm cursor-pointer">
              Auto-refresh daily
            </Label>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            size="sm"
            onClick={onCreateChallenge}
            className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Challenge
          </Button>
        </div>
      </motion.div>

      {lastRefreshed && (
        <motion.div variants={ANIMATION_VARIANTS.slideUp} className="text-sm text-muted-foreground">
          Last refreshed: {new Date(lastRefreshed).toLocaleString()}
        </motion.div>
      )}
    </>
  )
}
