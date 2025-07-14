"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  X,
  Camera,
  Loader,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { useStories } from "@/hooks/use-stories"
import { useAuth } from "@/contexts/auth-context"
import type { EnhancedStoryCreatorProps } from "./types"

export function EnhancedStoryCreator({ isOpen, onClose }: EnhancedStoryCreatorProps) {
  const { user } = useAuth()
  const { createStory, uploadStoryMedia, loading } = useStories()
  const [storyMedia, setStoryMedia] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [storyCaption, setStoryCaption] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [backgroundColor, setBackgroundColor] = useState("#000000")
  const [textColor, setTextColor] = useState("#ffffff")
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    // Check file size (max 100MB for video, 10MB for image)
    const isVideo = file.type.startsWith("video/")
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `Please select a file smaller than ${isVideo ? "100MB" : "10MB"}`,
        variant: "destructive",
      })
      setIsUploading(false)
      return
    }

    // Check file type
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file",
        variant: "destructive",
      })
      setIsUploading(false)
      return
    }

    try {
      // Show different messages for video vs image
      if (isVideo) {
        toast({
          title: "Uploading video...",
          description: "This may take a few moments for larger files",
        })
      }

      // Create preview URL immediately for better UX
      const previewUrl = URL.createObjectURL(file)
      setStoryMedia(previewUrl)
      setMediaType(isVideo ? "video" : "image")
      setActiveFilter("original")

      // Upload to Supabase storage in background
      const mediaUrl = await uploadStoryMedia(file)
      if (mediaUrl) {
        // Replace preview URL with actual URL
        URL.revokeObjectURL(previewUrl) // Clean up preview URL
        setStoryMedia(mediaUrl)
        
        if (isVideo) {
          toast({
            title: "Video uploaded successfully!",
            description: "Your video is ready to share",
          })
        }
      } else {
        // Revert if upload failed
        URL.revokeObjectURL(previewUrl)
        setStoryMedia(null)
        toast({
          title: "Upload failed",
          description: "Please try again with a different file",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: "Upload error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
      // Clean up on error
      if (storyMedia && storyMedia.startsWith('blob:')) {
        URL.revokeObjectURL(storyMedia)
      }
      setStoryMedia(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleCreateStory = async () => {
    if (!storyCaption.trim() && !storyMedia) {
      toast({
        title: "Content required",
        description: "Please add some content or media for your story",
        variant: "destructive",
      })
      return
    }

    try {
      const success = await createStory({
        content: storyCaption.trim(),
        media_url: storyMedia || undefined,
        media_type: mediaType,
        background_color: backgroundColor,
        text_color: textColor,
        duration: 24 // 24 hours
      })

      if (success) {
        // Reset form
        setStoryMedia(null)
        setStoryCaption("")
        setActiveFilter(null)
        setBackgroundColor("#000000")
        setTextColor("#ffffff")
        onClose()
      }
    } catch (error) {
      console.error('Error creating story:', error)
    }
  }

  const handleReset = () => {
    // Clean up blob URLs to prevent memory leaks
    if (storyMedia && storyMedia.startsWith('blob:')) {
      URL.revokeObjectURL(storyMedia)
    }
    
    setStoryMedia(null)
    setStoryCaption("")
    setActiveFilter(null)
    setBackgroundColor("#000000")
    setTextColor("#ffffff")
    setIsUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose()
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-white/20 dark:border-gray-700/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white text-sm">
                    {user?.email?.slice(0, 2).toUpperCase() || "UN"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">Create Story</p>
                  <p className="text-xs text-muted-foreground">
                    Share a moment
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="rounded-full h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="max-h-[70vh]">
              <div className="p-4 space-y-4">
                {/* Media Preview */}
                {isUploading ? (
                  <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 h-48 flex flex-col items-center justify-center">
                    <Loader className="h-8 w-8 animate-spin text-neo-mint mb-2" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {mediaType === 'video' ? 'This may take a moment for video files' : 'Processing image...'}
                    </p>
                  </div>
                ) : storyMedia ? (
                  <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {mediaType === 'video' ? (
                      <div className="relative">
                        <video 
                          src={storyMedia} 
                          className="w-full h-48 object-cover"
                          controls
                          muted
                          preload="metadata"
                          onLoadStart={() => console.log('Video load started')}
                          onLoadedData={() => console.log('Video loaded')}
                          onError={(e) => {
                            console.error('Video error:', e)
                            toast({
                              title: "Video error",
                              description: "There was an issue with your video. Please try again.",
                              variant: "destructive",
                            })
                          }}
                        />
                        {/* Video upload indicator */}
                        {storyMedia.startsWith('blob:') && (
                          <div className="absolute bottom-2 left-2">
                            <span className="bg-orange-500/90 text-white backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
                              Uploading to cloud...
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        <Image
                          src={storyMedia}
                          alt="Story preview"
                          width={300}
                          height={200}
                          className={`w-full h-48 object-cover ${activeFilter ? filters.find(f => f.id === activeFilter)?.class : ""}`}
                          onError={() => {
                            toast({
                              title: "Image error",
                              description: "There was an issue with your image. Please try again.",
                              variant: "destructive",
                            })
                          }}
                        />
                        {activeFilter && activeFilter !== "original" && (
                          <div className="absolute bottom-2 left-2">
                            <span className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
                              {filters.find(f => f.id === activeFilter)?.name}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (storyMedia && storyMedia.startsWith('blob:')) {
                          URL.revokeObjectURL(storyMedia)
                        }
                        setStoryMedia(null)
                      }}
                      className="absolute top-2 right-2 rounded-full bg-black/50 text-white hover:bg-black/70 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}

                {/* Filters for images */}
                {storyMedia && mediaType === 'image' && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Filters</p>
                    <ScrollArea className="w-full whitespace-nowrap rounded-lg">
                      <div className="flex gap-2 p-1">
                        {filters.map((filter) => (
                          <Button
                            key={filter.id}
                            variant={activeFilter === filter.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveFilter(filter.id)}
                            className="shrink-0 text-xs"
                          >
                            {filter.name}
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Text Content */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Share your story..."
                    value={storyCaption}
                    onChange={(e) => setStoryCaption(e.target.value)}
                    className="min-h-[80px] resize-none bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{storyCaption.length}/500</span>
                    <span>Story expires in 24 hours</span>
                  </div>
                </div>

                {/* Color Customization */}
                {!storyMedia && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Background</label>
                      <div className="flex gap-2">
                        {["#000000", "#1a1a1a", "#4f46e5", "#059669", "#dc2626", "#d97706"].map((color) => (
                          <button
                            key={color}
                            onClick={() => setBackgroundColor(color)}
                            className={`w-8 h-8 rounded-full border-2 ${
                              backgroundColor === color ? 'border-gray-400' : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Text</label>
                      <div className="flex gap-2">
                        {["#ffffff", "#000000", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"].map((color) => (
                          <button
                            key={color}
                            onClick={() => setTextColor(color)}
                            className={`w-8 h-8 rounded-full border-2 ${
                              textColor === color ? 'border-gray-400' : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        {storyMedia ? (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Change Media
                          </>
                        ) : (
                          <>
                            <Camera className="mr-2 h-4 w-4" />
                            Add Photo/Video
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateStory}
                disabled={loading || isUploading || (!storyCaption.trim() && !storyMedia)}
                className="flex-1 bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90"
              >
                {loading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  "Share Story"
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
