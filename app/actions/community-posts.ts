"use server"

import { supabaseServer } from "@/lib/supabase-server"
import type { VideoEvaluation } from "@/lib/gemini-video-evaluation"

export interface CommunityPost {
  id: string
  user_id: string | null
  username?: string | null
  user_image?: string | null
  title?: string | null
  content: string
  post_type: string | null
  media_url?: string | null
  original_video_id?: string | null
  ai_evaluation?: VideoEvaluation | string | null
  score?: number | null
  tags?: string[] | null
  is_public: boolean | null
  likes_count: number | null
  comments_count: number | null
  created_at: string | null
  updated_at: string | null
}

export async function createCommunityPost(
  userId: string,
  username: string,
  userImage: string,
  content: string,
  videoUrl?: string,
  originalVideoId?: string,
  aiEvaluation?: VideoEvaluation
): Promise<CommunityPost> {
  try {
    // First, ensure the user exists in the public.users table
    const { data: existingUser, error: userCheckError } = await supabaseServer
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existingUser && !userCheckError) {
      // User doesn't exist in public.users, create it
      const { error: userCreateError } = await supabaseServer
        .from('users')
        .insert({
          id: userId,
          email: `${username}@example.com`, // fallback email
          name: username,
          avatar: userImage,
          role: 'student',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (userCreateError) {
        console.log('Warning: Could not create user record:', userCreateError.message)
      } else {
        console.log('✅ Created user record for:', username)
      }
    }    // Create post data to match the posts table schema
    const postData = {
      user_id: userId,
      username,
      user_image: userImage,
      title: `Video Analysis - ${new Date().toLocaleDateString()}`,
      content,
      post_type: videoUrl ? 'video' : 'text', // Use 'video' for posts with video, 'text' for text-only
      media_url: videoUrl,
      original_video_id: originalVideoId,
      ai_evaluation: aiEvaluation ? JSON.stringify(aiEvaluation) : null,
      score: aiEvaluation?.score || null,
      is_public: true,
      likes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }// Save to Supabase
    const { data, error } = await supabaseServer
      .from('posts')
      .insert([postData])
      .select()
      .single()

    if (error) {
      console.error("❌ Error saving community post:", error)
      throw new Error(`Failed to save post: ${error.message}`)
    }

    console.log("✅ Community post saved successfully:", data.id)
    return data as CommunityPost

  } catch (error) {
    console.error("❌ Error in createCommunityPost:", error)
    throw error
  }
}

export async function getCommunityPosts(limit: number = 20, offset: number = 0): Promise<CommunityPost[]> {  try {
    const { data, error } = await supabaseServer
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })      .range(offset, offset + limit - 1)

    if (error) {
      console.error("❌ Error fetching community posts:", error)
      throw new Error(`Failed to fetch posts: ${error.message}`)
    }

    return (data || []) as CommunityPost[]

  } catch (error) {
    console.error("❌ Error in getCommunityPosts:", error)
    throw error
  }
}

export async function getUserPosts(userId: string, limit: number = 10): Promise<CommunityPost[]> {  try {
    const { data, error } = await supabaseServer
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })      .limit(limit)

    if (error) {
      console.error("❌ Error fetching user posts:", error)
      throw new Error(`Failed to fetch user posts: ${error.message}`)
    }

    return (data || []) as CommunityPost[]

  } catch (error) {
    console.error("❌ Error in getUserPosts:", error)
    throw error
  }
}
