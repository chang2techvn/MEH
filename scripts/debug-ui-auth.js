#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugUIAuth() {
  console.log('🔍 Debugging UI Auth with anon key...\n')

  try {
    // Step 1: Login as teacher1
    console.log('🔑 Attempting to login as teacher1@university.edu...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'teacher1@university.edu',
      password: 'teacher123' // Default password we set
    })

    if (authError) {
      console.error('❌ Auth error:', authError)
      return
    }

    console.log('✅ Login successful!')
    console.log('👤 User ID:', authData.user.id)
    console.log('📧 Email:', authData.user.email)

    // Step 2: Check if user exists in users table
    console.log('\n📊 Checking users table...')
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (userError) {
      console.error('❌ User table error:', userError)
    } else {
      console.log('✅ User found in users table:')
      console.log('  - ID:', userData.id)
      console.log('  - Email:', userData.email)
      console.log('  - Name:', userData.name)
      console.log('  - Role:', userData.role)
    }

    // Step 3: Check conversations with RLS (what UI sees)
    console.log('\n📞 Checking conversations with RLS...')
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')

    if (convError) {
      console.error('❌ Conversations error:', convError)
    } else {
      console.log(`✅ Found ${conversations?.length || 0} conversations:`)
      conversations?.forEach(conv => {
        console.log(`  - ${conv.id}: ${conv.title || 'Untitled'} (${conv.status})`)
      })
    }

    // Step 4: Check conversation participants with RLS
    console.log('\n👥 Checking conversation participants with RLS...')
    const { data: participants, error: partError } = await supabase
      .from('conversation_participants')
      .select(`
        *,
        users!inner(email, name, role)
      `)

    if (partError) {
      console.error('❌ Participants error:', partError)
    } else {
      console.log(`✅ Found ${participants?.length || 0} conversation participants:`)
      participants?.forEach(part => {
        console.log(`  - User: ${part.users.email} (${part.users.role}) in conversation ${part.conversation_id}`)
      })
    }

    // Step 5: Check conversations where user is participant
    console.log('\n🔍 Checking user\'s specific conversations...')
    const { data: userConversations, error: userConvError } = await supabase
      .from('conversation_participants')
      .select(`
        *,
        conversations!inner(*)
      `)
      .eq('user_id', authData.user.id)

    if (userConvError) {
      console.error('❌ User conversations error:', userConvError)
    } else {
      console.log(`✅ User is in ${userConversations?.length || 0} conversations:`)
      userConversations?.forEach(conv => {
        console.log(`  - ${conv.conversations.title || 'Untitled'} (${conv.conversations.status})`)
      })
    }

    // Step 6: Test exact query from chat context
    console.log('\n🎯 Testing exact chat context query...')
    const { data: contextConversations, error: contextError } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations!inner(id, title, status, created_at, updated_at)
      `)
      .eq('user_id', authData.user.id)

    if (contextError) {
      console.error('❌ Context query error:', contextError)
    } else {
      console.log(`✅ Context query found ${contextConversations?.length || 0} conversations:`)
      contextConversations?.forEach(conv => {
        console.log(`  - ${conv.conversations.id}: ${conv.conversations.title || 'Untitled'} (${conv.conversations.status})`)
      })
    }

  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

debugUIAuth()
