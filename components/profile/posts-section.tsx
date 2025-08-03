"use client"

import { motion } from "framer-motion"
import FeedPost from "@/components/feed/feed-post"
import EmptyState from "@/components/profile/empty-state"
import { PostsSkeleton } from "@/components/profile/profile-skeleton"
import { PostFilters } from "@/components/profile/post-filters"

interface UserPost {
  id: string
  username: string
  userImage: string
  timeAgo: string
  content: string
  mediaType?: 'image' | 'video' | 'youtube' | 'text' | 'ai-submission'
  mediaUrl?: string
  mediaUrls?: string[]
  youtubeVideoId?: string
  textContent?: string
  likes: number
  comments: number
  submission?: any
  videoEvaluation?: any
  isNew?: boolean
  title?: string
}

interface PostsSectionProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  activeFilter: string
  onFilterChange: (filter: string) => void
  filteredPosts: UserPost[]
  userPosts: UserPost[]
  isLoadingPosts: boolean
}

export function PostsSection({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  filteredPosts,
  userPosts,
  isLoadingPosts
}: PostsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-8 mx-8 md:mx-16 lg:mx-24 xl:mx-48 2xl:mx-72"
    >
      <div className="max-w-4xl mx-auto">
        {/* Search and Filter Controls */}
        <PostFilters
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          filteredPostsCount={filteredPosts.length}
          totalPostsCount={userPosts.length}
          isLoading={isLoadingPosts}
        />

        {/* Posts Content */}
        <div className="space-y-6">
          {isLoadingPosts ? (
            <PostsSkeleton />
          ) : filteredPosts.length === 0 ? (
            <EmptyState 
              type="posts"
              title={searchQuery ? "No posts found matching your search" : "No posts yet"}
              description={searchQuery ? "Try adjusting your search or filters" : "Start sharing your English learning journey!"}
            />
          ) : (
            filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <FeedPost
                  key={post.id}
                  id={String(post.id)}
                  username={post.username}
                  userImage={post.userImage}
                  timeAgo={post.timeAgo}
                  content={post.content}
                  mediaType={post.mediaType || 'text'}
                  mediaUrl={post.mediaUrl}
                  mediaUrls={post.mediaUrls}
                  youtubeVideoId={post.youtubeVideoId}
                  textContent={post.textContent}
                  likes={post.likes}
                  comments={post.comments}
                  submission={post.submission}
                  videoEvaluation={post.videoEvaluation}
                  isNew={post.isNew || false}
                  title={post.title}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  )
}
