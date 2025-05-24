"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { generateGeminiResponse } from "@/lib/gemini-api"

type MessageType = "text" | "thinking" | "error"

export type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  type: MessageType
  timestamp: Date
}

export function useGeminiAI() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [streamedResponse, setStreamedResponse] = useState("")

  // Generate a unique ID for messages
  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  // Simulate streaming effect for responses
  useEffect(() => {
    if (isTyping && streamedResponse) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.role === "assistant" && lastMessage.type === "thinking") {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === lastMessage.id ? { ...msg, content: streamedResponse, type: "text" } : msg)),
        )
      }
    }
  }, [streamedResponse, isTyping, messages])

  // Add a thinking message from the assistant
  const addThinkingMessage = useCallback(() => {
    const thinkingMessage: Message = {
      id: generateId(),
      role: "assistant",
      content: "",
      type: "thinking",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, thinkingMessage])
    return thinkingMessage.id
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()
      if (!input.trim() || isLoading) return

      // Add user message
      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: input,
        type: "text",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setIsLoading(true)

      // Add thinking message
      const thinkingId = addThinkingMessage()
      setIsTyping(true)

      try {
        // Get system prompt based on conversation history
        const systemPrompt = `You are an English language learning assistant. Help the user with their English learning needs.
        Be concise, helpful, and provide examples when appropriate. Format your responses with markdown for better readability.
        Current conversation history: ${JSON.stringify(messages.map((m) => ({ role: m.role, content: m.content })))}`

        // Simulate streaming by showing response character by character
        const fullResponse = await generateGeminiResponse(input, systemPrompt)

        // Simulate typing effect
        let displayedResponse = ""
        const typingSpeed = 10 // ms per character

        for (let i = 0; i < fullResponse.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, typingSpeed))
          displayedResponse += fullResponse[i]
          setStreamedResponse(displayedResponse)
        }

        // Update the thinking message with the full response
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === thinkingId ? { ...msg, content: fullResponse, type: "text" as MessageType } : msg,
          ),
        )
      } catch (error) {
        console.error("Error calling Gemini API:", error)

        // Update the thinking message with an error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === thinkingId
              ? {
                  ...msg,
                  content: "I'm sorry, I encountered an error connecting to the AI service. Please try again later.",
                  type: "error" as MessageType,
                }
              : msg,
          ),
        )
      } finally {
        setIsLoading(false)
        setIsTyping(false)
        setStreamedResponse("")
      }
    },
    [input, messages, isLoading, addThinkingMessage],
  )

  // Handle quick responses (suggested questions)
  const handleQuickResponse = useCallback(
    (text: string) => {
      setInput(text)
      setTimeout(() => handleSubmit(), 100)
    },
    [handleSubmit],
  )

  return {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    isTyping,
    handleQuickResponse,
  }
}
