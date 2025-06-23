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
      ) : (        <div
          className="w-[90px] sm:w-[110px] h-[160px] sm:h-[200px] rounded-xl relative overflow-hidden cursor-pointer"
          onClick={onClick}
        >          <LazyThumbnailImage 
            src={story.storyImage || "/placeholder.svg"} 
            alt={story.user} 
            fill 
            className="object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
          <div className="absolute top-2 left-2">
            <div
              className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full border-3 sm:border-4 ${story.viewed ? "border-gray-400" : "border-neo-mint dark:border-purist-blue"} overflow-hidden`}
            >
              <LazyAvatarImage
                src={story.userImage || "/placeholder.svg"}
                alt={story.user}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-white text-xs sm:text-sm font-medium line-clamp-2">{story.user}</p>
          </div>        </div>
      )}
    </div>
  )
}
