#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAuth() {
  console.log('🔍 Checking auth system...\n')

  try {
    // Check auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
    } else {
      console.log(`👥 Found ${authUsers.users?.length || 0} auth users:`)
      authUsers.users?.forEach(user => {
        console.log(`  - ${user.email} (${user.id}) - ${user.email_confirmed_at ? 'Confirmed' : 'Not confirmed'}`)
      })
    }

    // Check public users table
    const { data: publicUsers, error: publicError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'teacher1@university.edu')

    if (publicError) {
      console.error('❌ Error fetching public users:', publicError)
    } else {
      console.log(`\n📝 Teacher1 in public users table:`)
      console.log(publicUsers)
    }

  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

checkAuth()
