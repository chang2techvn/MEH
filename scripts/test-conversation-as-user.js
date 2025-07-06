import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Using anon key like frontend
)

async function testConversationAsUser() {
  console.log('🔐 Testing conversation creation as authenticated user...')
  
  try {
    // First, login as teacher1
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'teacher1@university.edu',
      password: 'password123'
    })
    
    if (authError) {
      console.error('❌ Login failed:', authError)
      return
    }
    
    console.log('✅ Logged in as:', authData.user.email)
    console.log('🆔 User ID:', authData.user.id)
    
    // Test 1: Create a conversation
    console.log('\n📝 Test 1: Creating conversation...')
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        title: 'Test Chat from Script',
        type: 'direct',
        status: 'active',
        created_by: authData.user.id
      })
      .select()
      .single()
    
    if (convError) {
      console.error('❌ Conversation creation failed:', convError)
      return
    }
    
    console.log('✅ Conversation created:', conversation.id)
    
    // Test 2: Add participants
    console.log('\n👥 Test 2: Adding participants...')
    
    // Add self as participant
    const { data: participant1, error: p1Error } = await supabase
      .from('conversation_participants')
      .insert({
        conversation_id: conversation.id,
        user_id: authData.user.id,
        role: 'participant'
      })
      .select()
      .single()
    
    if (p1Error) {
      console.error('❌ Failed to add self as participant:', p1Error)
      return
    }
    
    console.log('✅ Added self as participant')
    
    // Add another user (admin)
    const { data: participant2, error: p2Error } = await supabase
      .from('conversation_participants')
      .insert({
        conversation_id: conversation.id,
        user_id: '0bc5b28c-81a1-4349-8e37-f2e0a7631a49', // admin user ID
        role: 'participant'
      })
      .select()
      .single()
    
    if (p2Error) {
      console.error('❌ Failed to add admin as participant:', p2Error)
      return
    }
    
    console.log('✅ Added admin as participant')
    
    // Test 3: Fetch conversations (like frontend does)
    console.log('\n📋 Test 3: Fetching conversations...')
    const { data: conversations, error: fetchError } = await supabase
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
      .eq('user_id', authData.user.id)
      .order('last_read_at', { ascending: false })
    
    if (fetchError) {
      console.error('❌ Failed to fetch conversations:', fetchError)
      return
    }
    
    console.log('✅ Successfully fetched', conversations.length, 'conversations')
    conversations.forEach((conv, i) => {
      console.log(`  ${i+1}. ${conv.conversations.title} (${conv.conversations.status})`)
    })
    
    console.log('\n🎉 All tests passed! Frontend conversation features should work now.')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testConversationAsUser()
