import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testCommentsWithUserInfo() {
  console.log('🧪 Testing comments with user info...')
  
  try {
    // Get a post ID to test with
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id')
      .limit(1)
    
    if (postsError || !posts || posts.length === 0) {
      console.error('❌ No posts found to test with')
      return
    }
    
    const postId = posts[0].id
    console.log('📋 Testing with post ID:', postId)
    
    // Get comments with user info using the new approach
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
    
    if (commentsError) {
      console.error('❌ Error getting comments:', commentsError.message)
      return
    }
    
    console.log(`✅ Found ${comments?.length || 0} comments`)
    
    if (comments && comments.length > 0) {
      // Get user profiles for all commenters
      const userIds = [...new Set(comments.map(comment => comment.user_id))]
      
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
      
      console.log('📝 Comments with user info:')
      comments.forEach((comment, index) => {
        const profile = profileMap.get(comment.user_id)
        const userName = profile?.full_name || profile?.username || 'Anonymous User'
        const userAvatar = profile?.avatar_url
        
        console.log(`  ${index + 1}. ${userName}`)
        console.log(`     Content: "${comment.content}"`)
        console.log(`     Avatar: ${userAvatar ? '✅ Has avatar' : '❌ No avatar'}`)
        console.log(`     User ID: ${comment.user_id}`)
        console.log(`     Created: ${comment.created_at}`)
        console.log('     ---')
      })
    } else {
      console.log('📝 No comments found for this post')
      
      // Show available users for testing
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, username, full_name, avatar_url')
        .limit(3)
      
      if (!profilesError && profiles) {
        console.log('👥 Available users for testing:')
        profiles.forEach(profile => {
          console.log(`  - ${profile.full_name || profile.username} (ID: ${profile.user_id})`)
        })
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testCommentsWithUserInfo()
