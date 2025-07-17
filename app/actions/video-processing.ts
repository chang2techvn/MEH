'use server'

import { extractYouTubeTranscriptForDuration, type VideoInfo } from "@/lib/utils/video-processor"

/**
 * Server action to extract YouTube transcript for client components
 */
export async function extractVideoTranscript(
  videoId: string, 
  videoDuration?: number, 
  maxWatchTimeSeconds?: number
): Promise<VideoInfo> {
  try {
    console.log(`🎬 Server action: Extracting transcript for video ${videoId}`);
    
    const result = await extractYouTubeTranscriptForDuration(
      videoId, 
      videoDuration || 0, 
      maxWatchTimeSeconds || 300
    );
    
    console.log(`✅ Server action: Successfully extracted transcript for video ${videoId}`);
    return result;
    
  } catch (error) {
    console.error(`❌ Server action: Failed to extract transcript for video ${videoId}:`, error);
    throw error;
  }
}

/**
 * Server action to validate video ID and extract basic info
 */
export async function validateVideoId(videoId: string): Promise<{ valid: boolean; error?: string }> {
  try {
    // Basic YouTube video ID validation
    const videoIdRegex = /^[a-zA-Z0-9_-]{11}$/;
    
    if (!videoIdRegex.test(videoId)) {
      return { valid: false, error: 'Invalid YouTube video ID format' };
    }
    
    // Try to extract a small sample to validate the video exists and is accessible
    const result = await extractYouTubeTranscriptForDuration(videoId, 0, 30); // Only first 30 seconds
    
    if (!result.transcript || result.transcript.length < 10) {
      return { valid: false, error: 'Video transcript not available or too short' };
    }
    
    return { valid: true };
    
  } catch (error) {
    console.error(`❌ Video validation failed for ${videoId}:`, error);
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown validation error' 
    };
  }
}
