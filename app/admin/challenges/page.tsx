"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { challengeTopics } from "@/app/actions/challenge-videos"
import { Challenge } from "@/lib/utils/challenge-constants"
import ChallengeDetailView from "@/components/admin/challenge-detail-view"
import CreateChallengeModal from "@/components/challenge/create-challenge-modal"
import EditChallengeModal from "./components/edit-challenge-modal"
import DeleteChallengeModal from "./components/delete-challenge-modal"
import ChallengeHeader from "./components/challenge-header"
import ChallengeFiltersComponent from "./components/challenge-filters"
import BulkActionsBar from "./components/bulk-actions-bar"
import ChallengeTabs from "./components/challenge-tabs"
import LoadingSpinner from "./components/loading-spinner"
import { useChallengeState } from "./hooks/use-challenge-state"
import { useChallengeActions } from "./hooks/use-challenge-actions"
import { useBulkActions } from "./hooks/use-bulk-actions"
import { formatDuration, formatDate } from "./utils/format-utils"
import { ANIMATION_VARIANTS } from "./constants"
import type { ChallengeFilters, ViewMode } from "./types"

export default function AdminChallengesPage() {
  // State management
  const {
    challenges,
    setChallenges,
    filteredChallenges,
    loading,
    refreshing,
    lastRefreshed,
    autoRefresh,
    setAutoRefresh,
    refreshChallenges,
    filterChallenges,
  } = useChallengeState()

  const {
    formState,
    formError,
    formLoading,
    currentChallenge,
    setCurrentChallenge,
    handleYoutubeUrlChange,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    resetForm,
    prepareEditForm,
  } = useChallengeActions(challenges, setChallenges)

  const {
    selectedChallenges,
    bulkActionOpen,
    setBulkActionOpen,
    toggleChallengeSelection,
    toggleSelectAll,
    handleBulkDelete,
    handleBulkChangeDifficulty,
    clearSelection,
  } = useBulkActions(challenges, setChallenges, filteredChallenges)

  // UI state
  const [filters, setFilters] = useState<ChallengeFilters>({
    searchTerm: "",
    activeTab: "all",
    sortOrder: "newest",
    selectedTopics: [],
  })
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  // Get all available topics
  const allTopics = [
    ...new Set([
      ...challengeTopics,
    ]),
  ].sort()

  // Filter challenges when filters change
  useEffect(() => {
    filterChallenges(filters)
  }, [filters, filterChallenges])

  // Event handlers
  const handleCreateChallenge = () => {
    resetForm()
    setCreateModalOpen(true)
  }

  const handleEditChallenge = (challenge: any) => {
    prepareEditForm(challenge)
    setEditModalOpen(true)
  }

  const handleDeleteChallenge = (challenge: any) => {
    setCurrentChallenge(challenge)
    setDeleteModalOpen(true)
  }

  const handleViewChallenge = (challenge: any) => {
    setCurrentChallenge(challenge)
    setViewMode("detail")
  }

  const handleBackFromDetail = () => {
    setViewMode("table")
    setCurrentChallenge(null)
  }

  const submitCreateForm = () => {
    if (createChallenge()) {
      setCreateModalOpen(false)
    }
  }

  const submitEditForm = () => {
    if (updateChallenge()) {
      setEditModalOpen(false)
    }
  }

  const confirmDeleteChallenge = () => {
    if (currentChallenge && deleteChallenge(currentChallenge)) {
      setDeleteModalOpen(false)
    }
  }

  // Show detail view if selected
  if (viewMode === "detail" && currentChallenge) {
    return (
      <motion.div initial="hidden" animate="visible" variants={ANIMATION_VARIANTS.fadeIn}>
        <ChallengeDetailView
          challenge={currentChallenge}
          onEdit={handleEditChallenge}
          onBack={handleBackFromDetail}
          onDelete={handleDeleteChallenge}
        />
      </motion.div>
    )
  }

  // Show loading state
  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={ANIMATION_VARIANTS.fadeIn} className="space-y-6">
      <ChallengeHeader
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        refreshing={refreshing}
        onRefresh={refreshChallenges}
        onCreateChallenge={handleCreateChallenge}
        lastRefreshed={lastRefreshed}
      />

      <ChallengeFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        allTopics={allTopics}
      />

      <BulkActionsBar
        selectedCount={selectedChallenges.length}
        bulkActionOpen={bulkActionOpen}
        setBulkActionOpen={setBulkActionOpen}
        onBulkChangeDifficulty={handleBulkChangeDifficulty}
        onBulkDelete={handleBulkDelete}
        onClearSelection={clearSelection}
      />

      <ChallengeTabs
        activeTab={filters.activeTab}
        onTabChange={(tab) => setFilters({ ...filters, activeTab: tab })}
        viewMode={viewMode}
        filteredChallenges={filteredChallenges}
        formatDuration={formatDuration}
        formatDate={formatDate}
        onEdit={handleEditChallenge}
        onDelete={handleDeleteChallenge}
        onView={handleViewChallenge}
        selectedChallenges={selectedChallenges}
        toggleSelection={toggleChallengeSelection}
        toggleSelectAll={toggleSelectAll}
        allSelected={selectedChallenges.length === filteredChallenges.length && filteredChallenges.length > 0}
      />

      {/* Modals */}
      <CreateChallengeModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen} 
        onChallengeCreated={(challenge: Challenge) => {
          // Add the new challenge to the list
        }} 
      />

      <EditChallengeModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        formState={formState}
        formError={formError}
        formLoading={formLoading}
        allTopics={allTopics}
        onSubmit={submitEditForm}
        onYoutubeUrlChange={handleYoutubeUrlChange}
      />

      <DeleteChallengeModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        challenge={currentChallenge}
        onConfirm={confirmDeleteChallenge}
      />
    </motion.div>
  )
}
