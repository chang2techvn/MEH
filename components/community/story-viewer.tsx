"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { X, Send, Eye, Heart, Volume2, VolumeX } from "lucide-react"
import { StoryViewersModal } from "@/components/community/story-viewers-modal"
import type { Story } from "@/hooks/use-stories"

// Format story time to show hours (e.g., "21h") or "now" for recent stories
const formatStoryTime = (dateString: string): string => {
  const now = new Date()
  const storyDate = new Date(dateString)
  const diffInMinutes = Math.floor((now.getTime() - storyDate.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 5) {
    return "now"
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m`
  } else {
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours}h`
    } else {
      // Story should expire after 24 hours, but just in case
      return "1d"
    }
  }
}

interface StoryViewerProps {
  activeStory: number | string | null
  activeUserStories: Story[]
  currentStoryIndex: number
  progressKey: number
  stories: Story[]
  user: any
  storyPaused: boolean
  videoProgress: number
  videoMuted: boolean
  videoRef: React.RefObject<HTMLVideoElement | null>
  showStoryViewers: boolean
  selectedStoryForViewers: string | null
  storyReplyText: string
  isSubmittingReply: boolean
  showStoryReactions: boolean
  storyReactions: string[]
  onClose: () => void
  onPreviousStory: () => void
  onNextStory: () => void
  onCenterTap: () => void
  onStoryViewersClick: (e: React.MouseEvent) => void
  onCloseStoryViewers: () => void
  onVideoLoadedMetadata: () => void
  onVideoTimeUpdate: () => void
  onVideoEnded: () => void
  onVideoMuteToggle: () => void
  onStoryReplyChange: (value: string) => void
  onStoryReplySubmit: () => void
  onStoryReplyKeyPress: (e: React.KeyboardEvent) => void
  onStoryReactionOpen: () => void
  onStoryReaction: (emoji: string) => void
  setStoryReplyText: (text: string) => void
  setShowStoryReactions: (show: boolean) => void
  setStoryPaused: (paused: boolean) => void
}

