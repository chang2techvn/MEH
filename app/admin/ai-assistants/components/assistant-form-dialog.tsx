"use client"

import { useState } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, X, Upload, Sparkles, Settings, User, Target } from "lucide-react"
import type { AssistantFormData, FormErrors } from "../types"
import { 
  modelOptions, 
  categoryOptions, 
  capabilityOptions, 
  fieldOptions,
  roleOptions,
  experienceOptions,
  personalityOptions
} from "../constants"

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
  onPersonalityToggle: (trait: string) => void
  onTagAdd: (tag: string) => void
  onTagRemove: (tag: string) => void
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
  onPersonalityToggle,
  onTagAdd,
  onTagRemove,
  onSubmit,
  submitLabel,
}: AssistantFormDialogProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [newTag, setNewTag] = useState("")

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      onTagAdd(newTag.trim())
      setNewTag("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] p-0">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-5 h-5 text-blue-500" />
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="px-6 py-3 border-b bg-muted/30">
                <TabsList className="grid w-full grid-cols-4 bg-background">
                  <TabsTrigger value="basic" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Basic Info</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </TabsTrigger>
                  <TabsTrigger value="capabilities" className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span className="hidden sm:inline">Capabilities</span>
                  </TabsTrigger>
                  <TabsTrigger value="personality" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">Personality</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1 px-6">
                <div className="py-6">
                  <TabsContent value="basic" className="space-y-6 mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Basic Information</CardTitle>
                        <CardDescription>
                          Essential details about your AI assistant
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1 space-y-2">
                            <Label htmlFor="assistant-name">Assistant Name *</Label>
                            <Input
                              id="assistant-name"
                              placeholder="e.g., Grammar Expert, Speaking Coach"
                              value={formData.name}
                              onChange={(e) => onFormDataChange({ name: e.target.value })}
                              className={formErrors.name ? "border-red-500" : ""}
                            />
                            {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
                          </div>
                          
                          <div className="space-y-2 sm:w-32">
                            <Label>Avatar</Label>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={formData.avatar} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                  {formData.name.slice(0, 2).toUpperCase() || "AI"}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="assistant-avatar">Avatar URL</Label>
                          <Input
                            id="assistant-avatar"
                            placeholder="https://example.com/avatar.jpg"
                            value={formData.avatar || ""}
                            onChange={(e) => onFormDataChange({ avatar: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="assistant-description">Description *</Label>
                          <Textarea
                            id="assistant-description"
                            placeholder="Describe what this assistant does and how it helps users"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => onFormDataChange({ description: e.target.value })}
                            className={formErrors.description ? "border-red-500" : ""}
                          />
                          {formErrors.description && <p className="text-xs text-red-500">{formErrors.description}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Category</Label>
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

                          <div className="space-y-2">
                            <Label>Field</Label>
                            <Select value={formData.field} onValueChange={(value) => onFormDataChange({ field: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                              <SelectContent>
                                {fieldOptions.map((field) => (
                                  <SelectItem key={field.value} value={field.value}>
                                    {field.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={formData.role} onValueChange={(value) => onFormDataChange({ role: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                {roleOptions.map((role) => (
                                  <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-6 mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">AI Model & Configuration</CardTitle>
                        <CardDescription>
                          Configure the AI model and response settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>AI Model</Label>
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

                          <div className="space-y-2">
                            <Label>Experience Level</Label>
                            <Select value={formData.experience} onValueChange={(value) => onFormDataChange({ experience: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select experience" />
                              </SelectTrigger>
                              <SelectContent>
                                {experienceOptions.map((exp) => (
                                  <SelectItem key={exp.value} value={exp.value}>
                                    {exp.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Response Threshold ({formData.responseThreshold})</Label>
                          <Slider
                            value={[formData.responseThreshold]}
                            onValueChange={([value]) => onFormDataChange({ responseThreshold: value })}
                            max={1}
                            min={0}
                            step={0.1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Conservative</span>
                            <span>Balanced</span>
                            <span>Creative</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div className="space-y-0.5">
                            <Label className="text-base font-medium">Active Assistant</Label>
                            <p className="text-sm text-muted-foreground">
                              Make this assistant available to users
                            </p>
                          </div>
                          <Switch
                            checked={formData.isActive}
                            onCheckedChange={(checked) => onFormDataChange({ isActive: checked })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="assistant-prompt">System Prompt *</Label>
                          <Textarea
                            id="assistant-prompt"
                            placeholder="Define how your assistant should behave, its personality, and guidelines for responses..."
                            rows={6}
                            value={formData.systemPrompt}
                            onChange={(e) => onFormDataChange({ systemPrompt: e.target.value })}
                            className={formErrors.systemPrompt ? "border-red-500" : ""}
                          />
                          {formErrors.systemPrompt && <p className="text-xs text-red-500">{formErrors.systemPrompt}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="capabilities" className="space-y-6 mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Capabilities & Skills</CardTitle>
                        <CardDescription>
                          Select the skills and capabilities this assistant can help with
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                          {capabilityOptions.map((capability) => (
                            <Badge
                              key={capability.value}
                              variant={formData.capabilities.includes(capability.value) ? "default" : "outline"}
                              className="cursor-pointer p-2 justify-center text-center transition-all hover:scale-105"
                              onClick={() => onCapabilityToggle(capability.value)}
                            >
                              {capability.label}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Tags</CardTitle>
                        <CardDescription>
                          Add custom tags to help categorize and find this assistant
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a tag..."
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleAddTag}
                            disabled={!newTag.trim() || formData.tags.includes(newTag.trim())}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1 px-3 py-1"
                            >
                              {tag}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="w-4 h-4 p-0 hover:bg-transparent"
                                onClick={() => onTagRemove(tag)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="personality" className="space-y-6 mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Personality Traits</CardTitle>
                        <CardDescription>
                          Define the personality characteristics for more natural interactions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                          {personalityOptions.map((trait) => (
                            <Badge
                              key={trait.value}
                              variant={formData.personalityTraits.includes(trait.value) ? "default" : "outline"}
                              className="cursor-pointer p-2 justify-center text-center transition-all hover:scale-105"
                              onClick={() => onPersonalityToggle(trait.value)}
                            >
                              {trait.label}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
          </div>

          <Separator />
          
          <DialogFooter className="px-6 py-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${activeTab === "basic" ? "bg-blue-500" : "bg-muted"}`} />
                  <div className={`w-2 h-2 rounded-full ${activeTab === "settings" ? "bg-blue-500" : "bg-muted"}`} />
                  <div className={`w-2 h-2 rounded-full ${activeTab === "capabilities" ? "bg-blue-500" : "bg-muted"}`} />
                  <div className={`w-2 h-2 rounded-full ${activeTab === "personality" ? "bg-blue-500" : "bg-muted"}`} />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={onSubmit}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
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
              </div>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
