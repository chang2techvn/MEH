/**
 * File upload utilities for Supabase Storage
 */

import { supabase } from './supabase'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  path?: string
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  file: File, 
  bucketName: string = 'posts',
  folder: string = 'community-posts'
): Promise<UploadResult> {
  try {

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Upload error:', uploadError)
      return {
        success: false,
        error: uploadError.message
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath)

    const publicUrl = urlData.publicUrl

    return {
      success: true,
      url: publicUrl,
      path: filePath
    }

  } catch (error) {
    console.error('💥 Upload failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

/**
 * Upload video file
 */
export async function uploadVideo(file: File): Promise<UploadResult> {
  // Validate file type
  if (!file.type.startsWith('video/')) {
    return {
      success: false,
      error: 'File must be a video'
    }
  }

  // Check file size (max 100MB)
  const maxSize = 100 * 1024 * 1024 // 100MB
  if (file.size > maxSize) {
    return {
      success: false,
      error: 'Video file must be smaller than 100MB'
    }
  }

  return uploadFile(file, 'posts', 'videos')
}

/**
 * Upload image file
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    return {
      success: false,
      error: 'File must be an image'
    }
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      success: false,
      error: 'Image file must be smaller than 10MB'
    }
  }

  return uploadFile(file, 'posts', 'images')
}

/**
 * Delete file from storage
 */
export async function deleteFile(
  filePath: string, 
  bucketName: string = 'posts'
): Promise<{ success: boolean; error?: string }> {
  try {

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath])

    if (error) {
      console.error('❌ Delete error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    return { success: true }

  } catch (error) {
    console.error('💥 Delete failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    }
  }
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => file.type.startsWith(type))
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop() || ''
}
