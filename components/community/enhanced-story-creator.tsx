"use client"

import { useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  X,
  Loader,
  Sparkles,
  Type,
  Share,
  Trash2,
  Plus,
  Palette,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { toast } from "@/hooks/use-toast"
import { useStories } from "@/hooks/use-stories"
import { useAuth } from "@/contexts/auth-context"
import { useMobile } from "@/hooks/use-mobile"

// Import new components
import { StoryPreview } from './story-creator/story-preview'
import { MediaControls } from './story-creator/media-controls'
import { TextEditor } from './story-creator/text-editor'
import { BackgroundSelector } from './story-creator/background-selector'
import { MediaUpload } from './story-creator/media-upload'
import { TextElementsList } from './story-creator/text-elements-list'
import { useStoryCreator } from './story-creator/use-story-creator'
import { backgroundOptions } from './story-creator/constants'
import type { EnhancedStoryCreatorProps } from "./types"

export function EnhancedStoryCreator({ isOpen, onClose }: EnhancedStoryCreatorProps) {
  const { user } = useAuth()
  const { createStory, uploadStoryMedia, loading } = useStories()
  const { isMobile } = useMobile()
  const router = useRouter()
  
  const storyCreator = useStoryCreator()
  const storyPreviewRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if user is authenticated when component opens
  useEffect(() => {
    if (isOpen && !user) {
      onClose() // Close the modal first
      router.push('/auth/login') // Then redirect to login
    }
  }, [isOpen, user, onClose, router])

  // File upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const isVideo = file.type.startsWith("video/")

    storyCreator.setIsUploading(true)

    // Check file size
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `Please select a file smaller than ${isVideo ? "100MB" : "10MB"}`,
        variant: "destructive",
      })
      storyCreator.setIsUploading(false)
      return
    }

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file",
        variant: "destructive",
      })
      storyCreator.setIsUploading(false)
      return
    }

    // Video duration check
    if (isVideo) {
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      video.onloadedmetadata = async () => {
        if (video.duration > 30) {
          toast({
            title: "Video too long",
            description: "Please select a video shorter than 30 seconds",
            variant: "destructive",
          })
          storyCreator.setIsUploading(false)
          return
        }
        
        await processVideoFile(file)
      }
      
      video.src = URL.createObjectURL(file)
      return
    }

    // Image handling - limit to 1 image
    if (storyCreator.storyImages.length >= 1) {
      toast({
        title: "Too many images",
        description: "You can upload maximum 1 image",
        variant: "destructive",
      })
      storyCreator.setIsUploading(false)
      return
    }

    await processImageFile(file)
  }

  const processVideoFile = async (file: File) => {
    try {
      const previewUrl = URL.createObjectURL(file)
      storyCreator.setStoryMedia(previewUrl)
      storyCreator.setMediaType("video")
      
      // Reset transform when new media is loaded
      storyCreator.resetMediaTransform()

      const mediaUrl = await uploadStoryMedia(file)
      if (mediaUrl) {
        URL.revokeObjectURL(previewUrl)
        storyCreator.setStoryMedia(mediaUrl)
        storyCreator.setUploadedMediaUrls([mediaUrl])
        toast({
          title: 'Video uploaded successfully!',
          description: "Your video is ready to use",
        })
      }
    } catch (error) {
      console.error('Error uploading video:', error)
      toast({
        title: "Upload error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
      if (storyCreator.storyMedia?.startsWith('blob:')) {
        URL.revokeObjectURL(storyCreator.storyMedia)
      }
      storyCreator.setStoryMedia(null)
    } finally {
      storyCreator.setIsUploading(false)
    }
  }

  const processImageFile = async (file: File) => {
    try {
      const previewUrl = URL.createObjectURL(file)
      const mediaUrl = await uploadStoryMedia(file)
      
      if (mediaUrl) {
        URL.revokeObjectURL(previewUrl)
        storyCreator.setStoryImages(prev => [...prev, mediaUrl])
        storyCreator.setUploadedMediaUrls(prev => [...prev, mediaUrl])
        storyCreator.setCurrentImageIndex(storyCreator.storyImages.length)
        storyCreator.setMediaType("image")
        storyCreator.setStoryMedia(mediaUrl)
        
        toast({
          title: 'Image uploaded successfully!',
          description: `Image uploaded and ready to use`,
        })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: "Upload error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      storyCreator.setIsUploading(false)
    }
  }

  // Text drag handler
  const handleTextDrag = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const element = storyCreator.textElements.find(t => t.id === id)
    if (!element || !storyPreviewRef.current) return

    const rect = storyPreviewRef.current.getBoundingClientRect()
    const startXPercent = element.x
    const startYPercent = element.y

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY
      
      const newXPercent = startXPercent + (deltaX / rect.width) * 100
      const newYPercent = startYPercent + (deltaY / rect.height) * 100
      
      // Constrain to bounds
      const constrainedX = Math.max(0, Math.min(100, newXPercent))
      const constrainedY = Math.max(0, Math.min(100, newYPercent))
      
      storyCreator.updateTextElement(id, { x: constrainedX, y: constrainedY, isDragging: true })
    }

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault()
      storyCreator.updateTextElement(id, { isDragging: false })
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [storyCreator])

  // Media drag handler
  const handleMediaDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const startTransformX = storyCreator.mediaTransform.x
    const startTransformY = storyCreator.mediaTransform.y

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY
      storyCreator.setMediaTransform(prev => ({
        ...prev,
        x: startTransformX + deltaX * 0.3,
        y: startTransformY + deltaY * 0.3
      }))
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [storyCreator])

  // Touch handlers for mobile
  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault()
  }, [])

  const handleTouchEnd = useCallback(() => {
    document.removeEventListener('touchmove', handleTouchMove, { passive: false } as any)
    document.removeEventListener('touchend', handleTouchEnd)
  }, [handleTouchMove])

  const handleCreateStory = async () => {
    // Check if user is authenticated
    if (!user) {
      onClose() // Close the modal first
      router.push('/auth/login') // Redirect to login
      return
    }

    if (storyCreator.textElements.length === 0 && !storyCreator.storyMedia && storyCreator.storyImages.length === 0) {
      toast({
        title: "Content required",
        description: "Please add some content for your story",
        variant: "destructive",
      })
      return
    }

    try {
      const storyData = {
        content: storyCreator.textElements.map(t => t.text).join(' '),
        media_url: storyCreator.storyMedia || (storyCreator.storyImages.length > 0 ? storyCreator.storyImages[storyCreator.currentImageIndex] : undefined),
        media_type: storyCreator.mediaType,
        background_color: storyCreator.backgroundColor,
        background_image: storyCreator.backgroundImage || undefined,
        text_elements: storyCreator.textElements,
        media_transform: (storyCreator.storyMedia || storyCreator.storyImages.length > 0) ? storyCreator.mediaTransform : undefined,
        images: storyCreator.mediaType === 'image' ? storyCreator.storyImages : undefined,
        duration: 24
      }

      const success = await createStory(storyData)
      if (success) {
        storyCreator.resetForm()
        onClose()
      }
    } catch (error) {
      console.error('Error creating story:', error)
    }
  }

  const handleClose = () => {
    storyCreator.resetForm()
    onClose()
  }

  const selectedText = storyCreator.textElements.find(t => t.id === storyCreator.selectedTextId)

  // If user is not authenticated, don't render the modal
  if (!user) {
    return null
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleClose()
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/90 backdrop-blur-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
              <h1 className="text-white font-semibold">Create Story</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCreateStory}
                disabled={loading || storyCreator.isUploading || (storyCreator.textElements.length === 0 && !storyCreator.storyMedia && storyCreator.storyImages.length === 0)}
                className="text-white hover:bg-white/10"
              >
                {loading ? <Loader className="h-5 w-5 animate-spin" /> : <Share className="h-5 w-5" />}
              </Button>
            </div>

            {/* Story Preview with Side Controls */}
            <div className="flex-1 flex items-center justify-center relative px-4 pb-24">
              <StoryPreview
                ref={storyPreviewRef}
                backgroundColor={storyCreator.backgroundColor}
                backgroundImage={storyCreator.backgroundImage}
                storyMedia={storyCreator.storyMedia}
                mediaType={storyCreator.mediaType}
                mediaTransform={storyCreator.mediaTransform}
                textElements={storyCreator.textElements}
                selectedTextId={storyCreator.selectedTextId}
                user={user}
                onTextDrag={handleTextDrag}
                onTextClick={storyCreator.setSelectedTextId}
                onSelectText={storyCreator.setSelectedTextId}
                onFileUpload={() => fileInputRef.current?.click()}
                isUploading={storyCreator.isUploading}
                isMobile={true}
                storyImages={storyCreator.storyImages}
              />

              {/* Right Side Controls - Mobile */}
              <div className="absolute right-2 top-16 flex flex-col gap-2">
                {/* Stickers Button */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => storyCreator.setActiveDropdown(storyCreator.activeDropdown === 'stickers' ? null : 'stickers')}
                    className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/30 flex flex-col items-center justify-center p-0"
                  >
                    <Palette className="h-4 w-4 text-white" />
                  </Button>
                  
                  {/* Stickers Dropdown - Mobile */}
                  <AnimatePresence>
                    {storyCreator.activeDropdown === 'stickers' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-full mr-3 top-0 w-64 bg-white/95 backdrop-blur-md rounded-xl border border-white/30 shadow-2xl p-3 max-h-72 overflow-y-auto z-50"
                        style={{
                          transform: 'translateY(calc(-50% + 20px))',
                          maxWidth: 'calc(100vw - 80px)',
                        }}
                      >
                      <h3 className="font-semibold text-xs mb-2">Background Colors</h3>
                      <div className="grid grid-cols-5 gap-1.5 mb-3">
                        {backgroundOptions.filter(bg => bg.type === 'color').map((bg) => (
                          <button
                            key={bg.id}
                            onClick={() => {
                              storyCreator.setBackgroundColor(bg.value)
                              storyCreator.setBackgroundImage(null)
                              storyCreator.setActiveDropdown(null)
                            }}
                            className={`w-8 h-8 rounded-md border-2 transition-all ${
                              storyCreator.backgroundColor === bg.value && !storyCreator.backgroundImage 
                                ? 'border-blue-500 ring-1 ring-blue-200' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={{ backgroundColor: bg.value }}
                          />
                        ))}
                      </div>
                      
                      <h3 className="font-semibold text-xs mb-2">Gradients</h3>
                      <div className="grid grid-cols-2 gap-1.5">
                        {backgroundOptions.filter(bg => bg.type === 'gradient').map((bg) => (
                          <button
                            key={bg.id}
                            onClick={() => {
                              storyCreator.setBackgroundColor(bg.value)
                              storyCreator.setBackgroundImage(null)
                              storyCreator.setActiveDropdown(null)
                            }}
                            className={`w-full h-10 rounded-md border-2 flex items-center justify-center transition-all ${
                              storyCreator.backgroundColor === bg.value && !storyCreator.backgroundImage 
                                ? 'border-blue-500 ring-1 ring-blue-200' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={{ background: bg.value }}
                          >
                            <span className="text-white text-xs font-medium drop-shadow-md">
                              {bg.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Text Button */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => storyCreator.setActiveDropdown(storyCreator.activeDropdown === 'text' ? null : 'text')}
                    className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/30 flex flex-col items-center justify-center p-0"
                  >
                    <Type className="h-4 w-4 text-white" />
                  </Button>
                  
                  {/* Text Dropdown - Mobile */}
                  <AnimatePresence>
                    {storyCreator.activeDropdown === 'text' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-full mr-3 top-0 w-72 bg-white/95 backdrop-blur-md rounded-xl border border-white/30 shadow-2xl p-3 max-h-80 overflow-y-auto z-50"
                        style={{
                          transform: 'translateY(calc(-50% + 20px))',
                          maxWidth: 'calc(100vw - 80px)',
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-xs">Add Text</h3>
                          <Button
                            size="sm"
                            onClick={storyCreator.addTextElement}
                            className="text-xs h-6 px-2"
                          >
                            Add
                          </Button>
                        </div>
                        
                        {selectedText && (
                          <div className="space-y-3">
                            <TextEditor
                              textElement={selectedText}
                              onUpdate={(updates) => storyCreator.updateTextElement(selectedText.id, updates)}
                              onDelete={() => {
                                storyCreator.deleteTextElement(selectedText.id)
                                storyCreator.setActiveDropdown(null)
                              }}
                            />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Effects Button */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => storyCreator.setActiveDropdown(storyCreator.activeDropdown === 'effects' ? null : 'effects')}
                    className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/30 flex flex-col items-center justify-center p-0"
                  >
                    <Sparkles className="h-4 w-4 text-white" />
                  </Button>
                  
                  {/* Effects Dropdown - Mobile */}
                  <AnimatePresence>
                    {storyCreator.activeDropdown === 'effects' && storyCreator.storyMedia && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-full mr-3 top-0 w-56 bg-white/95 backdrop-blur-md rounded-xl border border-white/30 shadow-2xl p-3 z-50"
                        style={{
                          transform: 'translateY(calc(-50% + 20px))',
                          maxWidth: 'calc(100vw - 80px)',
                        }}
                      >
                        <h3 className="font-semibold text-xs mb-2">Media Effects</h3>
                        
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">Scale</label>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => storyCreator.setMediaTransform(prev => ({ ...prev, scale: Math.max(0.5, prev.scale - 0.1) }))}
                                className="h-7 w-7 p-0"
                              >
                                <ZoomOut className="h-3 w-3" />
                              </Button>
                              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded flex-1 text-center">
                                {Math.round(storyCreator.mediaTransform.scale * 100)}%
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => storyCreator.setMediaTransform(prev => ({ ...prev, scale: Math.min(3, prev.scale + 0.1) }))}
                                className="h-7 w-7 p-0"
                              >
                                <ZoomIn className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">Rotation</label>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => storyCreator.setMediaTransform(prev => ({ ...prev, rotation: prev.rotation - 15 }))}
                                className="h-7 w-7 p-0"
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded flex-1 text-center">
                                {storyCreator.mediaTransform.rotation}°
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => storyCreator.setMediaTransform(prev => ({ ...prev, rotation: prev.rotation + 15 }))}
                                className="h-7 w-7 p-0"
                              >
                                <RotateCcw className="h-3 w-3 transform rotate-180" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => storyCreator.setMediaTransform({ scale: 1, x: 0, y: 0, rotation: 0 })}
                              className="flex-1 text-xs h-7"
                            >
                              Reset
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                storyCreator.handleDeleteMedia()
                                storyCreator.setActiveDropdown(null)
                              }}
                              className="flex-1 text-xs h-7"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
              multiple={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Desktop Layout
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose()
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-6xl h-[90vh] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Panel - Story Preview */}
            <div className="flex-1 bg-black flex flex-col items-center justify-center p-8">
              <div className="relative flex items-center gap-6">
                {/* Media Controls - Left Side */}
                {storyCreator.storyMedia && (
                  <MediaControls
                    mediaTransform={storyCreator.mediaTransform}
                    onUpdateTransform={storyCreator.updateMediaTransform}
                    onReset={storyCreator.resetMediaTransform}
                    onDelete={storyCreator.handleDeleteMedia}
                  />
                )}

                {/* Story Preview Container */}
                <StoryPreview
                  ref={storyPreviewRef}
                  backgroundColor={storyCreator.backgroundColor}
                  backgroundImage={storyCreator.backgroundImage}
                  storyMedia={storyCreator.storyMedia}
                  mediaType={storyCreator.mediaType}
                  mediaTransform={storyCreator.mediaTransform}
                  textElements={storyCreator.textElements}
                  selectedTextId={storyCreator.selectedTextId}
                  user={user}
                  onTextDrag={handleTextDrag}
                  onTextClick={storyCreator.setSelectedTextId}
                  onSelectText={storyCreator.setSelectedTextId}
                  onMediaDrag={handleMediaDrag}
                  showMediaHint={true}
                  storyImages={storyCreator.storyImages}
                />
              </div>

              {/* Preview Label - Centered below */}
              <p className="text-white text-center mt-6 text-sm opacity-70">
                Story Preview
              </p>
            </div>

            {/* Right Panel - Editing Tools */}
            <div className="w-96 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {user?.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name || "User"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white text-sm">
                        {user?.name?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">Create Story</p>
                    <p className="text-xs text-muted-foreground">{user?.name || user?.email?.split('@')[0] || "Design your story"}</p>
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

              {/* Story Editor */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                  {/* Media Upload Section */}
                  <MediaUpload
                    isUploading={storyCreator.isUploading}
                    hasVideo={storyCreator.mediaType === 'video' && !!storyCreator.storyMedia}
                    hasMaxImages={storyCreator.mediaType === 'image' && storyCreator.storyImages.length >= 1}
                    onFileChange={handleFileChange}
                  />

                  {/* Text Section */}
                  <TextElementsList
                    textElements={storyCreator.textElements}
                    selectedTextId={storyCreator.selectedTextId}
                    onAddText={storyCreator.addTextElement}
                    onSelectText={storyCreator.setSelectedTextId}
                    onDeleteText={storyCreator.deleteTextElement}
                  />

                  {/* Text Editor */}
                  {selectedText && (
                    <TextEditor
                      textElement={selectedText}
                      onUpdate={(updates) => storyCreator.updateTextElement(selectedText.id, updates)}
                      onDelete={() => storyCreator.deleteTextElement(selectedText.id)}
                    />
                  )}

                  {/* Background Section */}
                  <BackgroundSelector
                    backgroundColor={storyCreator.backgroundColor}
                    backgroundImage={storyCreator.backgroundImage}
                    onBackgroundChange={storyCreator.setBackgroundColor}
                    onBackgroundImageChange={storyCreator.setBackgroundImage}
                  />
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
                  disabled={loading || storyCreator.isUploading || (storyCreator.textElements.length === 0 && !storyCreator.storyMedia && storyCreator.storyImages.length === 0)}
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
