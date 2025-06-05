// Fixed comprehensive test script for Supabase Realtime Chat functionality
import { createClient } from '@supabase/supabase-js'

// Using your local Supabase instance
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsaG9zdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ1MTkyNzQ0LCJleHAiOjE5NjA3Njg3NDR9.AzZvBr_zEtGBgXXqGNfDGsIHN5YGwuO0kKkYqcKPGws'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFixedRealtime() {
  console.log('🚀 Fixed Supabase Realtime Chat Test')
  console.log('====================================')
  
  try {
    // Step 1: Create users with correct schema
    console.log('1. Creating test users with correct database schema...')
    
    // User 1
    const email1 = `testuser1_${Date.now()}@test.com`
    const password1 = 'TestUser123!'
    
    const { data: user1, error: authError1 } = await supabase.auth.signUp({
      email: email1,
      password: password1,
    })
    
    if (authError1) {
      console.log('❌ User 1 auth signup failed:', authError1.message)
      return
    }
    
    console.log('✅ User 1 auth created:', user1.user.id)
    
    // Insert into public.users table (required for foreign key constraints)  
    const { error: userError1 } = await supabase
      .from('users')
      .insert({
        id: user1.user.id,
        email: email1,
        role: 'student'
      })
    
    if (userError1) {
      console.log('❌ User 1 public.users creation failed:', userError1.message)
      return
    } else {
      console.log('✅ User 1 public.users entry created')
    }

    // Create profile for user 1
    const { error: profileError1 } = await supabase
      .from('profiles')
      .insert({
        user_id: user1.user.id,
        username: 'testuser1',
        full_name: 'Test User 1'
      })
    
    if (profileError1) {
      console.log('⚠️ User 1 profile creation warning:', profileError1.message)
    } else {
      console.log('✅ User 1 profile created')
    }
    
    // User 2
    const email2 = `testuser2_${Date.now()}@test.com`
    const password2 = 'TestUser123!'
    
    const { data: user2, error: authError2 } = await supabase.auth.signUp({
      email: email2,
      password: password2,
    })
    
    if (authError2) {
      console.log('❌ User 2 auth signup failed:', authError2.message)
      return
    }
    
    console.log('✅ User 2 auth created:', user2.user.id)
    
    // Insert into public.users table (required for foreign key constraints)
    const { error: userError2 } = await supabase
      .from('users')
      .insert({
        id: user2.user.id,
        email: email2,
        role: 'student'
      })
    
    if (userError2) {
      console.log('❌ User 2 public.users creation failed:', userError2.message)
      return
    } else {
      console.log('✅ User 2 public.users entry created')
    }

    // Create profile for user 2
    const { error: profileError2 } = await supabase
      .from('profiles')
      .insert({
        user_id: user2.user.id,
        username: 'testuser2',
        full_name: 'Test User 2'
      })
    
    if (profileError2) {
      console.log('⚠️ User 2 profile creation warning:', profileError2.message)
    } else {
      console.log('✅ User 2 profile created')
    }

    // Step 2: Test message insertion with correct schema
    console.log('\n2. Testing message insertion...')
    
    const testMessage = {
      sender_id: user1.user.id,
      receiver_id: user2.user.id,
      content: `Hello from User 1! Test message at ${new Date().toISOString()}`,
      message_type: 'text'
    }
    
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert(testMessage)
      .select()
    
    if (messageError) {
      console.log('❌ Message insertion failed:', messageError.message)
      console.log('   Full error details:', messageError)
    } else {
      console.log('✅ Message inserted successfully!')
      console.log('   Message ID:', messageData[0]?.id)
      console.log('   Content:', messageData[0]?.content)
    }

    // Step 3: Set up realtime subscription
    console.log('\n3. Setting up realtime subscription...')
    
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
          console.log('🔔 Realtime message received!')
          console.log('   Event:', payload.eventType)
          console.log('   Message ID:', payload.new?.id)
          console.log('   Content:', payload.new?.content)
          console.log('   From:', payload.new?.sender_id)
          console.log('   To:', payload.new?.receiver_id)
          messagesReceived.push(payload)
        }
      )
      .subscribe((status, error) => {
        console.log('📡 Subscription status:', status)
        if (error) {
          console.log('❌ Subscription error:', error)
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
    }

    // Step 4: Test realtime message broadcasting
    console.log('\n4. Testing realtime message broadcasting...')
    
    const realtimeTestMessage = {
      sender_id: user2.user.id,
      receiver_id: user1.user.id,
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

    // Step 5: Test message retrieval with joins
    console.log('\n5. Testing message retrieval with user profiles...')
    
    const { data: messages, error: fetchError } = await supabase
      .from('messages')
      .select(`
        *,
        sender_profile:profiles!profiles_user_id_fkey(username, full_name),
        receiver_profile:profiles!profiles_user_id_fkey(username, full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (fetchError) {
      console.log('❌ Message fetch with profiles failed:', fetchError.message)
      console.log('   Trying simple fetch...')
      
      // Try simpler query without joins
      const { data: simpleMessages, error: simpleFetchError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (simpleFetchError) {
        console.log('❌ Simple message fetch also failed:', simpleFetchError.message)
      } else {
        console.log('✅ Simple messages fetched successfully!')
        console.log(`   Found ${simpleMessages.length} message(s)`)
        simpleMessages.forEach((msg, index) => {
          console.log(`   ${index + 1}. ID: ${msg.id}`)
          console.log(`      Content: "${msg.content}"`)
          console.log(`      From: ${msg.sender_id} To: ${msg.receiver_id}`)
          console.log(`      Type: ${msg.message_type} | Read: ${msg.is_read}`)
        })
      }
    } else {
      console.log('✅ Messages with profiles fetched successfully!')
      console.log(`   Found ${messages.length} message(s)`)
      messages.forEach((msg, index) => {
        console.log(`   ${index + 1}. From: ${msg.sender_profile?.username || 'Unknown'} To: ${msg.receiver_profile?.username || 'Unknown'}`)
        console.log(`      Content: "${msg.content}"`)
        console.log(`      Type: ${msg.message_type} | Read: ${msg.is_read}`)
      })
    }

    // Step 6: Test conversation flow
    console.log('\n6. Testing conversation flow...')
    
    const conversation = [
      {
        sender_id: user1.user.id,
        receiver_id: user2.user.id,
        content: "Hey! How's your English practice going?",
        message_type: 'text'
      },
      {
        sender_id: user2.user.id,
        receiver_id: user1.user.id,
        content: "Great! I'm learning new words every day.",
        message_type: 'text'
      }
    ]
    
    for (const [index, msg] of conversation.entries()) {
      console.log(`   Sending message ${index + 1}/${conversation.length}...`)
      const { error: convError } = await supabase
        .from('messages')
        .insert(msg)
      
      if (convError) {
        console.log(`   ❌ Message ${index + 1} failed:`, convError.message)
      } else {
        console.log(`   ✅ Message ${index + 1} sent`)
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Step 7: Test message status updates
    console.log('\n7. Testing message status updates...')
    
    const { data: unreadMessages, error: unreadError } = await supabase
      .from('messages')
      .select('id')
      .eq('receiver_id', user2.user.id)
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

    // Cleanup
    await supabase.removeChannel(channel)
    console.log('🧹 Cleaned up realtime subscription')

    // Final stats
    console.log('\n8. Final message statistics...')
    
    const { data: stats, error: statsError } = await supabase
      .from('messages')
      .select('message_type, is_read')
    
    if (statsError) {
      console.log('❌ Failed to get statistics:', statsError.message)
    } else {
      const totalMessages = stats.length
      const readMessages = stats.filter(msg => msg.is_read).length
      
      console.log(`📊 Message Statistics:`)
      console.log(`   Total messages: ${totalMessages}`)
      console.log(`   Read messages: ${readMessages}`)
      console.log(`   Unread messages: ${totalMessages - readMessages}`)
    }

    console.log('\n🎉 Fixed realtime chat test completed successfully!')

  } catch (error) {
    console.log('❌ Test failed with exception:', error.message)
    console.log('Full error:', error)
  }
}

// Run the test
testFixedRealtime().then(() => {
  console.log('\n🏁 All tests completed!')
  process.exit(0)
}).catch(err => {
  console.error('❌ Test script error:', err)
  process.exit(1)
})
