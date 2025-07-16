const { createClient } = require('@supabase/supabase-js')

// Supabase configuration from .env.local
const supabaseUrl = 'https://yvsjynosfwyhvisqhasp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2c2p5bm9zZnd5aHZpc3FoYXNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNjE0MDIsImV4cCI6MjA2MzgzNzQwMn0.cFkFS9DaD5BCN4R34RDp3bs4kQbicq2NM6NpVASiSdY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testStoryReplyNotifications() {
  try {
    console.log('🚀 Testing Complete Story Reply & Notification Flow')
    console.log('='.repeat(50))
    
    // 1. Find story author (Prof. Sarah Wilson who has stories)
    console.log('👤 Finding story author...')
    const { data: authorData, error: authorError } = await supabase
      .from('profiles')
      .select('user_id, username, full_name, avatar_url')
      .eq('full_name', 'Prof. Sarah Wilson')
      .single()
    
    if (authorError || !authorData) {
      console.error('❌ Author account not found:', authorError)
      return
    }
    
    const author = authorData
    console.log('✅ Author found:', author.full_name || author.username)
    
    // 2. Find different user to reply
    console.log('\n👨‍🎓 Finding reply user...')
    const { data: replyUserData, error: replyUserError } = await supabase
      .from('profiles')
      .select('user_id, username, full_name, avatar_url')
      .neq('user_id', author.user_id)
      .limit(1)
    
    if (replyUserError || !replyUserData || replyUserData.length === 0) {
      console.error('❌ Reply user not found:', replyUserError)
      return
    }
    
    const replyUser = replyUserData[0]
    console.log('✅ Reply user found:', replyUser.full_name || replyUser.username)
    
    // 3. Get author's most recent story
    console.log('\n📖 Finding author\'s most recent story...')
    const { data: storyData, error: storyError } = await supabase
      .from('stories')
      .select('id, author_id, content, media_url')
      .eq('author_id', author.user_id)
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (storyError || !storyData || storyData.length === 0) {
      console.error('❌ No stories found for author:', author.full_name || author.username, `(ID: ${author.user_id})`)
      return
    }
    
    const story = storyData[0]
    console.log('✅ Story found:', story.content || 'Media story', `(ID: ${story.id})`)
    
    // 4. Check existing story views/replies
    console.log('\n👀 Checking existing story interactions...')
    const { data: existingViews, error: viewsError } = await supabase
      .from('story_views')
      .select('*')
      .eq('story_id', story.id)
    
    if (viewsError) {
      console.error('⚠️ Error checking existing views:', viewsError)
    } else {
      console.log(`📊 Existing interactions: ${existingViews.length}`)
      existingViews.forEach(view => {
        if (view.interaction_type === 'reply' && view.reply_content) {
          console.log(`  📝 Reply: "${view.reply_content.substring(0, 50)}..."`)
        } else {
          console.log(`  👁️ View from user ${view.user_id}`)
        }
      })
    }
    
    // 5. Submit a story reply using the database function
    console.log('\n✍️ Submitting story reply...')
    const replyContent = `Test reply from ${replyUser.username || replyUser.full_name} at ${new Date().toLocaleTimeString()}`
    
    const { data: replyResult, error: replyError } = await supabase
      .rpc('add_story_reply', {
        p_story_id: story.id,
        p_viewer_id: replyUser.user_id,
        p_reply_content: replyContent
      })
    
    if (replyError) {
      console.error('❌ Reply submission failed:', replyError)
      return
    }
    
    console.log('✅ Reply submitted successfully!')
    console.log('📝 Reply content:', replyContent)
    
    // 6. Verify reply was stored
    console.log('\n🔍 Verifying reply storage...')
    const { data: newViews, error: newViewsError } = await supabase
      .from('story_views')
      .select('*')
      .eq('story_id', story.id)
      .eq('viewer_id', replyUser.user_id)
      .eq('interaction_type', 'reply')
    
    if (newViewsError) {
      console.error('❌ Error checking new views:', newViewsError)
    } else if (newViews.length > 0) {
      const latestReply = newViews[newViews.length - 1]
      console.log('✅ Reply verified in database')
      console.log('📄 Stored content:', latestReply.reply_content)
      console.log('⏰ Replied at:', latestReply.replied_at)
    } else {
      console.log('⚠️ Reply not found in database')
    }
    
    // 7. Check if notification was created
    console.log('\n🔔 Checking notification creation...')
    const { data: notifications, error: notificationError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', author.user_id)
      .eq('notification_type', 'story_reply')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (notificationError) {
      console.error('❌ Error checking notifications:', notificationError)
    } else if (notifications.length > 0) {
      console.log(`✅ Found ${notifications.length} story reply notification(s)`)
      notifications.forEach((notif, index) => {
        console.log(`📢 Notification ${index + 1}:`)
        console.log(`   📝 Content: ${notif.content}`)
        console.log(`   ⏰ Created: ${notif.created_at}`)
        console.log(`   📖 Read: ${notif.is_read ? 'Yes' : 'No'}`)
      })
    } else {
      console.log('⚠️ No story reply notifications found')
    }
    
    // 8. Check conversation creation
    console.log('\n💬 Checking conversation creation...')
    const { data: conversations, error: conversationError } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(user1_id.eq.${author.user_id},user2_id.eq.${replyUser.user_id}),and(user1_id.eq.${replyUser.user_id},user2_id.eq.${author.user_id})`)
    
    if (conversationError) {
      console.error('❌ Error checking conversations:', conversationError)
    } else if (conversations.length > 0) {
      console.log(`✅ Found conversation between users`)
      console.log(`💬 Conversation ID: ${conversations[0].id}`)
      console.log(`📅 Created: ${conversations[0].created_at}`)
    } else {
      console.log('ℹ️ No conversation found between users')
    }
    
    // 9. Test fetching story replies using the new function
    console.log('\n📚 Testing story replies retrieval...')
    const { data: replies, error: repliesError } = await supabase
      .rpc('get_story_replies', {
        p_story_id: story.id
      })
    
    if (repliesError) {
      console.error('❌ Error fetching replies:', repliesError)
    } else {
      console.log(`✅ Retrieved ${replies.length} reply(ies)`)
      replies.forEach((reply, index) => {
        console.log(`📝 Reply ${index + 1}:`)
        console.log(`   👤 User: ${reply.username || reply.full_name}`)
        console.log(`   💬 Content: ${reply.reply_content}`)
        console.log(`   ⏰ Time: ${reply.replied_at}`)
      })
    }
    
    console.log('\n🎉 Story Reply & Notification Test Complete!')
    console.log('='.repeat(50))
    
  } catch (error) {
    console.error('💥 Test failed with error:', error)
  }
}

// Run the test
testStoryReplyNotifications()
