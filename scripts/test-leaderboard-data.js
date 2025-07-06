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

async function testLeaderboardData() {
  console.log('🔍 Testing leaderboard data...')
  
  try {
    // Test the exact query from getLeaderboard
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, 
        points, 
        level, 
        streak_days,
        profiles!inner(full_name, avatar_url)
      `)
      .order('points', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('❌ Error fetching leaderboard:', error)
      return
    }
    
    console.log('📊 Raw leaderboard data:', JSON.stringify(data, null, 2))
    
    // Test transformation like in useLeaderboard (FIXED VERSION)
    const transformedData = data.map((user, index) => ({
      id: user.id,
      name: user.profiles?.[0]?.full_name || 'Unknown User',
      avatar: user.profiles?.[0]?.avatar_url,
      rank: index + 1,
      points: user.points || 0,
      level: user.level || 'Beginner',
      streak: user.streak_days || 0
    }))
    
    console.log('📊 Transformed leaderboard data:', JSON.stringify(transformedData, null, 2))
    
  } catch (error) {
    console.error('❌ Error in test:', error)
  }
}

testLeaderboardData()
