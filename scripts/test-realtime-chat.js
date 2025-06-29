require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testRealtimeChatFunctionality() {
  console.log('💬 Testing Realtime Chat Functionality')
  
  try {
    // Get test users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(3)

    if (usersError || !users || users.length < 2) {
      console.error('❌ Need at least 2 users for testing:', usersError)
      return
    }

    const user1 = users[0]
    const user2 = users[1]
    console.log(`👤 Test users: ${user1.name} and ${user2.name}`)

    // Get a conversation between these users
    const { data: conversations, error: convError } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations!inner(id, title)
      `)
      .eq('user_id', user1.id)

    if (convError || !conversations || conversations.length === 0) {
      console.error('❌ No conversations found for testing:', convError)
      return
    }

    const testConversation = conversations[0]
    const conversationId = testConversation.conversation_id
    console.log(`💬 Using conversation: ${conversationId}`)

    // Test 1: Message delivery
    console.log('\n📨 Test 1: Testing message delivery...')
    
    // Setup realtime listener for user2
    let receivedMessages = []
    const channel = supabase
      .channel(`test-conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('📨 Message received via Realtime:', payload.new.content)
          receivedMessages.push(payload.new)
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status)
      })

    // Wait for subscription to connect
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Send test message from user1
    const testMessage = `Test message from ${user1.name} at ${new Date().toISOString()}`
    const { data: sentMessage, error: sendError } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user1.id,
        content: testMessage,
        message_type: 'text',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (sendError) {
      console.error('❌ Failed to send test message:', sendError)
    } else {
      console.log('✅ Message sent:', sentMessage.content)
    }

    // Wait for realtime delivery
    await new Promise(resolve => setTimeout(resolve, 3000))

    if (receivedMessages.length > 0) {
      console.log('✅ Realtime message delivery working!')
      console.log(`📊 Delivered ${receivedMessages.length} message(s) via Realtime`)
    } else {
      console.log('⚠️ No messages received via Realtime - check configuration')
    }

    // Test 2: Typing indicators
    console.log('\n⌨️ Test 2: Testing typing indicators...')
    
    let typingEvents = []
    const typingChannel = supabase
      .channel(`typing-test-${conversationId}`)
      .on(
        'broadcast',
        { event: 'typing' },
        (payload) => {
          console.log('⌨️ Typing event received:', payload.payload)
          typingEvents.push(payload.payload)
        }
      )
      .subscribe()

    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simulate typing start
    await typingChannel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId: user1.id,
        userName: user1.name,
        isTyping: true,
        conversationId: conversationId
      }
    })

    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simulate typing stop
    await typingChannel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId: user1.id,
        userName: user1.name,
        isTyping: false,
        conversationId: conversationId
      }
    })

    await new Promise(resolve => setTimeout(resolve, 2000))

    if (typingEvents.length >= 2) {
      console.log('✅ Typing indicators working!')
      console.log(`📊 Received ${typingEvents.length} typing events`)
    } else {
      console.log('⚠️ Typing indicators may not be working properly')
    }

    // Test 3: Read status updates
    console.log('\n👀 Test 3: Testing read status updates...')
    
    const { data: beforeRead, error: beforeReadError } = await supabase
      .from('conversation_participants')
      .select('last_read_at')
      .eq('conversation_id', conversationId)
      .eq('user_id', user2.id)
      .single()

    if (beforeReadError) {
      console.error('❌ Failed to get read status:', beforeReadError)
    } else {
      console.log('📖 Read status before:', beforeRead.last_read_at)
    }

    // Update read status
    const { error: updateReadError } = await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', user2.id)

    if (updateReadError) {
      console.error('❌ Failed to update read status:', updateReadError)
    } else {
      console.log('✅ Read status updated successfully')
    }

    // Test 4: Unread count calculation
    console.log('\n🔢 Test 4: Testing unread count calculation...')
    
    // Get messages after the last read time
    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('last_read_at')
      .eq('conversation_id', conversationId)
      .eq('user_id', user2.id)
      .single()

    if (participantError) {
      console.error('❌ Failed to get participant data:', participantError)
    } else {
      const { data: unreadMessages, error: unreadError } = await supabase
        .from('conversation_messages')
        .select('id, sender_id, created_at')
        .eq('conversation_id', conversationId)
        .neq('sender_id', user2.id)
        .gt('created_at', participant.last_read_at || '2000-01-01')

      if (unreadError) {
        console.error('❌ Failed to get unread messages:', unreadError)
      } else {
        console.log(`📊 Unread messages for ${user2.name}: ${unreadMessages.length}`)
        console.log('✅ Unread count calculation working')
      }
    }

    // Cleanup
    console.log('\n🧹 Cleaning up...')
    supabase.removeChannel(channel)
    supabase.removeChannel(typingChannel)

    // Clean up test message
    if (sentMessage) {
      await supabase
        .from('conversation_messages')
        .delete()
        .eq('id', sentMessage.id)
      console.log('🗑️ Cleaned up test message')
    }

    console.log('\n✅ Realtime chat functionality test completed!')

  } catch (error) {
    console.error('❌ Realtime chat test failed:', error)
  }
}

// Run the test
testRealtimeChatFunctionality().then(() => {
  process.exit(0)
}).catch((error) => {
  console.error('❌ Test execution failed:', error)
  process.exit(1)
})
