"use client"

import { useState, useCallback } from "react"
import { toast } from "@/hooks/use-toast"
import type { TextElement, MediaTransform, StoryCreatorState } from './types'

export function useStoryCreator() {
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
  const [activeDropdown, setActiveDropdown] = useState<'stickers' | 'text' | 'effects' | null>(null)

  const addTextElement = useCallback(() => {
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
    setTextElements(prev => [...prev, newText])
    setSelectedTextId(newText.id)
    setIsAddingText(false)
  }, [])

  const updateTextElement = useCallback((id: string, updates: Partial<TextElement>) => {
    setTextElements(prev => prev.map(text => 
      text.id === id ? { ...text, ...updates } : text
    ))
  }, [])

  const deleteTextElement = useCallback((id: string) => {
    setTextElements(prev => prev.filter(text => text.id !== id))
    if (selectedTextId === id) {
      setSelectedTextId(null)
    }
  }, [selectedTextId])

  const updateMediaTransform = useCallback((updates: Partial<MediaTransform>) => {
    setMediaTransform(prev => ({ ...prev, ...updates }))
  }, [])

  const resetMediaTransform = useCallback(() => {
    setMediaTransform({ scale: 1, x: 0, y: 0, rotation: 0 })
  }, [])

  const handleDeleteMedia = useCallback(async () => {
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
      resetMediaTransform()
    } catch (error) {
      console.error('Error deleting media:', error)
      toast({
        title: "Delete error",
        description: "Failed to delete media. Please try again.",
        variant: "destructive",
      })
    }
  }, [mediaType, storyMedia, storyImages, currentImageIndex, uploadedMediaUrls, resetMediaTransform])

  const resetForm = useCallback(() => {
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
    setActiveDropdown(null)
  }, [storyMedia, storyImages])

  const state: StoryCreatorState = {
    storyMedia,
    storyImages,
    currentImageIndex,
    mediaType,
    mediaTransform,
    uploadedMediaUrls,
    backgroundColor,
    backgroundImage,
    textElements,
    selectedTextId,
    isAddingText,
    isUploading,
    isDragging,
    activeDropdown
  }

  return {
    // State
    ...state,
    
    // Setters
    setStoryMedia,
    setStoryImages,
    setCurrentImageIndex,
    setMediaType,
    setMediaTransform,
    setUploadedMediaUrls,
    setBackgroundColor,
    setBackgroundImage,
    setTextElements,
    setSelectedTextId,
    setIsAddingText,
    setIsUploading,
    setIsDragging,
    setActiveDropdown,
    
    // Actions
    addTextElement,
    updateTextElement,
    deleteTextElement,
    updateMediaTransform,
    resetMediaTransform,
    handleDeleteMedia,
    resetForm
  }
}
