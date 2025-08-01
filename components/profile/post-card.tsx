"use client"

import { motion } from "framer-motion"
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

interface UserPost {
  id: string
  content: string
  imageUrl?: string
  videoUrl?: string
  createdAt: string
  likesCount: number
  commentsCount: number
  isLiked: boolean
}

interface PostCardProps {
  post: UserPost
  index: number
  onLike?: (postId: string) => void
  onDelete?: (postId: string) => void
  onEdit?: (postId: string) => void
  showActions?: boolean
}

export default function PostCard({ 
  post, 
  index, 
  onLike, 
  onDelete, 
  onEdit, 
  showActions = true 
}: PostCardProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this post',
          text: post.content.substring(0, 100) + '...',
          url: `${window.location.origin}/post/${post.id}`,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
        // You could add a toast here
      } catch (error) {
        console.error('Error copying to clipboard:', error)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="border rounded-lg p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-md transition-all duration-300"
    >
      {/* Post Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="text-sm text-muted-foreground">
          {new Date(post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
        
        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(post.id)}>
                  Edit Post
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleShare}>
                Share Post
              </DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(post.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  Delete Post
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {/* Post Content */}
      <p className="text-sm leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>
      
      {/* Media Content */}
      {post.imageUrl && (
        <div className="rounded-lg overflow-hidden mb-3">
          <img
            src={post.imageUrl}
            alt="Post image"
            className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}
      
      {post.videoUrl && (
        <div className="rounded-lg overflow-hidden mb-3">
          <video
            src={post.videoUrl}
            controls
            className="w-full h-48 object-cover"
            poster={post.imageUrl} // Use image as video poster if available
          />
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
              post.isLiked ? 'text-red-500' : 'text-muted-foreground'
            }`}
            onClick={() => onLike?.(post.id)}
          >
            <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
            <span>{post.likesCount}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-muted-foreground hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{post.commentsCount}</span>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-muted-foreground hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 transition-colors"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </div>
    </motion.div>
  )
}
