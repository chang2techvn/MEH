const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yvsjynosfwyhvisqhasp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2c2p5bm9zZnd5aHZpc3FoYXNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNjE0MDIsImV4cCI6MjA2MzgzNzQwMn0.cFkFS9DaD5BCN4R34RDp3bs4kQbicq2NM6NpVASiSdY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProfileData() {
  console.log('🔍 Testing profile data fetch...\n')

  try {
    // Get all profiles with their avatars
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, full_name, avatar_url')
      .order('created_at')

    if (error) {
      console.error('Error:', error)
      return
    }

    console.log('📋 Profiles data:')
    profiles.forEach(profile => {
      console.log(`  - ${profile.full_name}`)
      console.log(`    User ID: ${profile.user_id}`)
      console.log(`    Avatar: ${profile.avatar_url}`)
      console.log('')
    })

    // Test the auth context query
    console.log('🔧 Testing auth context query for first user...')
    if (profiles.length > 0) {
      const firstUserId = profiles[0].user_id
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', firstUserId)
        .single()

      if (profileError) {
        console.error('Profile query error:', profileError)
      } else {
        console.log('✅ Profile data for auth context:', {
          user_id: profileData.user_id,
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url
        })
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testProfileData()
