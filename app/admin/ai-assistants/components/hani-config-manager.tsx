"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, RefreshCw, Camera, Bot, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/hooks/use-toast'
import { useSystemConfig } from '@/hooks/use-system-config'
import { singleChatService } from '@/lib/single-chat-service'
import type { DefaultAssistantConfig } from '@/types/system-config.types'

export function HaniConfigManager() {
  const { defaultAssistant, isLoading, error, updateDefaultAssistant, refreshConfig } = useSystemConfig()
  const [formData, setFormData] = useState<DefaultAssistantConfig>({
    id: '',
    name: '',
    avatar: '',
    role: '',
    field: '',
    prompt: '',
    model: ''
  })
  const [isSaving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Update form when defaultAssistant changes
  useEffect(() => {
    if (defaultAssistant) {
      setFormData(defaultAssistant)
      setHasChanges(false)
    }
  }, [defaultAssistant])

  // Check for changes
  useEffect(() => {
    if (defaultAssistant) {
      const changed = JSON.stringify(formData) !== JSON.stringify(defaultAssistant)
      setHasChanges(changed)
    }
  }, [formData, defaultAssistant])

  const handleInputChange = (field: keyof DefaultAssistantConfig, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.avatar.trim() || !formData.prompt.trim()) {
      toast({
        title: "Validation Error",
        description: "Name, avatar, and prompt are required fields",
        variant: "destructive"
      })
      return
    }

    try {
      setSaving(true)
      const success = await updateDefaultAssistant(formData)
      
      if (success) {
        // Clear the single chat service cache to refresh with new config
        singleChatService.clearConfigCache()
        
        toast({
          title: "Configuration Updated",
          description: "Default AI assistant configuration has been updated successfully",
          variant: "default"
        })
        setHasChanges(false)
        
        // Force a UI update by temporarily clearing and setting form data
        const updatedData = { ...formData }
        setFormData({ ...updatedData })
      } else {
        throw new Error('Failed to update configuration')
      }
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err instanceof Error ? err.message : "Failed to update configuration",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleRefresh = () => {
    refreshConfig()
    toast({
      title: "Configuration Refreshed",
      description: "Reloaded configuration from database",
      variant: "default"
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Default AI Assistant Configuration
          </CardTitle>
          <CardDescription>
            Configure the default AI assistant used across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading configuration...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Default AI Assistant Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading configuration: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Default AI Assistant Configuration
              </CardTitle>
              <CardDescription>
                Configure the default AI assistant used in chatbox and resources pages
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="secondary" className="text-orange-600">
                  Unsaved Changes
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isSaving}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-16 w-16" key={`avatar-${formData.avatar}`}>
              <AvatarImage src={formData.avatar} alt={formData.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                {formData.name.slice(0, 2).toUpperCase() || 'AI'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{formData.name || 'Assistant Name'}</h3>
              <p className="text-muted-foreground">{formData.role} • {formData.field}</p>
              <Badge variant="outline" className="mt-1">{formData.model}</Badge>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Assistant Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter assistant name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                placeholder="e.g., Assistant, Tutor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="field">Field</Label>
              <Input
                id="field"
                value={formData.field}
                onChange={(e) => handleInputChange('field', e.target.value)}
                placeholder="e.g., Assistant, Education"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">AI Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder="e.g., gemini-2.5-flash"
              />
            </div>
          </div>

          {/* Avatar URL */}
          <div className="space-y-2">
            <Label htmlFor="avatar" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Avatar URL *
            </Label>
            <Input
              id="avatar"
              value={formData.avatar}
              onChange={(e) => handleInputChange('avatar', e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">System Prompt *</Label>
            <Textarea
              id="prompt"
              value={formData.prompt}
              onChange={(e) => handleInputChange('prompt', e.target.value)}
              placeholder="Enter the system prompt that defines the assistant's personality and behavior"
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This prompt defines how the AI assistant behaves and responds to users
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || isSaving}
              className="min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}