export function StoryViewer({
  activeStory,
  activeUserStories,
  currentStoryIndex,
  progressKey,
  stories,
  user,
  storyPaused,
  videoProgress,
  videoMuted,
  videoRef,
  showStoryViewers,
  selectedStoryForViewers,
  storyReplyText,
  isSubmittingReply,
  showStoryReactions,
  storyReactions,
  onClose,
  onPreviousStory,
  onNextStory,
  onCenterTap,
  onStoryViewersClick,
  onCloseStoryViewers,
  onVideoLoadedMetadata,
  onVideoTimeUpdate,
  onVideoEnded,
  onVideoMuteToggle,
  onStoryReplyChange,
  onStoryReplySubmit,
  onStoryReplyKeyPress,
  onStoryReactionOpen,
  onStoryReaction,
  setStoryReplyText,
  setShowStoryReactions,
  setStoryPaused
}: StoryViewerProps) {
  if (activeStory === null) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 pb-16 md:pb-0"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full text-white z-60"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-[280px] mx-4 sm:max-w-xs md:max-w-sm lg:max-w-md md:mx-0"
        >
          {/* Story content */}
          <div className="relative aspect-[9/16] max-h-[calc(100vh-8rem)] md:max-h-none overflow-hidden rounded-xl bg-gradient-to-br from-neo-mint/20 to-purist-blue/20">
            {/* Story Progress Bars */}
            {activeUserStories.length > 1 && (
              <div className="absolute top-2 left-3 right-3 flex gap-1 z-10">
                {activeUserStories.map((story, index) => {
                  const currentStory = activeUserStories[currentStoryIndex]
                  const isVideo = currentStory?.media_type === 'video' || 
                    (currentStory?.media_url && (
                      currentStory.media_url.includes('.mp4') || 
                      currentStory.media_url.includes('.webm') || 
                      currentStory.media_url.includes('.mov') ||
                      currentStory.media_url.includes('video') ||
                      currentStory.media_url.includes('.avi')
                    ))
                  
                  return (
                    <div 
                      key={`${progressKey}-${index}`}
                      className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
                    >
                      <motion.div
                        key={`progress-${progressKey}-${index}`}
                        className="h-full bg-white"
                        initial={{ width: index < currentStoryIndex ? "100%" : "0%" }}
                        animate={{ 
                          width: index < currentStoryIndex ? "100%" : 
                                 index === currentStoryIndex ? 
                                   (isVideo && index === currentStoryIndex ? `${videoProgress}%` : "100%") : 
                                   "0%" 
                        }}
                        transition={{ 
                          duration: index === currentStoryIndex ? 
                            (storyPaused ? 0 : (isVideo ? 0 : 5)) : 0,
                          ease: "linear",
                          delay: 0
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            )}

            {/* Enhanced Story Content Rendering */}
            {(() => {
              const currentStory = activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory)
              if (!currentStory) return null

              const mediaUrl = currentStory?.media_url || (currentStory?.images?.[0])
              const mediaType = currentStory?.media_type
              const backgroundColor = currentStory?.background_color || '#000000'
              const backgroundImage = currentStory?.background_image
              const textElements = currentStory?.text_elements || []
              const mediaTransform = currentStory?.media_transform
              
              const isVideo = mediaType === 'video' || 
                (mediaUrl && (mediaUrl.includes('.mp4') || 
                mediaUrl.includes('.webm') || 
                mediaUrl.includes('.mov') ||
                mediaUrl.includes('video') ||
                mediaUrl.includes('.avi')))

              return (
                <div 
                  className="w-full h-full relative overflow-hidden"
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
                  {/* Background Media */}
                  {mediaUrl && (
                    <div 
                      className="absolute inset-0 overflow-hidden"
                      style={{
                        transform: mediaTransform ? 
                          `scale(${mediaTransform.scale || 1}) translate(${mediaTransform.x || 0}px, ${mediaTransform.y || 0}px) rotate(${mediaTransform.rotation || 0}deg)` :
                          undefined
                      }}
                    >
                      {isVideo ? (
                        <video
                          ref={videoRef}
                          key={activeStory} // Force re-render when story changes
                          src={mediaUrl}
                          className="w-full h-full object-cover"
                          autoPlay
                          muted={videoMuted}
                          loop={false} // Don't loop, let it end naturally
                          playsInline
                          controls={false}
                          onLoadedMetadata={onVideoLoadedMetadata}
                          onTimeUpdate={onVideoTimeUpdate}
                          onEnded={onVideoEnded}
                          onLoadedData={(e) => {
                            // Restart video from beginning when story opens
                            e.currentTarget.currentTime = 0
                            e.currentTarget.play()
                          }}
                        />
                      ) : (
                        <Image
                          src={mediaUrl}
                          alt="Story"
                          fill
                          priority={true}
                          className="object-cover"
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        />
                      )}
                    </div>
                  )}

                  {/* Text Elements */}
                  {textElements.map((textElement: any, index: number) => (
                    <div
                      key={textElement.id || index}
                      className="absolute select-none pointer-events-none z-10"
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
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)', // Add shadow for better readability
                      }}
                    >
                      {textElement.text}
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* Navigation Areas and Buttons */}
            <>
              {/* Previous Story Area (invisible clickable area) - excluding bottom reply area */}
              <div 
                className="absolute left-0 top-0 w-1/3 bottom-16 cursor-pointer z-10"
                onClick={onPreviousStory}
              />
              
              {/* Center Pause/Resume Area */}
              <div 
                className="absolute left-1/3 top-16 w-1/3 bottom-16 cursor-pointer z-10 flex items-center justify-center"
                onClick={onCenterTap}
              >
                {/* Pause/Play indicator */}
                {storyPaused && (
                  <div className="bg-black/50 backdrop-blur-sm rounded-full p-3 transition-opacity duration-300 ease-in-out">
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Next Story Area (invisible clickable area) - excluding top area for eye button and bottom reply area */}
              <div 
                className="absolute right-0 top-16 w-1/3 bottom-16 cursor-pointer z-10"
                onClick={onNextStory}
              />

              {/* Visible Navigation Buttons */}
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 border border-white/20"
                  onClick={onPreviousStory}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
              </div>

              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 border border-white/20"
                  onClick={onNextStory}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </>

            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex items-center gap-2 z-20">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-white">
                <AvatarImage src={
                  (activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory))?.profiles?.avatar_url || "/placeholder.svg"
                } />
                <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
                  {(activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory))?.profiles?.full_name?.substring(0, 2) || 
                   (activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory))?.profiles?.username?.substring(0, 2) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm sm:text-base text-white">
                  {(activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory))?.profiles?.full_name || 
                   (activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory))?.profiles?.username || "Unknown"}
                </p>
                <p className="text-xs text-white/70">
                  {(activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory))?.created_at 
                    ? formatStoryTime((activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory))!.created_at!) 
                    : "now"
                  }
                </p>
              </div>
            </div>

            {/* Story viewers - Only show for story author */}
            {user && (activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory))?.author_id === user.id && (
              <>
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-30">
                  <div 
                    className="h-8 rounded-full bg-black/30 text-white px-3 flex items-center cursor-pointer hover:bg-black/40 transition-colors"
                    onClick={onStoryViewersClick}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    <span className="text-xs">{(activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory))?.views_count || 0}</span>
                  </div>
                </div>

                {/* Story Viewers Overlay */}
                <StoryViewersModal 
                  isOpen={showStoryViewers}
                  onClose={onCloseStoryViewers}
                  storyId={selectedStoryForViewers || ''}
                  storyAuthorId={user?.id || ''}
                />
              </>
            )}

            {/* Video Volume Control - Only show for video stories */}
            {(() => {
              const currentStory = activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory)
              const isVideo = currentStory?.media_type === 'video' || 
                (currentStory?.media_url && (
                  currentStory.media_url.includes('.mp4') || 
                  currentStory.media_url.includes('.webm') || 
                  currentStory.media_url.includes('.mov') ||
                  currentStory.media_url.includes('video') ||
                  currentStory.media_url.includes('.avi')
                ))
              
              if (!isVideo) return null
              
              return (
                <div className="absolute top-16 sm:top-20 left-3 sm:left-4 z-30">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 border border-white/20"
                    onClick={onVideoMuteToggle}
                  >
                    {videoMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )
            })()}

            {/* Story interactions */}
            <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 px-3 sm:px-4 z-20 mb-safe">
              <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full p-1.5 sm:p-2">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-white flex-shrink-0">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                {(() => {
                  const currentStory = activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory)
                  const isOwnStory = currentStory && user && currentStory.author_id === user.id
                  
                  if (isOwnStory) {
                    return (
                      <div className="flex-1 flex items-center justify-center text-white/70 text-sm">
                        <span>This is your story</span>
                      </div>
                    )
                  }
                  
                  return (
                    <div className="flex gap-1 items-center flex-1 min-w-0">
                      {/* Maximized Story Reply Input with integrated Send button */}
                      <div className="relative flex-1 min-w-0">
                        <Input
                          placeholder="Reply to story..."
                          className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/70 focus-visible:ring-1 focus-visible:ring-white/50 focus-visible:ring-offset-0 text-sm rounded-full px-4 py-2 pr-12 h-10"
                          value={storyReplyText}
                          onChange={(e) => onStoryReplyChange(e.target.value)}
                          onKeyDown={onStoryReplyKeyPress}
                          onFocus={() => setStoryPaused(true)} // Pause story when focusing on input
                          onBlur={() => {
                            // Only resume if not submitting reply
                            if (!isSubmittingReply) {
                              setStoryPaused(false)
                            }
                          }}
                          disabled={isSubmittingReply}
                        />
                        
                        {/* Send Button inside input - Completely stable positioning */}
                        <button 
                          onClick={onStoryReplySubmit}
                          disabled={!storyReplyText.trim() || isSubmittingReply}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-7 h-7 text-white rounded-full bg-transparent hover:bg-white/20 disabled:opacity-50 border-0 p-0 flex items-center justify-center transition-colors duration-200"
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '28px',
                            height: '28px',
                            margin: 0,
                            padding: 0,
                            border: 'none',
                            outline: 'none',
                            cursor: (!storyReplyText.trim() || isSubmittingReply) ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {isSubmittingReply ? (
                            <svg className="animate-spin h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      
                      {/* Story Reactions Button - compact and right-aligned */}
                      <Popover open={showStoryReactions} onOpenChange={setShowStoryReactions}>
                        <PopoverTrigger asChild>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="story-reactions-button h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all duration-200 flex-shrink-0"
                            onClick={onStoryReactionOpen}
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-auto p-1 bg-black/30 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl"
                          align="end"
                          side="top"
                          sideOffset={10}
                        >
                          <div className="flex gap-1">
                            {storyReactions.map((emoji) => (
                              <Button
                                key={emoji}
                                variant="ghost"
                                size="sm"
                                className="text-lg p-1 h-auto transition-colors duration-200 hover:bg-white/10 rounded-xl min-w-0"
                                onClick={() => onStoryReaction(emoji)}
                              >
                                {emoji}
                              </Button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
