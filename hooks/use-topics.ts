import { useState, useEffect, useCallback } from "react"
import { toast } from "@/hooks/use-toast"

export interface Topic {
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

export interface TopicFormData {
  name: string
  description: string
  category: string
  keywords: string
  weight: number
  is_active: boolean
}

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load all topics
  const loadTopics = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/topics')
      if (!response.ok) {
        throw new Error('Failed to load topics')
      }
      const data = await response.json()
      setTopics(data.topics || [])
      return data.topics || []
    } catch (error) {
      console.error('Error loading topics:', error)
      toast({
        title: "Error",
        description: "Failed to load topics",
        variant: "destructive",
      })
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Get active topics only
  const getActiveTopics = useCallback(() => {
    return topics.filter(topic => topic.is_active)
  }, [topics])

  // Get topics by category
  const getTopicsByCategory = useCallback((category: string) => {
    return topics.filter(topic => topic.category === category && topic.is_active)
  }, [topics])

  // Get random topic for video generation
  const getRandomTopic = useCallback(() => {
    const activeTopics = getActiveTopics()
    if (activeTopics.length === 0) return null

    // Use weight to influence selection probability
    const weightedTopics = activeTopics.flatMap(topic => 
      Array(topic.weight).fill(topic)
    )

    const randomIndex = Math.floor(Math.random() * weightedTopics.length)
    return weightedTopics[randomIndex]
  }, [getActiveTopics])

  // Get random keywords from active topics
  const getRandomKeywords = useCallback((count: number = 3) => {
    const activeTopics = getActiveTopics()
    const allKeywords = activeTopics.flatMap(topic => topic.keywords)
    
    if (allKeywords.length === 0) return []

    // Shuffle and take specified count
    const shuffled = [...allKeywords].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }, [getActiveTopics])

  // Create new topic
  const createTopic = useCallback(async (topicData: Omit<TopicFormData, 'keywords'> & { keywords: string[] }) => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/admin/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(topicData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create topic')
      }

      const result = await response.json()
      
      toast({
        title: "Success",
        description: "Topic created successfully",
      })

      // Refresh topics list
      await loadTopics()
      return result.topic

    } catch (error) {
      console.error('Error creating topic:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create topic',
        variant: "destructive",
      })
      throw error
    } finally {
      setSaving(false)
    }
  }, [loadTopics])

  // Update existing topic
  const updateTopic = useCallback(async (id: string, topicData: Omit<TopicFormData, 'keywords'> & { keywords: string[] }) => {
    try {
      setSaving(true)
      
      const response = await fetch(`/api/admin/topics/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(topicData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update topic')
      }

      const result = await response.json()
      
      toast({
        title: "Success",
        description: "Topic updated successfully",
      })

      // Refresh topics list
      await loadTopics()
      return result.topic

    } catch (error) {
      console.error('Error updating topic:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update topic',
        variant: "destructive",
      })
      throw error
    } finally {
      setSaving(false)
    }
  }, [loadTopics])

  // Delete topic
  const deleteTopic = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/topics/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete topic')
      }

      toast({
        title: "Success",
        description: "Topic deleted successfully",
      })

      // Refresh topics list
      await loadTopics()

    } catch (error) {
      console.error('Error deleting topic:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete topic',
        variant: "destructive",
      })
      throw error
    }
  }, [loadTopics])

  // Bulk operations
  const bulkImportTopics = useCallback(async (topicsData: any[]) => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/admin/topics/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operation: 'import', topics: topicsData }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to import topics')
      }

      const result = await response.json()
      
      toast({
        title: "Bulk Import Success",
        description: `Imported ${result.results?.success || 0} topics successfully`,
      })

      // Refresh topics list
      await loadTopics()
      return result

    } catch (error) {
      console.error('Error importing topics:', error)
      toast({
        title: "Import Error",
        description: error instanceof Error ? error.message : 'Failed to import topics',
        variant: "destructive",
      })
      throw error
    } finally {
      setSaving(false)
    }
  }, [loadTopics])

  // Update topic usage (when used for video generation)
  const updateTopicUsage = useCallback(async (id: string) => {
    try {
      // This would typically be handled by the video generation service
      // For now, we'll just increment the usage count
      const topic = topics.find(t => t.id === id)
      if (topic) {
        await updateTopic(id, {
          name: topic.name,
          description: topic.description || '',
          category: topic.category,
          keywords: topic.keywords,
          weight: topic.weight,
          is_active: topic.is_active
        })
      }
    } catch (error) {
      console.error('Error updating topic usage:', error)
    }
  }, [topics, updateTopic])

  // Load topics on mount
  useEffect(() => {
    loadTopics()
  }, [loadTopics])

  return {
    topics,
    loading,
    saving,
    loadTopics,
    getActiveTopics,
    getTopicsByCategory,
    getRandomTopic,
    getRandomKeywords,
    createTopic,
    updateTopic,
    deleteTopic,
    bulkImportTopics,
    updateTopicUsage,
  }
}
