"use server"

import { load } from "cheerio"
import { supabaseServer } from "@/lib/supabase-server"
import { getVideoSettings } from "@/app/actions/admin-settings"
import { extractYouTubeTranscriptForDuration } from "@/lib/utils/video-processor"

// Types for our video data
export type VideoData = {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  videoUrl: string
  embedUrl: string
  duration: number
  transcript: string
  topics?: string[]
}

// Types for challenge data based on the new unified schema
export type ChallengeData = {
  id?: string
  title: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  embed_url: string | null
  duration: number | null
  topics: string[] | null
  transcript: string | null
  challenge_type: string
  difficulty: string
  user_id: string | null
  batch_id: string | null
  is_active: boolean
  featured: boolean
  date: string
  created_at?: string | null
  updated_at?: string | null
}

// Function to get today's date as a string (YYYY-MM-DD format)
const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Main function to create challenges for all types
export async function createChallenge(
  challengeType: 'daily' | 'practice' | 'user_generated',
  options: {
    videoUrl?: string // For user_generated type
    userId?: string // For user_generated type
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    minDuration?: number
    maxDuration?: number
    preferredTopics?: string[]
    count?: number // For practice type to create multiple challenges
  } = {}
): Promise<ChallengeData | ChallengeData[]> {
  const supabase = supabaseServer
  const today = getTodayDate()
  
  try {
    if (challengeType === 'user_generated') {
      if (!options.videoUrl || !options.userId) {
        throw new Error("Video URL and User ID are required for user-generated challenges")
      }
      
      // Extract video data from URL
      const videoData = await extractVideoFromUrl(options.videoUrl)
      if (!videoData) {
        throw new Error("Could not extract video information from the provided URL")
      }
      
      // Create user-generated challenge
      const challengeData: ChallengeData = {
        title: videoData.title,
        description: videoData.description,
        video_url: videoData.videoUrl,
        thumbnail_url: videoData.thumbnailUrl,
        embed_url: videoData.embedUrl,
        duration: videoData.duration,
        topics: videoData.topics || [],
        transcript: videoData.transcript,
        challenge_type: 'user_generated',
        difficulty: options.difficulty || 'intermediate',
        user_id: options.userId,
        batch_id: null,
        is_active: true,
        featured: false,
        date: today
      }
      
      const { data, error } = await supabase
        .from('challenges')
        .insert(challengeData)
        .select()
        .single()
        
      if (error) throw error
      return data
      
    } else if (challengeType === 'daily') {
      // Check if daily challenge already exists for today
      const { data: existing } = await supabase
        .from('challenges')
        .select('*')
        .eq('challenge_type', 'daily')
        .eq('date', today)
        .single()
        
      if (existing) {
        return existing
      }
      
      // Create new daily challenge
      const videoData = await fetchRandomYoutubeVideo(
        options.minDuration || 180,
        options.maxDuration || 600,
        options.preferredTopics || []
      )
      
      const challengeData: ChallengeData = {
        title: videoData.title,
        description: videoData.description,
        video_url: videoData.videoUrl,
        thumbnail_url: videoData.thumbnailUrl,
        embed_url: videoData.embedUrl,
        duration: videoData.duration,
        topics: videoData.topics || [],
        transcript: videoData.transcript,
        challenge_type: 'daily',
        difficulty: options.difficulty || 'intermediate',
        user_id: null,
        batch_id: null,
        is_active: true,
        featured: true,
        date: today
      }
      
      const { data, error } = await supabase
        .from('challenges')
        .insert(challengeData)
        .select()
        .single()
        
      if (error) throw error
      return data
      
    } else if (challengeType === 'practice') {
      const challenges: ChallengeData[] = []
      
      // Check how many practice challenges exist for today (should be 3: beginner, intermediate, advanced)
      const { data: existing } = await supabase
        .from('challenges')
        .select('*')
        .eq('challenge_type', 'practice')
        .eq('date', today)
        
      const existingCount = existing?.length || 0
      const difficultyLevels = ['beginner', 'intermediate', 'advanced'] as const
      
      // Check which difficulties are missing
      const existingDifficulties = existing?.map(c => c.difficulty) || []
      const missingDifficulties = difficultyLevels.filter(level => !existingDifficulties.includes(level))
      
      if (missingDifficulties.length === 0) {
        // All 3 difficulties exist for today, return existing
        return existing || []
      }
      
      // Create missing practice challenges (one for each missing difficulty)
      for (const difficulty of missingDifficulties) {
        try {
          const videoData = await fetchRandomYoutubeVideo(
            options.minDuration || 120,
            options.maxDuration || 480,
            options.preferredTopics || []
          )
          
          const challengeData: ChallengeData = {
            title: videoData.title,
            description: videoData.description,
            video_url: videoData.videoUrl,
            thumbnail_url: videoData.thumbnailUrl,
            embed_url: videoData.embedUrl,
            duration: videoData.duration,
            topics: videoData.topics || [],
            transcript: videoData.transcript,
            challenge_type: 'practice',
            difficulty: difficulty,
            user_id: null,
            batch_id: `practice_${today}_batch`,
            is_active: true,
            featured: false,
            date: today
          }
          
          const { data, error } = await supabase
            .from('challenges')
            .insert(challengeData)
            .select()
            .single()
            
          if (error) throw error
          challenges.push(data)
          
          console.log(`✅ Created ${difficulty} practice challenge for ${today}`)
          
          // Add delay between requests to avoid rate limiting
          if (missingDifficulties.indexOf(difficulty) < missingDifficulties.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
        } catch (error) {
          console.error(`Error creating ${difficulty} practice challenge:`, error)
          // Continue with next difficulty
        }
      }
      
      // Return all challenges for today (existing + new)
      const { data: allChallenges } = await supabase
        .from('challenges')
        .select('*')
        .eq('challenge_type', 'practice')
        .eq('date', today)
        .order('difficulty', { ascending: true }) // beginner, intermediate, advanced
        
      return allChallenges || []
    }
    
    throw new Error(`Invalid challenge type: ${challengeType}`)
    
  } catch (error) {
    console.error(`Error creating ${challengeType} challenge:`, error)
    throw error
  }
}

// Helper function to get challenges by type
export async function getChallenges(
  challengeType: 'daily' | 'practice' | 'user_generated',
  options: {
    date?: string
    userId?: string
    limit?: number
    difficulty?: string
  } = {}
): Promise<ChallengeData[]> {
  const supabase = supabaseServer
  const date = options.date || getTodayDate()
  
  let query = supabase
    .from('challenges')
    .select('*')
    .eq('challenge_type', challengeType)
    .eq('is_active', true)
    
  if (challengeType === 'user_generated' && options.userId) {
    query = query.eq('user_id', options.userId)
  } else if (challengeType === 'daily') {
    // Daily challenges: only today's challenge
    query = query.eq('date', date)
  } else if (challengeType === 'practice') {
    // Practice challenges: get latest 15 videos (5 days × 3 difficulties)
    // Don't filter by specific date, get the most recent ones
    query = query.order('date', { ascending: false })
                 .order('difficulty', { ascending: true }) // beginner, intermediate, advanced
                 .limit(options.limit || 15)
  }
  
  if (options.difficulty && challengeType !== 'practice') {
    query = query.eq('difficulty', options.difficulty)
  }
  
  if (options.limit && challengeType !== 'practice') {
    query = query.limit(options.limit)
  }
  
  if (challengeType !== 'practice') {
    query = query.order('created_at', { ascending: false })
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error(`Error fetching ${challengeType} challenges:`, error)
    throw error
  }
  
  return data || []
}

// Function to fetch random YouTube video
export async function fetchRandomYoutubeVideo(
  minDuration = 60,
  maxDuration = 2700,
  preferredTopics: string[] = [],
): Promise<VideoData> {
  // Check if we already have a video for today
  const today = getTodayDate()
  // if (cachedVideo && lastFetchDate === today) {
  //   return cachedVideo
  // }

  try {
    console.log(`Attempting to fetch a random YouTube video (${minDuration}-${maxDuration} seconds)...`)
    console.log("Preferred topics:", preferredTopics.length > 0 ? preferredTopics.join(", ") : "Any")    // Try to scrape YouTube for videos
    const videoData = await attemptYouTubeScraping(minDuration, maxDuration, preferredTopics)

    // Cache the video for today
    // cachedVideo = videoData
    // lastFetchDate = today

    return videoData
  } catch (error) {
    console.error("Error fetching random YouTube video:", error)
    throw error // Re-throw error instead of using fallback
  }
}

// Function to attempt YouTube scraping
async function attemptYouTubeScraping(
  minDuration: number,
  maxDuration: number,
  preferredTopics: string[] = [],
): Promise<VideoData> {
  // List of search terms for educational content
  let searchTerms = [
    "ted talk",
    "educational video",
    "english learning",
    "science explanation",
    "history documentary short",
    "technology review",
    "business insights",
    "cultural discussion",
    "environmental issues",
    "health and wellness",
    "language learning tips",
    "pronunciation guide",
    "grammar explanation",
    "vocabulary building",
    "public speaking",
    "presentation skills",
    "interview techniques",
    "professional communication",
    "academic writing",
    "critical thinking",
    "problem solving",
    "innovation mindset",
    "leadership skills",
    "global perspectives",
    "cultural diversity",
    "sustainable development",
    "digital transformation",
    "artificial intelligence basics",
    "future of work",
    "social media impact",
  ]

  // If preferred topics are provided, use them as search terms
  if (preferredTopics.length > 0) {
    // Combine with some educational keywords
    searchTerms = preferredTopics.map(
      (topic) => `${topic} explanation` || `${topic} educational` || `${topic} ted talk`,
    )
  }

  // Randomly select a search term
  const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)]

  console.log(`Searching YouTube for: "${randomTerm}"`)

  try {
    // Add duration filter to the search query
    // YouTube duration filters: short (< 4 min), medium (4-20 min), long (> 20 min)
    // We'll use medium since we want videos > 3 minutes
    const durationFilter = "medium"

    // Fetch YouTube search results
    const response = await fetch(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(randomTerm)}&sp=EgIYAg%253D%253D`, // EgIYAg%253D%253D is the encoded filter for medium length videos
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`YouTube search request failed with status: ${response.status}`)
    }

    const html = await response.text()
    console.log(`Received HTML response of length: ${html.length}`)

    // Extract video IDs using multiple methods
    const videoIds = extractVideoIds(html)

    if (videoIds.length === 0) {
      console.log("No videos found in search results, using fallback")
      throw new Error("No videos found in search results")
    }

    console.log(`Found ${videoIds.length} videos in search results`)

    // Try videos one by one until we find one with appropriate duration
    for (const videoId of videoIds) {
      try {
        const videoDetails = await getVideoDetails(videoId, minDuration, maxDuration)

        // Check if the video meets our duration requirements
        if (videoDetails.duration >= minDuration && videoDetails.duration <= maxDuration) {
          console.log(`Selected video ID: ${videoId} with duration: ${videoDetails.duration} seconds`)
          return videoDetails
        } else {
          console.log(
            `Skipping video ID: ${videoId} - duration ${videoDetails.duration} seconds is outside range ${minDuration}-${maxDuration}`,
          )
        }
      } catch (error) {
        console.error(`Error getting details for video ${videoId}:`, error)
        // Continue to the next video
      }
    }

    // If we get here, we couldn't find a suitable video
    throw new Error("No videos with appropriate duration found")
  } catch (error) {
    console.error("YouTube scraping failed:", error)
    throw error
  }
}

// Function to extract video IDs from HTML using multiple methods
function extractVideoIds(html: string): string[] {
  const $ = load(html)
  const videoIds: string[] = []

  // Method 1: Extract from watch links
  $("a").each((_, element) => {
    const href = $(element).attr("href")
    if (href && href.startsWith("/watch?v=")) {
      const videoId = href.split("v=")[1]?.split("&")[0]
      if (videoId && !videoIds.includes(videoId)) {
        videoIds.push(videoId)
      }
    }
  })

  // Method 2: Extract from data attributes
  $("[data-video-id]").each((_, element) => {
    const videoId = $(element).attr("data-video-id")
    if (videoId && !videoIds.includes(videoId)) {
      videoIds.push(videoId)
    }
  })

  // Method 3: Extract from thumbnails
  $("img").each((_, element) => {
    const src = $(element).attr("src") || ""
    if (src.includes("ytimg.com/vi/")) {
      const match = src.match(/\/vi\/([^/]+)\//)
      if (match && match[1] && !videoIds.includes(match[1])) {
        videoIds.push(match[1])
      }
    }
  })

  // Method 4: Look for JSON data in script tags
  $("script").each((_, element) => {
    const scriptContent = $(element).html() || ""
    if (scriptContent.includes('"videoId"')) {
      const videoIdMatches = scriptContent.match(/"videoId"\s*:\s*"([^"]+)"/g)
      if (videoIdMatches) {
        videoIdMatches.forEach((match) => {
          const videoId = match.split('"videoId":"')[1]?.replace('"', "")
          if (videoId && !videoIds.includes(videoId)) {
            videoIds.push(videoId)
          }
        })
      }
    }
  })

  return videoIds
}

// Function to get video details
async function getVideoDetails(videoId: string, minDuration: number, maxDuration: number): Promise<VideoData> {
  try {
    // Fetch video details from YouTube
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch video details with status: ${response.status}`)
    }

    const html = await response.text()
    const $ = load(html)

    // Extract video title
    const title =
      $('meta[property="og:title"]').attr("content") ||
      $("title").text().replace(" - YouTube", "") ||
      "Educational Video"

    // Extract video description
    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "Learn English with this educational video"

    // Extract thumbnail URL
    const thumbnailUrl =
      $('meta[property="og:image"]').attr("content") || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

    // Create embed URL for the video
    const embedUrl = `https://www.youtube.com/embed/${videoId}`

    // Extract duration from the page (this is complex and might not always work)
    // For simplicity, we'll use a random duration between min and max
    // In a real implementation, you would parse the actual duration from the page
    const durationText = $('meta[itemprop="duration"]').attr("content") || ""
    let duration = Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration

    // Try to parse duration from the page if available
    if (durationText) {
      try {
        // Format is typically PT#M#S (e.g., PT5M30S for 5 minutes and 30 seconds)
        const minutesMatch = durationText.match(/(\d+)M/)
        const secondsMatch = durationText.match(/(\d+)S/)

        const minutes = minutesMatch ? Number.parseInt(minutesMatch[1]) : 0
        const seconds = secondsMatch ? Number.parseInt(secondsMatch[1]) : 0

        duration = minutes * 60 + seconds

        console.log(`Parsed duration: ${duration} seconds (${minutes}m ${seconds}s)`)
      } catch (error) {
        console.error("Error parsing duration:", error)
      }
    }    // Extract transcript using admin settings for time limit
    const videoSettings = await getVideoSettings()
    const maxWatchTimeSeconds = videoSettings.minWatchTime || 300 // Default 5 minutes
    
    console.log(`🎬 Extracting transcript with admin time limit: ${maxWatchTimeSeconds} seconds`)
    const transcriptResult = await extractYouTubeTranscriptForDuration(videoId, duration, maxWatchTimeSeconds)
    const transcript = transcriptResult.transcript

    // Extract topics from title and description
    const topics = extractTopics(title, description)

    // Create video data object
    return {
      id: videoId,
      title,
      description,
      thumbnailUrl,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl,
      duration,
      transcript,
      topics,
    }
  } catch (error) {
    console.error("Error getting video details:", error)
    throw error
  }
}

