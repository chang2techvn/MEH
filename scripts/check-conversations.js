#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkConversations() {
  console.log('🔍 Checking conversations system...\n')

  try {
    // Check conversations
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')

    if (convError) {
      console.error('❌ Error fetching conversations:', convError)
    } else {
      console.log(`📞 Found ${conversations?.length || 0} conversations:`)
      conversations?.forEach(conv => {
        console.log(`  - ${conv.id}: ${conv.title || 'Untitled'} (${conv.status})`)
      })
    }

    // Check conversation participants
    const { data: participants, error: partError } = await supabase
      .from('conversation_participants')
      .select(`
        *,
        users!inner(email, name, role)
      `)

    if (partError) {
      console.error('❌ Error fetching participants:', partError)
    } else {
      console.log(`\n👥 Found ${participants?.length || 0} conversation participants:`)
      participants?.forEach(part => {
        console.log(`  - User: ${part.users.email} (${part.users.role}) in conversation ${part.conversation_id}`)
      })
    }

    // Check conversation messages
    const { data: messages, error: msgError } = await supabase
      .from('conversation_messages')
      .select(`
        *,
        users!inner(email, name)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (msgError) {
      console.error('❌ Error fetching messages:', msgError)
    } else {
      console.log(`\n💬 Found ${messages?.length || 0} recent conversation messages:`)
      messages?.forEach(msg => {
        console.log(`  - ${msg.users.email}: "${msg.content.slice(0, 50)}..." (${msg.created_at})`)
      })
    }

    // Check for teacher account specifically
    const { data: teacherUser, error: teacherError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'teacher1@university.edu')
      .single()

    if (teacherError || !teacherUser) {
      console.error('\n❌ Teacher account not found:', teacherError)
    } else {
      console.log(`\n👨‍🏫 Teacher account found: ${teacherUser.email} (${teacherUser.role})`)
      
      // Check teacher's conversations
      const { data: teacherConversations, error: teacherConvError } = await supabase
        .from('conversation_participants')
        .select(`
          *,
          conversations!inner(*)
        `)
        .eq('user_id', teacherUser.id)

      if (teacherConvError) {
        console.error('❌ Error fetching teacher conversations:', teacherConvError)
      } else {
        console.log(`📞 Teacher is in ${teacherConversations?.length || 0} conversations:`)
        teacherConversations?.forEach(conv => {
          console.log(`  - ${conv.conversations.title || 'Untitled'} (${conv.conversations.status})`)
        })
      }
    }

  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

checkConversations()
