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
 * Upload video file to Supabase Storage
 */
export async function uploadVideoToStorage(
  file: File,
  userId: string,
  onProgress?: (progress: VideoUploadProgress) => void
): Promise<VideoUploadResult> {
  try {
    console.log('🔄 Starting video upload process...')
    
    // Validate file
    const validation = validateVideoFile(file)
    if (!validation.valid) {
      console.error('❌ File validation failed:', validation.error)
      return {
        success: false,
        error: validation.error
      }
    }
    console.log('✅ File validation passed')

    // Try direct API upload first
    console.log('🚀 Trying direct API upload...')
    const directResult = await uploadVideoDirectAPI(file, userId, onProgress)
    
    if (directResult.success) {
      console.log('✅ Direct API upload successful')
      return directResult
    } else {
      console.log('⚠️ Direct API upload failed, trying Supabase client...')
    }

    // Fallback to Supabase client method
    const fileExtension = file.name.split('.').pop()
    const fileName = `${userId}/${uuidv4()}.${fileExtension}`

    console.log(`📹 Uploading via Supabase client: ${fileName}`)
    console.log(`📊 File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`)

    // Upload file to Supabase Storage with shorter timeout
    console.log('⬆️ Starting Supabase client upload...')
    
    const uploadPromise = supabase.storage
      .from(VIDEO_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    // Shorter timeout for Supabase client
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Supabase client timeout after 15 seconds')), 15000)
    )

    const { data, error } = await Promise.race([uploadPromise, timeoutPromise]) as any

    if (error) {
      console.error('❌ Supabase client upload error:', error)
      return {
        success: false,
        error: `Both upload methods failed. Last error: ${error.message}`
      }
    }
    console.log('✅ File uploaded to storage via Supabase client:', data)

    // Get public URL
    console.log('🔗 Generating public URL...')
    const { data: publicUrlData } = supabase.storage
      .from(VIDEO_BUCKET)
      .getPublicUrl(fileName)

    if (!publicUrlData?.publicUrl) {
      console.error('❌ Failed to generate public URL')
      return {
        success: false,
        error: 'Failed to generate public URL'
      }
    }

    console.log('✅ Video uploaded successfully:', publicUrlData.publicUrl)

    return {
      success: true,
      publicUrl: publicUrlData.publicUrl,
      filePath: fileName,
      fileSize: file.size
    }

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

    console.log('✅ Video deleted successfully:', filePath)
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
      console.log('📦 Creating video bucket...')
      
      // Create bucket with public access
      const { error: createError } = await supabase.storage.createBucket(VIDEO_BUCKET, {
        public: true,
        allowedMimeTypes: SUPPORTED_VIDEO_FORMATS,
        fileSizeLimit: MAX_FILE_SIZE
      })

      if (createError) {
        console.error('❌ Error creating bucket:', createError)
      } else {
        console.log('✅ Video bucket created successfully')
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
    console.log('🔍 Testing Supabase Storage connection...')
    
    // Test with direct fetch first
    try {
      const response = await fetch('http://127.0.0.1:54321/storage/v1/bucket', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        }
      })
      
      if (response.ok) {
        const buckets = await response.json()
        console.log('✅ Direct API call successful. Buckets:', buckets)
        
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
    
    console.log('✅ Supabase client successful. Buckets:', data?.map((b: any) => b.name))
    
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

/**
 * Upload video using direct API call (fallback method)
 */
export async function uploadVideoDirectAPI(
  file: File,
  userId: string,
  onProgress?: (progress: VideoUploadProgress) => void
): Promise<VideoUploadResult> {
  try {
    console.log('🔄 Starting direct API upload...')
    
    // Validate file
    const validation = validateVideoFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Generate filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${userId}/${uuidv4()}.${fileExtension}`
    
    console.log(`📹 Uploading via API: ${fileName}`)

    // Create FormData
    const formData = new FormData()
    formData.append('file', file)

    // Upload using fetch with XMLHttpRequest for progress
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentage = Math.round((e.loaded / e.total) * 100)
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percentage
          })
        }
      })
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const publicUrl = `http://127.0.0.1:54321/storage/v1/object/public/videos/${fileName}`
          console.log('✅ Direct API upload successful:', publicUrl)
          resolve({
            success: true,
            publicUrl,
            filePath: fileName,
            fileSize: file.size
          })
        } else {
          console.error('❌ Direct API upload failed:', xhr.status, xhr.responseText)
          resolve({
            success: false,
            error: `Upload failed: ${xhr.status} ${xhr.statusText}`
          })
        }
      })
      
      xhr.addEventListener('error', () => {
        console.error('❌ Direct API upload error')
        resolve({
          success: false,
          error: 'Network error during upload'
        })
      })
      
      xhr.addEventListener('timeout', () => {
        console.error('❌ Direct API upload timeout')
        resolve({
          success: false,
          error: 'Upload timeout'
        })
      })
      
      xhr.timeout = 60000 // 60 seconds
      xhr.open('POST', `http://127.0.0.1:54321/storage/v1/object/videos/${fileName}`)
      xhr.setRequestHeader('Authorization', `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`)
      xhr.send(formData)
    })

  } catch (error) {
    console.error('❌ Direct API upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
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
  testStorageConnection,
  uploadVideoDirectAPI
}
