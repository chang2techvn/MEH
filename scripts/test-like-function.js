import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testLikeFunction() {
  console.log('🧪 Testing like functionality...')
  
  try {
    // Test authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('🔐 Auth result:', { 
      user: user ? `${user.email} (${user.id})` : 'No authenticated user',
      error: authError 
    })
    
    // Get first user from database as fallback
    if (!user) {
      console.log('⚠️ No authenticated user, checking database users...')
      const { data: dbUsers, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .limit(3)
      
      if (userError) {
        console.error('❌ Error getting users:', userError.message)
      } else {
        console.log('📋 Available users in database:', dbUsers)
      }
    }
    
    // Test getting a post to like
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, title, likes_count')
      .limit(1)
    
    if (postsError) {
      console.error('❌ Error getting posts:', postsError.message)
    } else if (posts && posts.length > 0) {
      console.log('📋 Test post:', posts[0])
      
      const postId = posts[0].id
      
      // Test adding a like (using first user from database if no auth user)
      const testUserId = user?.id || 'test-user-id'
      
      console.log(`🔥 Testing addLike with postId: ${postId}, userId: ${testUserId}`)
      
      // Import and test the addLike function
      const { addLike } = await import('../lib/likes-comments.js')
      
      try {
        await addLike(postId, testUserId, 'like')
        console.log('✅ Like added successfully!')
      } catch (likeError) {
        console.error('❌ Error adding like:', likeError.message)
      }
    } else {
      console.log('❌ No posts found to test with')
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

testLikeFunction()
