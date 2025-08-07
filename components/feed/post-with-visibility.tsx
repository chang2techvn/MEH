"use client"

import { usePostVisibility } from "@/hooks/use-post-visibility"
import FeedPost from "@/components/feed/feed-post"

interface PostWithVisibilityProps {
  post: any
  postIndex: number
  totalPosts: number
  onPostVisible: (postIndex: number, totalPosts: number) => void
}

export function PostWithVisibility({ 
  post, 
  postIndex, 
  totalPosts, 
  onPostVisible 
}: PostWithVisibilityProps) {
  const { ref } = usePostVisibility({
    postIndex,
    totalPosts,
    onPostVisible
  })

  return (
    <div ref={ref} id={`post-${post.id}`}>
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
  )
}
