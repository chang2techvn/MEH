"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Smile, Paperclip, Mic, Send, ImageIcon, File, X, StopCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useChat } from "@/contexts/chat-context-realtime"

interface MessageInputProps {
  onSendMessage: (text: string, attachments?: any[]) => void
  compact?: boolean
  conversationId?: string
}

export default function MessageInput({ onSendMessage, compact = false, conversationId }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<any[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Get chat actions for typing indicators
  const { sendTypingIndicator } = useChat()

  // Clean up recording timer and typing timeout on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // Send typing indicators when user is typing
  const handleTypingStart = useCallback(() => {
    if (!conversationId) return
    
    // Send typing indicator
    sendTypingIndicator(conversationId, true)
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Set timeout to stop typing indicator after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(conversationId, false)
    }, 1000)
  }, [conversationId, sendTypingIndicator])

  const handleTypingStop = useCallback(() => {
    if (!conversationId) return
    
    // Clear timeout and send stop typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    sendTypingIndicator(conversationId, false)
  }, [conversationId, sendTypingIndicator])

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      // Stop typing indicator before sending
      handleTypingStop()
      
      onSendMessage(message.trim(), attachments)
      setMessage("")
      setAttachments([])

      // Focus back on input after sending
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 0)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newAttachments = Array.from(e.target.files).map((file) => ({
        type: file.type.startsWith("image/") ? "image" : "file",
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
        file,
      }))

      setAttachments([...attachments, ...newAttachments])
    }
  }

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments]

    // Revoke the object URL to avoid memory leaks
    if (newAttachments[index].url.startsWith("blob:")) {
      URL.revokeObjectURL(newAttachments[index].url)
    }

    newAttachments.splice(index, 1)
    setAttachments(newAttachments)
  }

  const handleAttachImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = "image/*"
      fileInputRef.current.click()
    }
    setShowAttachMenu(false)
  }

  const handleAttachFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = "*/*"
      fileInputRef.current.click()
    }
    setShowAttachMenu(false)
  }

  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)

    // Start a timer to track recording duration
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)
  }

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }

    setIsRecording(false)

    // Add a sample voice message
    setAttachments([
      ...attachments,
      {
        type: "audio",
        name: "Voice message",
        url: "/placeholder.svg?height=50&width=200&text=Voice+Message",
      },
    ])
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const addEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji)
    if (compact) {
      setShowEmojiPicker(false)
    }

    // Focus back on input after adding emoji
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 0)
  }

  // Emoji categories
  const emojiCategories = {
    recent: ["😊", "👍", "❤️", "🎉", "🔥", "👏", "😂", "🙏", "🤔", "😍"],
    smileys: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘"],
    gestures: ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "👋", "🤚", "🖐️", "✋"],
    symbols: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"],
  }

  return (
    <div className="p-3">
      {/* Attachments preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 mb-3"
          >
            {attachments.map((attachment, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative group"
              >
                {attachment.type === "image" ? (
                  <div className={`relative ${compact ? "h-16 w-16" : "h-20 w-20"} rounded-md overflow-hidden border`}>
                    <img
                      src={attachment.url || "/placeholder.svg"}
                      alt={attachment.name}
                      className="h-full w-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : attachment.type === "audio" ? (
                  <div className="relative flex items-center p-2 gap-2 bg-muted rounded-md border">
                    <div className="w-[100px] h-[30px] bg-gradient-to-r from-neo-mint to-purist-blue rounded-md flex items-center justify-center">
                      <span className="text-xs text-white font-medium">Voice Message</span>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative flex items-center p-2 gap-2 bg-muted rounded-md border">
                    <File className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs truncate max-w-[100px]">{attachment.name}</span>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice recording UI */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex items-center gap-4 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
          >
            <div className="flex-1 flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                className="h-3 w-3 bg-red-500 rounded-full"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">Recording voice message...</span>
                <span className="text-xs text-muted-foreground">{formatRecordingTime(recordingTime)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRecording(false)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={stopRecording}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Send
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="flex items-end gap-2 bg-muted/30 rounded-2xl p-1.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full shrink-0">
                    <Smile className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start" alignOffset={-40} side="top">
                  <Tabs defaultValue="recent" className="w-[280px]">
                    <TabsList className="grid grid-cols-4">
                      <TabsTrigger value="recent">Recent</TabsTrigger>
                      <TabsTrigger value="smileys">Smileys</TabsTrigger>
                      <TabsTrigger value="gestures">Gestures</TabsTrigger>
                      <TabsTrigger value="symbols">Symbols</TabsTrigger>
                    </TabsList>
                    <TabsContent value="recent" className="mt-2">
                      <div className="flex flex-wrap gap-2">
                        {emojiCategories.recent.map((emoji) => (
                          <Button key={emoji} variant="ghost" className="h-9 w-9 p-0" onClick={() => addEmoji(emoji)}>
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="smileys" className="mt-2">
                      <div className="flex flex-wrap gap-2">
                        {emojiCategories.smileys.map((emoji) => (
                          <Button key={emoji} variant="ghost" className="h-9 w-9 p-0" onClick={() => addEmoji(emoji)}>
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="gestures" className="mt-2">
                      <div className="flex flex-wrap gap-2">
                        {emojiCategories.gestures.map((emoji) => (
                          <Button key={emoji} variant="ghost" className="h-9 w-9 p-0" onClick={() => addEmoji(emoji)}>
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="symbols" className="mt-2">
                      <div className="flex flex-wrap gap-2">
                        {emojiCategories.symbols.map((emoji) => (
                          <Button key={emoji} variant="ghost" className="h-9 w-9 p-0" onClick={() => addEmoji(emoji)}>
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Add emoji</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Popover open={showAttachMenu} onOpenChange={setShowAttachMenu}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full shrink-0">
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start" alignOffset={-40} side="top">
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" className="justify-start gap-2" onClick={handleAttachImage}>
                      <ImageIcon className="h-4 w-4" />
                      <span>Image</span>
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2" onClick={handleAttachFile}>
                      <File className="h-4 w-4" />
                      <span>File</span>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Attach file</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} multiple />

        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            placeholder="Type a message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              // Send typing indicator when user starts typing
              if (e.target.value.length > 0) {
                handleTypingStart()
              } else {
                handleTypingStop()
              }
            }}
            onKeyDown={handleKeyDown}
            className="py-2 px-4 rounded-full border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <AnimatePresence mode="wait">
          {message ? (
            <motion.div
              key="send"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleSend}
                      size="icon"
                      className="h-9 w-9 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue hover:opacity-90 shrink-0"
                    >
                      <Send className="h-4 w-4 text-white" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Send message</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          ) : (
            <motion.div
              key="mic"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "destructive" : "ghost"}
                      size="icon"
                      className={`h-9 w-9 rounded-full shrink-0 ${isRecording ? "" : "hover:bg-muted"}`}
                    >
                      {isRecording ? (
                        <StopCircle className="h-5 w-5" />
                      ) : (
                        <Mic className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{isRecording ? "Stop recording" : "Record voice message"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
