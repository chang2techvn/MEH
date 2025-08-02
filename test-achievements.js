// Test script to check achievements system
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yvsjynosfwyhvisqhasp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2c2p5bm9zZnd5aHZpc3FoYXNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk4NzYzMzMsImV4cCI6MjAzNTQ1MjMzM30.c1s2wJmRrUFnDWYPmVXONFLNevQRwXjHjbpOB0-WUVY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAchievements() {
  console.log('🎯 Testing achievements system...')
  
  // Test getting achievements for a user
  try {
    console.log('📊 Testing get_user_achievements...')
    
    // Get current user first
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.log('❌ No authenticated user found')
      return
    }
    
    console.log('👤 Testing for user:', user.id)
    
    const { data, error } = await supabase
      .rpc('get_user_achievements', { user_id_param: user.id })
    
    if (error) {
      console.error('❌ Error:', error)
      return
    }
    
    console.log('✅ Success! Got achievements:', data?.length || 0)
    console.log('🏆 Sample achievements:')
    data?.slice(0, 5).forEach(achievement => {
      console.log(`  - ${achievement.icon} ${achievement.title}: ${achievement.progress}/${achievement.requirement_value} (${achievement.is_completed ? 'Completed' : 'In Progress'})`)
    })
    
    // Test checking achievements
    console.log('🔍 Testing check_and_award_achievements...')
    
    const { data: newAchievements, error: checkError } = await supabase
      .rpc('check_and_award_achievements', { user_id_param: user.id })
    
    if (checkError) {
      console.error('❌ Check error:', checkError)
      return
    }
    
    console.log('✅ Check completed! New achievements:', newAchievements?.length || 0)
    newAchievements?.forEach(achievement => {
      console.log(`  🎉 New: ${achievement.icon} ${achievement.title}`)
    })
    
  } catch (err) {
    console.error('❌ Test failed:', err)
  }
}

// Run if this is the main module
if (require.main === module) {
  testAchievements()
}

module.exports = { testAchievements }
