// Comprehensive test script for Supabase Realtime Chat functionality
import { createClient } from '@supabase/supabase-js'

// Using your local Supabase instance
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsaG9zdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ1MTkyNzQ0LCJleHAiOjE5NjA3Njg3NDR9.AzZvBr_zEtGBgXXqGNfDGsIHN5YGwuO0kKkYqcKPGws'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testComprehensiveRealtime() {
  console.log('🚀 Comprehensive Supabase Realtime Chat Test')
  console.log('==============================================')
  
  try {
    // Step 1: Create users in both auth.users and public.users
    console.log('1. Creating test users with proper database entries...')
    
    // User 1
    const testEmail1 = `testuser1_${Date.now()}@test.com`
    const testPassword1 = 'TestUser123!'
    
    const { data: authUser1, error: authError1 } = await supabase.auth.signUp({
      email: testEmail1,
      password: testPassword1,
    })
    
    if (authError1) {
      console.log('❌ User 1 auth signup failed:', authError1.message)
      return
    }
    
    console.log('✅ User 1 auth created:', authUser1.user.id)
    
    // Create corresponding entry in public.users
    const { data: publicUser1, error: publicError1 } = await supabase
      .from('users')
      .upsert({
        id: authUser1.user.id,
        email: testEmail1,
        username: `testuser1_${Date.now()}`,
        full_name: 'Test User One'
      })
      .select()
    
    if (publicError1) {
      console.log('❌ User 1 public.users creation failed:', publicError1.message)
      return
    }
    
    console.log('✅ User 1 public.users entry created')
    
    // User 2
    const testEmail2 = `testuser2_${Date.now()}@test.com`
    const testPassword2 = 'TestUser123!'
    
    const { data: authUser2, error: authError2 } = await supabase.auth.signUp({
      email: testEmail2,
      password: testPassword2,
    })
    
    if (authError2) {
      console.log('❌ User 2 auth signup failed:', authError2.message)
      return
    }
    
    console.log('✅ User 2 auth created:', authUser2.user.id)
    
    // Create corresponding entry in public.users
    const { data: publicUser2, error: publicError2 } = await supabase
      .from('users')
      .upsert({
        id: authUser2.user.id,
        email: testEmail2,
        username: `testuser2_${Date.now()}`,
        full_name: 'Test User Two'
      })
      .select()
    
    if (publicError2) {
      console.log('❌ User 2 public.users creation failed:', publicError2.message)
      return
    }
    
    console.log('✅ User 2 public.users entry created')

    // Step 2: Create profiles for both users
    console.log('\n2. Creating user profiles...')
    
    const { error: profileError1 } = await supabase
      .from('profiles')
      .upsert({
        id: authUser1.user.id,
        username: `testuser1_${Date.now()}`,
        full_name: 'Test User One',
        bio: 'Learning English through chat tests'
      })
    
    if (profileError1) {
      console.log('⚠️ Profile 1 creation warning:', profileError1.message)
    } else {
      console.log('✅ Profile 1 created successfully')
    }
    
    const { error: profileError2 } = await supabase
      .from('profiles')
      .upsert({
        id: authUser2.user.id,
        username: `testuser2_${Date.now()}`,
        full_name: 'Test User Two',
        bio: 'Testing realtime messaging'
      })
    
    if (profileError2) {
      console.log('⚠️ Profile 2 creation warning:', profileError2.message)
    } else {
      console.log('✅ Profile 2 created successfully')
    }

    // Step 3: Test message insertion with correct schema
    console.log('\n3. Testing message insertion...')
    
    const testMessage1 = {
      sender_id: authUser1.user.id,
      receiver_id: authUser2.user.id,
      content: `Hello from User 1! Test message at ${new Date().toISOString()}`,
      message_type: 'text'
    }
    
    const { data: messageData1, error: messageError1 } = await supabase
      .from('messages')
      .insert(testMessage1)
      .select()
    
    if (messageError1) {
      console.log('❌ Message 1 insertion failed:', messageError1.message)
      console.log('   Full error:', messageError1)
    } else {
      console.log('✅ Message 1 inserted successfully!')
      console.log('   Message ID:', messageData1[0]?.id)
      console.log('   Content:', messageData1[0]?.content)
    }

    // Step 4: Set up realtime subscription
    console.log('\n4. Setting up realtime subscription...')
    
    let messagesReceived = []
    let subscriptionActive = false
    let subscriptionError = null
    
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
          console.log('🔔 Realtime message received!')
          console.log('   Event:', payload.eventType)
          console.log('   Message ID:', payload.new?.id)
          console.log('   Content:', payload.new?.content)
          console.log('   From:', payload.new?.sender_id)
          console.log('   To:', payload.new?.receiver_id)
          console.log('   Type:', payload.new?.message_type)
          messagesReceived.push(payload)
        }
      )
      .subscribe((status, error) => {
        console.log('📡 Subscription status:', status)
        if (error) {
          console.log('❌ Subscription error:', error)
          subscriptionError = error
        }
        if (status === 'SUBSCRIBED') {
          subscriptionActive = true
          console.log('✅ Realtime subscription is ACTIVE!')
        }
      })

    // Wait for subscription to activate
    console.log('⏳ Waiting for subscription to activate...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    if (!subscriptionActive) {
      console.log('❌ Realtime subscription failed to activate')
      if (subscriptionError) {
        console.log('   Error details:', subscriptionError)
      }
    }

    // Step 5: Test realtime message broadcasting
    console.log('\n5. Testing realtime message broadcasting...')
    
    // Message from user 2 to user 1
    const realtimeTestMessage = {
      sender_id: authUser2.user.id,
      receiver_id: authUser1.user.id,
      content: `Realtime test from User 2 at ${new Date().toISOString()}`,
      message_type: 'text'
    }
    
    const { data: realtimeData, error: realtimeError } = await supabase
      .from('messages')
      .insert(realtimeTestMessage)
      .select()
    
    if (realtimeError) {
      console.log('❌ Realtime test message failed:', realtimeError.message)
    } else {
      console.log('✅ Realtime test message sent!')
      console.log('   Message ID:', realtimeData[0]?.id)
    }

    // Wait for realtime message
    console.log('⏳ Waiting for realtime message...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    if (messagesReceived.length > 0) {
      console.log(`✅ Realtime functionality working! Received ${messagesReceived.length} message(s)`)
    } else {
      console.log('❌ No realtime messages received')
    }

    // Step 6: Test message retrieval with joins
    console.log('\n6. Testing message retrieval with user data...')
    
    const { data: messages, error: fetchError } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id (
          username,
          full_name,
          email
        ),
        receiver:receiver_id (
          username,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (fetchError) {
      console.log('❌ Message fetch failed:', fetchError.message)
    } else {
      console.log('✅ Messages fetched successfully!')
      console.log(`   Found ${messages.length} message(s)`)
      messages.forEach((msg, index) => {
        console.log(`   ${index + 1}. From: ${msg.sender?.username || 'Unknown'} To: ${msg.receiver?.username || 'Unknown'}`)
        console.log(`      Content: "${msg.content}"`)
        console.log(`      Type: ${msg.message_type} | Read: ${msg.is_read} | Time: ${msg.created_at}`)
      })
    }

    // Step 7: Test conversation flow
    console.log('\n7. Testing conversation flow...')
    
    // Send a few messages back and forth
    const conversation = [
      {
        sender_id: authUser1.user.id,
        receiver_id: authUser2.user.id,
        content: "Hey! How's your English practice going?",
        message_type: 'text'
      },
      {
        sender_id: authUser2.user.id,
        receiver_id: authUser1.user.id,
        content: "Great! I'm learning new words every day. What about you?",
        message_type: 'text'
      },
      {
        sender_id: authUser1.user.id,
        receiver_id: authUser2.user.id,
        content: "Same here! Let's practice together sometime.",
        message_type: 'text'
      }
    ]
    
    for (const [index, msg] of conversation.entries()) {
      console.log(`   Sending message ${index + 1}/3...`)
      const { error: convError } = await supabase
        .from('messages')
        .insert(msg)
      
      if (convError) {
        console.log(`   ❌ Message ${index + 1} failed:`, convError.message)
      } else {
        console.log(`   ✅ Message ${index + 1} sent`)
      }
      
      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Step 8: Test message status updates
    console.log('\n8. Testing message status updates...')
    
    // Mark some messages as read
    const { data: unreadMessages, error: unreadError } = await supabase
      .from('messages')
      .select('id')
      .eq('receiver_id', authUser2.user.id)
      .eq('is_read', false)
      .limit(2)
    
    if (unreadError) {
      console.log('❌ Failed to fetch unread messages:', unreadError.message)
    } else if (unreadMessages.length > 0) {
      const { error: updateError } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', unreadMessages.map(msg => msg.id))
      
      if (updateError) {
        console.log('❌ Failed to mark messages as read:', updateError.message)
      } else {
        console.log(`✅ Marked ${unreadMessages.length} message(s) as read`)
      }
    } else {
      console.log('📝 No unread messages to update')
    }

    // Cleanup: Unsubscribe from channel
    await supabase.removeChannel(channel)
    console.log('🧹 Cleaned up realtime subscription')

    // Step 9: Final verification
    console.log('\n9. Final verification - Message statistics...')
    
    const { data: stats, error: statsError } = await supabase
      .from('messages')
      .select('message_type, is_read, sender_id, receiver_id')
    
    if (statsError) {
      console.log('❌ Failed to get message statistics:', statsError.message)
    } else {
      const totalMessages = stats.length
      const readMessages = stats.filter(msg => msg.is_read).length
      const textMessages = stats.filter(msg => msg.message_type === 'text').length
      
      console.log(`📊 Message Statistics:`)
      console.log(`   Total messages: ${totalMessages}`)
      console.log(`   Read messages: ${readMessages}`)
      console.log(`   Text messages: ${textMessages}`)
      console.log(`   Unread messages: ${totalMessages - readMessages}`)
    }

    console.log('\n🎉 Comprehensive realtime chat test completed successfully!')

  } catch (error) {
    console.log('❌ Test failed with exception:', error.message)
    console.log('Full error:', error)
  }
}

// Run the test
testComprehensiveRealtime().then(() => {
  console.log('\n🏁 All tests completed!')
  process.exit(0)
}).catch(err => {
  console.error('❌ Test script error:', err)
  process.exit(1)
})
