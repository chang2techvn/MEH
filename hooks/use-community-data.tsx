"use client"

import { useState, useEffect } from "react"
import { dbHelpers, supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import type { Post, Contact, Event } from "@/components/community"
import { formatTimeAgo, extractYouTubeId, isToday, isTomorrow } from "@/components/community"

export function useCommunityData() {
  const { user } = useAuth()
  
  // Data state
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [feedPosts, setFeedPosts] = useState<Post[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [backgroundLoadCompleted, setBackgroundLoadCompleted] = useState(false)
  
  // Constants for progressive loading
  const INITIAL_POSTS_COUNT = 5 // Load only 5 posts initially
  const POSTS_PER_PAGE = 10 // Load 10 more posts each time

  // Load initial posts (fast load for immediate UI)
  const loadInitialPosts = async () => {
    try {
      console.log("� Loading initial posts (fast load)...")
      
      const postsResult = await supabase
        .from('posts')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(INITIAL_POSTS_COUNT) // Only 5 posts initially
      
      if (postsResult.error) {
        console.error("❌ Error loading initial posts:", postsResult.error)
        return
      }
      
      if (postsResult.data && postsResult.data.length > 0) {
        console.log(`⚡ Fast loaded ${postsResult.data.length} initial posts`)
        
        const transformedPosts = await transformPosts(postsResult.data)
        setFeedPosts(transformedPosts as Post[])
        setCurrentPage(1) // Mark that we've loaded the first "page"
        
        // If we got fewer posts than requested, no more posts available
        if (postsResult.data.length < INITIAL_POSTS_COUNT) {
          setHasMorePosts(false)
        }
      }
    } catch (error) {
      console.error("❌ Error loading initial posts:", error)
    } finally {
      setLoading(false) // Stop initial loading state
    }
  }

  // Load more posts (for infinite scroll and background loading)
  const loadMorePosts = async (isBackgroundLoad = false) => {
    if (loadingMore || !hasMorePosts) return
    
    try {
      setLoadingMore(true)
      const loadType = isBackgroundLoad ? "background" : "user-triggered"
      console.log(`🔄 Loading more posts (${loadType}, page ${currentPage + 1})...`)
      
      const offset = currentPage * POSTS_PER_PAGE + (currentPage === 0 ? INITIAL_POSTS_COUNT : 0)
      
      const postsResult = await supabase
        .from('posts')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + POSTS_PER_PAGE - 1)
      
      if (postsResult.error) {
        console.error("❌ Error loading more posts:", postsResult.error)
        return
      }
      
      if (postsResult.data && postsResult.data.length > 0) {
        console.log(`📄 Loaded ${postsResult.data.length} more posts (${loadType})`)
        
        const transformedPosts = await transformPosts(postsResult.data)
        setFeedPosts(prev => [...prev, ...(transformedPosts as Post[])])
        setCurrentPage(prev => prev + 1)
        
        // Mark background load as completed if this was a background load
        if (isBackgroundLoad) {
          setBackgroundLoadCompleted(true)
        }
        
        // Check if we have more posts
        if (postsResult.data.length < POSTS_PER_PAGE) {
          setHasMorePosts(false)
          console.log("✅ No more posts to load")
        }
      } else {
        setHasMorePosts(false)
        console.log("✅ No more posts to load")
      }
    } catch (error) {
      console.error("❌ Error loading more posts:", error)
    } finally {
      setLoadingMore(false)
    }
  }

  // Smart preload function - loads when user is 70% through current posts
  const checkAndPreloadPosts = (currentPostIndex: number, totalPosts: number) => {
    // Calculate the threshold - when user reaches 70% of current posts
    const preloadThreshold = Math.floor(totalPosts * 0.7)
    
    // Only preload if we have more posts available, aren't already loading, and background load is completed
    if (currentPostIndex >= preloadThreshold && hasMorePosts && !loadingMore && backgroundLoadCompleted) {
      console.log(`🎯 User reached post ${currentPostIndex + 1}/${totalPosts} (${Math.round(((currentPostIndex + 1) / totalPosts) * 100)}%) - preloading more posts...`)
      loadMorePosts(false) // User-triggered load
    }
  }

  // Transform posts helper function
  const transformPosts = async (posts: any[]) => {
    // Get unique user_ids from posts
    const userIds = [...new Set(posts.map((post: any) => post.user_id))]
    
    // Get profiles for all users
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, full_name, username, avatar_url')
      .in('user_id', userIds)
    
    // Create a lookup map
    const profilesMap = new Map()
    profilesData?.forEach((profile: any) => {
      profilesMap.set(profile.user_id, profile)
    })
    
    // Transform database posts to feed format
    return posts.map((post: any) => {
      const profile = profilesMap.get(post.user_id)
      
      // Extract YouTube video ID if content contains YouTube links
      const youtubeId = extractYouTubeId(post.content || "")
      
      // Determine media type based on post data
      let mediaType: "video" | "text" | "none" | "ai-submission" | "youtube" | "image" = "text"
      
      if (youtubeId) {
        mediaType = "youtube"
      } else if (post.media_url || (post.media_urls && post.media_urls.length > 0)) {
        // Check if it's a video or image based on URL or post_type
        if (post.post_type === 'video' || 
            post.media_url?.includes('video') || 
            post.media_url?.includes('.mp4') ||
            post.media_url?.includes('.webm') ||
            post.media_url?.includes('.mov')) {
          mediaType = "video"
        } else if (post.post_type === 'image' || 
                  post.media_url?.includes('image') ||
                  post.media_url?.includes('.jpg') ||
                  post.media_url?.includes('.jpeg') ||
                  post.media_url?.includes('.png') ||
                  post.media_url?.includes('.gif') ||
                  post.media_url?.includes('.webp')) {
          mediaType = "image"
        }
      } else if (post.submission_data || post.ai_evaluation) {
        mediaType = "ai-submission"
      }

      return {
        id: post.id,
        username: profile?.full_name || profile?.username || "Anonymous User",
        userImage: profile?.avatar_url || "/placeholder.svg?height=40&width=40",
        timeAgo: formatTimeAgo(post.created_at),
        content: post.content || "",
        mediaType,
        mediaUrl: post.media_url,
        mediaUrls: post.media_urls || (post.media_url ? [post.media_url] : []),
        youtubeVideoId: youtubeId,
        textContent: mediaType === "text" ? post.content : undefined,
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
        title: post.title,
        submission: post.submission_data ? {
          type: post.submission_data.type || "text",
          content: post.submission_data.content || "",
          difficulty: post.submission_data.difficulty || "beginner",
          topic: post.submission_data.topic || "general"
        } : undefined,
        videoEvaluation: post.ai_evaluation ? (
          typeof post.ai_evaluation === 'string' 
            ? JSON.parse(post.ai_evaluation)
            : post.ai_evaluation
        ) : undefined,
        isNew: false
      }
    })
  }

  // Load remaining data in background (non-blocking)
  const loadBackgroundData = async () => {
    try {
      console.log("🔄 Loading background data...")
      
      // Immediately load more posts in background after initial load (without delay)
      if (hasMorePosts && !backgroundLoadCompleted) {
        console.log("🚀 Starting immediate background post loading...")
        await loadMorePosts(true) // Background load with flag
      }
      
      // Load other community data
      await Promise.allSettled([
        loadEvents().catch(error => {
          console.warn("⚠️ Failed to load events, continuing without them:", error.message)
        })
      ])

    } catch (error) {
      console.error("❌ Error loading background data:", error)
    } finally {
      setInitialLoad(false)
    }
  }
  const loadContacts = async () => {
    try {
      console.log("🔄 Loading contacts data...")
      console.log("🔍 Current user ID:", user?.id)
      
      // Load online users from database, excluding current user
      const { data: onlineUsersData, error: onlineUsersError } = await dbHelpers.getOnlineUsers(10, user?.id)
      
      if (onlineUsersError) {
        console.error("❌ Error loading online users:", onlineUsersError)
        throw new Error("Failed to load contacts")
      }
      
      if (!onlineUsersData || onlineUsersData.length === 0) {
        console.log("ℹ️ No online users found (excluding current user)")
        setContacts([])
        return
      }

      console.log(`✅ Loaded ${onlineUsersData.length} online users (current user already excluded by database)`)
      
      // No need to filter here since database already excluded current user
      // Transform online users data to contacts format
      const transformedContacts = onlineUsersData.map((profile: any, index: number) => ({
        id: profile.user_id || profile.id || `contact-${index}`,
        name: profile.full_name || profile.username || 'Unknown User',
        image: profile.avatar_url || "/placeholder.svg?height=40&width=40",
        online: profile.users?.last_login && new Date(profile.users.last_login) > new Date(Date.now() - 30 * 60 * 1000), // Active in last 30 minutes
        lastActive: profile.users?.last_login && new Date(profile.users.last_login) <= new Date(Date.now() - 30 * 60 * 1000) ? formatTimeAgo(profile.users.last_login) : undefined
      }))
      
      console.log(`✅ Transformed ${transformedContacts.length} contacts for display`)
      setContacts(transformedContacts as unknown as Contact[])
    } catch (error) {
      console.error("❌ Error loading contacts:", error)
      // Don't set fallback data, just show error
      setContacts([])
      throw error
    }
  }

  // Load events data
  const loadEvents = async () => {
    try {
      console.log("🔄 Loading events data...")
      
      // Load events from database using the same approach as backup file
      const { data: eventsData, error: eventsError } = await dbHelpers.getEvents()
      
      if (eventsError) {
        console.error("❌ Error loading events:", eventsError)
        throw new Error("Failed to load events")
      }
      
      if (!eventsData || eventsData.length === 0) {
        console.log("ℹ️ No events found")
        setEvents([])
        return
      }

      console.log(`✅ Loaded ${eventsData.length} events`)
      
      // Transform events data using the same approach as backup file
      const transformedEvents = eventsData.map((event: any, index: number) => ({
        id: event.id || `event-${index}`, // Use original ID or fallback
        title: event.title,
        date: new Date(event.startTime || event.start_date).toLocaleDateString(),
        time: new Date(event.startTime || event.start_date).toLocaleTimeString(),
        location: event.location,
        attendees: event.attendeeCount || 0,
        badge: isToday(new Date(event.startTime || event.start_date)) ? 'today' as const : 
               isTomorrow(new Date(event.startTime || event.start_date)) ? 'tomorrow' as const : 'upcoming' as const
      }))
      
      setEvents(transformedEvents as unknown as Event[])
    } catch (error) {
      console.error("❌ Error loading events:", error)
      // Don't set fallback data, just show error
      setEvents([])
      throw error
    }
  }



  // Initial data load - optimized for speed
  useEffect(() => {
    // Load initial posts immediately (non-blocking UI)
    loadInitialPosts().then(() => {
      console.log("⚡ Initial posts loaded, starting background data load")
      // Load remaining data in background
      loadBackgroundData()
    }).catch(error => {
      console.error("❌ Failed to load initial posts:", error)
      setLoading(false)
    })
  }, [])

  // Load contacts when user is authenticated (separate from initial data load)
  useEffect(() => {
    if (user?.id) {
      console.log("🔄 User authenticated, loading contacts (excluding current user)...")
      loadContacts().catch(error => {
        console.warn("⚠️ Failed to load contacts after user authentication:", error.message)
      })
    } else {
      // Clear contacts if no user
      console.log("🔄 No user authenticated, clearing contacts...")
      setContacts([])
    }
  }, [user?.id])

  return {
    // State
    loading,
    setLoading,
    loadingMore,
    setLoadingMore,
    initialLoad,
    setInitialLoad,
    feedPosts,
    setFeedPosts,
    contacts,
    setContacts,
    events,
    setEvents,
    hasMorePosts,
    setHasMorePosts,
    backgroundLoadCompleted,
    setBackgroundLoadCompleted,

    // Functions
    loadInitialPosts,
    loadMorePosts,
    checkAndPreloadPosts,
    loadBackgroundData,
    loadContacts,
    loadEvents
  }
}
