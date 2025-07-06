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

async function testLeaderboardQueryOptions() {
  console.log('🔍 Testing different leaderboard query options...')
  
  try {
    console.log('\n1️⃣ Current query (profiles as array):')
    const { data: data1, error: error1 } = await supabase
      .from('users')
      .select(`
        id, 
        points, 
        level, 
        streak_days,
        profiles!inner(full_name, avatar_url)
      `)
      .order('points', { ascending: false })
      .limit(3)
    
    if (error1) {
      console.error('❌ Error with option 1:', error1)
    } else {
      console.log('📊 Option 1 result:', JSON.stringify(data1, null, 2))
    }
    
    console.log('\n2️⃣ Alternative query (single profile join):')
    const { data: data2, error: error2 } = await supabase
      .from('users')
      .select(`
        id, 
        points, 
        level, 
        streak_days,
        profiles(full_name, avatar_url)
      `)
      .order('points', { ascending: false })
      .limit(3)
    
    if (error2) {
      console.error('❌ Error with option 2:', error2)
    } else {
      console.log('📊 Option 2 result:', JSON.stringify(data2, null, 2))
    }
    
    console.log('\n3️⃣ Alternative query (explicit single):')
    const { data: data3, error: error3 } = await supabase
      .from('users')
      .select(`
        id, 
        points, 
        level, 
        streak_days,
        profiles(*).single()
      `)
      .order('points', { ascending: false })
      .limit(3)
    
    if (error3) {
      console.error('❌ Error with option 3:', error3)
    } else {
      console.log('📊 Option 3 result:', JSON.stringify(data3, null, 2))
    }
    
  } catch (error) {
    console.error('❌ Error in test:', error)
  }
}

testLeaderboardQueryOptions()
