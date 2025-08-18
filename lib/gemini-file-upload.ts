/**
 * Gemini Files API integration for video upload and analysis
 * Updated to use API Key Manager with automatic failover
 */

import { GoogleGenAI } from "@google/genai"
import { getActiveApiKey, incrementUsage, markKeyAsInactive, rotateToNextKey } from './api-key-manager'

// Fallback API key from environment (for emergency use)
const FALLBACK_API_KEY = process.env.GEMINI_API_KEY

// Configuration
const UPLOAD_CONFIG = {
  maxRetries: 3,
  retryDelay: 2000,
  timeout: 60000 // 60 seconds for uploads
}

/**
 * Gets an active Gemini API key with automatic failover
 */
async function getGeminiApiKey(): Promise<{ key: string; keyId?: string }> {
  try {
    const activeKey = await getActiveApiKey('gemini')
    return {
      key: activeKey.decrypted_key,
      keyId: activeKey.id
    }
  } catch (error) {
    console.warn('⚠️ Failed to get API key from database, using fallback:', error)
    
    if (!FALLBACK_API_KEY) {
      throw new Error('No API keys available - database unavailable and no fallback configured')
    }
    
    return {
      key: FALLBACK_API_KEY
    }
  }
}

/**
 * Handles API errors and performs automatic failover
 */
async function handleApiError(error: any, keyId?: string): Promise<{ shouldRetry: boolean; newKey?: { key: string; keyId?: string } }> {
  const status = error.status || error.response?.status
  
  if (status === 503) {
    console.log('🔄 Service unavailable (503), attempting key rotation...')
    if (keyId) {
      const rotation = await rotateToNextKey('gemini', keyId, 'Service unavailable (503)')
      if (rotation.success) {
        const newKey = await getGeminiApiKey()
        return { shouldRetry: true, newKey }
      }
    }
  } else if (status === 429) {
    console.log('⚠️ Quota exceeded (429), marking key as inactive...')
    if (keyId) {
      await markKeyAsInactive(keyId, 'Quota exceeded (429)')
      const newKey = await getGeminiApiKey()
      return { shouldRetry: true, newKey }
    }
  } else if (status === 403) {
    console.log('❌ Invalid API key (403), marking as inactive...')
    if (keyId) {
      await markKeyAsInactive(keyId, 'Invalid API key (403)')
      const newKey = await getGeminiApiKey()
      return { shouldRetry: true, newKey }
    }
  }
  
  return { shouldRetry: false }
}

export interface GeminiFileUploadResult {
  fileUri: string
  fileName: string
  mimeType: string
  sizeBytes: number
  state: string
  uploadedFile: any  // The full file object for API calls
}

/**
 * Upload video file to Gemini Files API for analysis with automatic failover
 * @param videoFile - Video file buffer or Blob
 * @param mimeType - Video MIME type (e.g., 'video/mp4')
 * @param displayName - Display name for the file
 * @returns Upload result with file URI for Gemini analysis
 */
