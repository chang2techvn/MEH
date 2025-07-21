export interface TextElement {
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

export interface MediaTransform {
  scale: number
  x: number
  y: number
  rotation: number
}

export interface BackgroundOption {
  id: string
  type: 'color' | 'gradient'
  value: string
  name: string
}

export interface StoryCreatorState {
  // Media states
  storyMedia: string | null
  storyImages: string[]
  currentImageIndex: number
  mediaType: 'image' | 'video'
  mediaTransform: MediaTransform
  uploadedMediaUrls: string[]
  
  // Background states
  backgroundColor: string
  backgroundImage: string | null
  
  // Text elements
  textElements: TextElement[]
  selectedTextId: string | null
  isAddingText: boolean
  
  // UI states
  isUploading: boolean
  isDragging: boolean
  activeDropdown: 'stickers' | 'text' | 'effects' | null
}
