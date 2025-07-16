/**
 * Simple test for story reply notifications
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

async function testNotifications() {
  console.log('🔔 Testing Story Reply Notifications...\n')
  
  try {
    // Get Prof. Sarah Wilson (story author)
    const authorQuery = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .eq('full_name', 'Prof. Sarah Wilson')
      .single()
    
    if (authorQuery.error) {
      console.error('❌ Author not found:', authorQuery.error)
      return
    }
    
    const author = authorQuery.data
    console.log('✅ Story author:', author.full_name, author.user_id)
    
    // Get a different user (replier)
    const replierQuery = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .neq('user_id', author.user_id)
      .limit(1)
    
    if (replierQuery.error || !replierQuery.data || replierQuery.data.length === 0) {
      console.error('❌ Replier not found:', replierQuery.error)
      return
    }
    
    const replier = replierQuery.data[0]
    console.log('✅ Replier:', replier.full_name, replier.user_id)
    
    // Get author's story
    const storyQuery = await supabase
      .from('stories')
      .select('id, content')
      .eq('author_id', author.user_id)
      .eq('is_active', true)
      .limit(1)
    
    if (storyQuery.error || !storyQuery.data || storyQuery.data.length === 0) {
      console.error('❌ Story not found:', storyQuery.error)
      return
    }
    
    const story = storyQuery.data[0]
    console.log('✅ Story:', story.id, story.content?.substring(0, 30) + '...')
    
    // Clear old notifications
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', author.user_id)
      .eq('notification_type', 'story_reply')
    
    console.log('\n💬 Adding story reply...')
    
    // Add story reply
    const replyResult = await supabase
      .rpc('add_story_reply', {
        p_story_id: story.id,
        p_viewer_id: replier.user_id,
        p_reply_content: 'Test notification reply - ' + new Date().toISOString()
      })
    
    if (replyResult.error) {
      console.error('❌ Reply failed:', replyResult.error)
      return
    }
    
    console.log('✅ Reply result:', replyResult.data)
    
    // Check notifications
    console.log('\n🔔 Checking notifications...')
    const notificationQuery = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', author.user_id)
      .eq('notification_type', 'story_reply')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (notificationQuery.error) {
      console.error('❌ Notification check failed:', notificationQuery.error)
      return
    }
    
    if (notificationQuery.data && notificationQuery.data.length > 0) {
      const notification = notificationQuery.data[0]
      console.log('✅ Notification created:')
      console.log('   Title:', notification.title)
      console.log('   Message:', notification.message)
      console.log('   Data:', JSON.stringify(notification.data, null, 2))
      console.log('   Created:', notification.created_at)
    } else {
      console.log('❌ No notification found')
      
      // Debug: Check if function updated properly
      console.log('\n🔍 Debugging function...')
      const functionCheck = await supabase
        .rpc('get_story_replies', {
          p_story_id: story.id,
          p_author_id: author.user_id
        })
      
      console.log('Function check result:', functionCheck.data)
    }
    
    console.log('\n🎉 Notification test completed!')
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testNotifications()
