// Test script for Supabase Realtime Chat functionality
import { createClient } from '@supabase/supabase-js'

// Using your local Supabase instance
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsaG9zdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ1MTkyNzQ0LCJleHAiOjE5NjA3Njg3NDR9.AzZvBr_zEtGBgXXqGNfDGsIHN5YGwuO0kKkYqcKPGws'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRealtimeChat() {
  console.log('💬 Testing Supabase Realtime Chat...')
  console.log('====================================')
  
  try {
    // First, let's sign in a user for testing
    console.log('1. Signing in user for realtime testing...')
    const testEmail = `chattest${Date.now()}@test.com`
    const testPassword = 'ChatTest123!'
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })
    
    if (signUpError) {
      console.log('❌ User signup failed:', signUpError.message)
      return
    }
    
    console.log('✅ User signed up successfully!')
    
    // Create a profile for the user
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: signUpData.user.id,
        username: `chatuser_${Date.now()}`,
        full_name: 'Chat Test User'
      })
    
    if (profileError) {
      console.log('⚠️ Profile creation warning:', profileError.message)
    } else {
      console.log('✅ Profile created successfully!')
    }

    // Test 2: Create a test chat/conversation
    console.log('\n2. Creating test conversation...')
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        name: `Test Chat ${Date.now()}`,
        type: 'group'
      })
      .select()
    
    let conversationId
    if (conversationError) {
      console.log('❌ Conversation creation failed:', conversationError.message)
      // Try to use an existing conversation or create messages directly
      console.log('📝 Will test with direct message insertion...')
    } else {
      conversationId = conversationData[0].id
      console.log('✅ Conversation created:', conversationId)
    }

    // Test 3: Test message insertion
    console.log('\n3. Testing message insertion...')
    const testMessage = {
      user_id: signUpData.user.id,
      content: `Test message ${Date.now()}`,
      type: 'text'
    }
    
    if (conversationId) {
      testMessage.conversation_id = conversationId
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
    }

    // Test 4: Set up realtime subscription
    console.log('\n4. Testing realtime subscription...')
    
    let messageReceived = false
    let subscriptionActive = false
    
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('🔔 Realtime message received:', payload)
          messageReceived = true
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status)
        if (status === 'SUBSCRIBED') {
          subscriptionActive = true
          console.log('✅ Realtime subscription active!')
        }
      })

    // Wait for subscription to be active
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    if (!subscriptionActive) {
      console.log('❌ Realtime subscription failed to activate')
    }

    // Test 5: Insert another message to test realtime
    console.log('\n5. Testing realtime message broadcasting...')
    const { data: realtimeTestMessage, error: realtimeError } = await supabase
      .from('messages')
      .insert({
        user_id: signUpData.user.id,
        content: `Realtime test message ${Date.now()}`,
        type: 'text',
        ...(conversationId && { conversation_id: conversationId })
      })
      .select()
    
    if (realtimeError) {
      console.log('❌ Realtime test message failed:', realtimeError.message)
    } else {
      console.log('✅ Realtime test message sent!')
    }

    // Wait for realtime message
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    if (messageReceived) {
      console.log('✅ Realtime functionality working!')
    } else {
      console.log('❌ No realtime message received')
    }

    // Test 6: Test message fetching
    console.log('\n6. Testing message retrieval...')
    const { data: messages, error: fetchError } = await supabase
      .from('messages')
      .select(`
        *,
        profiles:user_id (
          username,
          full_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (fetchError) {
      console.log('❌ Message fetch failed:', fetchError.message)
    } else {
      console.log('✅ Messages fetched successfully!')
      console.log(`Found ${messages.length} recent messages`)
      messages.forEach(msg => {
        console.log(`- ${msg.profiles?.username || 'Unknown'}: ${msg.content}`)
      })
    }

    // Cleanup: Unsubscribe from channel
    await supabase.removeChannel(channel)
    console.log('🧹 Cleaned up realtime subscription')

  } catch (error) {
    console.log('❌ Realtime chat test failed with exception:', error.message)
  }
}

// Run the test
testRealtimeChat().then(() => {
  console.log('\n🏁 Realtime Chat testing completed!')
  process.exit(0)
}).catch(err => {
  console.error('Test script error:', err)
  process.exit(1)
})
