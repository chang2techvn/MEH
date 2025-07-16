/**
 * Quick test for story reply functionality
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

async function quickTest() {
  console.log('🔍 Quick test for story reply...\n')
  
  try {
    // Test 1: Check if functions exist
    console.log('📋 Testing function existence...')
    
    const { data: functions, error: funcError } = await supabase
      .rpc('get_story_replies', { p_story_id: '00000000-0000-0000-0000-000000000000', p_author_id: '00000000-0000-0000-0000-000000000000' })
      .then(() => ({ data: 'Function exists', error: null }))
      .catch((error) => ({ data: null, error }))
    
    if (funcError && !funcError.message.includes('Only story author can view replies')) {
      console.log('❌ get_story_replies function issue:', funcError.message)
    } else {
      console.log('✅ get_story_replies function exists')
    }
    
    // Test 2: Check story_views table structure
    console.log('\n📋 Checking story_views table...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('story_views')
      .select('id, story_id, viewer_id, interaction_type, reply_content, replied_at')
      .limit(1)
    
    if (tableError) {
      console.log('❌ story_views table issue:', tableError.message)
    } else {
      console.log('✅ story_views table structure OK')
    }
    
    // Test 3: Get sample story for testing
    console.log('\n📖 Getting sample story...')
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('id, author_id')
      .eq('is_active', true)
      .limit(1)
    
    if (storiesError || !stories || stories.length === 0) {
      console.log('❌ No active stories found for testing')
      return
    }
    
    const testStory = stories[0]
    console.log('✅ Found test story:', testStory.id)
    
    // Test 4: Get users for testing
    console.log('\n👥 Getting test users...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .neq('id', testStory.author_id) // Different from story author
      .limit(1)
    
    if (usersError || !users || users.length === 0) {
      console.log('❌ No test users found')
      return
    }
    
    const testUser = users[0]
    console.log('✅ Found test user:', testUser.id)
    
    // Test 5: Try to add reply
    console.log('\n💬 Testing add_story_reply function...')
    const { data: replyResult, error: replyError } = await supabase
      .rpc('add_story_reply', {
        p_story_id: testStory.id,
        p_viewer_id: testUser.id,
        p_reply_content: 'Test reply from quick test script!'
      })
    
    if (replyError) {
      console.log('❌ Reply function error:', replyError.message)
    } else {
      console.log('✅ Reply function result:', replyResult)
    }
    
    // Test 6: Try to get replies as story author
    console.log('\n📖 Testing get_story_replies function...')
    const { data: repliesResult, error: getRepliesError } = await supabase
      .rpc('get_story_replies', {
        p_story_id: testStory.id,
        p_author_id: testStory.author_id
      })
    
    if (getRepliesError) {
      console.log('❌ Get replies error:', getRepliesError.message)
    } else {
      console.log('✅ Get replies result:', repliesResult)
    }
    
    console.log('\n🎉 Quick test completed!')
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

// Run the test
quickTest()
