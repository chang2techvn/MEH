"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, Suspense, lazy } from "react"
import { toast } from "@/hooks/use-toast"

// Critical above-the-fold components - NO lazy loading
import MainHeader from "@/components/ui/main-header"
import { MobileNavigation } from "@/components/home/mobile-navigation"
import { CommunityMobileBottomNavigation } from "@/components/community/community-mobile-bottom-navigation"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import FeedPost from "@/components/feed/feed-post"
import FeedFilter from "@/components/feed/feed-filter"
import FeedEmptyState from "@/components/feed/feed-empty-state"
import SEOMeta from "@/components/optimized/seo-meta"
import { useMobile } from "@/hooks/use-mobile"
import { useStories } from "@/hooks/use-stories"
import { useAuth } from "@/contexts/auth-context"
import { useStoryControls } from "@/hooks/use-story-controls"
import { usePostManagement } from "@/hooks/use-post-management"
import { useCommunityData } from "@/hooks/use-community-data"
import { StoryViewer } from "@/components/community/story-viewer"
import type { Story } from "@/hooks/use-stories"

// Import essential community components directly - NO lazy loading
import {
  LeftSidebar,
  RightSidebar,
  StoriesSection,
  CreatePostCard,
  PostSkeleton,
} from "@/components/community"

// Only lazy load user-interaction modals
const CreatePostModal = lazy(() => import("@/components/community").then((mod) => ({ default: mod.CreatePostModal })))
const EnhancedStoryCreator = lazy(() => import("@/components/community").then((mod) => ({ default: mod.EnhancedStoryCreator })))

// Simple loading fallback for modals only
const ModalLoadingFallback = () => <div className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg h-32 w-full"></div>

