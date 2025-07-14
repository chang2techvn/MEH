"use client"

import { Plus } from "lucide-react"
import { LazyThumbnailImage, LazyAvatarImage } from "@/components/optimized/lazy-image"
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
          className="w-[90px] sm:w-[110px] h-[160px] sm:h-[200px] rounded-xl relative overflow-hidden cursor-pointer bg-gray-100 dark:bg-gray-800"
          onClick={onClick}
        >
          {/* Media Content */}
          {(() => {
            const isVideo = story.storyImage && (
              story.storyImage.includes('.mp4') || 
              story.storyImage.includes('.webm') || 
              story.storyImage.includes('.mov') ||
              story.storyImage.includes('video') ||
              story.storyImage.includes('.avi')
            )
            
            if (isVideo) {
              return (
                <video
                  src={story.storyImage}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster={story.storyImage}
                />
              )
            } else {
              return (
                <LazyThumbnailImage 
                  src={story.storyImage || "/placeholder.svg"} 
                  alt={story.username} 
                  fill 
                  className="object-cover" 
                />
              )
            }
          })()}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
          
          {/* User Avatar */}
          <div className="absolute top-2 left-2">
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
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-white text-xs sm:text-sm font-medium line-clamp-2 drop-shadow-lg">{story.username}</p>
          </div>
        </div>
      )}
    </div>
  )
}
