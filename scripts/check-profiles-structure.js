import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkProfilesStructure() {
  console.log('🔍 Checking profiles table structure...')
  
  try {
    // Just try to select from profiles to see what columns exist
    const { data: sampleProfiles, error: sampleError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (sampleError) {
      console.error('❌ Sample profiles error:', sampleError)
    } else {
      console.log('\n📋 Sample profile record structure:')
      if (sampleProfiles.length > 0) {
        console.log('Columns found:')
        Object.keys(sampleProfiles[0]).forEach(key => {
          console.log(`  - ${key}: ${typeof sampleProfiles[0][key]} = ${sampleProfiles[0][key]}`)
        })
      } else {
        console.log('No profiles found, let me try to get all profiles...')
        
        const { data: allProfiles, error: allError } = await supabase
          .from('profiles')
          .select('*')
        
        if (allError) {
          console.error('❌ All profiles error:', allError)
        } else {
          console.log(`Found ${allProfiles.length} profiles`)
          if (allProfiles.length > 0) {
            console.log('First profile structure:')
            Object.keys(allProfiles[0]).forEach(key => {
              console.log(`  - ${key}: ${typeof allProfiles[0][key]} = ${allProfiles[0][key]}`)
            })
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking profiles structure:', error)
  }
}

checkProfilesStructure()
