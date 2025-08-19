"use client"

import { useState, useCallback } from "react"

export interface AIGeneratedTopic {
  name: string
  description: string
  category: string
  keywords: string[]
  confidence: number
}

export interface AITopicSuggestion {
  topics: AIGeneratedTopic[]
  reasoning: string
  additionalSuggestions?: string[]
}

export function useAITopicGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSupplementing, setIsSupplementing] = useState(false)
  const [generatedTopics, setGeneratedTopics] = useState<AIGeneratedTopic[]>([])
  const [reasoning, setReasoning] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Generate topics based on user input
  const generateTopics = useCallback(async (input: string, count: number = 5) => {
    if (!input.trim() || isGenerating) return

    setIsGenerating(true)
    setError(null)

    try {
      const systemPrompt = `You are an AI topic generator for an English learning platform. Your task is to generate relevant topics and keywords for YouTube video fetching.

      Given user input, generate ${count} diverse and educational topics with the following requirements:
      1. Each topic should be suitable for English learning content
      2. Topics should span different categories (technology, science, business, education, entertainment, health, politics, sports, travel, general)
      3. Each topic should have 3-7 relevant keywords for YouTube search
      4. Provide a confidence score (0-100) for each topic
      5. Include a brief explanation of why these topics are good for English learning

      Categories available: technology, science, business, education, entertainment, health, politics, sports, travel, general

      Response format should be valid JSON:
      {
        "topics": [
          {
            "name": "Topic Name",
            "description": "Brief description of the topic",
            "category": "category_name",
            "keywords": ["keyword1", "keyword2", "keyword3"],
            "confidence": 85
          }
        ],
        "reasoning": "Explanation of why these topics are good for English learning",
        "additionalSuggestions": ["suggestion1", "suggestion2"]
      }`

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Generate ${count} English learning topics based on: "${input}"`,
          systemPrompt
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Request failed with status ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.response

      // Try to parse JSON from AI response with improved error handling
      let parsedData: AITopicSuggestion
      try {
        // First try direct JSON parse
        parsedData = JSON.parse(aiResponse)
      } catch (parseError) {
        try {
          // Try to extract JSON from markdown code blocks
          const jsonMatch = aiResponse.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
          if (jsonMatch) {
            parsedData = JSON.parse(jsonMatch[1])
          } else {
            // Try to find JSON object in the response
            const objectMatch = aiResponse.match(/\{[\s\S]*\}/)
            if (objectMatch) {
              parsedData = JSON.parse(objectMatch[0])
            } else {
              throw new Error('No valid JSON found in response')
            }
          }
        } catch (secondParseError) {
          // Fallback parsing if JSON is malformed
          console.warn('Failed to parse AI response as JSON, attempting fallback parsing:', aiResponse)
          parsedData = parseAIResponseFallback(aiResponse)
        }
      }

      // Validate the parsed data structure
      if (!parsedData || typeof parsedData !== 'object') {
        throw new Error('AI response is not a valid object')
      }

      if (!parsedData.topics || !Array.isArray(parsedData.topics)) {
        throw new Error('Invalid AI response format: missing or invalid topics array')
      }

      if (parsedData.topics.length === 0) {
        throw new Error('AI response contains no topics')
      }

      setGeneratedTopics(parsedData.topics)
      setReasoning(parsedData.reasoning || 'Topics generated successfully')

      return parsedData
    } catch (error) {
      console.error('Error generating topics:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate topics'
      setError(errorMessage)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }, [isGenerating])

  // Supplement existing topics with more suggestions
  const supplementTopics = useCallback(async (existingTopics: AIGeneratedTopic[], additionalContext?: string) => {
    if (isSupplementing) return

    setIsSupplementing(true)
    setError(null)

    try {
      const systemPrompt = `You are an AI topic generator for an English learning platform. You need to supplement existing topics with additional creative suggestions.

      Current topics: ${JSON.stringify(existingTopics.map(t => ({ name: t.name, category: t.category })))}
      
      Generate 3-5 additional topics that:
      1. Complement the existing topics
      2. Cover different categories not yet represented
      3. Are suitable for English learning
      4. Have good keyword diversity
      5. Are engaging and educational

      ${additionalContext ? `Additional context: ${additionalContext}` : ''}

      Response format should be valid JSON with the same structure as before.`

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Generate supplementary topics to complement the existing ones. ${additionalContext || ''}`,
          systemPrompt
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Request failed with status ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.response

      // Parse AI response with better error handling
      let parsedData: AITopicSuggestion
      try {
        // First try direct JSON parse
        parsedData = JSON.parse(aiResponse)
      } catch (parseError) {
        try {
          // Try to extract JSON from markdown code blocks
          const jsonMatch = aiResponse.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
          if (jsonMatch) {
            parsedData = JSON.parse(jsonMatch[1])
          } else {
            // Try to find JSON object in the response
            const objectMatch = aiResponse.match(/\{[\s\S]*\}/)
            if (objectMatch) {
              parsedData = JSON.parse(objectMatch[0])
            } else {
              throw new Error('No valid JSON found in response')
            }
          }
        } catch (secondParseError) {
          // Use fallback parsing
          console.warn('Failed to parse AI response as JSON, using fallback:', aiResponse)
          parsedData = parseAIResponseFallback(aiResponse)
        }
      }

      // Validate the parsed data structure
      if (!parsedData || typeof parsedData !== 'object') {
        throw new Error('AI response is not a valid object')
      }

      if (!parsedData.topics || !Array.isArray(parsedData.topics)) {
        throw new Error('Invalid AI response format: missing or invalid topics array')
      }

      if (parsedData.topics.length === 0) {
        throw new Error('AI response contains no topics')
      }

      // Combine with existing topics
      const combinedTopics = [...generatedTopics, ...parsedData.topics]
      setGeneratedTopics(combinedTopics)
      setReasoning(parsedData.reasoning || 'Additional topics generated successfully')

      return parsedData
    } catch (error) {
      console.error('Error supplementing topics:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to supplement topics'
      setError(errorMessage)
      throw error
    } finally {
      setIsSupplementing(false)
    }
  }, [isSupplementing, generatedTopics])

  // Update a specific generated topic
  const updateGeneratedTopic = useCallback((index: number, updatedTopic: Partial<AIGeneratedTopic>) => {
    setGeneratedTopics(prev => 
      prev.map((topic, i) => 
        i === index ? { ...topic, ...updatedTopic } : topic
      )
    )
  }, [])

  // Remove a generated topic
  const removeGeneratedTopic = useCallback((index: number) => {
    setGeneratedTopics(prev => prev.filter((_, i) => i !== index))
  }, [])

  // Clear all generated topics
  const clearGeneratedTopics = useCallback(() => {
    setGeneratedTopics([])
    setReasoning("")
    setError(null)
  }, [])

  // Reset error state
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    isGenerating,
    isSupplementing,
    generatedTopics,
    reasoning,
    error,
    
    // Actions
    generateTopics,
    supplementTopics,
    updateGeneratedTopic,
    removeGeneratedTopic,
    clearGeneratedTopics,
    clearError,
  }
}

