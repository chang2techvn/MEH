"use client"

import { motion } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus } from "lucide-react"
import { StoryCard } from "./story-card"
import { StoryCardSkeleton } from "./story-card-skeleton"
import { useStories } from "@/hooks/use-stories"
import type { Story } from "@/hooks/use-stories"

interface StoriesSectionProps {
  setShowStoryCreator: (show: boolean) => void
  handleStoryClick: (story: Story) => void
}

export function StoriesSection({
  setShowStoryCreator,
  handleStoryClick,
}: StoriesSectionProps) {
  const { stories, loading, getStoriesGroupedByUser } = useStories()
  const storiesGrouped = getStoriesGroupedByUser()

  return (
    <div className="mb-4 overflow-hidden">
      <div className="mb-2">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base">Stories</h3>
      </div>
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2 min-w-max">
          {/* Add Story Card - Always First */}
          {!loading && (
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="flex-shrink-0"
            >
              <div
                className="w-[90px] sm:w-[110px] h-[160px] sm:h-[200px] rounded-xl relative overflow-hidden cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center"
                onClick={() => setShowStoryCreator(true)}
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-2">
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-neo-mint dark:text-purist-blue" />
                </div>
                <p className="text-xs sm:text-sm font-medium">Create Story</p>
              </div>
            </motion.div>
          )}

          {/* Story Cards */}
          {loading
            ? Array(8)
                .fill(0)
                .map((_, i) => <StoryCardSkeleton key={i} />)
            : storiesGrouped.map((userStories, index) => (
                <StoryCard 
                  key={userStories.user?.user_id || index} 
                  story={{
                    id: userStories.stories[0].id,
                    username: userStories.user?.full_name || userStories.user?.username || "Unknown",
                    userImage: userStories.user?.avatar_url || "/placeholder.svg",
                    storyImage: userStories.stories[0].media_url || "/placeholder.svg",
                    mediaType: userStories.stories[0].media_type as "image" | "video",
                    isViewed: false,
                    hasMultiple: userStories.stories.length > 1,
                    isAddStory: false,
                    content: userStories.stories[0].content,
                    textElements: userStories.stories[0].text_elements,
                    backgroundColor: userStories.stories[0].background_color,
                    textColor: userStories.stories[0].text_color,
                    backgroundImage: userStories.stories[0].background_image,
                    mediaTransform: userStories.stories[0].media_transform,
                    images: userStories.stories[0].images
                  }}
                  onClick={() => handleStoryClick(userStories.stories[0])}
                />
              ))}
        </div>
      </ScrollArea>
    </div>
  )
}
