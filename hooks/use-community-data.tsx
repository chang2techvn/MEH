"use client"

import { useState, useEffect } from "react"
import { dbHelpers, supabase } from "@/lib/supabase"
import type { Post, Contact, Event, Group } from "@/components/community"
import { formatTimeAgo, extractYouTubeId, isToday, isTomorrow } from "@/components/community"

export function useCommunityData() {
  // Data state
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [feedPosts, setFeedPosts] = useState<Post[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [trendingTopics, setTrendingTopics] = useState<{ name: string; count: number }[]>([])

  // Load real data from Supabase
  const loadData = async () => {
    try {
      console.log("🔄 Loading community data...")
      
      // Load posts from database using the same approach as backup file
      const postsResult = await supabase
        .from('posts')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (postsResult.error) {
        console.error("❌ Error loading posts:", postsResult.error)
      } else if (postsResult.data) {
        console.log(`✅ Loaded ${postsResult.data.length} posts from database`)
        
        // Get unique user_ids from posts
        const userIds = [...new Set(postsResult.data.map((post: any) => post.user_id))]
        
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
        const transformedPosts = postsResult.data.map((post: any) => {
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
          } else if (post.submission_data || post.video_evaluation) {
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
            videoEvaluation: post.video_evaluation ? {
              pronunciation: post.video_evaluation.pronunciation || 0,
              fluency: post.video_evaluation.fluency || 0,
              grammar: post.video_evaluation.grammar || 0,
              vocabulary: post.video_evaluation.vocabulary || 0,
              overall: post.video_evaluation.overall || 0,
              feedback: post.video_evaluation.feedback || "",
              strengths: post.video_evaluation.strengths || [],
              improvements: post.video_evaluation.improvements || []
            } : undefined,
            isNew: false
          }
        })

        setFeedPosts(transformedPosts as Post[])
      }

      // Load other community data
      await Promise.allSettled([
        loadContacts().catch(error => {
          console.warn("⚠️ Failed to load contacts, continuing without them:", error.message)
        }),
        loadEvents().catch(error => {
          console.warn("⚠️ Failed to load events, continuing without them:", error.message)
        })
      ])

    } catch (error) {
      console.error("❌ Error loading community data:", error)
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }

  // Load contacts data
  const loadContacts = async () => {
    try {
      console.log("🔄 Loading contacts data...")
      
      // Load online users from database using the same approach as backup file
      const { data: onlineUsersData, error: onlineUsersError } = await dbHelpers.getOnlineUsers(10)
      
      if (onlineUsersError) {
        console.error("❌ Error loading online users:", onlineUsersError)
        throw new Error("Failed to load contacts")
      }
      
      if (!onlineUsersData || onlineUsersData.length === 0) {
        console.log("ℹ️ No online users found")
        setContacts([])
        return
      }

      console.log(`✅ Loaded ${onlineUsersData.length} online users`)
      
      // Transform online users data to contacts format
      const transformedContacts = onlineUsersData.map((profile: any, index: number) => ({
        id: profile.user_id || profile.id || `contact-${index}`,
        name: profile.full_name || profile.username || 'Unknown User',
        image: profile.avatar_url || "/placeholder.svg?height=40&width=40",
        online: profile.users?.last_active && new Date(profile.users.last_active) > new Date(Date.now() - 30 * 60 * 1000), // Active in last 30 minutes
        lastActive: profile.users?.last_active && new Date(profile.users.last_active) <= new Date(Date.now() - 30 * 60 * 1000) ? formatTimeAgo(profile.users.last_active) : undefined
      }))
      
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



  // Load trending topics
  const loadTrendingTopics = async () => {
    try {
      console.log("🔄 Loading trending topics...")
      
      // Load trending topics from database using the same approach as backup file
      const { data: trendingData, error: trendingError } = await dbHelpers.getTrendingTopics(10)
      
      if (trendingError) {
        console.error("❌ Error loading trending topics:", trendingError)
        throw new Error("Failed to load trending topics")
      }
      
      if (!trendingData || trendingData.length === 0) {
        console.log("ℹ️ No trending topics found")
        setTrendingTopics([])
        return
      }

      console.log(`✅ Loaded ${trendingData.length} trending topics`)
      
      // Transform trending topics data
      const transformedTopics = trendingData.map((topic: any) => ({
        name: topic.name || topic.topic,
        count: topic.count || topic.post_count || 0
      }))
      
      setTrendingTopics(transformedTopics)
    } catch (error) {
      console.error("❌ Error loading trending topics:", error)
      // Don't set fallback data, just show error
      setTrendingTopics([])
      throw error
    }
  }

  // Initial data load
  useEffect(() => {
    // Set loading to false immediately to show skeleton states
    setLoading(false)
    
    // Load data in background without blocking UI
    loadData().then(() => {
      console.log("✅ All community data loaded successfully")
    }).catch(error => {
      console.error("❌ Failed to load community data:", error)
    })
  }, [])

  return {
    // State
    loading,
    setLoading,
    initialLoad,
    setInitialLoad,
    feedPosts,
    setFeedPosts,
    contacts,
    setContacts,
    events,
    setEvents,
    setGroups,
    setTrendingTopics,

    // Functions
    loadData,
    loadContacts,
    loadEvents,
    loadTrendingTopics
  }
}
