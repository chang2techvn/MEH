"use server"

import { load } from "cheerio"
import { supabaseServer } from "@/lib/supabase-server"
import type { Database } from "@/lib/database.types"

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

// Function to get today's date as a string (YYYY-MM-DD format)
const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Fallback videos to use when scraping fails
const fallbackVideos = [
  {
    id: "J---aiyznGQ",
    title: "Learn English with TED Talks",
    description: "Improve your English skills with this educational TED Talk about language learning.",
    duration: 240, // 4 minutes
    topics: ["Education", "Language Learning", "Communication"],
  },
  {
    id: "Ks-_Mh1QhMc",
    title: "The Power of Body Language",
    description: "Learn about the importance of non-verbal communication in this fascinating talk.",
    duration: 300, // 5 minutes
    topics: ["Communication", "Psychology", "Public Speaking"],
  },
  {
    id: "RVmMeMcGc0I",
    title: "Climate Change Explained",
    description: "A comprehensive explanation of climate change and its effects on our planet.",
    duration: 360, // 6 minutes
    topics: ["Climate Change", "Environmental Conservation", "Science"],
  },
  {
    id: "fLJsdqxnZb0",
    title: "The Science of Learning",
    description: "Discover how our brains process and retain information in this educational video.",
    duration: 270, // 4.5 minutes
    topics: ["Education", "Neuroscience", "Psychology"],
  },
  {
    id: "UF8uR6Z6KLc",
    title: "How to Speak Effectively",
    description: "Learn the principles of effective public speaking and communication.",
    duration: 330, // 5.5 minutes
    topics: ["Communication", "Public Speaking", "Leadership"],
  },
]

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
    console.log("Preferred topics:", preferredTopics.length > 0 ? preferredTopics.join(", ") : "Any")

    // Try to scrape YouTube for videos
    const videoData = await attemptYouTubeScraping(minDuration, maxDuration, preferredTopics)

    // Cache the video for today
    // cachedVideo = videoData
    // lastFetchDate = today

    return videoData  } catch (error) {
    console.error("Error fetching random YouTube video:", error)

    // Use a fallback video when scraping fails
    return getFallbackVideo()
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
    }

    // Extract transcript (simplified version)
    const transcript = await extractTranscript(videoId)

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

// Function to get a fallback video
function getFallbackVideo(): VideoData {
  console.log("Using fallback video")

  // Select a random fallback video
  const fallback = fallbackVideos[Math.floor(Math.random() * fallbackVideos.length)]

  // Create video data object from fallback
  return {
    id: fallback.id,
    title: fallback.title,
    description: fallback.description,
    thumbnailUrl: `https://img.youtube.com/vi/${fallback.id}/hqdefault.jpg`,
    videoUrl: `https://www.youtube.com/watch?v=${fallback.id}`,
    embedUrl: `https://www.youtube.com/embed/${fallback.id}`,
    duration: fallback.duration,
    transcript: `This is a simulated transcript for "${fallback.title}". ${fallback.description}`,
    topics: fallback.topics || ["Education", "English Learning"],
  }
}

// Function to extract transcript from YouTube video
async function extractTranscript(videoId: string): Promise<string> {
  try {
    // In a real implementation, you would use a proper API or library to extract transcripts
    // For this example, we'll create a simulated transcript based on the video ID

    // Fetch the video page to extract some content for our simulated transcript
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    const html = await response.text()
    const $ = load(html)

    // Extract title and description
    const title = $('meta[property="og:title"]').attr("content") || "Unknown Title"
    const description = $('meta[property="og:description"]').attr("content") || "No description available"

    // Create a simulated transcript using the title and description
    return `Title: ${title}

${description}

This is a simulated transcript for the video. In a real implementation, you would extract the actual transcript from the YouTube video using YouTube's transcript API or a third-party service.`
  } catch (error) {
    console.error("Error extracting transcript:", error)
    return "Transcript unavailable"
  }
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
  
  try {    console.log(`🔍 Checking Supabase for today's video (${today})...`)    // 1. Check Supabase for today's video
    const { data, error } = await supabaseServer
      .from('daily_videos')
      .select('*')
      .eq('date', today)
      .single()
      
    if (data && !error) {
      const video = data as any // Type casting to bypass TypeScript issues temporarily
      console.log("✅ Video loaded from Supabase:", video.id)
      return {
        id: video.id,
        title: video.title,
        description: video.description || "Educational video",
        thumbnailUrl: video.thumbnail_url || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`,
        videoUrl: video.video_url,
        embedUrl: video.embed_url || `https://www.youtube.com/embed/${video.id}`,
        duration: video.duration || 300,
        transcript: "Transcript will be extracted when needed",
        topics: video.topics || []
      }
    }
    
    console.log("⚠️ No video found in Supabase for today, fetching new...")
    
    // 2. Fetch new video only if not exists in database
    const videoData = await fetchRandomYoutubeVideo()
    
    // 3. Save to Supabase immediately
    const { error: insertError } = await supabaseServer
      .from('daily_videos')
      .upsert({
        id: videoData.id,
        title: videoData.title,
        description: videoData.description,
        video_url: videoData.videoUrl,
        thumbnail_url: videoData.thumbnailUrl,
        embed_url: videoData.embedUrl,
        duration: videoData.duration,
        topics: videoData.topics,
        date: today,
        created_at: new Date().toISOString()
      })
    
    if (insertError) {
      console.error("❌ Error saving video to Supabase:", insertError)
    } else {
      console.log("✅ New video saved to Supabase:", videoData.id)
    }
    
    return videoData
    
  } catch (error) {
    console.error("❌ Error in getTodayVideo:", error)
    
    // Last resort: use a fallback video
    console.log("🔄 Using fallback video...")
    return getFallbackVideo()
  }
}

// Update admin video management functions for Supabase
export async function setAdminSelectedVideo(videoData: VideoData | null): Promise<void> {
  const today = getTodayDate()
  
  if (videoData) {
    try {
      // Save admin-selected video to Supabase
      const { error } = await supabaseServer
        .from('daily_videos')
        .upsert({
          id: videoData.id,
          title: videoData.title,
          description: videoData.description,
          video_url: videoData.videoUrl,
          thumbnail_url: videoData.thumbnailUrl,
          embed_url: videoData.embedUrl,
          duration: videoData.duration,
          topics: videoData.topics,
          date: today,
          created_at: new Date().toISOString()
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
        .from('daily_videos')
        .delete()
        .eq('date', today)
      
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
      .from('daily_videos')
      .select('date')
      .eq('date', today)
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
