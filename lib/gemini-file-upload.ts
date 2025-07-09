/**
 * Gemini Files API integration for video upload and analysis
 * Updated to use the new @google/genai SDK
 */

import { GoogleGenAI } from "@google/genai"

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is required")
}

const client = new GoogleGenAI({ apiKey })

export interface GeminiFileUploadResult {
  fileUri: string
  fileName: string
  mimeType: string
  sizeBytes: number
  state: string
  uploadedFile: any  // The full file object for API calls
}

/**
 * Upload video file to Gemini Files API for analysis
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
  try {
    console.log("🔄 Uploading video to Gemini Files API...")
    const fileSize = videoFile instanceof Buffer ? videoFile.length : (videoFile as Blob).size
    console.log("📁 File size:", fileSize)
    console.log("📁 MIME type:", mimeType)
    
    // Convert Buffer to File-like object if needed
    let fileData: File
    if (videoFile instanceof Buffer) {
      const blob = new Blob([videoFile], { type: mimeType })
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
    if (uploadResult.state === 'PROCESSING' && uploadResult.name) {
      console.log("⏳ Waiting for file processing...")
      await waitForFileProcessing(uploadResult.name)
    }
    
    return {
      fileUri: uploadResult.uri || "",
      fileName: uploadResult.name || "",
      mimeType: uploadResult.mimeType || mimeType,
      sizeBytes: Number(uploadResult.sizeBytes) || fileSize,
      state: String(uploadResult.state || "UNKNOWN"),
      uploadedFile: uploadResult  // Include the full file object
    }
    
  } catch (error) {
    console.error("❌ Failed to upload video to Gemini:", error)
    throw new Error(`Failed to upload video to Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Wait for file processing to complete
 */
async function waitForFileProcessing(fileName: string, maxWaitTime: number = 30000): Promise<void> {
  const startTime = Date.now()
  
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
 * Delete uploaded file from Gemini Files API
 * @param fileName - File name returned from upload
 */
export async function deleteGeminiFile(fileName: string): Promise<void> {
  try {
    console.log("🗑️ Deleting file from Gemini:", fileName)
    await client.files.delete({ name: fileName })
    console.log("✅ Successfully deleted file from Gemini")
  } catch (error) {
    console.error("❌ Failed to delete file from Gemini:", error)
    // Don't throw error for cleanup operations
  }
}

/**
 * Download video file from Supabase and upload to Gemini
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
    
    console.log("✅ Downloaded video, size:", videoBuffer.byteLength)
    
    // Upload to Gemini
    const uploadResult = await uploadVideoToGemini(
      Buffer.from(videoBuffer),
      contentType,
      'user-video-evaluation'
    )
    
    return uploadResult
    
  } catch (error) {
    console.error("❌ Failed to download and upload video:", error)
    throw new Error(`Failed to process video: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
