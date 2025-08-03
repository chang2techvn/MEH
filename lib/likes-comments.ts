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
  // Reduced logging for performance
  
  try {
    // First, check if user already liked this post
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('id, reaction_type')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle()
    
    if (checkError) {
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
      
      // Removed excessive logging
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
      
      // Removed excessive logging
      return { data, isNew: true }
    }
  } catch (error) {
    console.error('❌ Error adding like:', error)
    throw error
  }
}

export async function removeLike(postId: string, userId: string) {
  // Reduced logging
  
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
    
    // Removed excessive logging
    return data
  } catch (error) {
    console.error('❌ Error removing like:', error)
    throw error
  }
}

export async function getLikesForPost(postId: string) {
  // Reduced logging - only on errors
  
  try {
    const { data, error } = await supabase
      .from('likes')
      .select('id, user_id, reaction_type, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Return data without excessive logging
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
      .maybeSingle()
    
    if (error) {
      console.error('❌ Error checking user like:', error)
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
  // Reduced logging for better performance
  
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
    
    // Removed excessive logging
    return data
  } catch (error) {
    console.error('❌ Error adding comment:', error)
    throw error
  }
}

export async function getCommentsForPost(postId: string, currentUserId?: string) {
  // Remove excessive logging - only log errors or important info
  
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
      // Remove log spam
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
    
    // Get comment likes if currentUserId is provided
    let commentLikesMap = new Map()
    let commentReactionsMap = new Map()
    if (currentUserId) {
      const commentIds = comments.map(c => c.id)
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('comment_id, reaction_type')
        .eq('user_id', currentUserId)
        .in('comment_id', commentIds)
      
      if (!likesError && likes) {
        likes.forEach(like => {
          commentLikesMap.set(like.comment_id, true)
          commentReactionsMap.set(like.comment_id, like.reaction_type)
        })
      }
    }
    
    // Get reactions summary for all comments
    const commentIds = comments.map(c => c.id)
    const reactionsSummary = await getCommentReactionsSummary(commentIds)
    
    // Transform comments to include user info and like status
    const transformedData = comments.map(comment => {
      const profile = profileMap.get(comment.user_id)
      const commentReactions = reactionsSummary.get(comment.id) || {}
      
      // Find the most popular reaction (excluding 'like')
      let topReaction = null
      let topCount = 0
      Object.entries(commentReactions).forEach(([reaction, count]) => {
        const reactionCount = Number(count)
        if (reaction !== 'like' && reactionCount > topCount) {
          topReaction = reaction
          topCount = reactionCount
        }
      })
      
      return {
        ...comment,
        user_name: profile?.full_name || profile?.username || 'Anonymous User',
        user_avatar: profile?.avatar_url,
        liked_by_user: currentUserId ? commentLikesMap.has(comment.id) : false,
        user_reaction: currentUserId ? commentReactionsMap.get(comment.id) : null,
        top_reaction: topReaction,
        reactions_summary: commentReactions
      }
    })
    
    // Return transformed data without excessive logging
    return transformedData
  } catch (error) {
    console.error('❌ Error getting comments:', error)
    throw error
  }
}

export async function deleteComment(commentId: string, userId: string) {
  // Reduced excessive logging
  
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
    
    // Reduced excessive logging
    return data
  } catch (error) {
    console.error('❌ Error deleting comment:', error)
    throw error
  }
}

// Comment likes functions
export async function addCommentLike(commentId: string, userId: string, reactionType: string = 'like') {
  // Reduced excessive logging
  
  try {
    // Check if user already liked this comment
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('id, reaction_type')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .maybeSingle()
    
    if (checkError) {
      console.error('Error checking existing comment like:', checkError)
      throw checkError
    }
    
    if (existingLike) {
      // Update existing reaction
      const { data, error } = await supabase
        .from('likes')
        .update({ reaction_type: reactionType })
        .eq('id', existingLike.id)
        .select()
        .single()
      
      if (error) throw error
      
      // Reduced excessive logging
      return { data, isNew: false }
    }
    
    // Add new comment like
    const { data, error } = await supabase
      .from('likes')
      .insert([{
        comment_id: commentId,
        user_id: userId,
        post_id: null, // No post_id for comment likes
        reaction_type: reactionType
      }])
      .select()
      .single()
    
    if (error) throw error
    
    // Update comment likes count
    await updateCommentLikesCount(commentId)
    
    // Reduced excessive logging
    return { data, isNew: true }
  } catch (error) {
    console.error('❌ Error adding comment like:', error)
    throw error
  }
}

export async function removeCommentLike(commentId: string, userId: string) {
  // Reduced excessive logging
  
  try {
    const { data, error } = await supabase
      .from('likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .select()
    
    if (error) throw error
    
    // Update comment likes count
    await updateCommentLikesCount(commentId)
    
    // Reduced excessive logging
    return data
  } catch (error) {
    console.error('❌ Error removing comment like:', error)
    throw error
  }
}

export async function checkUserLikedComment(commentId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .maybeSingle()
    
    if (error) {
      console.error('❌ Error checking user comment like:', error)
      throw error
    }
    
    return !!data
  } catch (error) {
    console.error('❌ Error checking user comment like:', error)
    return false
  }
}

async function updateCommentLikesCount(commentId: string) {
  try {
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('comment_id', commentId)
    
    if (error) throw error
    
    const { error: updateError } = await supabase
      .from('comments')
      .update({ likes_count: count || 0 })
      .eq('id', commentId)
    
    if (updateError) throw updateError
    
    // Only log significant changes if needed
    // console.log(`✅ Updated comment likes_count to ${count}`)
  } catch (error) {
    console.error('❌ Error updating comment likes count:', error)
  }
}

export async function addReply(parentCommentId: string, userId: string, content: string, postId: string) {
  // Reduced excessive logging
  
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        post_id: postId,
        user_id: userId,
        content: content.trim(),
        parent_id: parentCommentId,
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
    
    // Reduced excessive logging
    return data
  } catch (error) {
    console.error('❌ Error adding reply:', error)
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
    
    // Only log when necessary for debugging
    // console.log(`✅ Updated post likes_count to ${count}`)
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
    
    // Only log when necessary for debugging
    // console.log(`✅ Updated post comments_count to ${count}`)
  } catch (error) {
    console.error('❌ Error updating post comments count:', error)
  }
}

export async function getUserCommentReaction(commentId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select('reaction_type')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .maybeSingle()
    
    if (error) {
      console.error('❌ Error getting user comment reaction:', error)
      throw error
    }
    
    return data?.reaction_type || null
  } catch (error) {
    console.error('❌ Error getting user comment reaction:', error)
    return null
  }
}

export async function getCommentReactionsSummary(commentIds: string[]) {
  try {
    const { data: reactions, error } = await supabase
      .from('likes')
      .select('comment_id, reaction_type')
      .in('comment_id', commentIds)
      .not('comment_id', 'is', null)
    
    if (error) throw error
    
    // Group reactions by comment_id and count each reaction type
    const reactionsSummary = new Map()
    reactions?.forEach(reaction => {
      if (!reactionsSummary.has(reaction.comment_id)) {
        reactionsSummary.set(reaction.comment_id, {})
      }
      const commentReactions = reactionsSummary.get(reaction.comment_id)
      commentReactions[reaction.reaction_type] = (commentReactions[reaction.reaction_type] || 0) + 1
    })
    
    return reactionsSummary
  } catch (error) {
    console.error('❌ Error getting comment reactions summary:', error)
    return new Map()
  }
}