// Function to extract topics from title and description
function extractTopics(title: string, description: string): string[] {
  // List of common topics
  const commonTopics = [
    "Technology",
    "Science",
    "Education",
    "Health",
    "Environment",
    "Business",
    "Economics",
    "Politics",
    "Culture",
    "Art",
    "History",
    "Psychology",
    "Philosophy",
    "Language",
    "Communication",
    "Climate Change",
    "Artificial Intelligence",
    "Sustainability",
    "Innovation",
    "Leadership",
    "Personal Development",
    "Social Media",
    "Digital Transformation",
    "Healthcare",
    "Renewable Energy",
    "Space",
    "Quantum Computing",
    "Blockchain",
    "Mental Health",
    "Remote Work",
    "Cybersecurity",
    "Genetic Engineering",
    "Virtual Reality",
    "Augmented Reality",
    "Robotics",
    "Machine Learning",
  ]

  // Combine title and description
  const content = `${title} ${description}`.toLowerCase()

  // Find matching topics
  const matchedTopics = commonTopics.filter((topic) => content.includes(topic.toLowerCase()))

  // If no topics match, return some generic ones
  if (matchedTopics.length === 0) {
    return ["Education", "English Learning"]
  }
  return matchedTopics
}

// Thêm biến để lưu trữ video được chọn bởi admin
// let adminSelectedVideo: VideoData | null = null

