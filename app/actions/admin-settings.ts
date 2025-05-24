"use server"

// Define the types for our settings
export interface VideoSettings {
  minWatchTime: number
  maxVideoDuration: number
  autoPublish: boolean
  enforceWatchTime: boolean
}

// Default settings
const DEFAULT_SETTINGS: VideoSettings = {
  minWatchTime: 180, // 3 minutes
  maxVideoDuration: 300, // 5 minutes
  autoPublish: true,
  enforceWatchTime: true,
}

// In a real app, these would be stored in a database
// For this example, we'll use a simple in-memory store
let currentSettings: VideoSettings = { ...DEFAULT_SETTINGS }

/**
 * Get the current video settings
 */
export async function getVideoSettings(): Promise<VideoSettings> {
  // In a real app, fetch from database
  return { ...currentSettings }
}

/**
 * Update video settings
 */
export async function updateVideoSettings(settings: VideoSettings): Promise<VideoSettings> {
  // Validate settings
  if (settings.minWatchTime < 30) {
    throw new Error("Minimum watch time should be at least 30 seconds")
  }

  if (settings.maxVideoDuration < settings.minWatchTime) {
    throw new Error("Maximum video duration should be greater than minimum watch time")
  }

  // In a real app, save to database
  currentSettings = { ...settings }

  // Simulate a delay for the API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return { ...currentSettings }
}

/**
 * Reset settings to defaults
 */
export async function resetVideoSettings(): Promise<VideoSettings> {
  // In a real app, reset in database
  currentSettings = { ...DEFAULT_SETTINGS }

  return { ...currentSettings }
}
