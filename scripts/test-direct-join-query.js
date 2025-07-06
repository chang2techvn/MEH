const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase URL or Anon Key in .env.local')
  process.exit(1)
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDirectJoinQuery() {
  console.log('🔍 Testing direct join approach...')
  
  try {
    // Option: Start from profiles and join users
    console.log('\n4️⃣ Starting from profiles table and joining users:')
    const { data: data4, error: error4 } = await supabase
      .from('profiles')
      .select(`
        full_name,
        avatar_url,
        users!inner(id, points, level, streak_days)
      `)
      .order('users.points', { foreignTable: 'users', ascending: false })
      .limit(3)
    
    if (error4) {
      console.error('❌ Error with option 4:', error4)
    } else {
      console.log('📊 Option 4 result:', JSON.stringify(data4, null, 2))
      
      // Transform this to match our expected format
      const transformed = data4.map((profile, index) => ({
        id: profile.users[0].id,
        name: profile.full_name,
        avatar: profile.avatar_url,
        rank: index + 1,
        points: profile.users[0].points,
        level: profile.users[0].level,
        streak: profile.users[0].streak_days
      }))
      
      console.log('📊 Transformed option 4:', JSON.stringify(transformed, null, 2))
    }
    
  } catch (error) {
    console.error('❌ Error in test:', error)
  }
}

testDirectJoinQuery()
