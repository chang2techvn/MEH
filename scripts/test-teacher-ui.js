#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testTeacherUI() {
  console.log('🧪 Testing teacher UI with anon key (same as UI)...\n')

  try {
    // First, simulate login as teacher1
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'teacher1@university.edu',
      password: 'teacher123'
    })

    if (authError) {
      console.error('❌ Auth error:', authError)
      return
    }

    console.log(`✅ Authenticated as: ${authData.user?.email}`)
    console.log(`User ID: ${authData.user?.id}\n`)

    // Test loading conversations as UI would do
    console.log('🔍 Testing conversation loading (as UI does)...\n')

    // Get user profile first
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.error('❌ Error getting user profile:', profileError)
    } else {
      console.log(`👤 User profile: ${userProfile.email} (${userProfile.role})`)
    }

    // Test conversations query (same as chat context)
    const { data: conversations, error: convError } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations!inner(*)
      `)
      .eq('user_id', authData.user.id)

    if (convError) {
      console.error('❌ Error fetching conversations with RLS:', convError)
    } else {
      console.log(`\n📞 Found ${conversations?.length || 0} conversations (with RLS):`)
      conversations?.forEach(conv => {
        console.log(`  - ${conv.conversations.id}: ${conv.conversations.title || 'Untitled'} (${conv.conversations.status})`)
      })
    }

    // Test participants query
    const conversationIds = conversations?.map(c => c.conversation_id) || []
    if (conversationIds.length > 0) {
      const { data: participants, error: partError } = await supabase
        .from('conversation_participants')
        .select(`
          *,
          user:users!user_id(id, name, avatar, last_active)
        `)
        .in('conversation_id', conversationIds)

      if (partError) {
        console.error('❌ Error fetching participants with RLS:', partError)
      } else {
        console.log(`\n👥 Found ${participants?.length || 0} participants (with RLS):`)
        participants?.forEach(part => {
          console.log(`  - ${part.user?.name || 'Unknown'} in conversation ${part.conversation_id}`)
        })
      }
    }

    // Test messages query
    if (conversationIds.length > 0) {
      const { data: messages, error: msgError } = await supabase
        .from('conversation_messages')
        .select(`
          *,
          users!sender_id(name, email)
        `)
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false })
        .limit(5)

      if (msgError) {
        console.error('❌ Error fetching messages with RLS:', msgError)
      } else {
        console.log(`\n💬 Found ${messages?.length || 0} messages (with RLS):`)
        messages?.forEach(msg => {
          console.log(`  - ${msg.users?.email}: "${msg.content?.slice(0, 30)}..."`)
        })
      }
    }

  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

testTeacherUI()
