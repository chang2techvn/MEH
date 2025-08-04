"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ChallengeTable from "./challenge-table"
import ChallengeGrid from "./challenge-grid"
import type { Challenge } from "@/app/actions/challenge-videos"
import type { ViewMode } from "../types"

interface ChallengeTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  viewMode: ViewMode
  filteredChallenges: Challenge[]
  formatDuration: (seconds: number) => string
  formatDate: (dateString: string) => string
  onEdit: (challenge: Challenge) => void
  onDelete: (challenge: Challenge) => void
  onView: (challenge: Challenge) => void
  selectedChallenges: string[]
  toggleSelection: (id: string) => void
  toggleSelectAll: () => void
  allSelected: boolean
}

export default function ChallengeTabs({
  activeTab,
  onTabChange,
  viewMode,
  filteredChallenges,
  formatDuration,
  formatDate,
  onEdit,
  onDelete,
  onView,
  selectedChallenges,
  toggleSelection,
  toggleSelectAll,
  allSelected,
}: ChallengeTabsProps) {
  const renderChallengeView = () => {
    if (viewMode === "table") {
      return (
        <ChallengeTable
          challenges={filteredChallenges}
          formatDuration={formatDuration}
          formatDate={formatDate}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          selectedChallenges={selectedChallenges}
          toggleSelection={toggleSelection}
          toggleSelectAll={toggleSelectAll}
          allSelected={allSelected}
        />
      )
    } else {
      return (
        <ChallengeGrid
          challenges={filteredChallenges}
          formatDuration={formatDuration}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          selectedChallenges={selectedChallenges}
          toggleSelection={toggleSelection}
        />
      )
    }
  }

  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger
          value="all"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
        >
          All Challenges
        </TabsTrigger>
        <TabsTrigger
          value="beginner"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
        >
          Beginner
        </TabsTrigger>
        <TabsTrigger
          value="intermediate"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
        >
          Intermediate
        </TabsTrigger>
        <TabsTrigger
          value="advanced"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
        >
          Advanced
        </TabsTrigger>
      </TabsList>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <TabsContent value="all" className="mt-6">
            {renderChallengeView()}
          </TabsContent>
          <TabsContent value="beginner" className="mt-6">
            {renderChallengeView()}
          </TabsContent>
          <TabsContent value="intermediate" className="mt-6">
            {renderChallengeView()}
          </TabsContent>
          <TabsContent value="advanced" className="mt-6">
            {renderChallengeView()}
          </TabsContent>
        </motion.div>
      </AnimatePresence>
    </Tabs>
  )
}
