"use client"

import { Plus } from "lucide-react"
import { LazyAvatarImage } from "@/components/optimized/lazy-image"
import { StoryPreview } from "./story-preview"
import type { StoryCardProps } from "./types"

export function StoryCard({ story, onClick }: StoryCardProps) {
  return (
    <div className="flex-shrink-0 hover-lift">
      {story.isAddStory ? (
        <div
          className="w-[90px] sm:w-[110px] h-[160px] sm:h-[200px] rounded-xl relative overflow-hidden cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center"
          onClick={onClick}
        >
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-2">
            <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-neo-mint dark:text-purist-blue" />
          </div>
          <p className="text-xs sm:text-sm font-medium">Create Story</p>
        </div>
      ) : (
        <div
          className="w-[90px] sm:w-[110px] h-[160px] sm:h-[200px] rounded-xl relative overflow-hidden cursor-pointer"
          onClick={onClick}
          style={{
            background: story.backgroundColor?.includes('gradient') 
              ? story.backgroundColor 
              : (story.backgroundColor || '#000000')
          }}
        >
          {/* Background Media */}
          {story.storyImage && (
            <div 
              className="absolute w-full h-full"
              style={{
                transform: story.mediaTransform ? 
                  `translate(${story.mediaTransform.x * 0.2}%, ${story.mediaTransform.y * 0.5}%) scale(${story.mediaTransform.scale * 1}) rotate(${story.mediaTransform.rotation}deg)` 
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
                />
              ) : (
                <img
                  src={story.storyImage}
                  alt="Story"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          )}
          
          {/* Text Elements */}
          {story.textElements && story.textElements.map((element: any) => (
            <div
              key={element.id}
              className="absolute pointer-events-none"
              style={{
                left: `${Math.min(Math.max(element.x * 0.8 + 10, 5), 90)}%`,
                top: `${Math.min(Math.max(element.y * 0.8 + 10, 5), 90)}%`,
                transform: 'translate(-50%, -50%)',
                color: element.color,
                fontSize: `${Math.max(element.fontSize * 0.25, 6)}px`,
                fontStyle: element.fontStyle,
                fontFamily: element.fontFamily,
                fontWeight: element.fontWeight,
                backgroundColor: element.backgroundColor,
                padding: element.backgroundColor ? '1px 2px' : '0',
                borderRadius: element.backgroundColor ? '2px' : '0',
                maxWidth: '70%',
                textShadow: '1px 1px 1px rgba(0,0,0,0.8)',
                lineHeight: '1.1',
              }}
            >
              {element.text.length > 15 ? element.text.substring(0, 15) + '...' : element.text}
            </div>
          ))}
          
          {/* Fallback Content */}
          {story.content && (!story.textElements || story.textElements.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <p 
                className="text-center font-medium text-[8px] leading-tight max-w-full break-words"
                style={{ 
                  color: story.textColor || '#ffffff',
                  textShadow: '1px 1px 1px rgba(0,0,0,0.8)'
                }}
              >
                {story.content.length > 40 ? story.content.substring(0, 40) + '...' : story.content}
              </p>
            </div>
          )}

          {/* Story Preview Component - Fallback */}
          {!story.backgroundColor && !story.storyImage && (
            <StoryPreview
              story={{
                id: String(story.id),
                storyImage: story.storyImage,
                mediaType: story.mediaType,
                content: story.content,
                textElements: story.textElements,
                backgroundColor: story.backgroundColor,
                textColor: story.textColor,
                backgroundImage: story.backgroundImage,
                mediaTransform: story.mediaTransform,
                images: story.images
              }}
              className="w-full h-full"
              isCardPreview={true}
            />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none z-10"></div>
          
          {/* User Avatar */}
          <div className="absolute top-2 left-2 z-20">
            <div
              className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full border-3 sm:border-4 ${story.isViewed ? "border-gray-400" : "border-neo-mint dark:border-purist-blue"} overflow-hidden`}
            >
              <LazyAvatarImage
                src={story.userImage || "/placeholder.svg"}
                alt={story.username}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            {/* Multiple stories indicator */}
            {story.hasMultiple && (
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-neo-mint dark:bg-purist-blue rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">+</span>
              </div>
            )}
          </div>
          
          {/* Username */}
          <div className="absolute bottom-2 left-2 right-2 z-20">
            <p className="text-white text-xs sm:text-sm font-medium line-clamp-2 drop-shadow-lg">{story.username}</p>
          </div>
        </div>
      )}
    </div>
  )
}
