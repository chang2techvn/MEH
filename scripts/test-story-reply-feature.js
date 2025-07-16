/**
 * Test Story Reply Functionality
 * Test script to verify that story reply feature works correctly
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testStoryReplyFeature() {
  console.log('🧪 Testing Story Reply Feature...\n')
  
  try {
    // 1. Get test users
    console.log('👥 Getting test users...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(2)
    
    if (usersError || !users || users.length < 2) {
      console.error('❌ Need at least 2 users for testing:', usersError)
      return
    }
    
    const storyAuthorId = users[0].id
    const replyUserId = users[1].id
    console.log('✅ Story author ID:', storyAuthorId)
    console.log('✅ Reply user ID:', replyUserId)
    
    // 2. Create a test story
    console.log('\n📖 Creating test story...')
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert({
        author_id: storyAuthorId,
        content: 'Test story for reply functionality',
        media_type: 'image',
        background_color: '#4A90E2',
        text_color: '#FFFFFF',
        duration: 24,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single()
    
    if (storyError || !story) {
      console.error('❌ Error creating test story:', storyError)
      return
    }
    
    console.log('✅ Test story created:', story.id)
    
    // 3. Test story reply functionality
    console.log('\n💬 Testing story reply...')
    const { data: replyResult, error: replyError } = await supabase
      .rpc('add_story_reply', {
        p_story_id: story.id,
        p_viewer_id: replyUserId,
        p_reply_content: 'This is a test reply to your story!'
      })
    
    if (replyError) {
      console.error('❌ Reply error:', replyError)
      return
    }
    
    console.log('✅ Reply result:', replyResult)
    
    if (replyResult.success) {
      console.log('🎉 Reply added successfully!')
    } else {
      console.error('❌ Reply failed:', replyResult.error)
      return
    }
    
    // 4. Test author trying to reply to own story (should fail)
    console.log('\n🚫 Testing author self-reply (should fail)...')
    const { data: selfReplyResult, error: selfReplyError } = await supabase
      .rpc('add_story_reply', {
        p_story_id: story.id,
        p_viewer_id: storyAuthorId,
        p_reply_content: 'Author trying to reply to own story'
      })
    
    if (selfReplyError) {
      console.error('❌ Self-reply error:', selfReplyError)
    } else {
      console.log('✅ Self-reply result:', selfReplyResult)
      if (!selfReplyResult.success && selfReplyResult.error.includes('Cannot reply to your own story')) {
        console.log('🎉 Self-reply correctly blocked!')
      } else {
        console.error('❌ Self-reply should have been blocked!')
      }
    }
    
    // 5. Test getting story replies (for author)
    console.log('\n📥 Testing get story replies...')
    const { data: replies, error: getRepliesError } = await supabase
      .rpc('get_story_replies', {
        p_story_id: story.id,
        p_author_id: storyAuthorId
      })
    
    if (getRepliesError) {
      console.error('❌ Get replies error:', getRepliesError)
    } else {
      console.log('✅ Story replies:', replies)
      if (replies && replies.length > 0) {
        console.log('🎉 Found', replies.length, 'reply(s):')
        replies.forEach((reply, index) => {
          console.log(`  ${index + 1}. "${reply.reply_content}" by ${reply.viewer_full_name || reply.viewer_username}`)
        })
      } else {
        console.log('📭 No replies found')
      }
    }
    
    // 6. Test non-author trying to get replies (should fail)
    console.log('\n🚫 Testing non-author get replies (should fail)...')
    const { data: unauthorizedReplies, error: unauthorizedError } = await supabase
      .rpc('get_story_replies', {
        p_story_id: story.id,
        p_author_id: replyUserId // Wrong author
      })
    
    if (unauthorizedError) {
      console.log('✅ Unauthorized access correctly blocked:', unauthorizedError.message)
    } else {
      console.error('❌ Unauthorized access should have been blocked!')
    }
    
    // 7. Cleanup - Delete test story
    console.log('\n🧹 Cleaning up test story...')
    const { error: deleteError } = await supabase
      .from('stories')
      .delete()
      .eq('id', story.id)
    
    if (deleteError) {
      console.error('❌ Error deleting test story:', deleteError)
    } else {
      console.log('✅ Test story cleaned up')
    }
    
    console.log('\n🎉 Story reply feature test completed successfully!')
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

// Run the test
testStoryReplyFeature()
