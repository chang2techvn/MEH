"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Eye, Clock, MessageCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { useChat } from "@/contexts/chat-context-realtime"

interface StoryViewer {
  id: string
  viewer_id: string
  viewed_at: string
  replied_at?: string
  reply_content?: string
  reactions: Array<{
    emoji: string
    timestamp: string
    count?: number
  }>
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
  const { openChatWindow } = useChat()
  const [viewers, setViewers] = useState<StoryViewer[]>([])
  const [loading, setLoading] = useState(false)

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const targetDate = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d`
  }

  // Truncate text with ellipsis
  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  // Handle clicking on a reply to open chat
  const handleReplyClick = async (viewerId: string, viewerName: string) => {
    try {
      // Find or create conversation
      let conversationId: string | null = null

      // First try to find existing conversation
      const { data: existingConversations, error: findError } = await supabase
        .from('conversations')
        .select(`
          id,
          conversation_participants!inner (user_id)
        `)
        .eq('type', 'direct')
        .eq('conversation_participants.user_id', user?.id)

      if (findError) throw findError

      // Find conversation where both users are participants
      for (const conv of existingConversations || []) {
        const { data: participants, error: participantsError } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conv.id)

        if (participantsError) continue

        const userIds = participants.map(p => p.user_id)
        if (userIds.includes(user?.id!) && userIds.includes(viewerId) && userIds.length === 2) {
          conversationId = conv.id
          break
        }
      }

      // If no conversation exists, create one
      if (!conversationId) {
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            title: `Chat with ${viewerName}`,
            status: 'active',
            type: 'direct'
          })
          .select()
          .single()

        if (createError) throw createError
        conversationId = newConversation.id

        // Add participants
        const { error: participantsError } = await supabase
          .from('conversation_participants')
          .insert([
            { conversation_id: conversationId, user_id: user?.id, role: 'participant' },
            { conversation_id: conversationId, user_id: viewerId, role: 'participant' }
          ])

        if (participantsError) throw participantsError
      }

      // Open chat window instead of navigating
      if (conversationId) {
        openChatWindow(conversationId)
        onClose() // Close the modal
      }
    } catch (error: any) {
      console.error('Error opening conversation:', error)
      toast({
        title: "Error",
        description: "Failed to open chat",
        variant: "destructive"
      })
    }
  }

  // Fetch story viewers and replies combined
  const fetchViewers = async (silent = false) => {
    if (!storyId || !user || user.id !== storyAuthorId) return

    if (!silent) {
      setLoading(true)
    }
    
    try {
      // Get views, replies, and reactions in one query
      const { data: interactionsData, error: interactionsError } = await supabase
        .from('story_views')
        .select('id, viewer_id, viewed_at, interaction_type, reply_content, replied_at, reactions, reacted_at')
        .eq('story_id', storyId)
        .in('interaction_type', ['view', 'reply', 'reaction'])
        .order('id', { ascending: false }) // Order by ID to get newest first

      if (interactionsError) throw interactionsError

      if (!interactionsData || interactionsData.length === 0) {
        setViewers([])
        return
      }

      // Get unique viewer IDs
      const viewerIds = [...new Set(interactionsData.map(interaction => interaction.viewer_id))]

      // Fetch profiles for those viewers
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, full_name, avatar_url')
        .in('user_id', viewerIds)

      if (profilesError) throw profilesError

      // Group interactions by user and combine all their activities
      const viewerMap = new Map<string, StoryViewer>()
      
      interactionsData.forEach((interaction: any) => {
        const profile = profilesData?.find(p => p.user_id === interaction.viewer_id)
        const viewerId = interaction.viewer_id
        
        if (!viewerMap.has(viewerId)) {
          // Create base viewer entry
          viewerMap.set(viewerId, {
            id: interaction.id,
            viewer_id: interaction.viewer_id,
            viewed_at: interaction.viewed_at,
            reactions: [],
            profiles: {
              username: profile?.username || '',
              full_name: profile?.full_name || '',
              avatar_url: profile?.avatar_url
            }
          })
        }
        
        const existingViewer = viewerMap.get(viewerId)!
        
        // If this is a reply, update the viewer entry
        if (interaction.interaction_type === 'reply' && interaction.reply_content) {
          existingViewer.reply_content = interaction.reply_content
          existingViewer.replied_at = interaction.replied_at
        }
        
        // If this is a reaction, process reactions array
        if (interaction.interaction_type === 'reaction' && interaction.reactions) {
          // Parse reactions array from database and group by emoji
          const reactionsArray = Array.isArray(interaction.reactions) ? interaction.reactions : []
          const reactionCounts = new Map()
          
          reactionsArray.forEach((reaction: any) => {
            const emoji = reaction.emoji
            if (reactionCounts.has(emoji)) {
              reactionCounts.get(emoji).count++
              // Keep most recent timestamp
              if (new Date(reaction.timestamp) > new Date(reactionCounts.get(emoji).timestamp)) {
                reactionCounts.get(emoji).timestamp = reaction.timestamp
              }
            } else {
              reactionCounts.set(emoji, {
                emoji,
                timestamp: reaction.timestamp,
                count: 1
              })
            }
          })
          
          existingViewer.reactions = Array.from(reactionCounts.values())
        }
      })

      // Sort by most recent activity (replies first, then reactions, then views)
      const transformedViewers = Array.from(viewerMap.values()).sort((a, b) => {
        // Prioritize users with replies first
        if (a.reply_content && !b.reply_content) return -1
        if (!a.reply_content && b.reply_content) return 1
        
        // Then users with reactions
        if (a.reactions.length > 0 && b.reactions.length === 0) return -1
        if (a.reactions.length === 0 && b.reactions.length > 0) return 1
        
        // Within same activity type, sort by most recent
        const aTime = a.reply_content ? a.replied_at! : 
                     a.reactions.length > 0 ? a.reactions[0].timestamp! : a.viewed_at
        const bTime = b.reply_content ? b.replied_at! : 
                     b.reactions.length > 0 ? b.reactions[0].timestamp! : b.viewed_at
        
        return new Date(bTime).getTime() - new Date(aTime).getTime()
      })
      
      setViewers(transformedViewers)
    } catch (error: any) {
      console.error('Error fetching story viewers:', error)
      if (!silent) {
        toast({
          title: "Error",
          description: "Failed to load story activity",
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
    }
  }, [isOpen, storyId])

  // Real-time updates - refetch viewers every 5 seconds when modal is open
  useEffect(() => {
    if (!isOpen || !storyId) return

    const interval = setInterval(async () => {
      if (!user || user.id !== storyAuthorId) return

      try {
        // Quick check if we need to update by just counting interactions
        const { count, error: countError } = await supabase
          .from('story_views')
          .select('*', { count: 'exact', head: true })
          .eq('story_id', storyId)
          .in('interaction_type', ['view', 'reply'])

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
          className="absolute top-16 right-3 w-80 max-h-96 bg-black/30 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 overflow-hidden z-40"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-white/20">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">
                Activity ({viewers.length})
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
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            ) : viewers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center px-3">
                <Eye className="h-8 w-8 text-white/50 mb-2" />
                <p className="text-sm text-white/70">
                  No activity yet
                </p>
              </div>
            ) : (
              <div className="p-2">
                {viewers.map((viewer) => (
                  <motion.div
                    key={viewer.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Avatar className="h-8 w-8 border border-white/20 mt-1">
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
                      
                      {/* Combined layout: Reply with reactions on the right */}
                      {viewer.reply_content ? (
                        <div className="mt-1">
                          <div className="flex items-start gap-2 justify-between min-w-0">
                            {/* Reply section - left side with proper text truncation */}
                            <div className="flex-1 min-w-0 max-w-[200px]">
                              <div 
                                className="bg-white/10 rounded-lg p-2 mb-1 cursor-pointer hover:bg-white/20 transition-colors"
                                onClick={() => handleReplyClick(viewer.viewer_id, viewer.profiles?.full_name || viewer.profiles?.username || 'Unknown')}
                              >
                                <p className="text-sm text-white/90 line-clamp-1 break-words" title={viewer.reply_content}>
                                  {viewer.reply_content}
                                </p>
                                {viewer.reply_content.length > 40 && (
                                  <div className="flex justify-end mt-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-auto p-0 text-xs text-white/60 hover:text-white hover:bg-transparent"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleReplyClick(viewer.viewer_id, viewer.profiles?.full_name || viewer.profiles?.username || 'Unknown')
                                      }}
                                    >
                                      See full
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-white/60">
                                <MessageCircle className="h-3 w-3" />
                                <span>Replied {formatTimeAgo(viewer.replied_at!)}</span>
                              </div>
                            </div>

                            {/* Reactions section - right side with stacked display */}
                            {viewer.reactions.length > 0 && (
                              <div className="flex flex-col items-end gap-1 ml-1 flex-shrink-0">
                                <div className="flex items-center gap-1">
                                  <div className="flex -space-x-1">
                                    {viewer.reactions.slice(0, 3).map((reaction, index) => (
                                      <div 
                                        key={index}
                                        className="relative bg-white/10 rounded-full w-6 h-6 flex items-center justify-center text-xs border border-white/20"
                                        style={{ zIndex: viewer.reactions.length - index }}
                                      >
                                        {reaction.emoji}
                                        {reaction.count && reaction.count > 1 && (
                                          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center" style={{ fontSize: '8px' }}>
                                            {reaction.count}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                    {viewer.reactions.length > 3 && (
                                      <div className="relative bg-white/10 rounded-full w-6 h-6 flex items-center justify-center text-xs border border-white/20">
                                        +{viewer.reactions.length - 3}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <span className="text-xs text-white/60">
                                  {formatTimeAgo(viewer.reactions[0].timestamp)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : viewer.reactions.length > 0 ? (
                        /* Only reactions - no reply */
                        <div className="mt-1">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1">
                              {viewer.reactions.slice(0, 4).map((reaction, index) => (
                                <div 
                                  key={index}
                                  className="relative bg-white/10 rounded-full w-8 h-8 flex items-center justify-center text-sm border border-white/20"
                                  style={{ zIndex: viewer.reactions.length - index }}
                                >
                                  {reaction.emoji}
                                  {reaction.count && reaction.count > 1 && (
                                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                      {reaction.count}
                                    </span>
                                  )}
                                </div>
                              ))}
                              {viewer.reactions.length > 4 && (
                                <div className="relative bg-white/10 rounded-full w-8 h-8 flex items-center justify-center text-xs border border-white/20">
                                  +{viewer.reactions.length - 4}
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-white/60">
                              {formatTimeAgo(viewer.reactions[0].timestamp)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        /* Only view - no reply or reactions */
                        <div className="flex items-center gap-1 text-xs text-white/60">
                          <Eye className="h-3 w-3" />
                          <span>Viewed {formatTimeAgo(viewer.viewed_at)}</span>
                        </div>
                      )}
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
