"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useSavedPosts } from "@/hooks/use-saved-posts"
import { FeedPost } from "@/components/feed"
import {
  Search,
  Clock,
  Heart,
  MessageSquare,
  Bookmark,
  BookmarkX,
  User,
  Calendar,
  ChevronLeft,
  Image,
  Video,
  FileText,
  Play,
} from "lucide-react"

interface SavedPostsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface PostDetail {
  id: string
  title?: string
  content: string
  username: string
  user_image?: string
  media_url?: string
  media_urls?: string[]
  post_type: string
  created_at: string
  likes_count: number
  comments_count: number
  tags?: string[]
  score?: number
  ai_evaluation?: any
}

export function SavedPostsModal({ isOpen, onClose }: SavedPostsModalProps) {
  const { savedPosts, loading, error, unsavePost, refreshSavedPosts } = useSavedPosts()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredPosts, setFilteredPosts] = useState<any[]>([])
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [showDetail, setShowDetail] = useState(false)

  // Refresh saved posts when modal opens
  useEffect(() => {
    if (isOpen) {
      refreshSavedPosts()
    }
  }, [isOpen, refreshSavedPosts])

  // Close detail view when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedPost(null)
      setShowDetail(false)
    }
  }, [isOpen])

  // Filter posts based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPosts(savedPosts)
    } else {
      const filtered = savedPosts.filter(savedPost => {
        const post = savedPost.posts
        if (!post) return false
        
        const searchLower = searchQuery.toLowerCase()
        return (
          post.content?.toLowerCase().includes(searchLower) ||
          post.title?.toLowerCase().includes(searchLower) ||
          post.username?.toLowerCase().includes(searchLower) ||
          post.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
        )
      })
      setFilteredPosts(filtered)
    }
  }, [savedPosts, searchQuery])

  const handleUnsavePost = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const success = await unsavePost(postId)
    if (success && selectedPost?.id === postId) {
      setShowDetail(false)
      setSelectedPost(null)
    }
  }

  const handlePostClick = (post: any) => {
    setSelectedPost(post)
    setShowDetail(true)
  }

  const handleBackToList = () => {
    setShowDetail(false)
    setSelectedPost(null)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`
    
    const diffInMonths = Math.floor(diffInDays / 30)
    return `${diffInMonths}mo ago`
  }

  const MediaPreview = ({ post }: { post: any }) => {
    const hasMedia = post.media_url || (post.media_urls && post.media_urls.length > 0)
    const mediaUrl = post.media_url || post.media_urls?.[0]
    
    if (!hasMedia) {
      return (
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center flex-shrink-0">
          <FileText className="h-6 w-6 text-gray-400 dark:text-gray-500" />
        </div>
      )
    }

    const isVideo = post.post_type === 'video' || 
                   mediaUrl?.includes('.mp4') || 
                   mediaUrl?.includes('.webm') || 
                   mediaUrl?.includes('.mov')

    return (
      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
        {isVideo ? (
          <>
            <video 
              className="w-full h-full object-cover"
              src={mediaUrl}
              muted
              playsInline
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Play className="h-4 w-4 text-white" fill="white" />
            </div>
          </>
        ) : (
          <img 
            src={mediaUrl} 
            alt="Post media"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.parentElement!.innerHTML = `
                <div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              `
            }}
          />
        )}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-white/20 dark:border-gray-800/20 mx-auto my-auto p-3 sm:p-6 rounded-2xl sm:rounded-xl">
        <DialogHeader className="pb-3 sm:pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl">
            {showDetail && selectedPost ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToList}
                  className="rounded-full hover:bg-white/20 dark:hover:bg-gray-800/20"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                  <Bookmark className="relative h-6 w-6 text-neo-mint dark:text-purist-blue" />
                </div>
                Post Details
              </div>
            ) : (
              <>
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                  <Bookmark className="relative h-6 w-6 text-neo-mint dark:text-purist-blue" />
                </div>
                Saved Posts
                {!loading && (
                  <Badge variant="outline" className="ml-2 bg-white/20 dark:bg-gray-800/20">
                    {savedPosts.length}
                  </Badge>
                )}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden mt-2">
          <AnimatePresence mode="wait">
            {showDetail && selectedPost ? (
              // Post Detail View
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {/* Description for detail view */}
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-white/10 dark:bg-gray-800/10 mx-1">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Post details view. You can unsave this post using the button below.
                  </p>
                </div>

                <ScrollArea className="h-[280px] sm:h-[400px] pr-2 sm:pr-4">
                  <FeedPost
                    id={selectedPost.id}
                    username={selectedPost.username}
                    userImage={selectedPost.user_image || "/placeholder.svg"}
                    timeAgo={formatTimeAgo(selectedPost.created_at)}
                    content={selectedPost.content}
                    mediaType={selectedPost.post_type}
                    mediaUrl={selectedPost.media_url}
                    mediaUrls={selectedPost.media_urls}
                    likes={selectedPost.likes_count}
                    comments={selectedPost.comments_count}
                    title={selectedPost.title}
                  />
                </ScrollArea>

                {/* Footer with unsave button */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-white/10 dark:border-gray-800/10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleUnsavePost(selectedPost.id, e)}
                    className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 order-1 sm:order-1 text-xs sm:text-sm"
                  >
                    <BookmarkX className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Remove from Saved</span>
                    <span className="sm:hidden">Remove</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20 order-2 sm:order-2 self-end sm:self-auto text-xs sm:text-sm"
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            ) : (
            // Saved Posts List
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
              className="flex-1 overflow-hidden"
            >
              {/* Search Bar */}
              <div className="relative mb-3 sm:mb-4 px-1">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 z-10" />
                <Input
                  placeholder="Search saved posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 sm:pl-10 pr-2 sm:pr-4 h-9 sm:h-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-white/60 dark:border-gray-600/60 text-sm rounded-lg focus:ring-2 focus:ring-neo-mint/50 dark:focus:ring-purist-blue/50 focus:border-neo-mint/70 dark:focus:border-purist-blue/70 transition-colors shadow-sm"
                />
              </div>

              {/* Description */}
              <div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-white/10 dark:bg-gray-800/10 mx-1">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Your saved posts collection. Click on any post to view details or use the remove button to unsave.
                </p>
              </div>

              {/* Posts List */}
              <ScrollArea className="h-[280px] sm:h-[400px] pr-2 sm:pr-4">
                <div className="space-y-2 sm:space-y-3">
                  {loading ? (
                    // Loading skeleton
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/10 dark:bg-gray-800/10">
                        <Skeleton className="w-16 h-16 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-7 w-7 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                          <div className="flex gap-2">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    ))
                  ) : error ? (
                    <div className="text-center py-8">
                      <p className="text-red-500 dark:text-red-400 mb-2">{error}</p>
                      <Button onClick={refreshSavedPosts} variant="outline" size="sm">
                        Try Again
                      </Button>
                    </div>
                  ) : filteredPosts.length > 0 ? (
                    <AnimatePresence mode="wait">
                      {filteredPosts.map((savedPost, index) => {
                        const post = savedPost.posts
                        if (!post) return null

                        return (
                          <motion.div
                            key={`saved-${post.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-white/10 dark:bg-gray-800/10 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors group cursor-pointer"
                            onClick={() => handlePostClick(post)}
                          >
                            {/* Media Preview */}
                            <MediaPreview post={post} />

                            {/* Post Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                                <Avatar className="h-5 w-5 sm:h-6 sm:w-6 border border-white dark:border-gray-800">
                                  <AvatarImage src={post.user_image || "/placeholder.svg"} alt={post.username} />
                                  <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white text-xs">
                                    {post.username.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <p className="font-medium text-xs sm:text-sm truncate">{post.username}</p>
                                <span className="text-xs text-muted-foreground hidden sm:inline">
                                  {formatTimeAgo(post.created_at)}
                                </span>
                              </div>

                              {post.title && post.title !== post.content && (
                                <h4 className="font-medium text-xs mb-1 line-clamp-1">
                                  {post.title}
                                </h4>
                              )}

                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {post.content}
                              </p>

                              {/* Post Stats */}
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
                                <div className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  <span>{post.likes_count || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  <span>{post.comments_count || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Saved {formatTimeAgo(savedPost.created_at)}</span>
                                </div>
                              </div>

                              {/* Tags */}
                              {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {post.tags.slice(0, 2).map((tag: string, tagIndex: number) => (
                                    <Badge key={tagIndex} variant="outline" className="text-xs h-4 px-1 bg-white/20 dark:bg-gray-800/20">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {post.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs h-4 px-1 bg-white/20 dark:bg-gray-800/20">
                                      +{post.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Unsave Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={(e) => handleUnsavePost(post.id, e)}
                            >
                              <BookmarkX className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-muted-foreground mb-4">
                        <Bookmark className="h-16 w-16 mx-auto opacity-50" />
                      </div>
                      {searchQuery ? (
                        <div>
                          <h3 className="font-medium mb-2">No posts found</h3>
                          <p className="text-muted-foreground text-sm">
                            Try adjusting your search terms
                          </p>
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-medium mb-2">No saved posts yet</h3>
                          <p className="text-muted-foreground text-sm">
                            Start saving posts by clicking the bookmark icon
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-white/10 dark:border-gray-800/10">
                <p className="text-xs text-muted-foreground">
                  {searchQuery ? `${filteredPosts.length} of ${savedPosts.length} posts` : `${savedPosts.length} saved posts`}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20 self-end sm:self-auto text-xs sm:text-sm"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
