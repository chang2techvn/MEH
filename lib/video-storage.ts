/**
 * Supabase Storage implementation for video uploads
 * Handles video file upload, storage, and URL generation
 */

import { supabase } from './supabase'
import { v4 as uuidv4 } from 'uuid'

// Storage bucket name for videos
const VIDEO_BUCKET = 'videos'

// Supported video formats
const SUPPORTED_VIDEO_FORMATS = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo', // .avi
]

// Maximum file size (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024

export interface VideoUploadResult {
  success: boolean
  publicUrl?: string
  filePath?: string
  error?: string
  fileSize?: number
}

export interface VideoUploadProgress {
  loaded: number
  total: number
  percentage: number
}

/**
 * Upload video file to Supabase Storage with optimization
 */
export async function uploadVideoToStorage(
  file: File,
  userId: string,
  onProgress?: (progress: VideoUploadProgress) => void
): Promise<VideoUploadResult> {
  try {
    console.log('🎬 Starting simple video upload:', {
      fileName: file.name,
      fileSize: file.size,
      userId: userId
    })

    // Check network connectivity
    if (!navigator.onLine) {
      return {
        success: false,
        error: 'No internet connection detected'
      }
    }
    
    // Validate file
    const validation = validateVideoFile(file)
    if (!validation.valid) {
      console.error('❌ File validation failed:', validation.error)
      return {
        success: false,
        error: validation.error
      }
    }

    // Initial progress
    onProgress?.({ loaded: 0, total: file.size, percentage: 5 })

    // Compress video if needed (keep existing compression logic)
    let fileToUpload = file
    if (file.size > 15 * 1024 * 1024) {
      console.log('📦 Compressing large video file...')
      onProgress?.({ loaded: 0, total: file.size, percentage: 10 })
      
      try {
        fileToUpload = await compressVideo(file)
        console.log('✅ Video compressed:', { original: file.size, compressed: fileToUpload.size })
      } catch (error) {
        console.warn('⚠️ Compression failed, using original file:', error)
        fileToUpload = file
      }
    }

    console.log('🚀 Starting API upload (bypasses RLS)...')
    onProgress?.({ loaded: 0, total: fileToUpload.size, percentage: 20 })

    // Use API endpoint with service role (simple and reliable)
    const formData = new FormData()
    formData.append('file', fileToUpload)
    formData.append('userId', userId)

    // Set up progress tracking with XMLHttpRequest
    const xhr = new XMLHttpRequest()
    
    return new Promise<VideoUploadResult>((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const baseProgress = 20 // Already at 20% from compression
          const uploadProgress = Math.round((event.loaded / event.total) * 80) // Remaining 80%
          const totalProgress = baseProgress + uploadProgress
          
          onProgress?.({ 
            loaded: event.loaded, 
            total: event.total, 
            percentage: totalProgress
          })
          console.log(`📊 Upload progress: ${totalProgress}%`)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText)
            console.log('✅ API upload successful:', result)
            onProgress?.({ loaded: fileToUpload.size, total: fileToUpload.size, percentage: 100 })
            resolve(result)
          } catch (error) {
            console.error('❌ Failed to parse response:', error)
            reject(new Error('Invalid response format'))
          }
        } else {
          console.error('❌ API upload failed:', xhr.status, xhr.responseText)
          reject(new Error(`Upload failed: ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        console.error('❌ Network error during upload')
        reject(new Error('Network error during upload'))
      })

      xhr.addEventListener('timeout', () => {
        console.error('❌ Upload timeout')
        reject(new Error('Upload timeout'))
      })

      xhr.timeout = 60000 // 60 seconds timeout
      xhr.open('POST', '/api/upload-video')
      xhr.send(formData)
    })

  } catch (error) {
    console.error('❌ Upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error'
    }
  }
}

/**
 * Delete video from Supabase Storage
 */
export async function deleteVideoFromStorage(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(VIDEO_BUCKET)
      .remove([filePath])

    if (error) {
      console.error('❌ Delete error:', error)
      return false
    }

    return true

  } catch (error) {
    console.error('❌ Delete error:', error)
    return false
  }
}

/**
 * Get signed URL for video (for temporary access)
 */
export async function getVideoSignedUrl(
  filePath: string,
  expiresIn: number = 3600 // 1 hour by default
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(VIDEO_BUCKET)
      .createSignedUrl(filePath, expiresIn)

    if (error) {
      console.error('❌ Signed URL error:', error)
      return null
    }

    return data?.signedUrl || null

  } catch (error) {
    console.error('❌ Signed URL error:', error)
    return null
  }
}

/**
 * Validate video file before upload
 */
function validateVideoFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!SUPPORTED_VIDEO_FORMATS.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported video format. Supported formats: ${SUPPORTED_VIDEO_FORMATS.join(', ')}`
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
    }
  }

  // Check if file is actually a video
  if (!file.type.startsWith('video/')) {
    return {
      valid: false,
      error: 'Selected file is not a video'
    }
  }

  return { valid: true }
}

/**
 * Ensure video bucket exists in Supabase Storage
 */
async function ensureVideoBucketExists(): Promise<void> {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError)
      return
    }

    const bucketExists = buckets?.some(bucket => bucket.name === VIDEO_BUCKET)

    if (!bucketExists) {
      
      // Create bucket with public access
      const { error: createError } = await supabase.storage.createBucket(VIDEO_BUCKET, {
        public: true,
        allowedMimeTypes: SUPPORTED_VIDEO_FORMATS,
        fileSizeLimit: MAX_FILE_SIZE
      })

      if (createError) {
        console.error('❌ Error creating bucket:', createError)
      } 
    }

  } catch (error) {
    console.error('❌ Error ensuring bucket exists:', error)
  }
}

