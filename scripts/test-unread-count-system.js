/**
 * Script to test and debug unread message count system
 * This will help identify and fix issues with message counting
 */

const { createClient } = require('@supabase/supabase-js')

// Use hardcoded values for testing
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU' // service role key

const supabase = createClient(supabaseUrl, supabaseKey)

async function testUnreadMessageCount() {
  console.log('🔍 Testing Unread Message Count System...\n')
  
  try {
    // Step 1: Check all users
    console.log('1. Checking all users...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .limit(5)
    
    if (usersError) {
      console.log('❌ Error fetching users:', usersError.message)
      return
    }
    
    console.log(`✅ Found ${users.length} active users`)
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.id})`)
    })
    console.log()

    // Step 2: Check all conversations
    console.log('2. Checking all conversations...')
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants!inner (
          user_id,
          last_read_at,
          users!inner (email, name)
        )
      `)
      .limit(10)
    
    if (convError) {
      console.log('❌ Error fetching conversations:', convError.message)
      return
    }
    
    console.log(`✅ Found ${conversations.length} conversations`)
    conversations.forEach((conv, index) => {
      console.log(`   ${index + 1}. ${conv.title} (${conv.id})`)
      conv.conversation_participants.forEach(p => {
        console.log(`      - ${p.users.email} (last read: ${p.last_read_at})`)
      })
    })
    console.log()

    // Step 3: Check messages for each conversation
    console.log('3. Checking messages and calculating unread count...')
    
    for (const conv of conversations) {
      console.log(`\n📨 Conversation: ${conv.title} (${conv.id})`)
      
      // Fetch messages
      const { data: messages, error: msgError } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true })
      
      if (msgError) {
        console.log(`   ❌ Error fetching messages: ${msgError.message}`)
        continue
      }
      
      console.log(`   📊 Total messages: ${messages.length}`)
      
      // Calculate unread count for each participant
      conv.conversation_participants.forEach(participant => {
        const lastReadAt = new Date(participant.last_read_at || 0)
        const unreadMessages = messages.filter(msg => 
          new Date(msg.created_at) > lastReadAt && 
          msg.sender_id !== participant.user_id
        )
        
        console.log(`   👤 ${participant.users.email}:`)
        console.log(`      - Last read: ${participant.last_read_at || 'Never'}`)
        console.log(`      - Unread count: ${unreadMessages.length}`)
        
        if (unreadMessages.length > 0) {
          console.log(`      - Unread messages:`)
          unreadMessages.forEach((msg, idx) => {
            console.log(`        ${idx + 1}. "${msg.content}" (${msg.created_at})`)
          })
        }
      })
    }

    // Step 4: Test updating read status
    console.log('\n4. Testing read status update...')
    
    if (conversations.length > 0 && users.length > 0) {
      const testConv = conversations[0]
      const testUser = users[0]
      
      // Find if user is participant in this conversation
      const participant = testConv.conversation_participants.find(p => p.user_id === testUser.id)
      
      if (participant) {
        console.log(`📝 Updating read status for ${testUser.email} in conversation ${testConv.title}`)
        
        const { error: updateError } = await supabase
          .from('conversation_participants')
          .update({ last_read_at: new Date().toISOString() })
          .eq('conversation_id', testConv.id)
          .eq('user_id', testUser.id)
        
        if (updateError) {
          console.log(`❌ Error updating read status: ${updateError.message}`)
        } else {
          console.log(`✅ Read status updated successfully`)
        }
      } else {
        console.log(`⚠️  User ${testUser.email} is not a participant in conversation ${testConv.title}`)
      }
    }

    // Step 5: Test creating a new message and checking unread count
    console.log('\n5. Testing new message creation and unread count...')
    
    if (conversations.length > 0 && users.length >= 2) {
      const testConv = conversations[0]
      const sender = users[0]
      const receiver = users[1]
      
      // Check if both users are participants
      const senderParticipant = testConv.conversation_participants.find(p => p.user_id === sender.id)
      const receiverParticipant = testConv.conversation_participants.find(p => p.user_id === receiver.id)
      
      if (senderParticipant && receiverParticipant) {
        console.log(`📬 Creating test message from ${sender.email} to ${receiver.email}`)
        
        const { data: newMessage, error: msgError } = await supabase
          .from('conversation_messages')
          .insert({
            conversation_id: testConv.id,
            sender_id: sender.id,
            content: `Test message from unread count script - ${new Date().toLocaleTimeString()}`,
            created_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (msgError) {
          console.log(`❌ Error creating test message: ${msgError.message}`)
        } else {
          console.log(`✅ Test message created: ${newMessage.content}`)
          
          // Check unread count for receiver
          const { data: messages, error: fetchError } = await supabase
            .from('conversation_messages')
            .select('*')
            .eq('conversation_id', testConv.id)
            .order('created_at', { ascending: true })
          
          if (!fetchError) {
            const lastReadAt = new Date(receiverParticipant.last_read_at || 0)
            const unreadCount = messages.filter(msg => 
              new Date(msg.created_at) > lastReadAt && 
              msg.sender_id !== receiver.id
            ).length
            
            console.log(`📊 Updated unread count for ${receiver.email}: ${unreadCount}`)
          }
        }
      } else {
        console.log(`⚠️  Cannot create test message - both users are not participants`)
      }
    }

    console.log('\n🎉 Unread message count test completed!')
    
  } catch (error) {
    console.error('❌ Error during unread count test:', error)
  }
}

// Run the test
testUnreadMessageCount()
