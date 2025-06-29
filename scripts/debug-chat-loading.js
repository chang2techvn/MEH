// Debug script for chat loading issues
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ztdgywjxsgtokblcrdjt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0ZGd5d2p4c2d0b2tibGNyZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwOTg4NjMsImV4cCI6MjA0OTY3NDg2M30.hZNP-Sm1O2aUNZc0E6P1FzWlQPcX3MJWKL1WZPf-NLQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugChatLoading() {
  console.log('🔍 Debugging chat loading issues...\n')

  try {
    // Test 1: Basic connection
    console.log('1. Testing basic Supabase connection...')
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1)

    if (testError) {
      console.error('❌ Connection failed:', testError.message)
      return
    }
    console.log('✅ Connection successful')

    // Test 2: Check users table
    console.log('\n2. Checking users...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(5)

    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
    } else {
      console.log(`✅ Found ${users.length} users:`)
      users.forEach(user => console.log(`   - ${user.name} (${user.email})`))
    }

    // Test 3: Check conversation_participants
    console.log('\n3. Checking conversation_participants...')
    const { data: participants, error: participantsError } = await supabase
      .from('conversation_participants')
      .select('*')
      .limit(5)

    if (participantsError) {
      console.error('❌ Error fetching participants:', participantsError)
    } else {
      console.log(`✅ Found ${participants.length} participants`)
    }

    // Test 4: Check conversations
    console.log('\n4. Checking conversations...')
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('*')
      .limit(5)

    if (conversationsError) {
      console.error('❌ Error fetching conversations:', conversationsError)
    } else {
      console.log(`✅ Found ${conversations.length} conversations`)
    }

    // Test 5: Try the exact query from chat-context
    console.log('\n5. Testing the exact chat-context query...')
    const testUserId = users[0]?.id
    if (testUserId) {
      const { data: conversationParticipants, error: participantsQueryError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          role,
          joined_at,
          last_read_at,
          conversations!inner(
            id,
            title,
            status,
            last_message_at,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', testUserId)
        .order('last_read_at', { ascending: false })

      if (participantsQueryError) {
        console.error('❌ Error with chat-context query:', participantsQueryError)
      } else {
        console.log(`✅ Chat-context query successful: ${conversationParticipants?.length || 0} results`)
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

debugChatLoading()