export async function uploadVideoToGemini(
  videoFile: Buffer | Blob,
  mimeType: string,
  displayName: string = 'video-for-evaluation'
): Promise<GeminiFileUploadResult> {
  let currentAttempt = 0
  let currentKey = await getGeminiApiKey()

  while (currentAttempt < UPLOAD_CONFIG.maxRetries) {
    try {
      console.log(`🔄 Uploading video to Gemini Files API (attempt ${currentAttempt + 1}/${UPLOAD_CONFIG.maxRetries})`)
      const fileSize = videoFile instanceof Buffer ? videoFile.length : (videoFile as Blob).size
      console.log("📁 File size:", fileSize)
      console.log("📁 MIME type:", mimeType)
      
      // Initialize client with current API key
      const client = new GoogleGenAI({ apiKey: currentKey.key })
      
      // Convert Buffer to File-like object if needed
      let fileData: File
      if (videoFile instanceof Buffer) {
        const uint8Array = new Uint8Array(videoFile)
        const blob = new Blob([uint8Array], { type: mimeType })
        fileData = new File([blob], displayName, { type: mimeType })
      } else {
        fileData = new File([videoFile as Blob], displayName, { type: mimeType })
      }
      
      // Upload file to Gemini Files API using new SDK
      const uploadResult = await client.files.upload({ file: fileData })
      
      console.log("✅ Successfully uploaded video to Gemini:")
      console.log("📁 File URI:", uploadResult.uri)
      console.log("📁 File name:", uploadResult.name)
      console.log("📁 State:", uploadResult.state)
      
      // Wait for file to be processed if needed
      if (uploadResult.state === 'PROCESSING') {
        console.log("⏳ File is processing, waiting...")
        await waitForFileProcessing(uploadResult.name || '', currentKey.key)
      }

      // Increment usage counter for successful upload
      if (currentKey.keyId) {
        await incrementUsage(currentKey.keyId)
      }

      return {
        fileUri: uploadResult.uri || '',
        fileName: uploadResult.name || '',
        mimeType: uploadResult.mimeType || mimeType,
        sizeBytes: Number(uploadResult.sizeBytes) || fileSize,
        state: uploadResult.state || 'ACTIVE',
        uploadedFile: uploadResult
      }

    } catch (error) {
      console.error(`❌ Upload attempt ${currentAttempt + 1} failed:`, error)

      // Handle specific upload errors with failover
      if (error instanceof Error) {
        if (error.message.includes("quota") || error.message.includes("limit")) {
          const errorResult = await handleApiError({ status: 429 }, currentKey.keyId)
          if (errorResult.shouldRetry && errorResult.newKey) {
            currentKey = errorResult.newKey
            currentAttempt++
            continue
          }
        } else if (error.message.includes("forbidden") || error.message.includes("403")) {
          const errorResult = await handleApiError({ status: 403 }, currentKey.keyId)
          if (errorResult.shouldRetry && errorResult.newKey) {
            currentKey = errorResult.newKey
            currentAttempt++
            continue
          }
        }
      }

      currentAttempt++

      if (currentAttempt >= UPLOAD_CONFIG.maxRetries) {
        console.error('❌ All upload attempts exhausted')
        throw new Error(`Failed to upload video after ${UPLOAD_CONFIG.maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, UPLOAD_CONFIG.retryDelay * currentAttempt))
    }
  }

  throw new Error('Failed to upload video - maximum retries exceeded')
}

/**
 * Wait for file processing to complete with API key support
 */
async function waitForFileProcessing(fileName: string, apiKey: string, maxWaitTime: number = 30000): Promise<void> {
  const startTime = Date.now()
  const client = new GoogleGenAI({ apiKey })
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const fileInfo = await client.files.get({ name: fileName })
      
      if (fileInfo.state === 'ACTIVE') {
        console.log("✅ File processing completed")
        return
      }
      
      if (fileInfo.state === 'FAILED') {
        throw new Error("File processing failed")
      }
      
      console.log("⏳ File still processing, waiting...")
      await new Promise(resolve => setTimeout(resolve, 2000))
      
    } catch (error) {
      console.error("❌ Error checking file status:", error)
      throw error
    }
  }
  
  throw new Error("File processing timeout")
}

/**
 * Delete uploaded file from Gemini Files API with automatic failover
 * @param fileName - File name returned from upload
 */
export async function deleteGeminiFile(fileName: string): Promise<void> {
  try {
    console.log("🗑️ Deleting file from Gemini:", fileName)
    const currentKey = await getGeminiApiKey()
    const client = new GoogleGenAI({ apiKey: currentKey.key })
    
    await client.files.delete({ name: fileName })
    console.log("✅ Successfully deleted file from Gemini")
  } catch (error) {
    console.error("❌ Failed to delete file from Gemini:", error)
    // Don't throw error for cleanup operations
  }
}

/**
 * Upload video buffer to Gemini Files API with specified API key
 * @param videoFile - Video buffer or file
 * @param mimeType - MIME type of the video
 * @param displayName - Display name for the file
 * @param apiKey - Specific API key to use for upload
 * @returns Upload result with file URI and metadata
 */
export async function uploadVideoToGeminiWithKey(
  videoFile: Buffer | Blob,
  mimeType: string,
  displayName: string,
  apiKey: string
): Promise<GeminiFileUploadResult> {
  console.log(`🔄 Uploading video to Gemini Files API with provided key`)
  const fileSize = videoFile instanceof Buffer ? videoFile.length : (videoFile as Blob).size
  console.log("📁 File size:", fileSize)
  console.log("📁 MIME type:", mimeType)
  
  // Initialize client with provided API key
  const client = new GoogleGenAI({ apiKey })
  
  // Convert Buffer to File-like object if needed
  let fileData: File
  if (videoFile instanceof Buffer) {
    const uint8Array = new Uint8Array(videoFile)
    const blob = new Blob([uint8Array], { type: mimeType })
    fileData = new File([blob], displayName, { type: mimeType })
  } else {
    fileData = new File([videoFile as Blob], displayName, { type: mimeType })
  }
  
  // Upload file to Gemini Files API using new SDK
  const uploadResult = await client.files.upload({ file: fileData })
  
  console.log("✅ Successfully uploaded video to Gemini:")
  console.log("📁 File URI:", uploadResult.uri)
  console.log("📁 File name:", uploadResult.name)
  console.log("📁 State:", uploadResult.state)
  
  // Wait for file to be processed if needed
  if (uploadResult.state === 'PROCESSING') {
    console.log("⏳ File is processing, waiting...")
    await waitForFileProcessing(uploadResult.name || '', apiKey)
  }

  return {
    fileUri: uploadResult.uri || '',
    fileName: uploadResult.name || '',
    mimeType: uploadResult.mimeType || mimeType,
    sizeBytes: Number(uploadResult.sizeBytes) || fileSize,
    state: uploadResult.state || 'ACTIVE',
    uploadedFile: uploadResult
  }
}

/**
 * Download video file from Supabase and upload to Gemini with specified API key
 * @param supabaseVideoUrl - Supabase storage URL
 * @param apiKey - Specific API key to use for upload
 * @returns Gemini file upload result
 */
export async function downloadAndUploadToGeminiWithKey(
  supabaseVideoUrl: string, 
  apiKey: string
): Promise<GeminiFileUploadResult> {
  console.log("🔄 Downloading video from Supabase:", supabaseVideoUrl)
  
  // Download video from Supabase
  const response = await fetch(supabaseVideoUrl)
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.status} ${response.statusText}`)
  }

  const videoBuffer = await response.arrayBuffer()
  const contentType = response.headers.get('content-type') || 'video/mp4'
  
  console.log("✅ Video downloaded, uploading to Gemini with specified key...")
  
  // Upload to Gemini using the provided API key
  return await uploadVideoToGeminiWithKey(
    Buffer.from(videoBuffer),
    contentType,
    `video-${Date.now()}`,
    apiKey
  )
}

/**
 * Download video file from Supabase and upload to Gemini with automatic failover
 * @param supabaseVideoUrl - Supabase storage URL
 * @returns Gemini file upload result
 */
export async function downloadAndUploadToGemini(supabaseVideoUrl: string): Promise<GeminiFileUploadResult> {
  try {
    console.log("🔄 Downloading video from Supabase:", supabaseVideoUrl)
    
    // Download video from Supabase
    const response = await fetch(supabaseVideoUrl)
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status} ${response.statusText}`)
    }

    const videoBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'video/mp4'
    
    console.log("✅ Video downloaded, uploading to Gemini...")
    
    // Upload to Gemini using our improved upload function
    return await uploadVideoToGemini(
      Buffer.from(videoBuffer),
      contentType,
      `video-${Date.now()}`
    )
    
  } catch (error) {
    console.error("❌ Failed to download and upload video:", error)
    throw new Error(`Download and upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
