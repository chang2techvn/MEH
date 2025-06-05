// Test script for Supabase Realtime Chat functionality (CORRECTED)
import { createClient } from '@supabase/supabase-js'

// Using your local Supabase instance
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsaG9zdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ1MTkyNzQ0LCJleHAiOjE5NjA3Njg3NDR9.AzZvBr_zEtGBgXXqGNfDGsIHN5YGwuO0kKkYqcKPGws'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRealtimeChatCorrected() {
  console.log('💬 Testing Supabase Realtime Chat (CORRECTED)...')
  console.log('================================================')
  
  try {
    // First, let's sign in TWO users for testing chat
    console.log('1. Creating test users for chat...')
    
    // User 1
    const testEmail1 = `chatuser1_${Date.now()}@test.com`
    const testPassword1 = 'ChatTest123!'
    
    const { data: user1Data, error: user1Error } = await supabase.auth.signUp({
      email: testEmail1,
      password: testPassword1,
    })
    
    if (user1Error) {
      console.log('❌ User 1 signup failed:', user1Error.message)
      return
    }
    
    console.log('✅ User 1 signed up successfully!')
    
    // Create profile for user 1
    const { error: profile1Error } = await supabase
      .from('profiles')
      .upsert({
        id: user1Data.user.id,
        username: `chatuser1_${Date.now()}`,
        full_name: 'Chat Test User 1'
      })
    
    if (profile1Error) {
      console.log('⚠️ User 1 profile creation warning:', profile1Error.message)
    } else {
      console.log('✅ User 1 profile created successfully!')
    }

    // Test 2: Test message insertion with correct schema
    console.log('\n2. Testing message insertion with CORRECT schema...')
    
    // First, let's create a second user to message
    const testEmail2 = `chatuser2_${Date.now()}@test.com`
    const testPassword2 = 'ChatTest123!'
    
    const { data: user2Data, error: user2Error } = await supabase.auth.signUp({
      email: testEmail2,
      password: testPassword2,
    })
    
    if (user2Error) {
      console.log('❌ User 2 signup failed:', user2Error.message)
      return
    }
    
    console.log('✅ User 2 signed up successfully!')
    
    // Create profile for user 2
    const { error: profile2Error } = await supabase
      .from('profiles')
      .upsert({
        id: user2Data.user.id,
        username: `chatuser2_${Date.now()}`,
        full_name: 'Chat Test User 2'
      })
    
    if (profile2Error) {
      console.log('⚠️ User 2 profile creation warning:', profile2Error.message)
    } else {
      console.log('✅ User 2 profile created successfully!')
    }

    // Test message with correct schema
    const testMessage = {
      sender_id: user1Data.user.id,
      receiver_id: user2Data.user.id,
      content: `Test message from user 1 to user 2: ${new Date().toISOString()}`,
      message_type: 'text'
    }
    
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert(testMessage)
      .select()
    
    if (messageError) {
      console.log('❌ Message insertion failed:', messageError.message)
    } else {
      console.log('✅ Message inserted successfully!')
      console.log('Message ID:', messageData[0]?.id)
      console.log('Message content:', messageData[0]?.content)
    }

    // Test 3: Set up realtime subscription
    console.log('\n3. Testing realtime subscription...')
    
    let messagesReceived = []
    let subscriptionActive = false
    
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('🔔 Realtime message received:', {
            event: payload.eventType,
            messageId: payload.new?.id,
            content: payload.new?.content,
            sender: payload.new?.sender_id,
            receiver: payload.new?.receiver_id
          })
          messagesReceived.push(payload)
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status)
        if (status === 'SUBSCRIBED') {
          subscriptionActive = true
          console.log('✅ Realtime subscription is active!')
        }
      })

    // Wait for subscription to be active
    console.log('⏳ Waiting for subscription to activate...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    if (!subscriptionActive) {
      console.log('❌ Realtime subscription failed to activate')
    }

    // Test 4: Send more messages to test realtime
    console.log('\n4. Testing realtime message broadcasting...')
    
    // Message from user 1 to user 2
    const { data: realtimeTest1, error: realtimeError1 } = await supabase
      .from('messages')
      .insert({
        sender_id: user1Data.user.id,
        receiver_id: user2Data.user.id,
        content: `Realtime test message 1: ${new Date().toISOString()}`,
        message_type: 'text'
      })
      .select()
    
    if (realtimeError1) {
      console.log('❌ Realtime test message 1 failed:', realtimeError1.message)
    } else {
      console.log('✅ Realtime test message 1 sent!')
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    // Message from user 2 to user 1
    const { data: realtimeTest2, error: realtimeError2 } = await supabase
      .from('messages')
      .insert({
        sender_id: user2Data.user.id,
        receiver_id: user1Data.user.id,
        content: `Realtime test message 2: ${new Date().toISOString()}`,
        message_type: 'text'
      })
      .select()
    
    if (realtimeError2) {
      console.log('❌ Realtime test message 2 failed:', realtimeError2.message)
    } else {
      console.log('✅ Realtime test message 2 sent!')
    }

    // Wait for realtime messages
    console.log('⏳ Waiting for realtime messages...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    if (messagesReceived.length > 0) {
      console.log(`✅ Realtime functionality working! Received ${messagesReceived.length} messages`)
    } else {
      console.log('❌ No realtime messages received')
    }

    // Test 5: Test message fetching with relationships
    console.log('\n5. Testing message retrieval with user profiles...')
    const { data: messages, error: fetchError } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id (
          id,
          name,
          email
        ),
        receiver:receiver_id (
          id, 
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (fetchError) {
      console.log('❌ Message fetch failed:', fetchError.message)
    } else {
      console.log('✅ Messages fetched successfully!')
      console.log(`Found ${messages.length} recent messages:`)
      messages.forEach((msg, index) => {
        console.log(`${index + 1}. ${msg.sender?.name || 'Unknown'} → ${msg.receiver?.name || 'Unknown'}: "${msg.content}"`)
      })
    }

    // Test 6: Test message read status update
    console.log('\n6. Testing message read status update...')
    if (messages && messages.length > 0) {
      const messageToMarkRead = messages[0]
      const { data: updateData, error: updateError } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageToMarkRead.id)
        .select()
      
      if (updateError) {
        console.log('❌ Message read status update failed:', updateError.message)
      } else {
        console.log('✅ Message marked as read successfully!')
      }
    }

    // Cleanup: Unsubscribe from channel
    await supabase.removeChannel(channel)
    console.log('🧹 Cleaned up realtime subscription')

  } catch (error) {
    console.log('❌ Realtime chat test failed with exception:', error.message)
  }
}

// Run the test
testRealtimeChatCorrected().then(() => {
  console.log('\n🏁 Realtime Chat testing completed!')
  process.exit(0)
}).catch(err => {
  console.error('Test script error:', err)
  process.exit(1)
})