export default function CommunityPage() {
  const { isMobile } = useMobile()
  const { user } = useAuth()
  const { 
    stories, 
    loading: storiesLoading, 
    createStory, 
    viewStory,
    addStoryReply 
  } = useStories()
  
  // UI state
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLeftSidebar, setShowLeftSidebar] = useState(false)
  const [showRightSidebar, setShowRightSidebar] = useState(false)
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 0)
  const [highlightPostId, setHighlightPostId] = useState<string | null>(null)
  
  // Story state
  const [activeStory, setActiveStory] = useState<number | string | null>(null)
  const [activeUserStories, setActiveUserStories] = useState<Story[]>([])
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [showStoryCreator, setShowStoryCreator] = useState(false)

  // Use custom hooks
  const communityData = useCommunityData()
  const postManagement = usePostManagement()
  const storyControls = useStoryControls({
    stories,
    user,
    activeStory,
    activeUserStories,
    currentStoryIndex,
    viewStory,
    addStoryReply,
  })

  // Extract highlight parameter from URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const highlight = urlParams.get('highlight')
      if (highlight) {
        setHighlightPostId(highlight)
        // Remove the parameter from URL after extracting
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [])

  // Auto-advance stories when viewing multiple stories
  useEffect(() => {
    if (activeStory && activeUserStories.length > 0 && !storyControls.storyPaused) {
      const currentStory = activeUserStories[currentStoryIndex]
      const isVideo = currentStory?.media_type === 'video' || 
        (currentStory?.media_url && (
          currentStory.media_url.includes('.mp4') || 
          currentStory.media_url.includes('.webm') || 
          currentStory.media_url.includes('.mov') ||
          currentStory.media_url.includes('video') ||
          currentStory.media_url.includes('.avi')
        ))

      // For videos, let the video control the timing via onEnded event
      if (!isVideo) {
        const timer = setTimeout(() => {
          storyControls.goToNextStory(setActiveUserStories, setCurrentStoryIndex, setActiveStory, storyControls.setStoryPaused)
        }, 5000) // 5 seconds for image stories

        return () => clearTimeout(timer)
      }
    }
  }, [activeStory, currentStoryIndex, activeUserStories, viewStory, storyControls.storyPaused])

  // Reset video progress when story changes
  useEffect(() => {
    if (activeStory) {
      storyControls.setVideoProgress(0)
      storyControls.setVideoMuted(true)
      if (storyControls.videoRef.current) {
        storyControls.videoRef.current.currentTime = 0
        storyControls.videoRef.current.muted = true
      }
    }
  }, [activeStory, currentStoryIndex])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    // Handle new posts published from challenges
    const handleNewPostPublished = (event: CustomEvent) => {
      const newPost = event.detail
      communityData.setFeedPosts(prev => [newPost, ...prev])
      toast({
        title: "New post published!",
        description: "Your challenge submission has been shared to the community.",
      })
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("newPostPublished", handleNewPostPublished as EventListener)
    
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("newPostPublished", handleNewPostPublished as EventListener)
    }
  }, [])

  // Scroll to highlighted post after data is loaded
  useEffect(() => {
    if (highlightPostId && communityData.feedPosts.length > 0 && !communityData.loading) {
      setTimeout(() => {
        const element = document.getElementById(`post-${highlightPostId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Add highlight effect
          element.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50')
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50')
          }, 3000)
        }
      }, 500)
    }
  }, [highlightPostId, communityData.feedPosts, communityData.loading])

  // Set mounted to true for client-side rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle story click
  const handleStoryClick = (story: Story) => {
    // Check if this is from the "Add Story" button (handled in StoriesSection)
    // or if story.id is 0 for backward compatibility
    if (String(story.id) === "0" || story.id === "add-story") {
      setShowStoryCreator(true)
      return
    }

    // Find all stories from the same user
    const groupedStories = storyControls.getStoriesGroupedByUser()
    const userGroup = groupedStories.find(group => 
      group.stories.some(s => s.id === story.id)
    )
    
    if (userGroup) {
      // Set all stories from this user
      setActiveUserStories(userGroup.stories)
      // Find the index of the clicked story
      const storyIndex = userGroup.stories.findIndex(s => s.id === story.id)
      setCurrentStoryIndex(storyIndex)
      setActiveStory(story.id)
      storyControls.setProgressKey(prev => prev + 1)
      
      // Mark story as viewed
      viewStory(String(story.id))
    }
  }

  if (!mounted) return null

  // Helper function to toggle right sidebar on mobile
  const toggleRightSidebar = () => {
    setShowRightSidebar(!showRightSidebar)
    if (!showRightSidebar) {
      // Close left sidebar if opening right sidebar
      setShowLeftSidebar(false)
    }
  }

  // Helper function to toggle left sidebar on mobile
  const toggleLeftSidebar = () => {
    setShowLeftSidebar(!showLeftSidebar)
    if (!showLeftSidebar) {
      // Close right sidebar if opening left sidebar
      setShowRightSidebar(false)
    }
  }

  // Determine if we're on a small mobile device
  const isSmallMobile = windowWidth < 640 // sm breakpoint
  const isTablet = windowWidth >= 640 && windowWidth < 1024 // between sm and lg

  return (
    <>
      <SEOMeta
        title="Community | EnglishMastery - Connect with English Learners Worldwide"
        description="Join our global English learning community. Connect with learners worldwide, share your progress, participate in discussions, and grow together in a supportive environment."
        keywords={[
          "English community",
          "language learners",
          "English practice",
          "global community",
          "language exchange",
        ]}
      />
      <div className="flex min-h-screen flex-col bg-[#f0f2f5] dark:bg-gray-900">
        <MainHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

        {/* Mobile menu */}
        <MobileNavigation 
          isOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)} 
        />

        {/* Main Content */}
        <main className="flex-1 relative">
          <div className="w-full max-w-none px-1 sm:px-2 md:px-4 lg:px-6 xl:px-8 2xl:px-12 py-2 sm:py-4">
            <div className="flex flex-col lg:flex-row lg:gap-4 xl:gap-6 2xl:gap-8 2xl:justify-center 2xl:max-w-[1800px] 2xl:mx-auto">
              {/* Left Sidebar */}
              <LeftSidebar 
                showLeftSidebar={showLeftSidebar}
                setShowLeftSidebar={setShowLeftSidebar}
              />

              {/* Main Feed */}
              <div className="flex-1 order-1 lg:order-2 max-w-full lg:max-w-[600px] xl:max-w-[800px] 2xl:max-w-[800px] 2xl:ml-32 2xl:mr-8">
                {/* Stories Section */}
                <StoriesSection
                  setShowStoryCreator={setShowStoryCreator}
                  handleStoryClick={handleStoryClick}
                />

                {/* Create Post Card */}
                <CreatePostCard
                  setShowNewPostForm={postManagement.setShowNewPostForm}
                  setShowEmojiPicker={postManagement.setShowEmojiPicker}
                  postFileInputRef={postManagement.postFileInputRef}
                />

                {/* Feed Filters */}
                <div className="mb-2 sm:mb-4">
                  <FeedFilter onFilterChange={postManagement.handleFilterChange} />
                </div>

                {/* Feed Posts */}
                <div className="space-y-2 sm:space-y-4">
                  {communityData.initialLoad ? (
                    Array(3)
                      .fill(0)
                      .map((_, i) => <PostSkeleton key={i} />)
                  ) : communityData.feedPosts.length > 0 ? (
                    communityData.feedPosts.map((post) => (
                      <div key={post.id} id={`post-${post.id}`}>
                        <FeedPost
                          id={String(post.id)}
                          username={post.username}
                          userImage={post.userImage}
                          timeAgo={post.timeAgo}
                          content={post.content}
                          mediaType={post.mediaType}
                          mediaUrl={post.mediaUrl}
                          mediaUrls={post.mediaUrls}
                          youtubeVideoId={post.youtubeVideoId}
                          textContent={post.textContent}
                          likes={post.likes}
                          comments={post.comments}
                          submission={post.submission}
                          videoEvaluation={post.videoEvaluation}
                          isNew={post.isNew}
                          title={post.title}
                        />
                      </div>
                    ))
                  ) : (
                    <FeedEmptyState
                      onRefresh={() => communityData.loadData()}
                      filterActive={postManagement.activeFilters.length > 0}
                    />
                  )}

                  {communityData.feedPosts.length > 0 && (
                    <div className="flex justify-center py-4">
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          toast({
                            title: "Loading more posts",
                            description: "Fetching additional content for your feed",
                          })
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Load More
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar */}
              <RightSidebar
                showRightSidebar={showRightSidebar}
                setShowRightSidebar={setShowRightSidebar}
                contacts={communityData.contacts}
                events={communityData.events}
                loading={communityData.loading}
              />
            </div>
          </div>
        </main>

        {/* Create Post Modal */}
        <Suspense fallback={<ModalLoadingFallback />}>
          <CreatePostModal
            showNewPostForm={postManagement.showNewPostForm}
            setShowNewPostForm={postManagement.setShowNewPostForm}
            newPostContent={postManagement.newPostContent}
            setNewPostContent={postManagement.setNewPostContent}
            isPostingContent={postManagement.isPostingContent}
            selectedFeeling={postManagement.selectedFeeling}
            setSelectedFeeling={postManagement.setSelectedFeeling}
            location={postManagement.location}
            setLocation={postManagement.setLocation}
            taggedPeople={postManagement.taggedPeople}
            setTaggedPeople={postManagement.setTaggedPeople}
            selectedDate={postManagement.selectedDate}
            setSelectedDate={postManagement.setSelectedDate}
            selectedMedia={postManagement.selectedMedia}
          setSelectedMedia={postManagement.setSelectedMedia}
          mediaPreviews={postManagement.mediaPreviews}
          setMediaPreviews={postManagement.setMediaPreviews}
          showEmojiPicker={postManagement.showEmojiPicker}
          setShowEmojiPicker={postManagement.setShowEmojiPicker}
          showLocationPicker={postManagement.showLocationPicker}
          setShowLocationPicker={postManagement.setShowLocationPicker}
          showTagPeople={postManagement.showTagPeople}
          setShowTagPeople={postManagement.setShowTagPeople}
          postFileInputRef={postManagement.postFileInputRef}
          contacts={communityData.contacts}
          handlePostSubmit={postManagement.handlePostSubmit}
          handleMediaSelect={postManagement.handleMediaSelect}
          removeSelectedMedia={postManagement.removeSelectedMedia}
          handleFeelingSelect={postManagement.handleFeelingSelect}
          handleLocationSelect={postManagement.handleLocationSelect}
          handlePersonTag={postManagement.handlePersonTag}
          removeTaggedPerson={postManagement.removeTaggedPerson}
        />
        </Suspense>

        {/* Story Viewer */}
        <StoryViewer
          activeStory={activeStory}
          activeUserStories={activeUserStories}
          currentStoryIndex={currentStoryIndex}
          progressKey={storyControls.progressKey}
          stories={stories}
          user={user}
          storyPaused={storyControls.storyPaused}
          videoProgress={storyControls.videoProgress}
          videoMuted={storyControls.videoMuted}
          videoRef={storyControls.videoRef}
          showStoryViewers={storyControls.showStoryViewers}
          selectedStoryForViewers={storyControls.selectedStoryForViewers}
          storyReplyText={storyControls.storyReplyText}
          isSubmittingReply={storyControls.isSubmittingReply}
          showStoryReactions={storyControls.showStoryReactions}
          storyReactions={storyControls.storyReactions}
          onClose={() => setActiveStory(null)}
          onPreviousStory={() => storyControls.goToPreviousStory(setActiveUserStories, setCurrentStoryIndex, setActiveStory)}
          onNextStory={() => storyControls.goToNextStory(setActiveUserStories, setCurrentStoryIndex, setActiveStory, storyControls.setStoryPaused)}
          onCenterTap={storyControls.handleCenterTap}
          onStoryViewersClick={storyControls.handleStoryViewersClick}
          onCloseStoryViewers={storyControls.handleCloseStoryViewers}
          onVideoLoadedMetadata={storyControls.handleVideoLoadedMetadata}
          onVideoTimeUpdate={storyControls.handleVideoTimeUpdate}
          onVideoEnded={() => storyControls.handleVideoEnded(setActiveUserStories, setCurrentStoryIndex, setActiveStory, storyControls.setStoryPaused)}
          onVideoMuteToggle={storyControls.handleVideoMuteToggle}
          onStoryReplyChange={storyControls.setStoryReplyText}
          onStoryReplySubmit={storyControls.handleStoryReplySubmit}
          onStoryReplyKeyPress={storyControls.handleStoryReplyKeyPress}
          onStoryReactionOpen={() => storyControls.setStoryPaused(true)}
          onStoryReaction={storyControls.handleStoryReaction}
          setStoryReplyText={storyControls.setStoryReplyText}
          setShowStoryReactions={storyControls.setShowStoryReactions}
          setStoryPaused={storyControls.setStoryPaused}
        />

        {/* Enhanced Story Creator */}
        <Suspense fallback={<ModalLoadingFallback />}>
          <EnhancedStoryCreator isOpen={showStoryCreator} onClose={() => setShowStoryCreator(false)} />
        </Suspense>

        {/* Floating Story Reaction Animations */}
        <AnimatePresence>
          {storyControls.storyReactionAnimations.map((reaction) => (
            <motion.div
              key={reaction.id}
              initial={{ 
                opacity: 1, 
                scale: 1, 
                x: reaction.x - 20, 
                y: reaction.y - 20 
              }}
              animate={{ 
                opacity: 0, 
                scale: 1.5, 
                y: reaction.y - 120,
                x: reaction.x - 20 + (Math.random() - 0.5) * 40
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, ease: "easeOut" }}
              className="fixed pointer-events-none z-[9999] text-3xl"
              style={{
                left: 0,
                top: 0,
              }}
            >
              {reaction.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Mobile Bottom Navigation - Only visible on mobile */}
        <div className="md:hidden">
          <CommunityMobileBottomNavigation />
        </div>
      </div>
    </>
  )
}
