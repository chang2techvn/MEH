#!/usr/bin/env node

/**
 * Test WebSocket connection and subscription stability
 * Tests the improved realtime subscription mechanisms
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    },
    headers: {
      'X-Client-Info': 'supabase-js-web'
    },
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (attempts) => Math.min(1000 * Math.pow(2, attempts), 30000)
  }
})

async function testWebSocketStability() {
  console.log('🧪 Testing WebSocket connection stability...')
  
  try {
    // Sign in as teacher1
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email: 'teacher1@university.edu',
      password: 'password123'
    })

    if (authError) {
      console.error('❌ Auth error:', authError.message)
      return
    }

    console.log('✅ Signed in as:', user.email)

    // Get user's conversations
    const { data: conversations, error: convError } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations!inner(
          id,
          title,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id)

    if (convError) {
      console.error('❌ Error fetching conversations:', convError)
      return
    }

    console.log(`📝 Found ${conversations.length} conversations for user`)

    if (conversations.length === 0) {
      console.log('⚠️ No conversations found for user')
      return
    }

    const testConversationId = conversations[0].conversation_id
    console.log(`🎯 Testing subscription for conversation: ${testConversationId}`)

    // Test 1: Basic subscription
    let subscriptionAttempts = 0
    let subscriptionSuccess = false

    const testChannel = supabase
      .channel(`test-conversation-${testConversationId}`, {
        config: {
          broadcast: { self: false },
          presence: { key: user.id }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
          filter: `conversation_id=eq.${testConversationId}`
        },
        (payload) => {
          console.log('💬 Received message:', payload.new.content)
        }
      )
      .subscribe((status, err) => {
        subscriptionAttempts++
        console.log(`📡 Subscription attempt ${subscriptionAttempts}, status: ${status}`, err ? err : '')
        
        if (status === 'SUBSCRIBED') {
          subscriptionSuccess = true
          console.log('✅ Subscription successful!')
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.log(`❌ Subscription failed with status: ${status}`)
          
          if (subscriptionAttempts < 3) {
            console.log(`🔄 Retrying subscription (attempt ${subscriptionAttempts + 1})`)
            setTimeout(() => {
              supabase.removeChannel(testChannel)
              testWebSocketStability() // Retry entire test
            }, 2000)
          }
        }
      })

    // Test 2: Insert a test message after 3 seconds
    setTimeout(async () => {
      if (subscriptionSuccess) {
        console.log('📤 Inserting test message...')
        
        const { error: insertError } = await supabase
          .from('conversation_messages')
          .insert([
            {
              conversation_id: testConversationId,
              sender_id: user.id,
              content: `WebSocket test message - ${new Date().toISOString()}`,
              message_type: 'text'
            }
          ])

        if (insertError) {
          console.error('❌ Error inserting test message:', insertError)
        } else {
          console.log('✅ Test message inserted successfully')
        }
      }
    }, 3000)

    // Test 3: Clean up after 10 seconds
    setTimeout(() => {
      console.log('🧹 Cleaning up test...')
      supabase.removeChannel(testChannel)
      process.exit(0)
    }, 10000)

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

// Run the test
testWebSocketStability()
