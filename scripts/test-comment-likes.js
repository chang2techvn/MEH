const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://pcnqxqxbdulqvqjulbgi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjbnF4cXhiZHVscXZxanVsYmdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2Mjk1MzEsImV4cCI6MjA1MDIwNTUzMX0.gvGqhCdPJrUaFEqP0DjEz-L0bVQF2P7_zCSnqnxNTGw'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCommentLikes() {
  try {
    console.log('🧪 Testing comment likes functionality...')
    
    // Get a test comment
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('id, content, likes_count')
      .limit(1)
    
    if (commentsError) {
      console.error('❌ Error getting comments:', commentsError)
      return
    }
    
    if (!comments || comments.length === 0) {
      console.log('⚠️ No comments found to test')
      return
    }
    
    const testComment = comments[0]
    console.log('📋 Test comment:', {
      id: testComment.id,
      content: testComment.content.substring(0, 50) + '...',
      current_likes: testComment.likes_count
    })
    
    // Get a test user
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('user_id')
      .limit(1)
    
    if (usersError || !users || users.length === 0) {
      console.log('⚠️ No users found to test')
      return
    }
    
    const testUser = users[0]
    console.log('👤 Test user:', testUser.user_id)
    
    // Test 1: Add comment like
    console.log('\n🧪 Test 1: Adding comment like...')
    
    // Check if like already exists
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('id')
      .eq('comment_id', testComment.id)
      .eq('user_id', testUser.user_id)
      .single()
    
    if (existingLike) {
      console.log('⚠️ Like already exists, removing first...')
      const { error: removeError } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id)
      
      if (removeError) {
        console.error('❌ Error removing existing like:', removeError)
        return
      }
    }
    
    // Add the like
    const { data: newLike, error: addError } = await supabase
      .from('likes')
      .insert([{
        comment_id: testComment.id,
        user_id: testUser.user_id,
        post_id: null,
        reaction_type: 'like'
      }])
      .select()
      .single()
    
    if (addError) {
      console.error('❌ Error adding comment like:', addError)
      return
    }
    
    console.log('✅ Comment like added:', newLike.id)
    
    // Update likes count
    const { count: likesCount, error: countError } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('comment_id', testComment.id)
    
    if (!countError) {
      const { error: updateError } = await supabase
        .from('comments')
        .update({ likes_count: likesCount || 0 })
        .eq('id', testComment.id)
      
      if (!updateError) {
        console.log(`✅ Updated comment likes_count to ${likesCount}`)
      }
    }
    
    // Test 2: Check if user liked comment
    console.log('\n🧪 Test 2: Checking if user liked comment...')
    
    const { data: checkLike, error: checkLikeError } = await supabase
      .from('likes')
      .select('id')
      .eq('comment_id', testComment.id)
      .eq('user_id', testUser.user_id)
      .single()
    
    if (checkLikeError && checkLikeError.code !== 'PGRST116') {
      console.error('❌ Error checking user like:', checkLikeError)
      return
    }
    
    console.log('✅ User like status:', !!checkLike)
    
    // Test 3: Remove comment like
    console.log('\n🧪 Test 3: Removing comment like...')
    
    const { data: removedLike, error: removeError } = await supabase
      .from('likes')
      .delete()
      .eq('comment_id', testComment.id)
      .eq('user_id', testUser.user_id)
      .select()
      .single()
    
    if (removeError) {
      console.error('❌ Error removing comment like:', removeError)
      return
    }
    
    console.log('✅ Comment like removed:', removedLike.id)
    
    // Update likes count again
    const { count: finalCount, error: finalCountError } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('comment_id', testComment.id)
    
    if (!finalCountError) {
      const { error: finalUpdateError } = await supabase
        .from('comments')
        .update({ likes_count: finalCount || 0 })
        .eq('id', testComment.id)
      
      if (!finalUpdateError) {
        console.log(`✅ Final comment likes_count: ${finalCount}`)
      }
    }
    
    console.log('\n🎉 Comment likes test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testCommentLikes()
