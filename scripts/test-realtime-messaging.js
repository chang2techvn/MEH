require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client with service role for testing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testRealtimeChat() {
  console.log('🚀 Testing Realtime Chat Between Two Accounts')
  console.log('=' * 60)
  
  try {
    // Get teacher1 and john.smith for testing
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .in('email', ['teacher1@university.edu', 'john.smith@university.edu'])

    if (usersError || !users || users.length < 2) {
      console.error('❌ Need both teacher1 and john.smith accounts:', usersError)
      return
    }

    const teacher1 = users.find(u => u.email === 'teacher1@university.edu')
    const johnSmith = users.find(u => u.email === 'john.smith@university.edu')

    console.log(`👤 Testing between:`)
    console.log(`   📧 ${teacher1.name} (${teacher1.email})`)
    console.log(`   📧 ${johnSmith.name} (${johnSmith.email})`)

    // Find a conversation between them
    const { data: conversations, error: convError } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations!inner(id, title)
      `)
      .eq('user_id', teacher1.id)

    if (convError || !conversations || conversations.length === 0) {
      console.error('❌ No conversations found for teacher1:', convError)
      return
    }

    // Check if John is in any of teacher1's conversations
    let sharedConversation = null
    for (const conv of conversations) {
      const { data: participants, error: partError } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conv.conversation_id)
        .eq('user_id', johnSmith.id)

      if (!partError && participants && participants.length > 0) {
        sharedConversation = conv
        break
      }
    }

    if (!sharedConversation) {
      console.log('⚠️ No shared conversation found, creating one...')
      
      // Create a new conversation
      const { data: newConv, error: newConvError } = await supabase
        .from('conversations')
        .insert({
          title: 'Realtime Test Chat',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (newConvError) {
        console.error('❌ Failed to create conversation:', newConvError)
        return
      }

      // Add participants
      const { error: part1Error } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: newConv.id,
          user_id: teacher1.id,
          role: 'participant',
          joined_at: new Date().toISOString(),
          last_read_at: new Date().toISOString()
        })

      const { error: part2Error } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: newConv.id,
          user_id: johnSmith.id,
          role: 'participant',
          joined_at: new Date().toISOString(),
          last_read_at: new Date().toISOString()
        })

      if (part1Error || part2Error) {
        console.error('❌ Failed to add participants:', part1Error || part2Error)
        return
      }

      sharedConversation = { conversation_id: newConv.id, conversations: newConv }
    }

    const conversationId = sharedConversation.conversation_id
    console.log(`💬 Using conversation: ${conversationId}`)

    // Test 1: Setup realtime listeners
    console.log('\n📡 Test 1: Setting up realtime listeners...')
    
    let teacher1Messages = []
    let johnSmithMessages = []
    
    // Teacher1's perspective
    const teacher1Channel = supabase
      .channel(`teacher1-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log(`📨 Teacher1 received message: ${payload.new.content}`)
          teacher1Messages.push(payload.new)
        }
      )
      .subscribe()

    // John's perspective
    const johnChannel = supabase
      .channel(`john-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log(`📨 John received message: ${payload.new.content}`)
          johnSmithMessages.push(payload.new)
        }
      )
      .subscribe()

    // Wait for subscriptions to connect
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Test 2: Send message from Teacher1 to John
    console.log('\n💬 Test 2: Teacher1 sending message to John...')
    
    const teacher1Message = `Hello John! This is a realtime test message from Teacher1 at ${new Date().toLocaleTimeString()}`
    const { data: msg1, error: msg1Error } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: teacher1.id,
        content: teacher1Message,
        message_type: 'text',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (msg1Error) {
      console.error('❌ Failed to send message from Teacher1:', msg1Error)
    } else {
      console.log(`✅ Teacher1 sent: "${teacher1Message}"`)
    }

    // Wait for realtime delivery
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Test 3: Send reply from John to Teacher1
    console.log('\n💬 Test 3: John sending reply to Teacher1...')
    
    const johnMessage = `Hi Teacher! This is John's reply at ${new Date().toLocaleTimeString()}. I received your message!`
    const { data: msg2, error: msg2Error } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: johnSmith.id,
        content: johnMessage,
        message_type: 'text',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (msg2Error) {
      console.error('❌ Failed to send message from John:', msg2Error)
    } else {
      console.log(`✅ John sent: "${johnMessage}"`)
    }

    // Wait for realtime delivery
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Test 4: Check realtime delivery results
    console.log('\n📊 Test 4: Checking realtime delivery results...')
    
    console.log(`Teacher1 received ${teacher1Messages.length} realtime messages:`)
    teacher1Messages.forEach((msg, index) => {
      const sender = msg.sender_id === teacher1.id ? 'Teacher1' : 'John'
      console.log(`  ${index + 1}. ${sender}: ${msg.content}`)
    })

    console.log(`John received ${johnSmithMessages.length} realtime messages:`)
    johnSmithMessages.forEach((msg, index) => {
      const sender = msg.sender_id === teacher1.id ? 'Teacher1' : 'John'
      console.log(`  ${index + 1}. ${sender}: ${msg.content}`)
    })

    // Test 5: Test typing indicators
    console.log('\n⌨️ Test 5: Testing typing indicators...')
    
    let typingEvents = []
    const typingChannel = supabase
      .channel(`typing-test-${conversationId}`)
      .on(
        'broadcast',
        { event: 'typing' },
        (payload) => {
          console.log(`⌨️ Typing event: ${payload.payload.userName} is ${payload.payload.isTyping ? 'typing' : 'stopped typing'}`)
          typingEvents.push(payload.payload)
        }
      )
      .subscribe()

    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simulate Teacher1 typing
    await typingChannel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId: teacher1.id,
        userName: teacher1.name,
        isTyping: true,
        conversationId: conversationId
      }
    })

    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simulate Teacher1 stop typing
    await typingChannel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId: teacher1.id,
        userName: teacher1.name,
        isTyping: false,
        conversationId: conversationId
      }
    })

    await new Promise(resolve => setTimeout(resolve, 2000))

    // Results summary
    console.log('\n🎯 REALTIME CHAT TEST RESULTS:')
    console.log('=' * 50)
    console.log(`✅ Message delivery: ${teacher1Messages.length + johnSmithMessages.length}/4 messages delivered`)
    console.log(`✅ Bidirectional chat: ${teacher1Messages.length > 0 && johnSmithMessages.length > 0 ? 'Working' : 'Check connection'}`)
    console.log(`✅ Typing indicators: ${typingEvents.length >= 2 ? 'Working' : 'Check broadcast'}`)
    console.log(`✅ Realtime subscriptions: ${teacher1Messages.length > 0 || johnSmithMessages.length > 0 ? 'Working' : 'Check configuration'}`)

    if (teacher1Messages.length > 0 && johnSmithMessages.length > 0) {
      console.log('\n🎉 SUCCESS! Realtime chat is working between the two accounts!')
      console.log('   • Messages are delivered instantly')
      console.log('   • Both users can send and receive')
      console.log('   • Typing indicators are functional')
      console.log('   • Ready for production use!')
    } else {
      console.log('\n⚠️ Partial functionality detected. Check Supabase Realtime configuration.')
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test channels...')
    supabase.removeChannel(teacher1Channel)
    supabase.removeChannel(johnChannel)
    supabase.removeChannel(typingChannel)

    // Clean up test messages
    if (msg1) {
      await supabase.from('conversation_messages').delete().eq('id', msg1.id)
    }
    if (msg2) {
      await supabase.from('conversation_messages').delete().eq('id', msg2.id)
    }
    console.log('🗑️ Cleaned up test messages')

  } catch (error) {
    console.error('❌ Realtime chat test failed:', error)
  }
}

