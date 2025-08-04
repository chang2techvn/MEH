"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import type { AssistantFormData, FormErrors } from "../types"
import { modelOptions, categoryOptions, capabilityOptions } from "../constants"

interface AssistantFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  formData: AssistantFormData
  formErrors: FormErrors
  isLoading: boolean
  onFormDataChange: (updates: Partial<AssistantFormData>) => void
  onCapabilityToggle: (capability: string) => void
  onSubmit: () => void
  submitLabel: string
}

export function AssistantFormDialog({
  open,
  onOpenChange,
  title,
  description,
  formData,
  formErrors,
  isLoading,
  onFormDataChange,
  onCapabilityToggle,
  onSubmit,
  submitLabel,
}: AssistantFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assistant-name">Name</Label>
              <Input
                id="assistant-name"
                placeholder="Enter assistant name"
                value={formData.name}
                onChange={(e) => onFormDataChange({ name: e.target.value })}
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assistant-model">AI Model</Label>
              <Select value={formData.model} onValueChange={(value) => onFormDataChange({ model: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="assistant-description">Description</Label>
              <Textarea
                id="assistant-description"
                placeholder="Enter a brief description"
                rows={2}
                value={formData.description}
                onChange={(e) => onFormDataChange({ description: e.target.value })}
                className={formErrors.description ? "border-red-500" : ""}
              />
              {formErrors.description && <p className="text-xs text-red-500">{formErrors.description}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="assistant-prompt">System Prompt</Label>
              <Textarea
                id="assistant-prompt"
                placeholder="Define how your assistant should behave"
                rows={5}
                value={formData.systemPrompt}
                onChange={(e) => onFormDataChange({ systemPrompt: e.target.value })}
                className={formErrors.systemPrompt ? "border-red-500" : ""}
              />
              {formErrors.systemPrompt && <p className="text-xs text-red-500">{formErrors.systemPrompt}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Capabilities</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {capabilityOptions.map((capability) => (
                <Badge
                  key={capability.value}
                  variant={formData.capabilities.includes(capability.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => onCapabilityToggle(capability.value)}
                >
                  {capability.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assistant-category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => onFormDataChange({ category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-end">
              <div className="flex items-center space-x-2">
                <Switch
                  id="assistant-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => onFormDataChange({ isActive: checked })}
                />
                <Label htmlFor="assistant-active" className="cursor-pointer">
                  Active
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isLoading}
            className="bg-gradient-to-r from-neo-mint to-purist-blue hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {submitLabel === "Create Assistant" ? "Creating..." : "Saving..."}
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
