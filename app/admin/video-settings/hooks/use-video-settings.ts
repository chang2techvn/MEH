"use client"

import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import { SAMPLE_TOPICS, MOCK_NEW_TOPICS } from "../constants"
import type { VideoSettingsProps, VideoSettingsState } from "../types"

export function useVideoSettings({
  initialDuration = 180,
  initialMinDuration = 180,
  initialAutoPublish = true,
}: VideoSettingsProps) {
  const [state, setState] = useState<VideoSettingsState>({
    maxDuration: initialDuration,
    minDuration: initialMinDuration,
    autoPublish: initialAutoPublish,
    topics: SAMPLE_TOPICS,
    newTopic: "",
    searchTerm: "",
    activeTab: "general",
    loadingTopics: false,
    saving: false,
  })

  // Lọc chủ đề theo từ khóa tìm kiếm
  const filteredTopics = state.topics.filter((topic) =>
    topic.name.toLowerCase().includes(state.searchTerm.toLowerCase()),
  )

  // Thêm chủ đề mới
  const addTopic = () => {
    if (!state.newTopic.trim()) return

    const topicExists = state.topics.some((topic) => topic.name.toLowerCase() === state.newTopic.toLowerCase())

    if (topicExists) {
      toast({
        title: "Topic already exists",
        description: `"${state.newTopic}" is already in your topics list.`,
        variant: "destructive",
      })
      return
    }

    const newTopicObj = {
      id: Date.now().toString(),
      name: state.newTopic.trim(),
      trending: false,
    }

    setState({
      ...state,
      topics: [...state.topics, newTopicObj],
      newTopic: "",
    })

    toast({
      title: "Topic added",
      description: `"${state.newTopic}" has been added to your topics list.`,
    })
  }

  // Xóa chủ đề
  const removeTopic = (id: string) => {
    setState({
      ...state,
      topics: state.topics.filter((topic) => topic.id !== id),
    })
  }

  // Chuyển đổi trạng thái trending của chủ đề
  const toggleTrending = (id: string) => {
    setState({
      ...state,
      topics: state.topics.map((topic) => (topic.id === id ? { ...topic, trending: !topic.trending } : topic)),
    })
  }

  // Làm mới danh sách chủ đề từ API
  const refreshTopics = async () => {
    setState({ ...state, loadingTopics: true })

    try {
      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Thêm một số chủ đề mới ngẫu nhiên
      setState({
        ...state,
        topics: [...state.topics, ...MOCK_NEW_TOPICS],
        loadingTopics: false,
      })

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
      setState({ ...state, loadingTopics: false })
    }
  }

  // Lưu cài đặt
  const handleSave = async () => {
    try {
      setState({ ...state, saving: true })

      // Kiểm tra thời lượng tối thiểu
      if (state.minDuration < 60) {
        toast({
          title: "Invalid minimum duration",
          description: "Minimum duration should be at least 60 seconds.",
          variant: "destructive",
        })
        setState({ ...state, saving: false })
        return
      }

      // Kiểm tra thời lượng tối đa
      if (state.maxDuration < state.minDuration) {
        toast({
          title: "Invalid maximum duration",
          description: "Maximum duration should be greater than minimum duration.",
          variant: "destructive",
        })
        setState({ ...state, saving: false })
        return
      }

      // Giả lập API call để lưu cài đặt
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Hiển thị thông báo thành công
      toast({
        title: "Settings saved",
        description: "Video settings have been updated successfully.",
      })
      setState({ ...state, saving: false })
    } catch (error) {
      console.error("Error saving settings:", error)

      // Hiển thị thông báo lỗi
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
      setState({ ...state, saving: false })
    }
  }

  const updateState = (updates: Partial<VideoSettingsState>) => {
    setState({ ...state, ...updates })
  }

  return {
    state,
    filteredTopics,
    updateState,
    addTopic,
    removeTopic,
    toggleTrending,
    refreshTopics,
    handleSave,
  }
}
