"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface TextElement {
  id: string
  text: string
  x: number
  y: number
  color: string
  fontSize: number
  fontStyle?: string
  textAlign?: string
  fontFamily?: string
  fontWeight?: string
  backgroundColor?: string
}

interface MediaTransform {
  x: number
  y: number
  scale: number
  rotation: number
}

interface StoryPreviewProps {
  story: {
    id: string
    storyImage?: string
    mediaType?: string
    content?: string
    textElements?: TextElement[]
    backgroundColor?: string
    textColor?: string
    backgroundImage?: string
    mediaTransform?: MediaTransform
    images?: string[]
  }
  className?: string
  isCardPreview?: boolean // New prop để scale down cho story card
}

export function StoryPreview({ story, className, isCardPreview = false }: StoryPreviewProps) {
  const textElements = story.textElements || []
  
  // Scale factor for card preview
  const scaleFactor = isCardPreview ? 0.3 : 1
  
  // Parse background for gradients
  const backgroundStyle = story.backgroundColor?.includes('gradient') 
    ? { background: story.backgroundColor }
    : { backgroundColor: story.backgroundColor || '#000000' }

  return (
    <div 
      className={cn("relative w-full h-full overflow-hidden", className)}
      style={{
        ...backgroundStyle,
        // Force background to show
        minHeight: '100%',
        minWidth: '100%'
      }}
    >
      {/* Debug info */}
      {isCardPreview && (
        <div className="absolute top-0 left-0 text-white text-[6px] bg-black/50 p-1 z-50">
          Preview: {story.backgroundColor?.substring(0, 10)}...
        </div>
      )}
      
      {/* Background Image */}
      {story.backgroundImage && (
        <Image
          src={story.backgroundImage}
          alt="Background"
          fill
          className="object-cover"
          unoptimized={story.backgroundImage.includes('supabase.co')}
        />
      )}

      {/* Main Media with Transform */}
      {story.storyImage && (
        <div 
          className="absolute w-full h-full"
          style={{
            transform: story.mediaTransform ? 
              `translate(${story.mediaTransform.x * scaleFactor}%, ${story.mediaTransform.y * scaleFactor}%) scale(${story.mediaTransform.scale * scaleFactor}) rotate(${story.mediaTransform.rotation}deg)` 
              : 'none',
            transformOrigin: 'center center',
          }}
        >
          {story.mediaType === 'video' ? (
            <video
              src={story.storyImage}
              className="w-full h-full object-cover"
              muted
              loop
              autoPlay
              playsInline
              onError={(e) => {
                console.error('Video load error:', e)
              }}
              onLoadedData={() => {
              }}
            />
          ) : (
            <Image
              src={story.storyImage}
              alt="Story media"
              fill
              className="object-cover"
              unoptimized={story.storyImage.includes('supabase.co')}
              onError={(e) => {
                console.error('Image load error:', e)
              }}
              onLoad={() => {
              }}
            />
          )}
        </div>
      )}
      
      {/* Additional Images */}
      {story.images && story.images.length > 0 && story.images.map((imageUrl, index) => (
        <div key={index} className="absolute inset-0">
          <Image
            src={imageUrl}
            alt={`Story image ${index + 1}`}
            fill
            className="object-cover"
            unoptimized={imageUrl.includes('supabase.co')}
          />
        </div>
      ))}

      {/* Text Elements */}
      {textElements.map((element) => (
        <div
          key={element.id}
          className="absolute pointer-events-none"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            transform: 'translate(-50%, -50%)',
            color: element.color,
            fontSize: `${element.fontSize * (isCardPreview ? 0.2 : 0.5)}px`,
            fontStyle: element.fontStyle,
            textAlign: element.textAlign as any,
            fontFamily: element.fontFamily,
            fontWeight: element.fontWeight,
            backgroundColor: element.backgroundColor,
            padding: element.backgroundColor ? (isCardPreview ? '0.5px 1px' : '1px 3px') : '0',
            borderRadius: element.backgroundColor ? (isCardPreview ? '1px' : '2px') : '0',
            maxWidth: '80%',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          {element.text}
        </div>
      ))}

      {/* Fallback Content Text */}
      {story.content && textElements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <p 
            className={`text-center font-medium leading-relaxed max-w-full break-words ${isCardPreview ? 'text-[8px]' : 'text-xs'}`}
            style={{ 
              color: story.textColor || '#ffffff',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}
          >
            {isCardPreview && story.content.length > 30 
              ? story.content.substring(0, 30) + '...' 
              : story.content}
          </p>
        </div>
      )}
    </div>
  )
}
