#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function resetTeacherPassword() {
  console.log('🔑 Resetting teacher1 password...\n')

  try {
    // Reset password for teacher1
    const { data, error } = await supabase.auth.admin.updateUserById(
      '4bfefa38-468c-441b-9181-4f4e433236b7', // teacher1 ID from previous output
      { password: 'teacher123' }
    )

    if (error) {
      console.error('❌ Error resetting password:', error)
    } else {
      console.log('✅ Password reset successfully for teacher1@university.edu')
      console.log('New password: teacher123')
    }

  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

resetTeacherPassword()
