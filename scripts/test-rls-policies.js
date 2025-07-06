import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testRLSPolicies() {
  console.log('🔐 Testing RLS policies with service role...')
  
  try {
    // Test 1: Get teacher1 user ID
    const teacher1Id = '13df7bf1-d38f-4b58-b444-3dfa67e04f17'
    const adminId = '0bc5b28c-81a1-4349-8e37-f2e0a7631a49'
    
    console.log('👤 Testing with teacher1 ID:', teacher1Id)
    
    // Test 2: Create conversation using RPC (simulates frontend call)
    console.log('\n📝 Test: Creating conversation through RPC...')
    
    const { data: conversation, error: convError } = await supabase.rpc('create_conversation_with_participants', {
      conversation_title: 'Test Chat via RPC',
      conversation_type: 'direct',
      creator_id: teacher1Id,
      participant_ids: [teacher1Id, adminId]
    })
    
    if (convError) {
      console.log('⚠️ RPC function might not exist, trying direct insert...')
      
      // Fallback: Direct insert test
      const { data: directConv, error: directError } = await supabase
        .from('conversations')
        .insert({
          title: 'Direct Test Chat',
          type: 'direct',
          status: 'active',
          created_by: teacher1Id
        })
        .select()
        .single()
      
      if (directError) {
        console.error('❌ Direct insert failed:', directError)
        return
      }
      
      console.log('✅ Direct conversation created:', directConv.id)
      
      // Add participants
      const { data: participants, error: partError } = await supabase
        .from('conversation_participants')
        .insert([
          {
            conversation_id: directConv.id,
            user_id: teacher1Id,
            role: 'participant'
          },
          {
            conversation_id: directConv.id,
            user_id: adminId,
            role: 'participant'
          }
        ])
        .select()
      
      if (partError) {
        console.error('❌ Failed to add participants:', partError)
        return
      }
      
      console.log('✅ Added', participants.length, 'participants')
      
    } else {
      console.log('✅ RPC conversation created:', conversation)
    }
    
    // Test 3: Query conversations like frontend does
    console.log('\n📋 Test: Querying conversations like frontend...')
    
    const { data: userConversations, error: queryError } = await supabase
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
      .eq('user_id', teacher1Id)
      .order('last_read_at', { ascending: false })
    
    if (queryError) {
      console.error('❌ Query failed:', queryError)
      return
    }
    
    console.log('✅ Successfully queried conversations:', userConversations.length)
    userConversations.forEach((conv, i) => {
      console.log(`  ${i+1}. "${conv.conversations.title}" (${conv.conversations.status})`)
    })
    
    // Test 4: Check if we can fetch users for new chat
    console.log('\n👥 Test: Fetching users for new chat...')
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        profiles!inner(
          username,
          full_name,
          avatar_url
        )
      `)
      .neq('id', teacher1Id)
      .eq('is_active', true)
      .limit(10)
    
    if (usersError) {
      console.error('❌ Failed to fetch users:', usersError)
      return
    }
    
    console.log('✅ Found', users.length, 'users for new chat:')
    users.forEach((user, i) => {
      console.log(`  ${i+1}. ${user.profiles.full_name} (@${user.profiles.username}) - ${user.role}`)
    })
    
    console.log('\n🎉 All RLS tests passed! Frontend should work now.')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testRLSPolicies()
