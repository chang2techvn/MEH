"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Eye, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

interface StoryViewer {
  id: string
  viewer_id: string
  viewed_at: string
  profiles: {
    username: string
    full_name: string
    avatar_url?: string
  }
}

interface StoryViewersModalProps {
  isOpen: boolean
  onClose: () => void
  storyId: string
  storyAuthorId: string
}

export function StoryViewersModal({ isOpen, onClose, storyId, storyAuthorId }: StoryViewersModalProps) {
  const { user } = useAuth()
  const [viewers, setViewers] = useState<StoryViewer[]>([])
  const [loading, setLoading] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const viewedAt = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - viewedAt.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d`
  }

  // Fetch story viewers
  const fetchViewers = async (silent = false) => {
    if (!storyId || !user || user.id !== storyAuthorId) return

    if (!silent) {
      setLoading(true)
    }
    
    try {
      // First get story views
      const { data: viewsData, error: viewsError } = await supabase
        .from('story_views')
        .select('id, viewer_id, viewed_at')
        .eq('story_id', storyId)
        .order('viewed_at', { ascending: false })

      if (viewsError) throw viewsError

      if (!viewsData || viewsData.length === 0) {
        setViewers([])
        return
      }

      // Get viewer IDs
      const viewerIds = viewsData.map(view => view.viewer_id)

      // Fetch profiles for those viewers
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, full_name, avatar_url')
        .in('user_id', viewerIds)

      if (profilesError) throw profilesError

      // Combine data
      const transformedViewers: StoryViewer[] = viewsData.map((view: any) => {
        const profile = profilesData?.find(p => p.user_id === view.viewer_id)
        return {
          id: view.id,
          viewer_id: view.viewer_id,
          viewed_at: view.viewed_at,
          profiles: {
            username: profile?.username || '',
            full_name: profile?.full_name || '',
            avatar_url: profile?.avatar_url
          }
        }
      })

      setViewers(transformedViewers)
    } catch (error: any) {
      console.error('Error fetching story viewers:', error)
      if (!silent) {
        toast({
          title: "Error",
          description: "Failed to load story viewers",
          variant: "destructive"
        })
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (isOpen && storyId) {
      fetchViewers()
      setLastFetchTime(Date.now())
    }
  }, [isOpen, storyId])

  // Real-time updates - refetch viewers every 5 seconds when modal is open
  useEffect(() => {
    if (!isOpen || !storyId) return

    const interval = setInterval(async () => {
      if (!user || user.id !== storyAuthorId) return

      try {
        // Quick check if we need to update by just counting views
        const { count, error: countError } = await supabase
          .from('story_views')
          .select('*', { count: 'exact', head: true })
          .eq('story_id', storyId)

        if (countError) return

        // Only fetch full data if count changed
        if (count !== viewers.length) {
          await fetchViewers(true) // Silent fetch
        }
      } catch (error) {
        // Silently fail for background updates
        console.error('Background check failed:', error)
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [isOpen, storyId, user, storyAuthorId, viewers.length])

  // Only show to story author
  if (!user || user.id !== storyAuthorId) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="absolute top-16 right-3 w-64 max-h-80 bg-black/30 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 overflow-hidden z-40"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-white/20">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">
                Viewers ({viewers.length})
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Content */}
          <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            ) : viewers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center px-3">
                <Eye className="h-8 w-8 text-white/50 mb-2" />
                <p className="text-sm text-white/70">
                  No views yet
                </p>
              </div>
            ) : (
              <div className="p-2">
                {viewers.map((viewer) => (
                  <motion.div
                    key={viewer.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Avatar className="h-8 w-8 border border-white/20">
                      <AvatarImage src={viewer.profiles?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white text-xs">
                        {viewer.profiles?.username?.charAt(0)?.toUpperCase() || 
                         viewer.profiles?.full_name?.charAt(0)?.toUpperCase() || 
                         '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {viewer.profiles?.full_name || viewer.profiles?.username || 'Unknown'}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-white/60">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(viewer.viewed_at)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
