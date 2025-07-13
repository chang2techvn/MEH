import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkProfilesStructure() {
  console.log('🔍 Checking profiles table structure...')
  
  try {
    // Try to get some sample data from profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Error accessing profiles table:', error.message)
      return
    }
    
    console.log('✅ Profiles table exists')
    
    if (data && data.length > 0) {
      console.log('Sample profile structure:', JSON.stringify(data[0], null, 2))
      console.log('Available columns:', Object.keys(data[0]))
    } else {
      console.log('🔍 No profiles found, checking table columns...')
      
      // Try different common column names
      const testColumns = ['id', 'user_id', 'username', 'display_name', 'full_name', 'avatar_url', 'created_at']
      
      for (const column of testColumns) {
        try {
          const { data: columnData, error: columnError } = await supabase
            .from('profiles')
            .select(column)
            .limit(1)
          
          if (!columnError) {
            console.log(`✅ Column "${column}" exists`)
          } else {
            console.log(`❌ Column "${column}" not found`)
          }
        } catch (e) {
          console.log(`❌ Column "${column}" not found`)
        }
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkProfilesStructure()
