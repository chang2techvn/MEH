"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save, Plus, X, Search, RefreshCw, Globe, TrendingUp } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"

// Danh sách chủ đề mẫu
const SAMPLE_TOPICS = [
  { id: "1", name: "Climate Change", trending: true },
  { id: "2", name: "Artificial Intelligence", trending: true },
  { id: "3", name: "Sustainable Development", trending: true },
  { id: "4", name: "Digital Transformation", trending: false },
  { id: "5", name: "Global Economics", trending: false },
  { id: "6", name: "Cultural Diversity", trending: false },
  { id: "7", name: "Technological Innovation", trending: true },
  { id: "8", name: "Healthcare Advancements", trending: true },
  { id: "9", name: "Educational Methods", trending: false },
  { id: "10", name: "Environmental Conservation", trending: true },
  { id: "11", name: "Renewable Energy", trending: true },
  { id: "12", name: "Space Exploration", trending: true },
  { id: "13", name: "Quantum Computing", trending: false },
  { id: "14", name: "Blockchain Technology", trending: false },
  { id: "15", name: "Mental Health", trending: true },
  { id: "16", name: "Remote Work", trending: false },
  { id: "17", name: "Cybersecurity", trending: true },
  { id: "18", name: "Social Media Impact", trending: true },
  { id: "19", name: "Genetic Engineering", trending: false },
  { id: "20", name: "Virtual Reality", trending: true },
]

interface VideoSettingsProps {
  initialDuration?: number
  initialMinDuration?: number
  initialAutoPublish?: boolean
}

export default function VideoSettings({
  initialDuration = 180,
  initialMinDuration = 180,
  initialAutoPublish = true,
}: VideoSettingsProps) {
  const [maxDuration, setMaxDuration] = useState(initialDuration)
  const [minDuration, setMinDuration] = useState(initialMinDuration)
  const [autoPublish, setAutoPublish] = useState(initialAutoPublish)
  const [saving, setSaving] = useState(false)
  const [topics, setTopics] = useState(SAMPLE_TOPICS)
  const [newTopic, setNewTopic] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("general")
  const [loadingTopics, setLoadingTopics] = useState(false)

  // Lọc chủ đề theo từ khóa tìm kiếm
  const filteredTopics = topics.filter((topic) => topic.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Thêm chủ đề mới
  const addTopic = () => {
    if (!newTopic.trim()) return

    const topicExists = topics.some((topic) => topic.name.toLowerCase() === newTopic.toLowerCase())

    if (topicExists) {
      toast({
        title: "Topic already exists",
        description: `"${newTopic}" is already in your topics list.`,
        variant: "destructive",
      })
      return
    }

    const newTopicObj = {
      id: Date.now().toString(),
      name: newTopic.trim(),
      trending: false,
    }

    setTopics([...topics, newTopicObj])
    setNewTopic("")

    toast({
      title: "Topic added",
      description: `"${newTopic}" has been added to your topics list.`,
    })
  }

  // Xóa chủ đề
  const removeTopic = (id: string) => {
    setTopics(topics.filter((topic) => topic.id !== id))
  }

  // Chuyển đổi trạng thái trending của chủ đề
  const toggleTrending = (id: string) => {
    setTopics(topics.map((topic) => (topic.id === id ? { ...topic, trending: !topic.trending } : topic)))
  }

  // Làm mới danh sách chủ đề từ API
  const refreshTopics = async () => {
    setLoadingTopics(true)

    try {
      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Thêm một số chủ đề mới ngẫu nhiên
      const newTopics = [
        { id: "21", name: "Metaverse", trending: true },
        { id: "22", name: "NFTs", trending: false },
        { id: "23", name: "Autonomous Vehicles", trending: true },
        { id: "24", name: "Circular Economy", trending: true },
        { id: "25", name: "Biohacking", trending: false },
      ]

      // Kết hợp với các chủ đề hiện có
      setTopics([...topics, ...newTopics])

      toast({
        title: "Topics refreshed",
        description: "Latest trending topics have been added to your list.",
      })
    } catch (error) {
      toast({
        title: "Error refreshing topics",
        description: "Failed to fetch latest topics. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingTopics(false)
    }
  }

  // Lưu cài đặt
  const handleSave = async () => {
    try {
      setSaving(true)

      // Kiểm tra thời lượng tối thiểu
      if (minDuration < 60) {
        toast({
          title: "Invalid minimum duration",
          description: "Minimum duration should be at least 60 seconds.",
          variant: "destructive",
        })
        setSaving(false)
        return
      }

      // Kiểm tra thời lượng tối đa
      if (maxDuration < minDuration) {
        toast({
          title: "Invalid maximum duration",
          description: "Maximum duration should be greater than minimum duration.",
          variant: "destructive",
        })
        setSaving(false)
        return
      }

      // Giả lập API call để lưu cài đặt
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Hiển thị thông báo thành công
      toast({
        title: "Settings saved",
        description: "Video settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)

      // Hiển thị thông báo lỗi
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Settings</CardTitle>
        <CardDescription>Configure settings for daily challenge videos</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="topics">Video Topics</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="min-duration">Minimum Video Duration (seconds)</Label>
              <Input
                id="min-duration"
                type="number"
                min={60}
                max={600}
                value={minDuration}
                onChange={(e) => setMinDuration(Number.parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Videos shorter than this will not be used. Recommended: 180 seconds (3 minutes).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-duration">Maximum Video Duration (seconds)</Label>
              <Input
                id="max-duration"
                type="number"
                min={60}
                max={900}
                value={maxDuration}
                onChange={(e) => setMaxDuration(Number.parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Videos longer than this will be automatically trimmed. Recommended: 300 seconds (5 minutes).
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-publish">Auto-publish Submissions</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically publish user submissions to the community feed
                </p>
              </div>
              <Switch id="auto-publish" checked={autoPublish} onCheckedChange={setAutoPublish} />
            </div>
          </TabsContent>

          <TabsContent value="topics" className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search topics..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={refreshTopics} disabled={loadingTopics}>
                {loadingTopics ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Input
                placeholder="Add new topic..."
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTopic()
                  }
                }}
              />
              <Button onClick={addTopic}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            <div className="border rounded-md">
              <div className="p-3 border-b bg-muted/20 flex items-center justify-between">
                <div className="font-medium">Topic Name</div>
                <div className="font-medium">Actions</div>
              </div>

              <ScrollArea className="h-[300px]">
                <AnimatePresence>
                  {filteredTopics.length > 0 ? (
                    filteredTopics.map((topic) => (
                      <motion.div
                        key={topic.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/10"
                      >
                        <div className="flex items-center gap-2">
                          <span>{topic.name}</span>
                          {topic.trending && (
                            <Badge className="bg-gradient-to-r from-neo-mint to-purist-blue text-white border-0">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTrending(topic.id)}
                            className={topic.trending ? "text-neo-mint dark:text-purist-blue" : ""}
                          >
                            <TrendingUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTopic(topic.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <Globe className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No topics found</p>
                      <p className="text-sm">Try a different search term or add a new topic</p>
                    </div>
                  )}
                </AnimatePresence>
              </ScrollArea>
            </div>

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Total topics: {topics.length}</span>
              <span>Trending topics: {topics.filter((t) => t.trending).length}</span>
            </div>
          </TabsContent>
        </Tabs>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-6 bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
