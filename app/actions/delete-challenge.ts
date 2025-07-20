"use server"

import { supabaseServer } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function deleteChallenge(challengeId: string, userId?: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    console.log(`🗑️ Attempting to delete challenge: ${challengeId}`)
    
    // First, check if the challenge exists and if the user has permission to delete it
    const { data: challenge, error: fetchError } = await supabaseServer
      .from('challenges')
      .select('id, user_id, challenge_type, title')
      .eq('id', challengeId)
      .single()
    
    if (fetchError) {
      console.error("❌ Error fetching challenge:", fetchError)
      return {
        success: false,
        error: "Challenge not found"
      }
    }
    
    if (!challenge) {
      return {
        success: false,
        error: "Challenge not found"
      }
    }
    
    console.log(`📝 Challenge details:`, {
      id: challenge.id,
      title: challenge.title,
      type: challenge.challenge_type,
      userId: challenge.user_id
    })
    
    // Check permissions - only allow deletion of user-generated challenges by their creator
    if (challenge.challenge_type !== 'user_generated') {
      console.error("❌ Attempted to delete non-user-generated challenge")
      return {
        success: false,
        error: "Only user-generated challenges can be deleted"
      }
    }
    
    if (userId && challenge.user_id !== userId) {
      console.error("❌ User doesn't have permission to delete this challenge")
      return {
        success: false,
        error: "You don't have permission to delete this challenge"
      }
    }
    
    // Delete the challenge
    const { error: deleteError } = await supabaseServer
      .from('challenges')
      .delete()
      .eq('id', challengeId)
    
    if (deleteError) {
      console.error("❌ Error deleting challenge:", deleteError)
      return {
        success: false,
        error: "Failed to delete challenge"
      }
    }
    
    console.log(`✅ Successfully deleted challenge: ${challengeId}`)
    
    // Revalidate the challenges page to update the UI
    revalidatePath('/')
    
    return {
      success: true
    }
    
  } catch (error) {
    console.error("❌ Unexpected error deleting challenge:", error)
    return {
      success: false,
      error: "An unexpected error occurred"
    }
  }
}
