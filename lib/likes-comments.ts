import { supabase } from '@/lib/supabase'

export interface LikeData {
  id?: string
  user_id: string
  post_id: string
  reaction_type: string
  created_at?: string
}

export interface CommentData {
  id?: string
  post_id: string
  user_id: string
  content: string
  parent_id?: string | null
  likes_count?: number
  created_at?: string
  updated_at?: string
}

// Likes functions
export async function addLike(postId: string, userId: string, reactionType: string = 'like') {
  console.log('📤 Adding like to Supabase:', { postId, userId, reactionType })
  
  try {
    // First, check if user already liked this post
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('id, reaction_type')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing like:', checkError)
      throw checkError
    }
    
    if (existingLike) {
      // Update existing like
      const { data, error } = await supabase
        .from('likes')
        .update({ reaction_type: reactionType })
        .eq('id', existingLike.id)
        .select()
        .single()
      
      if (error) throw error
      
      console.log('✅ Like updated successfully:', data)
      return { data, isNew: false }
    } else {
      // Create new like
      const { data, error } = await supabase
        .from('likes')
        .insert([{ post_id: postId, user_id: userId, reaction_type: reactionType }])
        .select()
        .single()
      
      if (error) throw error
      
      // Update likes_count in posts table
      await updatePostLikesCount(postId)
      
      console.log('✅ Like added successfully:', data)
      return { data, isNew: true }
    }
  } catch (error) {
    console.error('❌ Error adding like:', error)
    throw error
  }
}

export async function removeLike(postId: string, userId: string) {
  console.log('📤 Removing like from Supabase:', { postId, userId })
  
  try {
    const { data, error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)
      .select()
    
    if (error) throw error
    
    // Update likes_count in posts table
    await updatePostLikesCount(postId)
    
    console.log('✅ Like removed successfully:', data)
    return data
  } catch (error) {
    console.error('❌ Error removing like:', error)
    throw error
  }
}

export async function getLikesForPost(postId: string) {
  console.log('📥 Getting likes for post:', postId)
  
  try {
    const { data, error } = await supabase
      .from('likes')
      .select('id, user_id, reaction_type, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    console.log(`✅ Found ${data?.length || 0} likes for post`)
    return data || []
  } catch (error) {
    console.error('❌ Error getting likes:', error)
    throw error
  }
}

export async function checkUserLikedPost(postId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select('reaction_type')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      throw error
    }
    
    return data || null
  } catch (error) {
    console.error('❌ Error checking user like:', error)
    return null
  }
}

// Comments functions
export async function addComment(postId: string, userId: string, content: string, parentId?: string) {
  console.log('📤 Adding comment to Supabase:', { postId, userId, content, parentId })
  
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        post_id: postId,
        user_id: userId,
        content: content.trim(),
        parent_id: parentId || null,
        likes_count: 0
      }])
      .select(`
        id,
        post_id,
        user_id,
        content,
        parent_id,
        likes_count,
        created_at,
        updated_at
      `)
      .single()
    
    if (error) throw error
    
    // Update comments_count in posts table
    await updatePostCommentsCount(postId)
    
    console.log('✅ Comment added successfully:', data)
    return data
  } catch (error) {
    console.error('❌ Error adding comment:', error)
    throw error
  }
}

export async function getCommentsForPost(postId: string) {
  console.log('📥 Getting comments for post:', postId)
  
  try {
    // First, get comments
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(`
        id,
        post_id,
        user_id,
        content,
        parent_id,
        likes_count,
        created_at,
        updated_at
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    
    if (commentsError) throw commentsError
    
    if (!comments || comments.length === 0) {
      console.log('✅ No comments found for post')
      return []
    }
    
    // Get unique user IDs
    const userIds = [...new Set(comments.map(comment => comment.user_id))]
    
    // Get user profiles for all commenters
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, username, full_name, avatar_url')
      .in('user_id', userIds)
    
    if (profilesError) {
      console.warn('⚠️ Could not get user profiles:', profilesError.message)
    }
    
    // Create a map of user_id to profile
    const profileMap = new Map()
    profiles?.forEach(profile => {
      profileMap.set(profile.user_id, profile)
    })
    
    // Transform comments to include user info
    const transformedData = comments.map(comment => {
      const profile = profileMap.get(comment.user_id)
      return {
        ...comment,
        user_name: profile?.full_name || profile?.username || 'Anonymous User',
        user_avatar: profile?.avatar_url
      }
    })
    
    console.log(`✅ Found ${transformedData.length} comments for post`)
    return transformedData
  } catch (error) {
    console.error('❌ Error getting comments:', error)
    throw error
  }
}

export async function deleteComment(commentId: string, userId: string) {
  console.log('📤 Deleting comment:', { commentId, userId })
  
  try {
    const { data, error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId) // Ensure user can only delete their own comments
      .select('post_id')
      .single()
    
    if (error) throw error
    
    // Update comments_count in posts table
    if (data?.post_id) {
      await updatePostCommentsCount(data.post_id)
    }
    
    console.log('✅ Comment deleted successfully')
    return data
  } catch (error) {
    console.error('❌ Error deleting comment:', error)
    throw error
  }
}

// Helper functions to update post counts
async function updatePostLikesCount(postId: string) {
  try {
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
    
    if (error) throw error
    
    const { error: updateError } = await supabase
      .from('posts')
      .update({ likes_count: count || 0 })
      .eq('id', postId)
    
    if (updateError) throw updateError
    
    console.log(`✅ Updated post likes_count to ${count}`)
  } catch (error) {
    console.error('❌ Error updating post likes count:', error)
  }
}

async function updatePostCommentsCount(postId: string) {
  try {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
    
    if (error) throw error
    
    const { error: updateError } = await supabase
      .from('posts')
      .update({ comments_count: count || 0 })
      .eq('id', postId)
    
    if (updateError) throw updateError
    
    console.log(`✅ Updated post comments_count to ${count}`)
  } catch (error) {
    console.error('❌ Error updating post comments count:', error)
  }
}
