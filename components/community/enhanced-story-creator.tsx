"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  X,
  Camera,
  Loader,
  Upload,
  Type,
  Palette,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Smile,
  Bold,
  Italic,
  AlignCenter,
  AlignLeft,
  AlignRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"

import { toast } from "@/hooks/use-toast"
import { useStories } from "@/hooks/use-stories"
import { useAuth } from "@/contexts/auth-context"
import type { EnhancedStoryCreatorProps } from "./types"

interface TextElement {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  fontFamily: string
  fontWeight: string
  fontStyle: string
  textAlign: string
  backgroundColor?: string
  isDragging?: boolean
}

interface MediaTransform {
  scale: number
  x: number
  y: number
  rotation: number
}

export function EnhancedStoryCreator({ isOpen, onClose }: EnhancedStoryCreatorProps) {
  const { user } = useAuth()
  const { createStory, uploadStoryMedia, loading } = useStories()
  
  // Media states
  const [storyMedia, setStoryMedia] = useState<string | null>(null)
  const [storyImages, setStoryImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [mediaTransform, setMediaTransform] = useState<MediaTransform>({
    scale: 1,
    x: 0,
    y: 0,
    rotation: 0
  })
  const [uploadedMediaUrls, setUploadedMediaUrls] = useState<string[]>([])
  
  // Background states
  const [backgroundColor, setBackgroundColor] = useState("linear-gradient(135deg, #84fab0, #8fd3f4)")
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  
  // Text elements
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null)
  const [isAddingText, setIsAddingText] = useState(false)
  
  // UI states
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const storyPreviewRef = useRef<HTMLDivElement>(null)

  // Predefined backgrounds
  const backgroundOptions = [
    { id: "solid-white", type: "color", value: "#ffffff", name: "White" },
    { id: "solid-black", type: "color", value: "#000000", name: "Black" },
    { id: "solid-red", type: "color", value: "#ef4444", name: "Red" },
    { id: "solid-blue", type: "color", value: "#3b82f6", name: "Blue" },
    { id: "solid-green", type: "color", value: "#10b981", name: "Green" },
    { id: "solid-purple", type: "color", value: "#8b5cf6", name: "Purple" },
    { id: "solid-yellow", type: "color", value: "#f59e0b", name: "Yellow" },
    { id: "solid-pink", type: "color", value: "#ec4899", name: "Pink" },
    { id: "solid-indigo", type: "color", value: "#6366f1", name: "Indigo" },
    { id: "solid-orange", type: "color", value: "#f97316", name: "Orange" },
    { id: "solid-teal", type: "color", value: "#14b8a6", name: "Teal" },
    { id: "solid-gray", type: "color", value: "#6b7280", name: "Gray" },
    { id: "gradient-sunset", type: "gradient", value: "linear-gradient(135deg, #ff6b6b, #feca57)", name: "Sunset" },
    { id: "gradient-ocean", type: "gradient", value: "linear-gradient(135deg, #667eea, #764ba2)", name: "Ocean" },
    { id: "gradient-forest", type: "gradient", value: "linear-gradient(135deg, #11998e, #38ef7d)", name: "Forest" },
    { id: "gradient-purple", type: "gradient", value: "linear-gradient(135deg, #667eea, #764ba2)", name: "Purple" },
    { id: "gradient-pink", type: "gradient", value: "linear-gradient(135deg, #f093fb, #f5576c)", name: "Pink" },
    { id: "gradient-blue", type: "gradient", value: "linear-gradient(135deg, #4facfe, #00f2fe)", name: "Blue" },
    { id: "gradient-fire", type: "gradient", value: "linear-gradient(135deg, #ff9a56, #ff6b6b)", name: "Fire" },
    { id: "gradient-mint", type: "gradient", value: "linear-gradient(135deg, #84fab0, #8fd3f4)", name: "Mint" },
  ]

  // Font options
  const fontFamilies = [
    "Inter, sans-serif",
    "Arial, sans-serif", 
    "Georgia, serif",
    "Times New Roman, serif",
    "Helvetica, sans-serif",
    "Courier New, monospace",
    "Impact, sans-serif",
    "Comic Sans MS, cursive"
  ]

  // Color palette
  const colorPalette = [
    "#ffffff", "#000000", "#ff6b6b", "#4ecdc4", "#45b7d1", 
    "#96ceb4", "#ffeaa7", "#dda0dd", "#98d8c8", "#f7dc6f"
  ]

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const isVideo = file.type.startsWith("video/")

    setIsUploading(true)

    // Check file size
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

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file",
        variant: "destructive",
      })
      setIsUploading(false)
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
          setIsUploading(false)
          return
        }
        
        await processVideoFile(file)
      }
      
      video.src = URL.createObjectURL(file)
      return
    }

    // Image handling - limit to 1 image
    if (storyImages.length >= 1) {
      toast({
        title: "Too many images",
        description: "You can upload maximum 1 image",
        variant: "destructive",
      })
      setIsUploading(false)
      return
    }

    await processImageFile(file)
  }

  const processVideoFile = async (file: File) => {
    try {
      const previewUrl = URL.createObjectURL(file)
      setStoryMedia(previewUrl)
      setMediaType("video")
      
      // Reset transform when new media is loaded
      setMediaTransform({ scale: 1, x: 0, y: 0, rotation: 0 })

      const mediaUrl = await uploadStoryMedia(file)
      if (mediaUrl) {
        URL.revokeObjectURL(previewUrl)
        setStoryMedia(mediaUrl)
        setUploadedMediaUrls([mediaUrl])
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
      if (storyMedia?.startsWith('blob:')) {
        URL.revokeObjectURL(storyMedia)
      }
      setStoryMedia(null)
    } finally {
      setIsUploading(false)
    }
  }

  const processImageFile = async (file: File) => {
    try {
      const previewUrl = URL.createObjectURL(file)
      const mediaUrl = await uploadStoryMedia(file)
      
      if (mediaUrl) {
        URL.revokeObjectURL(previewUrl)
        setStoryImages(prev => [...prev, mediaUrl])
        setUploadedMediaUrls(prev => [...prev, mediaUrl])
        setCurrentImageIndex(storyImages.length)
        setMediaType("image")
        setStoryMedia(mediaUrl)
        
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
      setIsUploading(false)
    }
  }

  const handleDeleteMedia = async () => {
    try {
      if (mediaType === 'video' && storyMedia) {
        // Clean up video
        if (storyMedia.startsWith('blob:')) {
          URL.revokeObjectURL(storyMedia)
        }
        setStoryMedia(null)
        setUploadedMediaUrls([])
      } else if (mediaType === 'image' && storyImages.length > 0) {
        // Remove current image
        const updatedImages = storyImages.filter((_, index) => index !== currentImageIndex)
        const updatedUrls = uploadedMediaUrls.filter((_, index) => index !== currentImageIndex)
        
        setStoryImages(updatedImages)
        setUploadedMediaUrls(updatedUrls)
        
        if (updatedImages.length > 0) {
          const newIndex = Math.min(currentImageIndex, updatedImages.length - 1)
          setCurrentImageIndex(newIndex)
          setStoryMedia(updatedImages[newIndex])
        } else {
          setStoryMedia(null)
          setCurrentImageIndex(0)
        }
        
        toast({
          title: 'Media deleted',
          description: 'Media has been removed from your story',
        })
      }
      
      // Reset transform
      setMediaTransform({ scale: 1, x: 0, y: 0, rotation: 0 })
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error('Error deleting media:', error)
      toast({
        title: "Delete error",
        description: "Failed to delete media. Please try again.",
        variant: "destructive",
      })
    }
  }

  const addTextElement = () => {
    const newText: TextElement = {
      id: `text-${Date.now()}`,
      text: "Your text here",
      x: 50, // Center percentage
      y: 50, // Center percentage
      fontSize: 24,
      color: "#ffffff",
      fontFamily: "Inter, sans-serif",
      fontWeight: "normal",
      fontStyle: "normal",
      textAlign: "center",
      backgroundColor: "transparent"
    }
    setTextElements([...textElements, newText])
    setSelectedTextId(newText.id)
    setIsAddingText(false)
  }

  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(prev => prev.map(text => 
      text.id === id ? { ...text, ...updates } : text
    ))
  }

  const deleteTextElement = (id: string) => {
    setTextElements(prev => prev.filter(text => text.id !== id))
    if (selectedTextId === id) {
      setSelectedTextId(null)
    }
  }

  const handleTextDrag = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const element = textElements.find(t => t.id === id)
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
      
      updateTextElement(id, { x: constrainedX, y: constrainedY, isDragging: true })
    }

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault()
      updateTextElement(id, { isDragging: false })
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [textElements])

  const handleCreateStory = async () => {
    if (textElements.length === 0 && !storyMedia && storyImages.length === 0) {
      toast({
        title: "Content required",
        description: "Please add some content for your story",
        variant: "destructive",
      })
      return
    }

    try {
      const storyData = {
        content: textElements.map(t => t.text).join(' '),
        media_url: storyMedia || (storyImages.length > 0 ? storyImages[currentImageIndex] : undefined),
        media_type: mediaType,
        background_color: backgroundColor,
        background_image: backgroundImage || undefined,
        text_elements: textElements,
        media_transform: (storyMedia || storyImages.length > 0) ? mediaTransform : undefined,
        images: mediaType === 'image' ? storyImages : undefined,
        duration: 24
      }

      const success = await createStory(storyData)
      if (success) {
        handleReset()
        onClose()
      }
    } catch (error) {
      console.error('Error creating story:', error)
    }
  }

  const handleReset = () => {
    // Clean up any blob URLs
    if (storyMedia?.startsWith('blob:')) {
      URL.revokeObjectURL(storyMedia)
    }
    storyImages.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    })
    
    setStoryMedia(null)
    setStoryImages([])
    setCurrentImageIndex(0)
    setUploadedMediaUrls([])
    setTextElements([])
    setSelectedTextId(null)
    setBackgroundColor("linear-gradient(135deg, #84fab0, #8fd3f4)")
    setBackgroundImage(null)
    setMediaTransform({ scale: 1, x: 0, y: 0, rotation: 0 })
    setIsUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const selectedText = textElements.find(t => t.id === selectedTextId)

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
                {storyMedia && (
                  <div className="flex flex-col gap-2">
                    {/* Scale Controls */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20">
                      <div className="text-white text-xs font-medium mb-2 text-center">Scale</div>
                      <div className="flex flex-col items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setMediaTransform(prev => ({ ...prev, scale: Math.min(3, prev.scale + 0.1) }))}
                          className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 p-0"
                        >
                          <ZoomIn className="h-3 w-3" />
                        </Button>
                        
                        <div className="text-white text-xs font-mono bg-black/30 px-1 py-0.5 rounded-full min-w-[35px] text-center">
                          {Math.round(mediaTransform.scale * 100)}%
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setMediaTransform(prev => ({ ...prev, scale: Math.max(0.5, prev.scale - 0.1) }))}
                          className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 p-0"
                        >
                          <ZoomOut className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Rotation Controls */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20">
                      <div className="text-white text-xs font-medium mb-2 text-center">Rotate</div>
                      <div className="flex flex-col items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setMediaTransform(prev => ({ ...prev, rotation: prev.rotation + 15 }))}
                          className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 p-0"
                        >
                          <RotateCcw className="h-3 w-3 transform rotate-180" />
                        </Button>
                        
                        <div className="text-white text-xs font-mono bg-black/30 px-1 py-0.5 rounded-full min-w-[35px] text-center">
                          {mediaTransform.rotation}°
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setMediaTransform(prev => ({ ...prev, rotation: prev.rotation - 15 }))}
                          className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 p-0"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Reset Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setMediaTransform({ scale: 1, x: 0, y: 0, rotation: 0 })}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg backdrop-blur-md text-xs px-2 py-1 h-8"
                    >
                      Reset
                    </Button>

                    {/* Delete Media Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDeleteMedia}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-400/30 rounded-lg backdrop-blur-md text-xs px-2 py-1 h-8"
                    >
                      Delete
                    </Button>
                  </div>
                )}

                {/* Story Preview Container */}
                <div 
                  ref={storyPreviewRef}
                  className="relative w-[280px] h-[500px] rounded-2xl overflow-hidden shadow-2xl group"
                  style={{
                    ...(backgroundImage 
                      ? {
                          backgroundImage: `url(${backgroundImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }
                      : backgroundColor.includes('gradient') 
                        ? { backgroundImage: backgroundColor }
                        : { backgroundColor: backgroundColor }
                    )
                  }}
                >
                  {/* Drag Hint Overlay */}
                  {storyMedia && (
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 flex items-center justify-center pointer-events-none">
                      <div className="bg-black/30 backdrop-blur-sm rounded-full p-3">
                        <Move className="h-5 w-5 text-white/80" />
                      </div>
                    </div>
                  )}
                  {/* Background Media */}
                  {storyMedia && (
                    <div 
                      className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing"
                      style={{
                        transform: `scale(${mediaTransform.scale}) translate(${mediaTransform.x}px, ${mediaTransform.y}px) rotate(${mediaTransform.rotation}deg)`
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const startX = e.clientX
                        const startY = e.clientY
                        const startTransformX = mediaTransform.x
                        const startTransformY = mediaTransform.y

                        const handleMouseMove = (e: MouseEvent) => {
                          const deltaX = e.clientX - startX
                          const deltaY = e.clientY - startY
                          setMediaTransform(prev => ({
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
                      }}
                    >
                      {mediaType === 'video' ? (
                        <video 
                          src={storyMedia} 
                          className="w-full h-full object-cover"
                          muted
                          loop
                          autoPlay
                        />
                      ) : (
                        <Image
                          src={storyMedia}
                          alt="Story background"
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                  )}

                  {/* Text Elements */}
                  {textElements.map((textElement) => (
                    <div
                      key={textElement.id}
                      className={`absolute cursor-move select-none ${
                        selectedTextId === textElement.id ? 'ring-2 ring-blue-400' : ''
                      } ${textElement.isDragging ? 'z-50' : 'z-30'}`}
                      style={{
                        left: `${textElement.x}%`,
                        top: `${textElement.y}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: `${textElement.fontSize}px`,
                        color: textElement.color,
                        fontFamily: textElement.fontFamily,
                        fontWeight: textElement.fontWeight,
                        fontStyle: textElement.fontStyle,
                        textAlign: textElement.textAlign as any,
                        backgroundColor: textElement.backgroundColor !== 'transparent' ? textElement.backgroundColor : undefined,
                        padding: textElement.backgroundColor !== 'transparent' ? '4px 8px' : undefined,
                        borderRadius: textElement.backgroundColor !== 'transparent' ? '4px' : undefined,
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSelectedTextId(textElement.id)
                        handleTextDrag(textElement.id, e)
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedTextId(textElement.id)
                      }}
                    >
                      {textElement.text}
                    </div>
                  ))}

                  {/* Story Header */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 border-2 border-white">
                        {user?.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name || "User"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white text-xs">
                            {user?.name?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || "U"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="text-white font-medium text-sm">{user?.name || "Your Story"}</p>
                        <p className="text-white/70 text-xs">now</p>
                      </div>
                    </div>
                  </div>

                  {/* Story Progress Bar */}
                  <div className="absolute top-2 left-4 right-4 h-1 bg-white/30 rounded-full z-20">
                    <div className="h-full bg-white rounded-full w-0 animate-pulse"></div>
                  </div>
                </div>
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
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-gray-600" />
                      <h3 className="font-semibold text-sm">Media</h3>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                      multiple={false}
                    />
                    
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || (mediaType === 'video' && !!storyMedia) || (mediaType === 'image' && storyImages.length >= 1)}
                      className="w-full h-12 border-2 border-dashed border-gray-300 hover:border-gray-400"
                    >
                      {isUploading ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          {!storyMedia && storyImages.length === 0 
                            ? "Add Photo/Video" 
                            : mediaType === 'video' 
                              ? "Video Added" 
                              : storyImages.length >= 1 
                                ? "Image Added" 
                                : `Add Image`
                          }
                        </>
                      )}
                    </Button>

                    {/* Media limits info */}
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>• Videos: Max 30 seconds, up to 100MB</p>
                      <p>• Images: Maximum 1 image, up to 10MB</p>
                    </div>

                    {/* Image navigation removed since only 1 image allowed */}
                  </div>

                  {/* Text Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4 text-gray-600" />
                      <h3 className="font-semibold text-sm">Text</h3>
                    </div>
                    
                    <Button
                      onClick={addTextElement}
                      className="w-full bg-gradient-to-r from-neo-mint to-purist-blue"
                    >
                      <Type className="mr-2 h-4 w-4" />
                      Add Text Element
                    </Button>

                    {textElements.length > 0 && (
                      <div className="space-y-2">
                        {textElements.map((textElement) => (
                          <div
                            key={textElement.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedTextId === textElement.id 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-sm' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedTextId(textElement.id)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm truncate font-medium">
                                {textElement.text || "Empty text"}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteTextElement(textElement.id)
                                }}
                                className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Text Editor */}
                    {selectedText && (
                      <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                        <h4 className="font-medium text-sm">Edit Text</h4>
                        
                        {/* Text Content */}
                        <Textarea
                          value={selectedText.text}
                          onChange={(e) => updateTextElement(selectedText.id, { text: e.target.value })}
                          placeholder="Enter your text..."
                          className="min-h-[60px] resize-none"
                        />

                        {/* Font Controls Row */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-600">Font</label>
                            <select
                              value={selectedText.fontFamily}
                              onChange={(e) => updateTextElement(selectedText.id, { fontFamily: e.target.value })}
                              className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
                            >
                              {fontFamilies.map((font) => (
                                <option key={font} value={font}>
                                  {font.split(',')[0]}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-600">Size: {selectedText.fontSize}px</label>
                            <Slider
                              value={[selectedText.fontSize]}
                              onValueChange={([value]) => updateTextElement(selectedText.id, { fontSize: value })}
                              min={12}
                              max={72}
                              step={2}
                              className="w-full"
                            />
                          </div>
                        </div>

                        {/* Style Controls */}
                        <div className="flex justify-between">
                          <div className="flex gap-1">
                            <Button
                              variant={selectedText.fontWeight === 'bold' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateTextElement(selectedText.id, { 
                                fontWeight: selectedText.fontWeight === 'bold' ? 'normal' : 'bold' 
                              })}
                            >
                              <Bold className="h-3 w-3" />
                            </Button>
                            <Button
                              variant={selectedText.fontStyle === 'italic' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateTextElement(selectedText.id, { 
                                fontStyle: selectedText.fontStyle === 'italic' ? 'normal' : 'italic' 
                              })}
                            >
                              <Italic className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="flex gap-1">
                            <Button
                              variant={selectedText.textAlign === 'left' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateTextElement(selectedText.id, { textAlign: 'left' })}
                            >
                              <AlignLeft className="h-3 w-3" />
                            </Button>
                            <Button
                              variant={selectedText.textAlign === 'center' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateTextElement(selectedText.id, { textAlign: 'center' })}
                            >
                              <AlignCenter className="h-3 w-3" />
                            </Button>
                            <Button
                              variant={selectedText.textAlign === 'right' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateTextElement(selectedText.id, { textAlign: 'right' })}
                            >
                              <AlignRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Colors */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-600">Text Color</label>
                            <div className="flex gap-1 flex-wrap">
                              {colorPalette.slice(0, 8).map((color) => (
                                <button
                                  key={color}
                                  onClick={() => updateTextElement(selectedText.id, { color })}
                                  className={`w-6 h-6 rounded-full border-2 ${
                                    selectedText.color === color ? 'border-gray-400 ring-2 ring-blue-200' : 'border-gray-200'
                                  }`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-600">Background</label>
                            <div className="flex gap-1 flex-wrap">
                              <button
                                onClick={() => updateTextElement(selectedText.id, { backgroundColor: 'transparent' })}
                                className={`w-6 h-6 rounded-full border-2 bg-gradient-to-br from-white to-gray-100 flex items-center justify-center ${
                                  selectedText.backgroundColor === 'transparent' ? 'border-gray-400 ring-2 ring-blue-200' : 'border-gray-200'
                                }`}
                              >
                                <X className="h-3 w-3 text-gray-500" />
                              </button>
                              {colorPalette.slice(0, 7).map((color) => (
                                <button
                                  key={color}
                                  onClick={() => updateTextElement(selectedText.id, { backgroundColor: color })}
                                  className={`w-6 h-6 rounded-full border-2 ${
                                    selectedText.backgroundColor === color ? 'border-gray-400 ring-2 ring-blue-200' : 'border-gray-200'
                                  }`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Background Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-gray-600" />
                      <h3 className="font-semibold text-sm">Background</h3>
                    </div>
                    
                    {/* Solid Colors */}
                    <div className="grid grid-cols-6 gap-2">
                      {backgroundOptions.filter(bg => bg.type === 'color').map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() => {
                            setBackgroundColor(bg.value)
                            setBackgroundImage(null)
                          }}
                          className={`w-full h-10 rounded-lg border-2 transition-all ${
                            backgroundColor === bg.value && !backgroundImage 
                              ? 'border-blue-500 ring-2 ring-blue-200' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ backgroundColor: bg.value }}
                          title={bg.name}
                        />
                      ))}
                    </div>

                    {/* Gradients */}
                    <div className="grid grid-cols-6 gap-2">
                      {backgroundOptions.filter(bg => bg.type === 'gradient').map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() => {
                            setBackgroundColor(bg.value)
                            setBackgroundImage(null)
                          }}
                          className={`w-full h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                            backgroundColor === bg.value && !backgroundImage 
                              ? 'border-blue-500 ring-2 ring-blue-200' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ background: bg.value }}
                          title={bg.name}
                        >
                          <span className="text-white text-xs font-medium drop-shadow-md">
                            {bg.name}
                          </span>
                        </button>
                      ))}
                    </div>
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
                  disabled={loading || isUploading || (textElements.length === 0 && !storyMedia && storyImages.length === 0)}
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