/**
 * Get video metadata from storage
 */
export async function getVideoMetadata(filePath: string): Promise<any> {
  try {
    const { data, error } = await supabase.storage
      .from(VIDEO_BUCKET)
      .list(filePath)

    if (error) {
      console.error('❌ Metadata error:', error)
      return null
    }

    return data?.[0] || null

  } catch (error) {
    console.error('❌ Metadata error:', error)
    return null
  }
}

/**
 * List user videos
 */
export async function listUserVideos(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from(VIDEO_BUCKET)
      .list(userId)

    if (error) {
      console.error('❌ List videos error:', error)
      return []
    }

    return data?.map(file => file.name) || []

  } catch (error) {
    console.error('❌ List videos error:', error)
    return []
  }
}

/**
 * Convert blob URL to File for upload
 */
export function blobUrlToFile(blobUrl: string, fileName: string = 'video.mp4'): Promise<File> {
  return fetch(blobUrl)
    .then(response => response.blob())
    .then(blob => new File([blob], fileName, { type: blob.type || 'video/mp4' }))
}

/**
 * Compress video before upload (basic implementation)
 */
export async function compressVideo(file: File, quality: number = 0.7): Promise<File> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth * quality
      canvas.height = video.videoHeight * quality
      
      video.currentTime = 0
      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'video/mp4' }))
            } else {
              resolve(file) // Return original if compression fails
            }
          }, 'video/mp4', quality)
        }
      }
    }
    
    video.src = URL.createObjectURL(file)
  })
}

/**
 * Test Supabase Storage connection with direct API call
 */
export async function testStorageConnection(): Promise<{ success: boolean; message: string }> {
  try {
    
    // Test with direct fetch first
    try {
      const response = await fetch('http://127.0.0.1:54321/storage/v1/bucket', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        }
      })
      
      if (response.ok) {
        const buckets = await response.json()
        
        const videoBucket = buckets.find((bucket: any) => bucket.name === 'videos')
        if (videoBucket) {
          return {
            success: true,
            message: `Direct API test passed. Videos bucket exists.`
          }
        }
      } else {
        console.error('❌ Direct API call failed:', response.status, response.statusText)
      }
    } catch (directError) {
      console.error('❌ Direct API error:', directError)
    }
    
    // Test with Supabase client (with shorter timeout)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Supabase client timeout')), 5000)
    )
    
    const listPromise = supabase.storage.listBuckets()
    
    const { data, error } = await Promise.race([listPromise, timeoutPromise]) as any
    
    if (error) {
      console.error('❌ Supabase client failed:', error)
      return {
        success: false,
        message: `Supabase client failed: ${error.message}`
      }
    }
    
    
    const videoBucket = data?.find((bucket: any) => bucket.name === 'videos')
    if (videoBucket) {
      return {
        success: true,
        message: `Supabase client test passed. Videos bucket exists.`
      }
    } else {
      return {
        success: false,
        message: 'Connected but videos bucket not found.'
      }
    }
    
  } catch (error) {
    console.error('❌ Storage test error:', error)
    return {
      success: false,
      message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

export default {
  uploadVideoToStorage,
  deleteVideoFromStorage,
  getVideoSignedUrl,
  getVideoMetadata,
  listUserVideos,
  blobUrlToFile,
  compressVideo,
  validateVideoFile,
  testStorageConnection
}
