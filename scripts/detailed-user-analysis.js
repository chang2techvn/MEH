import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function analyzeUsers() {
  console.log('🔍 Analyzing user state in detail...')
  
  try {
    // Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      return
    }
    
    console.log(`\n📊 Found ${authUsers.users.length} users in auth.users:`)
    authUsers.users.forEach(user => {
      console.log(`  - ID: ${user.id}, Email: ${user.email}`)
    })
    
    // Get all public users
    const { data: publicUsers, error: publicError } = await supabase
      .from('users')
      .select('*')
    
    if (publicError) {
      console.error('❌ Error fetching public users:', publicError)
      return
    }
    
    console.log(`\n📊 Found ${publicUsers.length} users in public.users:`)
    publicUsers.forEach(user => {
      console.log(`  - ID: ${user.id}, Email: ${user.email}`)
    })
    
    // Check for duplicates by email in public.users
    const emailCounts = {}
    publicUsers.forEach(user => {
      emailCounts[user.email] = (emailCounts[user.email] || 0) + 1
    })
    
    console.log('\n🔍 Email duplicates in public.users:')
    Object.entries(emailCounts).forEach(([email, count]) => {
      if (count > 1) {
        console.log(`  - ${email}: ${count} records`)
      }
    })
    
    // Check for ID mismatches
    console.log('\n🔍 ID mismatches between auth.users and public.users:')
    authUsers.users.forEach(authUser => {
      const publicUser = publicUsers.find(u => u.email === authUser.email)
      if (publicUser && publicUser.id !== authUser.id) {
        console.log(`  - Email: ${authUser.email}`)
        console.log(`    Auth ID: ${authUser.id}`)
        console.log(`    Public ID: ${publicUser.id}`)
      }
    })
    
    // Check profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError)
      return
    }
    
    console.log(`\n📊 Found ${profiles.length} profiles:`)
    profiles.forEach(profile => {
      console.log(`  - ID: ${profile.id}, Name: ${profile.name || 'No name'}`)
    })
    
  } catch (error) {
    console.error('❌ Error analyzing users:', error)
  }
}

analyzeUsers()
