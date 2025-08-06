"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Plus, Search, Trash2, Edit2, Tag, TrendingUp, Bot, Sparkles } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AITopicGenerator } from "@/components/admin/ai-topic-generator"

// Animation variants
const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

interface Topic {
  id: string
  name: string
  description?: string
  category: string
  keywords: string[]
  is_active: boolean
  weight: number
  usage_count: number
  last_used_at?: string
  created_at: string
  updated_at: string
}

interface TopicsManagementTabProps {
  onUpdate?: () => void
}

export function TopicsManagementTab({ onUpdate }: TopicsManagementTabProps) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isAddingTopic, setIsAddingTopic] = useState(false)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  // Form states for new/edit topic
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "general",
    keywords: "",
    weight: 1,
    is_active: true
  })

  const categories = [
    "general",
    "technology", 
    "science",
    "business",
    "education",
    "entertainment",
    "health",
    "politics",
    "sports",
    "travel"
  ]

  // Load topics from database
  const loadTopics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/topics')
      if (!response.ok) {
        throw new Error('Failed to load topics')
      }
      const data = await response.json()
      setTopics(data.topics || [])
    } catch (error) {
      console.error('Error loading topics:', error)
      toast({
        title: "Error",
        description: "Failed to load topics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Save topic (create or update)
  const saveTopic = async () => {
    try {
      setSaving(true)
      
      // Validate required fields
      if (!formData.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Topic name is required",
          variant: "destructive",
        })
        return
      }

      const keywordsArray = formData.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0)

      const topicData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        keywords: keywordsArray,
        weight: formData.weight,
        is_active: formData.is_active
      }

      const url = editingTopic 
        ? `/api/admin/topics/${editingTopic.id}`
        : '/api/admin/topics'
      
      const method = editingTopic ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(topicData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save topic')
      }

      toast({
        title: "Success",
        description: `Topic ${editingTopic ? 'updated' : 'created'} successfully`,
      })

      // Reset form and refresh topics
      resetForm()
      await loadTopics()
      onUpdate?.()

    } catch (error) {
      console.error('Error saving topic:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to save topic',
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Delete topic
  const deleteTopic = async (topicId: string) => {
    try {
      const response = await fetch(`/api/admin/topics/${topicId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete topic')
      }

      toast({
        title: "Success",
        description: "Topic deleted successfully",
      })

      await loadTopics()
      onUpdate?.()

    } catch (error) {
      console.error('Error deleting topic:', error)
      toast({
        title: "Error",
        description: "Failed to delete topic",
        variant: "destructive",
      })
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "general",
      keywords: "",
      weight: 1,
      is_active: true
    })
    setIsAddingTopic(false)
    setEditingTopic(null)
    setIsEditModalOpen(false)
  }

  // Handle AI-generated topic addition
  const handleAITopicAdd = async (aiTopic: { name: string; description: string; category: string; keywords: string[] }) => {
    try {
      setSaving(true)
      
      const topicData = {
        name: aiTopic.name.trim(),
        description: aiTopic.description?.trim() || null,
        category: aiTopic.category,
        keywords: aiTopic.keywords,
        weight: 5, // Default weight for AI-generated topics
        is_active: true
      }

      const response = await fetch('/api/admin/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(topicData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save AI-generated topic')
      }

      await loadTopics()
      onUpdate?.()

    } catch (error) {
      console.error('Error saving AI-generated topic:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to save AI-generated topic',
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Edit topic
  const startEditTopic = (topic: Topic) => {
    setFormData({
      name: topic.name,
      description: topic.description || "",
      category: topic.category,
      keywords: topic.keywords.join(', '),
      weight: topic.weight,
      is_active: topic.is_active
    })
    setEditingTopic(topic)
    setIsEditModalOpen(true)
  }

  // Bulk import topics
  const handleBulkImport = async (bulkText: string) => {
    try {
      setSaving(true)
      
      const lines = bulkText.split('\n').filter(line => line.trim())
      const topicsToCreate = []

      for (const line of lines) {
        const parts = line.split('|').map(p => p.trim())
        const name = parts[0]
        const category = parts[1] || 'general'
        const keywords = parts[2] ? parts[2].split(',').map(k => k.trim()) : []
        const description = parts[3] || ''

        if (name) {
          topicsToCreate.push({
            name,
            category,
            keywords,
            description,
            weight: 1,
            is_active: true
          })
        }
      }

      if (topicsToCreate.length === 0) {
        throw new Error('No valid topics found in the input')
      }

      const response = await fetch('/api/admin/topics/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topics: topicsToCreate }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to import topics')
      }

      const result = await response.json()

      toast({
        title: "Bulk Import Success",
        description: `Successfully imported ${result.created} topics`,
      })

      await loadTopics()
      onUpdate?.()

    } catch (error) {
      console.error('Error importing topics:', error)
      toast({
        title: "Import Error",
        description: error instanceof Error ? error.message : 'Failed to import topics',
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Filter topics
  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || topic.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Load topics on mount
  useEffect(() => {
    loadTopics()
  }, [])

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={slideUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Topics & Keywords Management
            </CardTitle>
            <CardDescription>
              Manage topics and keywords for YouTube video fetching. Topics will be randomly selected for daily video generation.
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Controls */}
      <motion.div variants={slideUp}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search topics or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Add Topic Button */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowAIGenerator(!showAIGenerator)}
                  variant={showAIGenerator ? "default" : "outline"}
                  className="flex items-center gap-2"
                >
                  <Bot className="h-4 w-4" />
                  AI Generator
                  {showAIGenerator && <Sparkles className="h-3 w-3 text-yellow-400" />}
                </Button>
                <Button 
                  onClick={() => setIsAddingTopic(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Topic
                </Button>
              </div>
            </div>

            {/* Bulk Import */}
            <details className="mb-4">
              <summary className="cursor-pointer text-sm font-medium mb-2 hover:text-primary">
                Bulk Import Topics (Advanced)
              </summary>
              <div className="space-y-2">
                <Label>Bulk Import Format (one per line): Name|Category|Keywords|Description</Label>
                <Textarea
                  placeholder="AI Technology|technology|artificial intelligence,machine learning,AI|Latest AI developments
Climate Change|science|global warming,environment,sustainability|Environmental topics"
                  rows={3}
                  id="bulk-import"
                />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const textarea = document.getElementById('bulk-import') as HTMLTextAreaElement
                    if (textarea.value.trim()) {
                      handleBulkImport(textarea.value)
                      textarea.value = ''
                    }
                  }}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Import Topics
                </Button>
              </div>
            </details>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Topic Generator */}
      {showAIGenerator && (
        <motion.div variants={slideUp}>
          <AITopicGenerator
            onTopicsGenerated={(topics) => {
              // Optional: Handle bulk topics if needed
            }}
            onAddTopic={handleAITopicAdd}
            categories={categories}
          />
        </motion.div>
      )}

      {/* Edit Topic Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTopic ? 'Edit Topic' : 'Add New Topic'}</DialogTitle>
            <DialogDescription>
              {editingTopic ? 'Update the topic information below.' : 'Create a new topic for the video library.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="topic-name">Topic Name *</Label>
              <Input
                id="topic-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Artificial Intelligence"
              />
            </div>

            <div>
              <Label htmlFor="topic-category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="topic-description">Description</Label>
              <Input
                id="topic-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="topic-keywords">Keywords (comma-separated)</Label>
              <Textarea
                id="topic-keywords"
                value={formData.keywords}
                onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                placeholder="e.g., AI, machine learning, artificial intelligence"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="topic-weight">Weight (1-10)</Label>
              <Input
                id="topic-weight"
                type="number"
                min="1"
                max="10"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: parseInt(e.target.value) || 1 }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="topic-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="topic-active">Active</Label>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={saveTopic} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingTopic ? 'Update' : 'Create'} Topic
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Topics List */}
      <motion.div variants={slideUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Topics List ({filteredTopics.length})</span>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-2 p-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredTopics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No topics found. {searchTerm ? 'Try adjusting your search.' : 'Add your first topic to get started.'}
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto border-t">
                <div className="divide-y">
                  {filteredTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{topic.name}</h4>
                          <div className="flex gap-1 flex-shrink-0">
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5">{topic.category}</Badge>
                            {!topic.is_active && <Badge variant="destructive" className="text-xs px-1.5 py-0.5">Inactive</Badge>}
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 flex items-center gap-1">
                              <TrendingUp className="h-2.5 w-2.5" />
                              {topic.weight}
                            </Badge>
                          </div>
                        </div>
                        {topic.description && (
                          <p className="text-xs text-muted-foreground mb-1 line-clamp-1">{topic.description}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                            {topic.keywords.slice(0, 3).map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-xs px-1 py-0 h-4">
                                {keyword}
                              </Badge>
                            ))}
                            {topic.keywords.length > 3 && (
                              <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                                +{topic.keywords.length - 3}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex-shrink-0">
                            {topic.usage_count} uses
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => startEditTopic(topic)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this topic?')) {
                              deleteTopic(topic.id)
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
