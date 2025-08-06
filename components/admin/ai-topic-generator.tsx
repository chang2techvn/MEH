"use client"

/* eslint-disable bem/classname */

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Loader2, 
  Sparkles, 
  Bot, 
  Plus, 
  RefreshCw, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  Wand2
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAITopicGenerator, type AIGeneratedTopic } from "@/hooks/use-ai-topic-generator"

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

interface AITopicGeneratorProps {
  onTopicsGenerated: (topics: AIGeneratedTopic[]) => void
  onAddTopic: (topic: Omit<AIGeneratedTopic, 'confidence'>) => void
  categories: string[]
}

export function AITopicGenerator({ onTopicsGenerated, onAddTopic, categories }: AITopicGeneratorProps) {
  const [userInput, setUserInput] = useState("")
  const [topicCount, setTopicCount] = useState(5)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const {
    isGenerating,
    isSupplementing,
    generatedTopics,
    reasoning,
    error,
    generateTopics,
    supplementTopics,
    updateGeneratedTopic,
    removeGeneratedTopic,
    clearGeneratedTopics,
    clearError
  } = useAITopicGenerator()

  const handleGenerate = async () => {
    if (!userInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a topic idea or description",
        variant: "destructive",
      })
      return
    }

    try {
      await generateTopics(userInput, topicCount)
      toast({
        title: "Topics Generated!",
        description: `Generated ${topicCount} topics based on your input`,
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate topics. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSupplement = async () => {
    try {
      await supplementTopics(generatedTopics, userInput)
      toast({
        title: "Topics Supplemented!",
        description: "Added more topic suggestions",
      })
    } catch (error) {
      toast({
        title: "Supplement Failed",
        description: "Failed to supplement topics. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditTopic = (index: number, field: keyof AIGeneratedTopic, value: any) => {
    updateGeneratedTopic(index, { [field]: value })
  }

  const handleAddTopicToDB = (topic: AIGeneratedTopic) => {
    const { confidence, ...topicData } = topic
    onAddTopic(topicData)
    toast({
      title: "Topic Added",
      description: `"${topic.name}" has been added to your topics`,
    })
  }

  const handleAddAllTopics = () => {
    generatedTopics.forEach(topic => {
      const { confidence, ...topicData } = topic
      onAddTopic(topicData)
    })
    toast({
      title: "All Topics Added",
      description: `Added ${generatedTopics.length} topics to your collection`,
    })
    clearGeneratedTopics()
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600 bg-green-50 border-green-200"
    if (confidence >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* AI Generator Header */}
      <motion.div variants={slideUp}>
        <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Bot className="h-5 w-5 text-blue-600" />
              </motion.div>
              AI Topic Generator
              <Badge variant="secondary" className="ml-2">
                <Sparkles className="h-3 w-3 mr-1" />
                Powered by Gemini
              </Badge>
            </CardTitle>
            <CardDescription>
              Let AI generate relevant topics and keywords for your English learning platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Input Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="ai-input">Topic Idea or Theme</Label>
                  <Textarea
                    id="ai-input"
                    placeholder="e.g., Modern technology trends, Environmental awareness, Business communication..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                </div>
                <div>
                  <Label htmlFor="topic-count">Number of Topics</Label>
                  <Select value={topicCount.toString()} onValueChange={(value) => setTopicCount(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 topics</SelectItem>
                      <SelectItem value="5">5 topics</SelectItem>
                      <SelectItem value="8">8 topics</SelectItem>
                      <SelectItem value="10">10 topics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col justify-end">
                  <Button 
                    onClick={handleGenerate} 
                    disabled={isGenerating || !userInput.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate Topics
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Quick Suggestions */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Quick ideas:</span>
                {[
                  "AI and Technology",
                  "Climate Change Solutions",
                  "Career Development",
                  "Health and Wellness",
                  "Cultural Exchange"
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setUserInput(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Generation Error</span>
                  <Button variant="ghost" size="sm" onClick={clearError} className="ml-auto">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Topics */}
      <AnimatePresence>
        {generatedTopics.length > 0 && (
          <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Generated Topics ({generatedTopics.length})
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSupplement}
                      disabled={isSupplementing}
                    >
                      {isSupplementing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Add More
                    </Button>
                    <Button onClick={handleAddAllTopics} size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Add All
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearGeneratedTopics}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </CardTitle>
                {reasoning && (
                  <CardDescription className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>{reasoning}</span>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  <div className="divide-y p-4 space-y-3">
                    {generatedTopics.map((topic, index) => (
                      <motion.div
                        key={`${topic.name}-${index}`}
                        variants={slideUp}
                        className="pt-3 first:pt-0"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 mr-4">
                            {editingIndex === index ? (
                              <div className="space-y-2">
                                <Input
                                  value={topic.name}
                                  onChange={(e) => handleEditTopic(index, 'name', e.target.value)}
                                  className="font-medium text-sm"
                                />
                                <Input
                                  value={topic.description}
                                  onChange={(e) => handleEditTopic(index, 'description', e.target.value)}
                                  placeholder="Description"
                                  className="text-sm"
                                />
                              </div>
                            ) : (
                              <>
                                <h4 className="font-medium text-sm leading-tight">{topic.name}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{topic.description}</p>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${getConfidenceColor(topic.confidence)}`}>
                              {topic.confidence}%
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => removeGeneratedTopic(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Category</Label>
                            {editingIndex === index ? (
                              <Select 
                                value={topic.category} 
                                onValueChange={(value) => handleEditTopic(index, 'category', value)}
                              >
                                <SelectTrigger className="h-7 text-xs">
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
                            ) : (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">{topic.category}</Badge>
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-xs text-muted-foreground">Keywords</Label>
                            {editingIndex === index ? (
                              <Textarea
                                value={topic.keywords.join(', ')}
                                onChange={(e) => handleEditTopic(index, 'keywords', e.target.value.split(',').map(k => k.trim()))}
                                placeholder="Comma-separated keywords"
                                rows={2}
                                className="resize-none text-xs"
                              />
                            ) : (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {topic.keywords.slice(0, 4).map((keyword, kIndex) => (
                                  <Badge key={kIndex} variant="outline" className="text-xs px-1 py-0 h-4">
                                    {keyword}
                                  </Badge>
                                ))}
                                {topic.keywords.length > 4 && (
                                  <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                                    +{topic.keywords.length - 4}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleAddTopicToDB(topic)}
                            className="bg-green-600 hover:bg-green-700 h-7 text-xs px-2"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add to Topics
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
