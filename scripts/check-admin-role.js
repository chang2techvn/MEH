const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkAndSetAdminRole() {
  try {
    console.log('🔍 Checking users in database...')
    
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return
    }
    
    console.log(`📋 Found ${users.length} users:`)
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - Role: ${user.role || 'null'} - ID: ${user.id}`)
    })
    
    // Check if any user has admin role
    const adminUsers = users.filter(user => user.role === 'admin')
    console.log(`👑 Admin users: ${adminUsers.length}`)
    
    if (adminUsers.length === 0) {
      console.log('⚠️  No admin users found!')
      
      if (users.length > 0) {
        const firstUser = users[0]
        console.log(`🔧 Setting first user as admin: ${firstUser.email}`)
        
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('id', firstUser.id)
          .select()
        
        if (updateError) {
          console.error('❌ Error updating user role:', updateError)
        } else {
          console.log('✅ Successfully set admin role for:', firstUser.email)
          console.log('Updated user:', updatedUser[0])
        }
      }
    } else {
      console.log('✅ Admin users already exist:', adminUsers.map(u => u.email))
    }
    
  } catch (error) {
    console.error('💥 Script error:', error)
  }
}

checkAndSetAdminRole()
