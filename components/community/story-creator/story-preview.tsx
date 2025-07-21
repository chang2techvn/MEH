"use client"

import { forwardRef } from "react"
import Image from "next/image"
import { Move, Plus, Loader } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { TextElement, MediaTransform } from './types'

interface StoryPreviewProps {
  backgroundColor: string
  backgroundImage: string | null
  storyMedia: string | null
  mediaType: 'image' | 'video'
  mediaTransform: MediaTransform
  textElements: TextElement[]
  selectedTextId: string | null
  user: any
  onTextDrag: (id: string, e: React.MouseEvent) => void
  onTextClick: (id: string) => void
  onSelectText: (id: string) => void
  onMediaDrag?: (e: React.MouseEvent) => void
  onFileUpload?: () => void
  isUploading?: boolean
  isMobile?: boolean
  showMediaHint?: boolean
  storyImages?: string[]
}

export const StoryPreview = forwardRef<HTMLDivElement, StoryPreviewProps>(
  ({
    backgroundColor,
    backgroundImage,
    storyMedia,
    mediaType,
    mediaTransform,
    textElements,
    selectedTextId,
    user,
    onTextDrag,
    onTextClick,
    onSelectText,
    onMediaDrag,
    onFileUpload,
    isUploading = false,
    isMobile = false,
    showMediaHint = false,
    storyImages = []
  }, ref) => {
    return (
      <div 
        ref={ref}
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
        {storyMedia && showMediaHint && (
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
            onMouseDown={onMediaDrag}
            onTouchStart={(e) => {
              // Handle touch events for mobile
              const touch = e.touches[0]
              if (touch && onMediaDrag) {
                const mouseEvent = {
                  ...e,
                  clientX: touch.clientX,
                  clientY: touch.clientY,
                  preventDefault: () => e.preventDefault(),
                  stopPropagation: () => e.stopPropagation()
                } as any
                onMediaDrag(mouseEvent)
              }
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
              onSelectText(textElement.id)
              onTextDrag(textElement.id, e)
            }}
            onTouchStart={(e) => {
              // Handle touch for mobile
              const touch = e.touches[0]
              if (touch) {
                const mouseEvent = {
                  ...e,
                  clientX: touch.clientX,
                  clientY: touch.clientY,
                  preventDefault: () => e.preventDefault(),
                  stopPropagation: () => e.stopPropagation()
                } as any
                onSelectText(textElement.id)
                onTextDrag(textElement.id, mouseEvent)
              }
            }}
            onClick={(e) => {
              e.stopPropagation()
              onTextClick(textElement.id)
            }}
          >
            {textElement.text}
          </div>
        ))}

        {/* Add Media Button - Center */}
        {!storyMedia && storyImages.length === 0 && onFileUpload && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              onClick={onFileUpload}
              disabled={isUploading}
              className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30"
            >
              {isUploading ? (
                <Loader className="h-8 w-8 animate-spin text-white" />
              ) : (
                <Plus className="h-8 w-8 text-white" />
              )}
            </Button>
          </div>
        )}

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
    )
  }
)

StoryPreview.displayName = 'StoryPreview'
