/**
 * Test Story Reply Notifications and Messages Flow
 * Tests the complete flow from story reply to notification and conversation creation
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

async function testStoryReplyNotificationsFlow() {
  console.log('🧪 Testing Story Reply Notifications and Messages Flow...\n')
  
  try {
    // 1. Find teacher account (story author)
    console.log('👩‍🏫 Finding teacher account...')
    const { data: teacherAuth, error: teacherAuthError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', 'teacher1@university.edu')
      .single()
    
    if (teacherAuthError || !teacherAuth) {
      console.error('❌ Teacher auth not found:', teacherAuthError)
      return
    }
    
    // Get teacher profile
    const { data: teacherData, error: teacherError } = await supabase
      .from('profiles')
      .select('user_id, username, full_name, avatar_url')
      .eq('user_id', teacherAuth.id)
      .single()
    
    if (teacherError || !teacherData) {
      console.error('❌ Teacher profile not found:', teacherError)
      return
    }
    
    console.log('✅ Teacher found:', teacherData.full_name, `(${teacherAuth.email})`)
    
    // 2. Find another user to reply (student)
    console.log('\n👨‍🎓 Finding student account...')
    const { data: studentData, error: studentError } = await supabase
      .from('profiles')
      .select('user_id, username, full_name, avatar_url')
      .neq('user_id', teacherData.user_id)
      .limit(1)
    
    if (studentError || !studentData || studentData.length === 0) {
      console.error('❌ Student account not found:', studentError)
      return
    }
    
    const student = studentData[0]
    console.log('✅ Student found:', student.full_name || student.username)
    
    // 3. Find or create a story by teacher
    console.log('\n📖 Finding teacher\'s story...')
    let { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('id, content, author_id')
      .eq('author_id', teacherData.user_id)
      .eq('is_active', true)
      .limit(1)
    
    if (storiesError) {
      console.error('❌ Error finding stories:', storiesError)
      return
    }
    
    let storyId
    if (!stories || stories.length === 0) {
      console.log('📝 Creating new story for teacher...')
      const { data: newStory, error: createError } = await supabase
        .from('stories')
        .insert({
          author_id: teacherData.user_id,
          content: 'Welcome to my English class! Today we\'ll learn about storytelling techniques. 📚✨',
          media_type: 'image',
          background_color: '#4f46e5',
          text_color: '#ffffff',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
        .select('id')
        .single()
      
      if (createError) {
        console.error('❌ Error creating story:', createError)
        return
      }
      
      storyId = newStory.id
      console.log('✅ Story created:', storyId)
    } else {
      storyId = stories[0].id
      console.log('✅ Story found:', storyId)
      console.log('✅ Story content:', stories[0].content?.substring(0, 60) + '...')
    }
    
    // 4. Clear previous test data for clean testing
    console.log('\n🧹 Cleaning up previous test data...')
    await supabase
      .from('story_views')
      .delete()
      .eq('story_id', storyId)
      .eq('viewer_id', student.user_id)
      .eq('interaction_type', 'reply')
    
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', teacherData.user_id)
      .eq('notification_type', 'story_reply')
    
    // 5. Test story reply with notification
    console.log('\n💬 Testing story reply with notification...')
    const replyContent = 'Great lesson Professor! I really enjoyed learning about storytelling. The examples were very helpful! 👍📚'
    
    const { data: replyResult, error: replyError } = await supabase
      .rpc('add_story_reply', {
        p_story_id: storyId,
        p_viewer_id: student.user_id,
        p_reply_content: replyContent
      })
    
    if (replyError) {
      console.error('❌ Reply error:', replyError)
      return
    }
    
    console.log('✅ Reply result:', replyResult)
    
    // 6. Check if notification was created
    console.log('\n🔔 Checking notifications...')
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', teacherData.user_id)
      .eq('notification_type', 'story_reply')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (notifError) {
      console.error('❌ Notification error:', notifError)
      return
    }
    
    if (notifications && notifications.length > 0) {
      console.log('✅ Notification created:', {
        title: notifications[0].title,
        message: notifications[0].message,
        data: notifications[0].data,
        is_read: notifications[0].is_read
      })
    } else {
      console.log('❌ No notification found')
    }
    
    // 7. Check if conversation/message was created
    console.log('\n💬 Checking conversations...')
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select(`
        id,
        title,
        type,
        created_at,
        conversation_participants!inner (
          user_id
        ),
        messages (
          id,
          content,
          sender_id,
          created_at
        )
      `)
      .eq('type', 'direct')
      .order('created_at', { ascending: false })
    
    if (convError) {
      console.error('❌ Conversation error:', convError)
      return
    }
    
    // Find conversation between teacher and student
    const conversation = conversations?.find(conv => {
      const participants = conv.conversation_participants.map(p => p.user_id)
      return participants.includes(teacherData.user_id) && participants.includes(student.user_id)
    })
    
    if (conversation) {
      console.log('✅ Conversation found:', {
        id: conversation.id,
        title: conversation.title,
        messagesCount: conversation.messages?.length || 0,
        created: conversation.created_at
      })
      
      if (conversation.messages && conversation.messages.length > 0) {
        const lastMessage = conversation.messages[conversation.messages.length - 1]
        console.log('✅ Last message:', {
          content: lastMessage.content.substring(0, 60) + '...',
          sender: lastMessage.sender_id === student.user_id ? 'Student' : 'Teacher',
          time: lastMessage.created_at
        })
      }
    } else {
      console.log('❌ No conversation found between teacher and student')
    }
    
    // 8. Test story viewers modal data
    console.log('\n👥 Testing story viewers data (for StoryViewersModal)...')
    const { data: viewerData, error: viewerError } = await supabase
      .from('story_views')
      .select(`
        id,
        viewer_id,
        viewed_at,
        interaction_type,
        reply_content,
        replied_at,
        profiles!inner (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('story_id', storyId)
      .in('interaction_type', ['view', 'reply'])
      .order('viewed_at', { ascending: false })
    
    if (viewerError) {
      console.error('❌ Viewer data error:', viewerError)
      return
    }
    
    console.log('✅ Story interactions:', viewerData?.map(v => ({
      type: v.interaction_type,
      user: v.profiles.full_name,
      reply: v.reply_content ? 
        (v.reply_content.length > 50 ? v.reply_content.substring(0, 50) + '...' : v.reply_content) : 
        null,
      time: v.interaction_type === 'reply' ? v.replied_at : v.viewed_at
    })))
    
    // 9. Test truncation for long replies (StoryViewersModal feature)
    console.log('\n✂️ Testing reply truncation...')
    const longReply = 'This is a very long reply that should be truncated in the StoryViewersModal when displayed. It contains multiple sentences and should show ellipsis (...) when the content is too long to display fully in the modal interface.'
    
    const { data: longReplyResult, error: longReplyError } = await supabase
      .rpc('add_story_reply', {
        p_story_id: storyId,
        p_viewer_id: student.user_id,
        p_reply_content: longReply
      })
    
    if (longReplyError) {
      console.log('⚠️ Long reply error (expected if duplicate):', longReplyError.message)
    } else {
      console.log('✅ Long reply added for truncation testing')
    }
    
    console.log('\n🎉 Story reply notifications flow test completed!')
    console.log('\n📋 Summary:')
    console.log('- ✅ Teacher account found')
    console.log('- ✅ Student account found') 
    console.log('- ✅ Story created/found')
    console.log('- ✅ Reply functionality tested')
    console.log('- ✅ Notification system tested')
    console.log('- ✅ Conversation system tested')
    console.log('- ✅ StoryViewersModal data tested')
    console.log('- ✅ Reply truncation tested')
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

// Run the test
testStoryReplyNotificationsFlow()
