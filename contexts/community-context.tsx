"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useCommunityData } from "@/hooks/use-community-data"
import { supabase } from "@/lib/supabase"
import type { Post, Contact, Event } from "@/components/community"

interface CommunityContextType {
  // Data
  feedPosts: Post[]
  contacts: Contact[]
  events: Event[]
  
  // Loading states
  loading: boolean
  loadingMore: boolean
  initialLoad: boolean
  hasMorePosts: boolean
  backgroundLoadCompleted: boolean
  
  // Actions
  loadMorePosts: (userTriggered?: boolean) => Promise<void>
  checkAndPreloadPosts: (currentPostIndex: number, totalPosts: number) => void
  loadSpecificPost: (postId: string) => Promise<void>
  refreshData: () => Promise<void>
  loadInitialPosts: () => Promise<void>
  setFeedPosts: (updater: (prev: Post[]) => Post[]) => void
  forceRefreshWithHighlight: (highlightPostId: string) => Promise<void>
  
  // Cache management
  isCacheReady: boolean
  lastLoadTime: number
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined)

interface CommunityProviderProps {
  children: ReactNode
}

export function CommunityProvider({ children }: CommunityProviderProps) {
  const communityData = useCommunityData()
  const [isCacheReady, setIsCacheReady] = useState(false)
  const [lastLoadTime, setLastLoadTime] = useState(0)
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null)
  
  // Force refresh with highlight - bypass cache and load fresh data
  const forceRefreshWithHighlight = async (highlightPostId: string) => {
    console.log('🔄 Force refreshing with highlight:', highlightPostId)
    
    try {
      // First, try to load the specific post
      await communityData.loadSpecificPost(highlightPostId)
      
      // Then refresh all posts to get latest data
      await communityData.loadInitialPosts()
      
      setLastLoadTime(Date.now())
      console.log('✅ Force refresh completed')
    } catch (error) {
      console.error('❌ Force refresh failed:', error)
    }
  }
  
  // Setup realtime subscription for posts
  useEffect(() => {
    console.log('🔔 Setting up realtime subscription for posts...')
    
    const channel = supabase
      .channel('community_posts')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('🔔 Realtime posts change detected:', payload)
          
          if (payload.eventType === 'INSERT') {
            console.log('📝 New post inserted, refreshing...')
            // Refresh posts when new post is added
            communityData.loadInitialPosts()
          } else if (payload.eventType === 'UPDATE') {
            console.log('✏️ Post updated, refreshing...')
            // Refresh posts when post is updated
            communityData.loadInitialPosts()
          } else if (payload.eventType === 'DELETE') {
            console.log('🗑️ Post deleted, refreshing...')
            // Refresh posts when post is deleted
            communityData.loadInitialPosts()
          }
        }
      )
      .subscribe((status) => {
        console.log('🔔 Realtime subscription status:', status)
      })
    
    setRealtimeChannel(channel)
    
    // Cleanup subscription on unmount
    return () => {
      console.log('🔕 Cleaning up realtime subscription')
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, []) // Only run once on mount
  
  // Mark cache as ready when initial load completes
  useEffect(() => {
    if (!communityData.loading && !communityData.initialLoad && communityData.feedPosts.length > 0) {
      setIsCacheReady(true)
      setLastLoadTime(Date.now())
      console.log('✅ Community cache ready with', communityData.feedPosts.length, 'posts')
    }
  }, [communityData.loading, communityData.initialLoad, communityData.feedPosts.length])

  // Set up realtime subscription for posts
  useEffect(() => {
    console.log('🔄 Setting up realtime subscription for posts...')
    
    const subscription = supabase
      .channel('posts-realtime')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: 'is_public=eq.true'
        },
        (payload) => {
          console.log('🆕 New post added realtime:', payload.new)
          // Force refresh when new post is added
          communityData.loadInitialPosts()
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE', 
          schema: 'public',
          table: 'posts',
          filter: 'is_public=eq.true'
        },
        (payload) => {
          console.log('📝 Post updated realtime:', payload.new)
          // Refresh to get updated post
          communityData.loadInitialPosts()
        }
      )
      .subscribe((status) => {
        console.log('📡 Posts realtime subscription status:', status)
      })

    return () => {
      console.log('🔌 Cleaning up posts realtime subscription')
      subscription.unsubscribe()
    }
  }, [communityData.loadInitialPosts])
  
  // Refresh data function
  const refreshData = async () => {
    console.log('🔄 Refreshing community data...')
    setIsCacheReady(false)
    // The hook will handle the actual refresh
    setLastLoadTime(Date.now())
  }
  
  // Wrapper for loadInitialPosts
  const loadInitialPosts = async () => {
    // This will be handled by the hook's internal logic
    return Promise.resolve()
  }
  
  // Wrapper for setFeedPosts - not directly available but can refresh
  const setFeedPosts = (updater: (prev: Post[]) => Post[]) => {
    // For now, just refresh data
    // In a more sophisticated implementation, we could have direct state management
    console.log('🔄 Updating feed posts via refresh...')
    refreshData()
  }
  
  const contextValue: CommunityContextType = {
    // Data
    feedPosts: communityData.feedPosts,
    contacts: communityData.contacts,
    events: communityData.events,
    
    // Loading states
    loading: communityData.loading,
    loadingMore: communityData.loadingMore,
    initialLoad: communityData.initialLoad,
    hasMorePosts: communityData.hasMorePosts,
    backgroundLoadCompleted: communityData.backgroundLoadCompleted,
    
    // Actions
    loadMorePosts: communityData.loadMorePosts,
    checkAndPreloadPosts: communityData.checkAndPreloadPosts,
    loadSpecificPost: communityData.loadSpecificPost,
    refreshData,
    loadInitialPosts,
    setFeedPosts,
    forceRefreshWithHighlight,
    
    // Cache management
    isCacheReady,
    lastLoadTime
  }
  
  return (
    <CommunityContext.Provider value={contextValue}>
      {children}
    </CommunityContext.Provider>
  )
}

export function useCommunity() {
  const context = useContext(CommunityContext)
  if (context === undefined) {
    throw new Error('useCommunity must be used within a CommunityProvider')
  }
  return context
}
