"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { format } from "date-fns"
import {
  X,
  Camera,
  Loader,
  Upload,
  Globe,
  Users,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import type { EnhancedStoryCreatorProps } from "./types"

export function EnhancedStoryCreator({ isOpen, onClose }: EnhancedStoryCreatorProps) {
  const [storyImage, setStoryImage] = useState<string | null>(null)
  const [storyCaption, setStoryCaption] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [storyPrivacy, setStoryPrivacy] = useState<"public" | "friends" | "close-friends">("public")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filters = [
    { id: "original", name: "Original", class: "" },
    { id: "grayscale", name: "Noir", class: "grayscale" },
    { id: "sepia", name: "Retro", class: "sepia" },
    { id: "saturate", name: "Vivid", class: "saturate-150" },
    { id: "contrast", name: "Dramatic", class: "contrast-125" },
    { id: "blur", name: "Dreamy", class: "blur-sm" },
    { id: "hue-rotate", name: "Cool", class: "hue-rotate-60" },
    { id: "warm", name: "Warm", class: "brightness-110 sepia-[.25]" },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      })
      setIsUploading(false)
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      })
      setIsUploading(false)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setStoryImage(event.target?.result as string)
      setIsUploading(false)
      setActiveFilter("original")
    }
    reader.readAsDataURL(file)
  }

  const handleCreateStory = () => {
    if (!storyImage) {
      toast({
        title: "No image selected",
        description: "Please select an image for your story",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50])
    }

    // Simulate story creation
    setTimeout(() => {
      toast({
        title: "Story published!",
        description: `Your story is now visible to ${storyPrivacy === "public" ? "everyone" : storyPrivacy === "friends" ? "your friends" : "close friends"}.`,
      })
      setIsCreating(false)
      onClose()
    }, 1500)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose()
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-white/20 dark:border-gray-700/30"
          >
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 h-8 w-8"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </Button>
              <motion.h3
                className="text-base sm:text-lg font-semibold text-center"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Create Story
              </motion.h3>
              <div className="w-8">{/* Spacer for alignment */}</div>
            </div>

            <div className="p-4 sm:p-5">
              {/* Story Image Upload Area */}
              {!storyImage ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="relative"
                >
                  <div
                    className="aspect-[9/16] rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity overflow-hidden group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center">
                        <Loader className="h-10 w-10 text-neo-mint dark:text-purist-blue animate-spin mb-3" />
                        <p className="text-sm font-medium">Uploading image...</p>
                      </div>
                    ) : (
                      <>
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white dark:bg-gray-700 shadow-lg flex items-center justify-center mb-4 border-2 border-neo-mint dark:border-purist-blue"
                        >
                          <Camera className="h-8 w-8 sm:h-10 sm:w-10 text-neo-mint dark:text-purist-blue" />
                        </motion.div>
                        <h3 className="text-base sm:text-lg font-semibold mb-2">Create a new story</h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center max-w-[250px]">
                          Share a photo with your friends and followers
                        </p>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-white/5 transition-all duration-300"
                        >
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          >
                            <span className="text-sm font-medium">Click to upload</span>
                          </motion.div>
                        </motion.div>
                      </>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      aria-label="Upload story image"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {/* Story Preview */}
                  <div className="relative">
                    <div className="aspect-[9/16] rounded-xl overflow-hidden bg-black">
                      <img
                        src={storyImage || "/placeholder.svg"}
                        alt="Story preview"
                        className={`w-full h-full object-cover ${activeFilter ? filters.find((f) => f.id === activeFilter)?.class || "" : ""}`}
                      />

                      {/* User Info Overlay */}
                      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 border-2 border-white">
                            <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
                              JD
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-white">John Doe</p>
                            <p className="text-xs text-white/70">Just now</p>
                          </div>
                        </div>
                      </div>

                      {/* Caption Overlay */}
                      {storyCaption && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                          <p className="text-sm text-white">{storyCaption}</p>
                        </div>
                      )}

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setStoryImage(null)
                          setActiveFilter(null)
                        }}
                        className="absolute top-3 right-3 rounded-full bg-black/50 text-white hover:bg-black/70 h-8 w-8"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Filters */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Filters</h4>
                    <ScrollArea className="w-full">
                      <div className="flex gap-2 pb-2">
                        {filters.map((filter) => (
                          <div
                            key={filter.id}
                            className={`flex-shrink-0 cursor-pointer transition-all duration-200 ${
                              activeFilter === filter.id
                                ? "ring-2 ring-neo-mint dark:ring-purist-blue ring-offset-2 dark:ring-offset-gray-800"
                                : "opacity-70 hover:opacity-100"
                            }`}
                            onClick={() => setActiveFilter(filter.id)}
                          >
                            <div className="w-16 h-16 rounded-lg overflow-hidden">
                              <img
                                src={storyImage || "/placeholder.svg"}
                                alt={filter.name}
                                className={`w-full h-full object-cover ${filter.class}`}
                              />
                            </div>
                            <p className="text-xs text-center mt-1">{filter.name}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Caption Input */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Caption</h4>
                    <Textarea
                      placeholder="Write a caption..."
                      value={storyCaption}
                      onChange={(e) => setStoryCaption(e.target.value)}
                      className="resize-none text-sm"
                      maxLength={150}
                    />
                    <div className="flex justify-end mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{storyCaption.length}/150</span>
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Who can see your story?</h4>
                    <div className="flex gap-2">
                      <Button
                        variant={storyPrivacy === "public" ? "default" : "outline"}
                        size="sm"
                        className={`flex-1 ${
                          storyPrivacy === "public" ? "bg-neo-mint hover:bg-neo-mint/90 text-white" : ""
                        }`}
                        onClick={() => setStoryPrivacy("public")}
                      >
                        <Globe className="h-3.5 w-3.5 mr-1" />
                        Public
                      </Button>
                      <Button
                        variant={storyPrivacy === "friends" ? "default" : "outline"}
                        size="sm"
                        className={`flex-1 ${
                          storyPrivacy === "friends" ? "bg-neo-mint hover:bg-neo-mint/90 text-white" : ""
                        }`}
                        onClick={() => setStoryPrivacy("friends")}
                      >
                        <Users className="h-3.5 w-3.5 mr-1" />
                        Friends
                      </Button>
                      <Button
                        variant={storyPrivacy === "close-friends" ? "default" : "outline"}
                        size="sm"
                        className={`flex-1 ${
                          storyPrivacy === "close-friends" ? "bg-neo-mint hover:bg-neo-mint/90 text-white" : ""
                        }`}
                        onClick={() => setStoryPrivacy("close-friends")}
                      >
                        <User className="h-3.5 w-3.5 mr-1" />
                        Close Friends
                      </Button>
                    </div>
                  </div>

                  {/* Create Button */}
                  <Button
                    className="w-full py-2 h-auto text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={handleCreateStory}
                    disabled={isCreating}
                    style={{
                      background: "linear-gradient(to right, hsl(var(--neo-mint)), hsl(var(--purist-blue)))",
                    }}
                  >
                    {isCreating ? (
                      <motion.div
                        className="flex items-center justify-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Publishing...</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        <span>Share Story</span>
                      </motion.div>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