// Thêm hàm để đặt video được chọn bởi admin
// export async function setAdminSelectedVideo(videoData: VideoData | null): Promise<void> {
//   adminSelectedVideo = videoData
//   console.log("Admin selected video set:", adminSelectedVideo?.id)
// }

// New Supabase-only implementation for getTodayVideo
export async function getTodayVideo(): Promise<VideoData> {
  const today = getTodayDate()
  
  try {    
    console.log(`🔍 Checking Supabase for today's video (${today})...`)    
    
    // 1. Check Supabase for today's video first
    const { data, error } = await supabaseServer
      .from('challenges')
      .select('*')
      .eq('date', today)
      .eq('challenge_type', 'daily')
      .single()
      
    if (data && !error) {
      console.log("✅ Video already exists for today, using saved video:", data.id)
      
      // Log transcript information
      if (data.transcript && data.transcript.length > 100) {
        console.log(`📝 Transcript available: ${data.transcript.length} characters`)
        console.log(`📄 Transcript preview: ${data.transcript.substring(0, 200)}...`)
      } else {
        console.log("⚠️ No transcript in database for this video")
      }
      
      return {
        id: data.id, // Use database UUID for challenge lookup
        title: data.title,
        description: data.description || "Educational video",
        thumbnailUrl: data.thumbnail_url || `https://img.youtube.com/vi/${data.video_url?.split('v=')[1] || data.id}/hqdefault.jpg`,
        videoUrl: data.video_url,
        embedUrl: data.embed_url || `https://www.youtube.com/embed/${data.video_url?.split('v=')[1] || data.id}`,
        duration: data.duration || 300,
        transcript: data.transcript || "",
        topics: data.topics || []
      }
    }
    
    console.log("⚠️ No video found in Supabase for today, fetching new...")
      // 2. Keep trying to get videos with valid transcripts until we succeed
    let attempts = 0
    const maxAttempts = 10 // Increase max attempts to be more thorough
    
    while (attempts < maxAttempts) {
      attempts++
      console.log(`🔄 Attempt ${attempts}/${maxAttempts}: Fetching video...`)
      
      try {
        const videoData = await fetchRandomYoutubeVideo()
        console.log(`🎬 Video fetched: ${videoData.id}`)
        
        // Check if the fetched video already has a valid transcript
        if (videoData.transcript && videoData.transcript.length >= 100) {
          console.log(`✅ Found video with valid transcript: ${videoData.transcript.length} characters`)
          
          // Save successful video with transcript to unified challenges table and retrieve DB record
          const { data: saved, error: insertError } = await supabaseServer
            .from('challenges')
            .upsert({
              title: videoData.title,
              description: videoData.description,
              video_url: videoData.videoUrl,
              thumbnail_url: videoData.thumbnailUrl,
              embed_url: videoData.embedUrl,
              duration: videoData.duration,
              topics: videoData.topics,
              transcript: videoData.transcript,
              challenge_type: 'daily',
              difficulty: 'intermediate',
              user_id: null,
              batch_id: `daily_${today}_batch`,
              is_active: true,
              featured: false,
              date: today,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single()
          
          if (!insertError && saved) {
            console.log("✅ New video with transcript saved to Supabase:", saved.id)
            return {
              id: saved.id,
              title: saved.title,
              description: saved.description || "Educational video",
              thumbnailUrl: saved.thumbnail_url || `https://img.youtube.com/vi/${saved.video_url?.split('v=')[1] || saved.id}/hqdefault.jpg`,
              videoUrl: saved.video_url,
              embedUrl: saved.embed_url || `https://www.youtube.com/embed/${saved.video_url?.split('v=')[1] || saved.id}`,
              duration: saved.duration || 300,
              transcript: saved.transcript || "",
              topics: saved.topics || []
            }
          } else {
            console.error("❌ Error saving video to Supabase:", insertError)
            // Continue trying with other videos
          }
        } else {
          console.log(`⚠️ No valid transcript for video ${videoData.id} (${videoData.transcript?.length || 0} chars), trying next video...`)
        }
      } catch (error) {
        console.error(`❌ Error with attempt ${attempts}:`, error)
        // Continue to next attempt
      }
    }
    
    // If we've exhausted all attempts, throw an error instead of using fallback
    console.error(`❌ Could not find video with valid transcript after ${maxAttempts} attempts`)
    throw new Error(`Failed to extract transcript from any video after ${maxAttempts} attempts. Please try again later.`)
    
  } catch (error) {
    console.error("❌ Error in getTodayVideo:", error)
    throw error // Re-throw the error instead of using fallback
  }
}

// Update admin video management functions for Supabase
export async function setAdminSelectedVideo(videoData: VideoData | null): Promise<void> {
  const today = getTodayDate()
  
  if (videoData) {
    try {
      // Save admin-selected video to unified challenges table
      const { error } = await supabaseServer
        .from('challenges')
        .upsert({
          title: videoData.title,
          description: videoData.description,
          video_url: videoData.videoUrl,
          thumbnail_url: videoData.thumbnailUrl,
          embed_url: videoData.embedUrl,
          duration: videoData.duration,
          topics: videoData.topics,
          transcript: videoData.transcript || "",
          challenge_type: 'daily',
          difficulty: 'intermediate',
          user_id: null,
          batch_id: `daily_${today}_admin`,
          is_active: true,
          featured: false,
          date: today,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (error) {
        console.error("❌ Error saving admin video to Supabase:", error)
        throw error
      }
      
      console.log("✅ Admin selected video saved to Supabase:", videoData.id)
    } catch (error) {
      console.error("❌ Failed to save admin video:", error)
      throw error
    }
  } else {
    try {
      // Clear today's video from Supabase
      const { error } = await supabaseServer
        .from('challenges')
        .delete()
        .eq('date', today)
        .eq('challenge_type', 'daily')
      
      if (error) {
        console.error("❌ Error clearing video from Supabase:", error)
        throw error
      }
      
      console.log("✅ Admin video cleared from Supabase")
    } catch (error) {
      console.error("❌ Failed to clear admin video:", error)
      throw error
    }
  }
}

// Add helper function for debugging
export async function shouldRefreshVideo(): Promise<boolean> {
  const today = getTodayDate()
  
  try {
    const { data } = await supabaseServer
      .from('challenges')
      .select('date')
      .eq('date', today)
      .eq('challenge_type', 'daily')
      .single()
      
    return !data // Return true if no video exists for today
  } catch {
    return true // Refresh if there's an error
  }
}

// Add a function to manually reset the cached video (for testing)
export async function resetCachedVideo(): Promise<void> {
  console.log("Note: No cache to reset - using Supabase only")
}

// Thêm hàm để trích xuất video từ URL YouTube
export async function extractVideoFromUrl(url: string): Promise<VideoData | null> {
  try {
    // Trích xuất video ID từ URL
    const videoId = extractYoutubeId(url)

    if (!videoId) {
      throw new Error("Invalid YouTube URL")
    }

    console.log("Extracted video ID:", videoId)

    // Lấy thông tin video
    const videoDetails = await getVideoDetails(videoId, 0, 9999)
    return videoDetails
  } catch (error) {
    console.error("Error extracting video from URL:", error)
    return null
  }
}

// Hàm trích xuất YouTube ID từ URL
function extractYoutubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)

  return match && match[2].length === 11 ? match[2] : null
}
