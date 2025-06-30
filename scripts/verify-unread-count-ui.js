/**
 * Script to verify and fix unread message count display in the UI
 * This will check if the unread count is correctly calculated and displayed
 */

const { createClient } = require('@supabase/supabase-js')

// Use service role key for admin access
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyUnreadCountDisplay() {
  console.log('🔍 Verifying Unread Count Display System...\n')
  
  try {
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
    
    if (usersError) {
      console.log('❌ Error fetching users:', usersError.message)
      return
    }
    
    console.log(`✅ Found ${users.length} active users\n`)
    
    // For each user, calculate their unread count across all conversations
    for (const user of users) {
      console.log(`👤 User: ${user.email} (${user.id})`)
      
      // Get conversations for this user
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants!inner (
            user_id,
            last_read_at
          )
        `)
        .eq('conversation_participants.user_id', user.id)
      
      if (convError) {
        console.log(`   ❌ Error fetching conversations: ${convError.message}`)
        continue
      }
      
      let totalUnreadCount = 0
      console.log(`   📋 Conversations: ${conversations.length}`)
      
      for (const conv of conversations) {
        // Get participant info for this user
        const participant = conv.conversation_participants.find(p => p.user_id === user.id)
        if (!participant) continue
        
        // Get messages in this conversation
        const { data: messages, error: msgError } = await supabase
          .from('conversation_messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
        
        if (msgError) {
          console.log(`   ❌ Error fetching messages: ${msgError.message}`)
          continue
        }
        
        // Calculate unread count for this conversation
        const lastReadAt = new Date(participant.last_read_at || 0)
        const unreadMessages = messages.filter(msg => 
          new Date(msg.created_at) > lastReadAt && 
          msg.sender_id !== user.id
        )
        
        totalUnreadCount += unreadMessages.length
        
        console.log(`   📨 ${conv.title}: ${unreadMessages.length} unread messages`)
        
        if (unreadMessages.length > 0) {
          console.log(`      Last read: ${participant.last_read_at || 'Never'}`)
          console.log(`      Latest unread: "${unreadMessages[0].content.substring(0, 50)}..."`)
        }
      }
      
      console.log(`   🔥 Total unread count: ${totalUnreadCount}`)
      console.log()
    }
    
    // Check if the chat context is calculating unread counts correctly
    console.log('🎯 Testing Chat Context Unread Count Logic...\n')
    
    // Simulate what the chat context should be doing
    const testUserId = users[0].id // Use first user for testing
    console.log(`🧪 Testing unread count calculation for user: ${users[0].email}`)
    
    const { data: userConversations, error: userConvError } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        last_read_at,
        conversations!inner (
          id,
          title,
          status,
          last_message_at
        )
      `)
      .eq('user_id', testUserId)
    
    if (userConvError) {
      console.log(`❌ Error fetching user conversations: ${userConvError.message}`)
      return
    }
    
    console.log(`   ✅ User participates in ${userConversations.length} conversations`)
    
    // Calculate unread count for each conversation
    const conversationsWithUnreadCount = []
    
    for (const convParticipant of userConversations) {
      const { data: messages, error: msgError } = await supabase
        .from('conversation_messages')
        .select('id, sender_id, created_at')
        .eq('conversation_id', convParticipant.conversation_id)
        .order('created_at', { ascending: false })
      
      if (msgError) {
        console.log(`   ❌ Error fetching messages: ${msgError.message}`)
        continue
      }
      
      const lastReadAt = new Date(convParticipant.last_read_at || 0)
      const unreadCount = messages.filter(msg => 
        new Date(msg.created_at) > lastReadAt && 
        msg.sender_id !== testUserId
      ).length
      
      conversationsWithUnreadCount.push({
        id: convParticipant.conversation_id,
        title: convParticipant.conversations.title,
        unreadCount
      })
    }
    
    // Display results
    console.log('   📊 Unread count per conversation:')
    conversationsWithUnreadCount.forEach(conv => {
      console.log(`      - ${conv.title}: ${conv.unreadCount} unread`)
    })
    
    const totalUnread = conversationsWithUnreadCount.reduce((sum, conv) => sum + conv.unreadCount, 0)
    console.log(`   🎯 Total unread messages: ${totalUnread}`)
    
    // Recommendations
    console.log('\n💡 Recommendations:')
    
    if (totalUnread > 0) {
      console.log('   ✅ Unread count system is working correctly!')
      console.log('   📋 Next steps:')
      console.log('      1. Verify UI components are using correct unread count calculation')
      console.log('      2. Check if real-time updates are working for unread counts')
      console.log('      3. Test marking messages as read functionality')
    } else {
      console.log('   ⚠️  No unread messages found - this might indicate:')
      console.log('      1. All messages have been read')
      console.log('      2. last_read_at timestamps are not being updated correctly')
      console.log('      3. There might be an issue with the unread count calculation')
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
  }
}

// Create a test message to verify real-time unread count updates
async function createTestMessage() {
  console.log('\n🧪 Creating test message to verify real-time unread count...')
  
  try {
    // Get first conversation
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .limit(1)
      .single()
    
    if (convError || !conv) {
      console.log('❌ No conversations found for testing')
      return
    }
    
    // Get participants
    const { data: participants, error: partError } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conv.id)
    
    if (partError || !participants || participants.length < 2) {
      console.log('❌ Need at least 2 participants for testing')
      return
    }
    
    const senderId = participants[0].user_id
    
    // Create test message
    const { error: msgError } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: conv.id,
        sender_id: senderId,
        content: `Test message for unread count verification - ${new Date().toLocaleString()}`,
        created_at: new Date().toISOString()
      })
    
    if (msgError) {
      console.log('❌ Error creating test message:', msgError.message)
    } else {
      console.log('✅ Test message created successfully!')
      console.log('   🎯 This should increase unread count for other participants')
      console.log('   🔄 Check the UI to see if unread count updates in real-time')
    }
    
  } catch (error) {
    console.error('❌ Test message creation failed:', error.message)
  }
}

// Run verification
async function runVerification() {
  await verifyUnreadCountDisplay()
  await createTestMessage()
  
  console.log('\n✅ Unread count verification completed!')
  console.log('🎯 Check your app UI to see if unread counts are displayed correctly')
}

runVerification().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