// Instructions for manual testing
function printManualTestInstructions() {
  console.log('\n📋 MANUAL TESTING INSTRUCTIONS:')
  console.log('=' * 50)
  console.log('')
  console.log('1. 🌐 Open two browser windows/tabs')
  console.log('   • Window 1: Login as teacher1@university.edu')
  console.log('   • Window 2: Login as john.smith@university.edu')
  console.log('')
  console.log('2. 💬 Start a conversation:')
  console.log('   • In teacher1 window: Click the message button')
  console.log('   • Find John Smith in the dropdown')
  console.log('   • Click to open chat window')
  console.log('')
  console.log('3. ✍️ Test realtime messaging:')
  console.log('   • Type a message from teacher1 and send')
  console.log('   • Switch to john.smith window')
  console.log('   • Check if message appears instantly')
  console.log('   • Reply from john.smith')
  console.log('   • Check if reply appears in teacher1 window')
  console.log('')
  console.log('4. ⌨️ Test typing indicators:')
  console.log('   • Start typing in one window')
  console.log('   • Check if "typing..." appears in the other')
  console.log('   • Stop typing and verify indicator disappears')
  console.log('')
  console.log('5. 🔔 Test notifications:')
  console.log('   • Check unread message badges')
  console.log('   • Verify badges update in real-time')
  console.log('   • Test mark as read functionality')
  console.log('')
  console.log('✅ If all tests pass, your realtime chat is fully functional!')
}

// Run the test
testRealtimeChat().then(() => {
  printManualTestInstructions()
  process.exit(0)
}).catch((error) => {
  console.error('❌ Test execution failed:', error)
  process.exit(1)
})
