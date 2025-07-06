const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vbwrqgpdswfxgflxmlxs.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid3JxZ3Bkc3dmeGdmbHhtbHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NzQ5NjMsImV4cCI6MjA1MTM1MDk2M30.LKKe8eM7wHTd1MdCqVqSwpLUOgX2wUr_YKR3DLLywmY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUserAvatars() {
  console.log('🔍 Checking user avatars from profiles table...\n')

  try {
    // Get all users with their profiles
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        profiles!inner(
          full_name,
          username,
          avatar_url
        )
      `)
      .limit(10)

    if (error) {
      console.error('❌ Error fetching users:', error)
      return
    }

    if (!users || users.length === 0) {
      console.log('⚠️ No users found')
      return
    }

    console.log(`📊 Found ${users.length} users:\n`)

    users.forEach((user, index) => {
      const profile = user.profiles?.[0]
      console.log(`${index + 1}. User ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Name: ${profile?.full_name || profile?.username || 'No name'}`)
      console.log(`   Avatar URL: ${profile?.avatar_url || 'No avatar'}`)
      console.log('   ---')
    })

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

checkUserAvatars()
