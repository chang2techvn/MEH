"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { Assistant } from "./types"
import { useAssistants } from "./hooks/use-assistants"
import { useAssistantFilters } from "./hooks/use-assistant-filters"
import { useAssistantForm } from "./hooks/use-assistant-form"
import { AssistantHeader } from "./components/assistant-header"
import { AssistantFiltersComponent } from "./components/assistant-filters"
import { AssistantGrid } from "./components/assistant-grid"
import { AssistantPagination } from "./components/assistant-pagination"
import { AssistantFormDialog } from "./components/assistant-form-dialog"
import { AssistantViewDialog } from "./components/assistant-view-dialog"
import { AssistantDeleteDialog } from "./components/assistant-delete-dialog"
import { CreateCharacterModal } from "./components/create-character-modal"

export default function AIAssistantsPage() {
  const { assistants, isLoading, addAssistant, updateAssistant, deleteAssistant, toggleAssistantActive } =
    useAssistants()
  
  const { filters, paginatedAssistants, totalPages, handleSort, updateFilters } = useAssistantFilters(assistants)
  const { 
    formData, 
    formErrors, 
    resetForm, 
    validateForm, 
    updateFormData, 
    handleCapabilityToggle, 
    handlePersonalityToggle,
    handleTagAdd,
    handleTagRemove,
    setFormData 
  } = useAssistantForm()

  // Dialog states
  const [showCreateCharacterDialog, setShowCreateCharacterDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null)

  const handleAddClick = () => {
    setShowCreateCharacterDialog(true)
  }

  const handleEditClick = (assistant: Assistant) => {
    setSelectedAssistant(assistant)
    setFormData({
      name: assistant.name,
      description: assistant.description,
      model: assistant.model.toLowerCase().replace(/\s+/g, "-"),
      systemPrompt: assistant.systemPrompt,
      capabilities: assistant.capabilities,
      category: assistant.category,
      isActive: assistant.isActive,
      avatar: assistant.avatar,
      personalityTraits: assistant.personalityTraits,
      responseThreshold: assistant.responseThreshold,
      field: assistant.field,
      role: assistant.role,
      experience: assistant.experience,
      tags: assistant.tags,
    })
    setShowEditDialog(true)
  }

  const handleViewClick = (assistant: Assistant) => {
    setSelectedAssistant(assistant)
    setShowViewDialog(true)
  }

  const handleDeleteClick = (assistant: Assistant) => {
    setSelectedAssistant(assistant)
    setShowDeleteDialog(true)
  }

  const handleAddAssistant = async () => {
    if (!validateForm()) return
    await addAssistant(formData)
    setShowEditDialog(false)
    resetForm()
  }

  const handleEditAssistant = async () => {
    if (!selectedAssistant || !validateForm()) return
    await updateAssistant(selectedAssistant.id, formData)
    setShowEditDialog(false)
    resetForm()
  }

  const handleDeleteAssistant = async () => {
    if (!selectedAssistant) return
    await deleteAssistant(selectedAssistant.id)
    setShowDeleteDialog(false)
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col space-y-6">
        <AssistantHeader onAddClick={handleAddClick} />

        <AssistantFiltersComponent 
          filters={filters} 
          onFiltersChange={updateFilters} 
          onSort={handleSort}
          assistants={assistants}
        />

        <AssistantGrid
          assistants={paginatedAssistants}
          isLoading={isLoading}
          onToggleActive={toggleAssistantActive}
          onView={handleViewClick}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onAddClick={handleAddClick}
          searchQuery={filters.searchQuery}
        />

        <AssistantPagination
          currentPage={filters.currentPage}
          totalPages={totalPages}
          itemsPerPage={filters.itemsPerPage}
          onPageChange={(page) => updateFilters({ currentPage: page })}
          onItemsPerPageChange={(itemsPerPage) => updateFilters({ itemsPerPage, currentPage: 1 })}
        />
      </div>

      {/* Dialogs */}
      <CreateCharacterModal
        open={showCreateCharacterDialog}
        onOpenChange={setShowCreateCharacterDialog}
        onSuccess={() => {
          // Refresh assistants list or add new assistant to state
          window.location.reload()
        }}
      />

      <AssistantFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        title="Edit Assistant"
        description="Update your AI assistant configuration."
        formData={formData}
        formErrors={formErrors}
        isLoading={isLoading}
        onFormDataChange={updateFormData}
        onCapabilityToggle={handleCapabilityToggle}
        onPersonalityToggle={handlePersonalityToggle}
        onTagAdd={handleTagAdd}
        onTagRemove={handleTagRemove}
        onSubmit={handleEditAssistant}
        submitLabel="Save Changes"
      />

      <AssistantViewDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        assistant={selectedAssistant}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      <AssistantDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        assistant={selectedAssistant}
        isLoading={isLoading}
        onConfirm={handleDeleteAssistant}
      />
    </motion.div>
  )
}
