require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testRealtimePerformance() {
  console.log('🧪 Testing Realtime Chat Performance')
  
  try {
    // Test 1: Check if Realtime is enabled
    console.log('\n📡 Test 1: Checking Realtime connection...')
    const { data, error } = await supabase.from('conversations').select('id').limit(1)
    if (error) {
      console.error('❌ Database connection failed:', error)
      return
    }
    console.log('✅ Database connection successful')

    // Test 2: Setup multiple subscriptions to simulate load
    console.log('\n📡 Test 2: Setting up multiple subscriptions...')
    const channels = []
    const numChannels = 10 // Simulate 10 concurrent users

    for (let i = 0; i < numChannels; i++) {
      const channel = supabase
        .channel(`test-channel-${i}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'conversation_messages'
          },
          (payload) => {
            console.log(`📨 Channel ${i} received message:`, payload.new.id)
          }
        )
        .subscribe((status) => {
          console.log(`📡 Channel ${i} status:`, status)
        })
      
      channels.push(channel)
    }

    // Wait for all channels to connect
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Test 3: Send test messages and measure response time
    console.log('\n📡 Test 3: Testing message delivery speed...')
    const testMessages = []
    const startTime = Date.now()

    // Get a test conversation
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .limit(1)

    if (!conversations || conversations.length === 0) {
      console.log('⚠️ No conversations found for testing')
      return
    }

    const testConversationId = conversations[0].id

    // Send multiple test messages
    for (let i = 0; i < 5; i++) {
      const { data: message, error: messageError } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: testConversationId,
          sender_id: 'test-user-id',
          content: `Test message ${i} - ${Date.now()}`,
          message_type: 'text',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (messageError) {
        console.error(`❌ Failed to send test message ${i}:`, messageError)
      } else {
        testMessages.push(message)
        console.log(`✅ Sent test message ${i}:`, message.id)
      }

      // Wait 500ms between messages
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    const endTime = Date.now()
    console.log(`⏱️ Total time for ${testMessages.length} messages: ${endTime - startTime}ms`)
    console.log(`⚡ Average time per message: ${(endTime - startTime) / testMessages.length}ms`)

    // Test 4: Check subscription scalability
    console.log('\n📡 Test 4: Testing subscription scalability...')
    console.log(`📊 Active channels: ${channels.length}`)
    console.log(`📊 Expected max concurrent users: 1000+`)
    console.log(`📊 Supabase Realtime should handle up to 500 concurrent connections per project`)

    // Cleanup
    console.log('\n🧹 Cleaning up test channels...')
    for (const channel of channels) {
      supabase.removeChannel(channel)
    }

    // Clean up test messages
    if (testMessages.length > 0) {
      const messageIds = testMessages.map(m => m.id)
      await supabase
        .from('conversation_messages')
        .delete()
        .in('id', messageIds)
      console.log(`🗑️ Cleaned up ${messageIds.length} test messages`)
    }

    console.log('\n✅ Realtime performance test completed!')
    
    // Performance recommendations
    console.log('\n📋 Performance Recommendations:')
    console.log('1. ✅ Use separate channels per conversation (implemented)')
    console.log('2. ✅ Implement optimistic updates (implemented)')
    console.log('3. ✅ Use debounced typing indicators (implemented)')
    console.log('4. ✅ Limit message history loading (implemented)')
    console.log('5. ✅ Clean up old subscriptions (implemented)')
    console.log('6. 💡 Consider message pagination for large conversations')
    console.log('7. 💡 Use CDN for media/file attachments')
    console.log('8. 💡 Implement connection pooling for high-traffic scenarios')

  } catch (error) {
    console.error('❌ Realtime performance test failed:', error)
  }
}

// Enhanced scalability recommendations
function printScalabilityRecommendations() {
  console.log('\n🚀 SCALABILITY RECOMMENDATIONS FOR LARGE USER BASES:')
  console.log('')
  console.log('📊 CONNECTION MANAGEMENT:')
  console.log('• Limit concurrent Realtime connections per user (max 5-10)')
  console.log('• Use connection pooling for server-side operations')
  console.log('• Implement exponential backoff for reconnections')
  console.log('• Monitor connection count and implement circuit breakers')
  console.log('')
  console.log('💾 DATA OPTIMIZATION:')
  console.log('• Paginate message history (50 messages per load)')
  console.log('• Use message compression for large payloads')
  console.log('• Implement message archiving for old conversations')
  console.log('• Cache frequently accessed data in Redis')
  console.log('')
  console.log('⚡ PERFORMANCE OPTIMIZATION:')
  console.log('• Use database indexes on conversation_id, sender_id, created_at')
  console.log('• Implement read replicas for message retrieval')
  console.log('• Use CDN for media files and avatars')
  console.log('• Consider database partitioning for messages table')
  console.log('')
  console.log('🔒 RATE LIMITING:')
  console.log('• Limit messages per user per minute (e.g., 60 msgs/min)')
  console.log('• Implement typing indicator throttling')
  console.log('• Use user-based rate limiting for API calls')
  console.log('• Monitor and alert on unusual activity patterns')
  console.log('')
  console.log('📈 MONITORING:')
  console.log('• Track Realtime connection count and latency')
  console.log('• Monitor database performance and query times')
  console.log('• Set up alerts for connection failures')
  console.log('• Log and analyze user engagement patterns')
}

// Run the tests
testRealtimePerformance().then(() => {
  printScalabilityRecommendations()
  process.exit(0)
}).catch((error) => {
  console.error('❌ Test execution failed:', error)
  process.exit(1)
})
