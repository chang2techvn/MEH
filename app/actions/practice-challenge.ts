"use server"

import { supabaseServer } from "@/lib/supabase-server"
import { type VideoData } from "./youtube-video"

// Function to get challenge video data from daily_challenges table
export async function getPracticeChallengeVideo(challengeId: string): Promise<VideoData> {
  try {
    console.log(`🔍 Loading practice challenge video: ${challengeId}`)
    
    // First try to get from daily_challenges table
    const { data: challengeData, error: challengeError } = await supabaseServer
      .from('daily_challenges')
      .select('*')
      .eq('id', challengeId)
      .single()
    
    if (challengeData && !challengeError) {
      console.log(`✅ Found challenge in daily_challenges table`)
      
      // Convert database format to VideoData format
      const videoData: VideoData = {
        id: challengeData.id,
        title: challengeData.title,
        description: challengeData.description || "",
        thumbnailUrl: challengeData.thumbnail_url || "",
        videoUrl: challengeData.video_url,
        embedUrl: challengeData.embed_url || "",
        duration: challengeData.duration || 0,
        topics: challengeData.topics || [],
        transcript: challengeData.transcript || ""
      }
      
      return videoData
    }
    
    // If not found in daily_challenges, try daily_videos table as fallback
    console.log(`🔍 Not found in daily_challenges, checking daily_videos table...`)
    const { data: videoData, error: videoError } = await supabaseServer
      .from('daily_videos')
      .select('*')
      .eq('id', challengeId)
      .single()
    
    if (videoData && !videoError) {
      console.log(`✅ Found video in daily_videos table`)
      
      // Convert daily_videos format to VideoData format
      const convertedVideoData: VideoData = {
        id: videoData.id,
        title: videoData.title,
        description: videoData.description || "",
        thumbnailUrl: videoData.thumbnail_url || "",
        videoUrl: videoData.video_url,
        embedUrl: videoData.embed_url || "",
        duration: videoData.duration || 0,
        topics: videoData.topics || [],
        transcript: videoData.transcript || ""
      }
      
      return convertedVideoData
    }
    
    console.log(`❌ Video not found in either table`)
    throw new Error(`Practice challenge video not found: ${challengeId}`)
    
  } catch (error) {
    console.error(`❌ Error loading practice challenge video:`, error)
    throw error
  }
}
