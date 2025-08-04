const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkCurrentSessions() {
  try {
    console.log('🔍 Checking active auth sessions...')
    
    // Get all active sessions from auth.sessions table (if accessible)
    const { data: sessions, error: sessionsError } = await supabase.auth.admin.listUsers()
    
    if (sessionsError) {
      console.error('❌ Error fetching sessions:', sessionsError)
      return
    }
    
    console.log(`📋 Found ${sessions.users.length} total auth users:`)
    
    for (const user of sessions.users) {
      console.log(`\n👤 Auth User: ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Last sign in: ${user.last_sign_in_at}`)
      console.log(`   Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`)
      
      // Find corresponding user in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (userError) {
        console.log(`   ⚠️  No profile in users table: ${userError.message}`)
      } else {
        console.log(`   📝 Profile: ${userData.full_name || 'No name'} - Role: ${userData.role || 'null'}`)
      }
    }
    
  } catch (error) {
    console.error('💥 Script error:', error)
  }
}

checkCurrentSessions()
