import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvsjynosfwyhvisqhasp.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2c2p5bm9zZnd5aHZpc3FoYXNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI2MTQwMiwiZXhwIjoyMDYzODM3NDAyfQ.nF-6Rpj5NZdVH1R0pN4Wm2VSJRF0GaPfAlgPvwezMoc'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Sample avatar URLs from various sources
const sampleAvatars = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b612b5e4?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&h=150&fit=crop&crop=face'
]

async function addRealAvatars() {
  console.log('🎨 Adding real avatar URLs to user profiles...\n')

  try {
    // Get all profiles
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('user_id, full_name, avatar_url')
      .order('created_at')

    if (fetchError) {
      console.error('Error fetching profiles:', fetchError)
      return
    }

    console.log(`Found ${profiles.length} profiles to update:`)
    
    // Update each profile with a random avatar
    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i]
      const avatarUrl = sampleAvatars[i % sampleAvatars.length]
      
      console.log(`Updating ${profile.full_name} with avatar: ${avatarUrl}`)
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', profile.user_id)

      if (updateError) {
        console.error(`Error updating profile ${profile.user_id}:`, updateError)
      } else {
        console.log(`✅ Updated ${profile.full_name}`)
      }
    }

    // Also update the users table
    console.log('\n📝 Updating users table...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name')
      .order('created_at')

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return
    }

    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      const avatarUrl = sampleAvatars[i % sampleAvatars.length]
      
      console.log(`Updating user ${user.full_name} with avatar: ${avatarUrl}`)
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id)

      if (updateError) {
        console.error(`Error updating user ${user.id}:`, updateError)
      } else {
        console.log(`✅ Updated user ${user.full_name}`)
      }
    }

    console.log('\n🎉 All avatars updated successfully!')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

addRealAvatars()