// Fallback parser for when AI response is not proper JSON
function parseAIResponseFallback(response: string): AITopicSuggestion {
  
  const topics: AIGeneratedTopic[] = []
  
  // Try multiple parsing strategies
  
  // Strategy 1: Look for numbered or bulleted lists with topic names
  const listMatches = response.match(/(?:^\s*(?:\d+[\.\)]|\*|\-)\s+([^\n]+))/gm)
  if (listMatches && listMatches.length > 0) {
    listMatches.forEach((match, index) => {
      const name = match.replace(/^\s*(?:\d+[\.\)]|\*|\-)\s+/, '').trim()
      if (name && name.length > 2) {
        topics.push({
          name,
          description: `AI generated topic: ${name}`,
          category: 'general',
          keywords: [name.toLowerCase().replace(/[^\w\s]/g, '').split(' ')[0]],
          confidence: 70
        })
      }
    })
  }
  
  // Strategy 2: Look for topic patterns with colons or quotes
  if (topics.length === 0) {
    const topicPatterns = [
      /(?:topic|name):\s*"([^"]+)"/gi,
      /(?:topic|name):\s*([^\n,]+)/gi,
      /"([^"]{5,50})"/g
    ]
    
    for (const pattern of topicPatterns) {
      const matches = Array.from(response.matchAll(pattern))
      if (matches.length > 0) {
        matches.forEach((match, index) => {
          if (index < 10) { // Limit to 10 topics
            const name = match[1]?.trim()
            if (name && name.length > 2 && name.length < 100) {
              topics.push({
                name,
                description: `AI generated topic: ${name}`,
                category: 'general',
                keywords: [name.toLowerCase().replace(/[^\w\s]/g, '').split(' ')[0]],
                confidence: 65
              })
            }
          }
        })
        if (topics.length > 0) break
      }
    }
  }
  
  // Strategy 3: Split by common delimiters and clean up
  if (topics.length === 0) {
    const lines = response.split(/[\n\r]+/).filter(line => 
      line.trim().length > 5 && 
      line.trim().length < 100 &&
      !line.includes('json') &&
      !line.includes('```') &&
      !line.includes('reasoning') &&
      !line.includes('suggestion')
    )
    
    lines.slice(0, 5).forEach((line, index) => {
      const name = line.trim().replace(/^[\d\.\-\*\s]+/, '').replace(/['"]/g, '')
      if (name && name.length > 2) {
        topics.push({
          name,
          description: `AI generated topic: ${name}`,
          category: 'general',
          keywords: [name.toLowerCase().replace(/[^\w\s]/g, '').split(' ')[0]],
          confidence: 60
        })
      }
    })
  }
  
  // Strategy 4: Generate default topics if nothing found
  if (topics.length === 0) {
    const defaultTopics = [
      'English Grammar Fundamentals',
      'Vocabulary Building',
      'Conversation Practice',
      'Reading Comprehension',
      'Writing Skills'
    ]
    
    defaultTopics.forEach(name => {
      topics.push({
        name,
        description: `AI generated topic: ${name}`,
        category: 'education',
        keywords: [name.toLowerCase().replace(/[^\w\s]/g, '').split(' ')[0]],
        confidence: 50
      })
    })
  }
  
  // Ensure we have valid topics
  const validTopics = topics.filter(topic => 
    topic.name && 
    topic.name.length > 2 && 
    topic.name.length < 100
  ).slice(0, 10) // Limit to 10 topics
  
  return {
    topics: validTopics,
    reasoning: `Topics extracted from AI response using fallback parsing (found ${validTopics.length} topics)`,
    additionalSuggestions: []
  }
}
