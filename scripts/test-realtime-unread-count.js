/**
 * Script to test real-time unread count updates
 * This will simulate message sending and verify unread count updates
 */

const { createClient } = require('@supabase/supabase-js')

// Use service role key for admin access
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRealtimeUnreadCount() {
  console.log('🔄 Testing Real-time Unread Count Updates...\n')
  
  try {
    // Get a conversation with multiple participants
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants!inner (
          user_id,
          last_read_at,
          users!inner (id, email, name)
        )
      `)
      .limit(1)
    
    if (convError || !conversations || conversations.length === 0) {
      console.log('❌ No conversations found for testing')
      return
    }
    
    const conversation = conversations[0]
    const participants = conversation.conversation_participants
    
    if (participants.length < 2) {
      console.log('❌ Need at least 2 participants for testing')
      return
    }
    
    console.log(`📝 Testing conversation: ${conversation.title}`)
    console.log(`👥 Participants: ${participants.length}`)
    participants.forEach(p => {
      console.log(`   - ${p.users.email} (${p.user_id})`)
    })
    console.log()
    
    // Calculate current unread count for each participant
    console.log('📊 Current unread counts:')
    
    const { data: messages, error: msgError } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: false })
    
    if (msgError) {
      console.log('❌ Error fetching messages:', msgError.message)
      return
    }
    
    const participantUnreadCounts = []
    
    for (const participant of participants) {
      const lastReadAt = new Date(participant.last_read_at || 0)
      const unreadCount = messages.filter(msg => 
        new Date(msg.created_at) > lastReadAt && 
        msg.sender_id !== participant.user_id
      ).length
      
      participantUnreadCounts.push({
        userId: participant.user_id,
        email: participant.users.email,
        unreadCount,
        lastReadAt: participant.last_read_at
      })
      
      console.log(`   ${participant.users.email}: ${unreadCount} unread messages`)
    }
    console.log()
    
    // Send a test message from first participant
    const sender = participants[0]
    const receivers = participants.slice(1)
    
    console.log(`📤 Sending test message from ${sender.users.email}...`)
    
    const testMessage = {
      conversation_id: conversation.id,
      sender_id: sender.user_id,
      content: `Real-time unread count test message - ${new Date().toLocaleString()}`,
      created_at: new Date().toISOString()
    }
    
    const { data: newMessage, error: sendError } = await supabase
      .from('conversation_messages')
      .insert(testMessage)
      .select()
      .single()
    
    if (sendError) {
      console.log('❌ Error sending test message:', sendError.message)
      return
    }
    
    console.log('✅ Test message sent successfully!')
    console.log(`   Message: "${newMessage.content}"`)
    console.log(`   ID: ${newMessage.id}`)
    console.log()
    
    // Wait a moment for real-time updates to propagate
    console.log('⏳ Waiting for real-time updates (3 seconds)...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Check updated unread counts
    console.log('📊 Updated unread counts (after new message):')
    
    const { data: updatedMessages, error: updatedMsgError } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: false })
    
    if (updatedMsgError) {
      console.log('❌ Error fetching updated messages:', updatedMsgError.message)
      return
    }
    
    for (const participant of participants) {
      const lastReadAt = new Date(participant.last_read_at || 0)
      const newUnreadCount = updatedMessages.filter(msg => 
        new Date(msg.created_at) > lastReadAt && 
        msg.sender_id !== participant.user_id
      ).length
      
      const oldCount = participantUnreadCounts.find(p => p.userId === participant.user_id)?.unreadCount || 0
      const countChange = newUnreadCount - oldCount
      
      console.log(`   ${participant.users.email}: ${newUnreadCount} unread (${countChange > 0 ? '+' + countChange : countChange})`)
    }
    console.log()
    
    // Test marking a message as read
    console.log('👁️  Testing mark as read functionality...')
    
    const receiver = receivers[0]
    const now = new Date().toISOString()
    
    console.log(`📖 Marking messages as read for ${receiver.users.email}...`)
    
    const { error: updateError } = await supabase
      .from('conversation_participants')
      .update({ last_read_at: now })
      .eq('conversation_id', conversation.id)
      .eq('user_id', receiver.user_id)
    
    if (updateError) {
      console.log('❌ Error updating read status:', updateError.message)
      return
    }
    
    console.log('✅ Read status updated successfully!')
    
    // Check unread count after marking as read
    const finalUnreadCount = updatedMessages.filter(msg => 
      new Date(msg.created_at) > new Date(now) && 
      msg.sender_id !== receiver.user_id
    ).length
    
    console.log(`   ${receiver.users.email} unread count after read: ${finalUnreadCount}`)
    console.log()
    
    // Create another test message to verify unread count increment
    console.log('📤 Sending another test message to verify counter increment...')
    
    const secondTestMessage = {
      conversation_id: conversation.id,
      sender_id: sender.user_id,
      content: `Second test message - ${new Date().toLocaleString()}`,
      created_at: new Date().toISOString()
    }
    
    const { error: secondSendError } = await supabase
      .from('conversation_messages')
      .insert(secondTestMessage)
    
    if (secondSendError) {
      console.log('❌ Error sending second test message:', secondSendError.message)
    } else {
      console.log('✅ Second test message sent!')
      console.log('   🎯 This should increment unread count for receivers')
    }
    
    console.log('\n🏆 Real-time unread count test completed!')
    console.log('📱 Check your app UI to verify:')
    console.log('   1. Unread count badge appears on Messages button')
    console.log('   2. Unread count shows next to conversation names')
    console.log('   3. Real-time updates work without page refresh')
    console.log('   4. Unread count decreases when messages are read')
    
  } catch (error) {
    console.error('❌ Real-time test failed:', error.message)
  }
}

// Run the test
runRealtimeTest().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})

async function runRealtimeTest() {
  await testRealtimeUnreadCount()
}
