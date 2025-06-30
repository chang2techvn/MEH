/**
 * Script to validate and fix unread count display issues
 * This will check common issues and provide fixes
 */

const { createClient } = require('@supabase/supabase-js')

// Use service role key for admin access
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function validateUnreadCountSystem() {
  console.log('🔍 Validating Unread Count Display System...\n')
  
  try {
    // Check 1: Verify database integrity
    console.log('1️⃣ Checking database integrity...')
    
    // Check for orphaned messages
    const { data: orphanedMessages, error: orphanError } = await supabase
      .from('conversation_messages')
      .select('id, conversation_id')
      .not('conversation_id', 'in', `(
        SELECT id FROM conversations
      )`)
    
    if (orphanError) {
      console.log('   ❌ Error checking orphaned messages:', orphanError.message)
    } else if (orphanedMessages && orphanedMessages.length > 0) {
      console.log(`   ⚠️  Found ${orphanedMessages.length} orphaned messages`)
      console.log('   🔧 Recommendation: Clean up orphaned messages')
    } else {
      console.log('   ✅ No orphaned messages found')
    }
    
    // Check for participants without valid last_read_at
    const { data: invalidParticipants, error: participantError } = await supabase
      .from('conversation_participants')
      .select('*')
      .is('last_read_at', null)
    
    if (participantError) {
      console.log('   ❌ Error checking participants:', participantError.message)
    } else if (invalidParticipants && invalidParticipants.length > 0) {
      console.log(`   ⚠️  Found ${invalidParticipants.length} participants without last_read_at`)
      console.log('   🔧 Fixing null last_read_at values...')
      
      const { error: fixError } = await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date('2000-01-01').toISOString() })
        .is('last_read_at', null)
      
      if (fixError) {
        console.log('   ❌ Error fixing last_read_at:', fixError.message)
      } else {
        console.log('   ✅ Fixed null last_read_at values')
      }
    } else {
      console.log('   ✅ All participants have valid last_read_at')
    }
    
    console.log()
    
    // Check 2: Validate unread count calculation for each user
    console.log('2️⃣ Validating unread count calculations...')
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .limit(5)
    
    if (usersError) {
      console.log('   ❌ Error fetching users:', usersError.message)
      return
    }
    
    for (const user of users) {
      console.log(`   👤 ${user.email}:`)
      
      // Get user's conversations
      const { data: userConversations, error: convError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          last_read_at,
          conversations!inner (id, title)
        `)
        .eq('user_id', user.id)
      
      if (convError) {
        console.log(`      ❌ Error fetching conversations: ${convError.message}`)
        continue
      }
      
      let totalUnread = 0
      
      for (const convParticipant of userConversations) {
        const { data: messages, error: msgError } = await supabase
          .from('conversation_messages')
          .select('id, sender_id, created_at')
          .eq('conversation_id', convParticipant.conversation_id)
        
        if (msgError) {
          console.log(`      ❌ Error fetching messages: ${msgError.message}`)
          continue
        }
        
        const lastReadAt = new Date(convParticipant.last_read_at || 0)
        const unreadCount = messages.filter(msg => 
          new Date(msg.created_at) > lastReadAt && 
          msg.sender_id !== user.id
        ).length
        
        totalUnread += unreadCount
        
        if (unreadCount > 0) {
          console.log(`      📨 ${convParticipant.conversations.title}: ${unreadCount} unread`)
        }
      }
      
      console.log(`      🔥 Total unread: ${totalUnread}`)
    }
    
    console.log()
    
    // Check 3: Test real-time subscription health
    console.log('3️⃣ Testing real-time subscription health...')
    
    // Create a test subscription to verify real-time is working
    const testChannel = supabase.channel('unread-count-test')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_messages'
      }, (payload) => {
        console.log('   ✅ Real-time message received:', payload.new.id)
      })
      .subscribe((status) => {
        console.log(`   📡 Real-time subscription status: ${status}`)
      })
    
    // Wait for subscription to establish
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Send a test message to trigger real-time
    const { data: testConv } = await supabase
      .from('conversations')
      .select('id')
      .limit(1)
      .single()
    
    if (testConv) {
      const { data: testUsers } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', testConv.id)
        .limit(1)
        .single()
      
      if (testUsers) {
        await supabase
          .from('conversation_messages')
          .insert({
            conversation_id: testConv.id,
            sender_id: testUsers.user_id,
            content: 'Real-time test message for unread count validation',
            created_at: new Date().toISOString()
          })
        
        console.log('   📤 Test message sent to trigger real-time')
      }
    }
    
    // Wait for real-time event
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Cleanup test subscription
    await supabase.removeChannel(testChannel)
    
    console.log()
    
    // Check 4: Performance analysis
    console.log('4️⃣ Performance analysis...')
    
    const { data: totalMessages } = await supabase
      .from('conversation_messages')
      .select('id', { count: 'exact', head: true })
    
    const { data: totalConversations } = await supabase
      .from('conversations')
      .select('id', { count: 'exact', head: true })
    
    const { data: totalParticipants } = await supabase
      .from('conversation_participants')
      .select('id', { count: 'exact', head: true })
    
    console.log(`   📊 Database stats:`)
    console.log(`      - Messages: ${totalMessages?.length || 0}`)
    console.log(`      - Conversations: ${totalConversations?.length || 0}`)
    console.log(`      - Participants: ${totalParticipants?.length || 0}`)
    
    if (totalMessages?.length > 1000) {
      console.log('   ⚠️  Large message count detected')
      console.log('   💡 Consider implementing message pagination for better performance')
    }
    
    console.log()
    
    // Check 5: Recommendations
    console.log('5️⃣ Recommendations for optimal unread count display:')
    console.log()
    
    console.log('   🎯 Frontend optimizations:')
    console.log('      1. Use React.memo() for conversation list items')
    console.log('      2. Implement virtualized lists for large conversation counts')
    console.log('      3. Debounce real-time updates to prevent UI flickering')
    console.log('      4. Cache unread counts in localStorage for offline support')
    console.log()
    
    console.log('   📱 UI/UX improvements:')
    console.log('      1. Add visual feedback when unread count changes')
    console.log('      2. Implement "mark all as read" functionality')
    console.log('      3. Show unread indicator in conversation titles')
    console.log('      4. Add notification sounds for new messages')
    console.log()
    
    console.log('   ⚡ Performance tips:')
    console.log('      1. Limit real-time subscriptions to active conversations')
    console.log('      2. Batch unread count updates every few seconds')
    console.log('      3. Use database functions for complex unread calculations')
    console.log('      4. Implement proper indexing on frequently queried columns')
    console.log()
    
    // Create a test scenario for UI testing
    console.log('6️⃣ Creating test scenario for UI validation...')
    
    // Find a user with unread messages
    const { data: userWithUnread } = await supabase
      .from('conversation_participants')
      .select(`
        user_id,
        conversation_id,
        last_read_at,
        users!inner (email)
      `)
      .not('last_read_at', 'is', null)
      .limit(1)
      .single()
    
    if (userWithUnread) {
      // Send a new message to create unread count
      await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: userWithUnread.conversation_id,
          sender_id: users[0].id, // Use first user as sender
          content: `UI test message - Please check unread count appears in UI - ${new Date().toLocaleString()}`,
          created_at: new Date().toISOString()
        })
      
      console.log(`   ✅ Test message created for ${userWithUnread.users.email}`)
      console.log('   🎯 Login as this user and check if unread count appears correctly')
    }
    
    console.log()
    console.log('✅ Unread count validation completed!')
    console.log('📱 Please check your app UI to verify unread count display')
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message)
  }
}

// Run validation
validateUnreadCountSystem().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
