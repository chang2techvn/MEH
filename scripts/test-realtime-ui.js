const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ozdkuwvddmolbmfmkxzd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZGt1d3ZkZG1vbGJtZm1reHpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDA0OTcwMCwiZXhwIjoyMDQ5NjI1NzAwfQ.1QoVw2LKXtfr5FTL0JqaONlvVT0VbTQ1xrS5IrKZLoc'

// Test realtime system with detailed debugging for UI
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testRealtimeUI() {
  console.log('🔍 Testing realtime UI behavior with detailed debugging...\n')

  try {
    // 1. Get teachers data
    const { data: teachers, error: teachersError } = await supabase
      .from('users')
      .select('*')
      .in('email', ['teacher1@university.edu', 'teacher2@university.edu'])
      .order('email')

    if (teachersError || !teachers || teachers.length !== 2) {
      console.error('❌ Could not get both teachers:', teachersError)
      return
    }

    const [teacher1, teacher2] = teachers
    console.log('👥 Teachers found:')
    console.log(`   Teacher 1: ${teacher1.name} (${teacher1.email}) - ID: ${teacher1.id}`)
    console.log(`   Teacher 2: ${teacher2.name} (${teacher2.email}) - ID: ${teacher2.id}`)

    // 2. Get conversation between teachers
    const { data: conversation, error: convError } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations!inner(id, title, created_at)
      `)
      .eq('user_id', teacher1.id)
      .limit(1)
      .single()

    if (convError || !conversation) {
      console.error('❌ No conversation found between teachers:', convError)
      return
    }

    const conversationId = conversation.conversation_id
    console.log(`💬 Using conversation: ${conversationId}`)

    // 3. Get current message count
    const { data: existingMessages } = await supabase
      .from('conversation_messages')
      .select('id, content, sender_id, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(5)

    console.log(`📊 Current message count: ${existingMessages?.length || 0}`)
    if (existingMessages && existingMessages.length > 0) {
      console.log('   Last few messages:')
      existingMessages.forEach((msg, i) => {
        const sender = msg.sender_id === teacher1.id ? 'Teacher1' : 'Teacher2'
        console.log(`   ${i + 1}. [${sender}] ${msg.content} (${new Date(msg.created_at).toLocaleTimeString()})`)
      })
    }

    // 4. Set up realtime listener to simulate React context
    let messageReceived = false
    const testMessage = `Realtime UI Test - ${new Date().toLocaleTimeString()}`

    console.log('\n🔔 Setting up realtime listener (simulating React context)...')
    
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
          console.log('📨 REALTIME MESSAGE RECEIVED:', {
            id: payload.new.id,
            content: payload.new.content,
            sender_id: payload.new.sender_id,
            created_at: payload.new.created_at,
            conversation_id: payload.new.conversation_id
          })
          
          if (payload.new.content === testMessage) {
            messageReceived = true
            console.log('✅ Test message confirmed via realtime!')
          }
        }
      )
      .subscribe((status) => {
        console.log(`🔔 Subscription status: ${status}`)
      })

    // Wait for subscription to be ready
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 5. Simulate React sendMessage flow (with optimistic update)
    console.log('\n🚀 Simulating React sendMessage flow...')
    console.log(`📝 Sending message from Teacher2: "${testMessage}"`)

    // Step 1: Optimistic update (this would happen in React state)
    console.log('🔄 Step 1: Optimistic update (immediate UI feedback)')
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      senderId: teacher2.id,
      text: testMessage,
      timestamp: new Date(),
      status: "sending"
    }
    console.log('   📝 Optimistic message created:', optimisticMessage.id)

    // Step 2: Database insert (this is what triggers realtime)
    console.log('🔄 Step 2: Database insert (triggers realtime)')
    const { data: realMessage, error: insertError } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: teacher2.id,
        content: testMessage,
        message_type: 'text',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Failed to insert message:', insertError)
      return
    }

    console.log('✅ Database insert successful:', realMessage.id)

    // Step 3: Replace optimistic message with real message
    console.log('🔄 Step 3: Replace optimistic message with real message')
    console.log(`   🔄 Replace ${optimisticMessage.id} with ${realMessage.id}`)

    // Wait to see if realtime event is received
    console.log('\n⏳ Waiting for realtime event (5 seconds)...')
    await new Promise(resolve => setTimeout(resolve, 5000))

    if (messageReceived) {
      console.log('✅ REALTIME TEST PASSED: Message received via subscription')
    } else {
      console.log('❌ REALTIME TEST FAILED: No message received via subscription')
    }

    // 6. Check if message persists in database
    console.log('\n💾 Checking message persistence...')
    const { data: persistedMessage } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('id', realMessage.id)
      .single()

    if (persistedMessage) {
      console.log('✅ Message persisted in database:', persistedMessage.content)
    } else {
      console.log('❌ Message not found in database')
    }

    // 7. Simulate React component re-render check
    console.log('\n🔄 Simulating component state after realtime event...')
    const { data: updatedMessages } = await supabase
      .from('conversation_messages')
      .select('id, content, sender_id, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(5)

    console.log(`📊 Updated message count: ${updatedMessages?.length || 0}`)
    console.log('   Recent messages:')
    updatedMessages?.forEach((msg, i) => {
      const sender = msg.sender_id === teacher1.id ? 'Teacher1' : 'Teacher2'
      const isNew = msg.content === testMessage
      console.log(`   ${i + 1}. [${sender}] ${msg.content} ${isNew ? '🆕' : ''} (${new Date(msg.created_at).toLocaleTimeString()})`)
    })

    // Clean up
    supabase.removeChannel(channel)

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testRealtimeUI().then(() => {
  console.log('\n🏁 Realtime UI test completed')
  process.exit(0)
}).catch(error => {
  console.error('❌ Test error:', error)
  process.exit(1)
})
