#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const anonSupabase = createClient(supabaseUrl, supabaseAnonKey)
const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugOtherParticipants() {
  console.log('🔍 Debugging other participants query...\n')

  try {
    // Step 1: Login as teacher1
    console.log('🔑 Logging in as teacher1@university.edu...')
    const { data: authData, error: authError } = await anonSupabase.auth.signInWithPassword({
      email: 'teacher1@university.edu',
      password: 'teacher123'
    })

    if (authError) {
      console.error('❌ Auth error:', authError)
      return
    }

    const teacherId = authData.user.id
    console.log(`✅ Logged in. Teacher ID: ${teacherId}`)

    // Step 2: Test other participants query for each conversation
    const conversationIds = [
      '60931444-0d0e-4a4c-aaed-d53713f283fc',
      '9a95cbb3-e587-428c-bd34-d7d5d4b2c180', 
      '24750521-2499-4a6f-b694-f9a257c6e9fc'
    ]

    for (const convId of conversationIds) {
      console.log(`\n📞 Testing conversation: ${convId}`)
      
      // Test with anon client (what UI uses)
      console.log('🔍 With anon client (UI perspective):')
      const { data: anonParticipants, error: anonError } = await anonSupabase
        .from('conversation_participants')
        .select(`
          user_id,
          role,
          user:users!user_id(id, name, avatar, last_active)
        `)
        .eq('conversation_id', convId)
        .neq('user_id', teacherId)

      if (anonError) {
        console.error('❌ Anon query error:', anonError)
      } else {
        console.log(`✅ Anon found ${anonParticipants?.length || 0} other participants:`)
        anonParticipants?.forEach(p => {
          console.log(`  - ${p.user?.name || 'Unknown'} (${p.user?.id})`)
        })
      }

      // Test with service client (bypasses RLS)
      console.log('🔍 With service client (admin perspective):')
      const { data: serviceParticipants, error: serviceError } = await serviceSupabase
        .from('conversation_participants')
        .select(`
          user_id,
          role,
          user:users!user_id(id, name, avatar, last_active)
        `)
        .eq('conversation_id', convId)
        .neq('user_id', teacherId)

      if (serviceError) {
        console.error('❌ Service query error:', serviceError)
      } else {
        console.log(`✅ Service found ${serviceParticipants?.length || 0} other participants:`)
        serviceParticipants?.forEach(p => {
          console.log(`  - ${p.user?.name || 'Unknown'} (${p.user?.id})`)
        })
      }

      // Check all participants in conversation (service client)
      console.log('👥 All participants in conversation:')
      const { data: allParticipants, error: allError } = await serviceSupabase
        .from('conversation_participants')
        .select(`
          user_id,
          role,
          users!inner(id, name, email, role)
        `)
        .eq('conversation_id', convId)

      if (allError) {
        console.error('❌ All participants error:', allError)
      } else {
        console.log(`✅ Total ${allParticipants?.length || 0} participants:`)
        allParticipants?.forEach(p => {
          console.log(`  - ${p.users.name} (${p.users.email}) - Role: ${p.users.role}`)
        })
      }
    }

  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

debugOtherParticipants()
