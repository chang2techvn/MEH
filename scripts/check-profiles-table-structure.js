/**
 * Script to check the structure of the 'profiles' table in Supabase
 */

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkProfilesTableStructure() {
  console.log('🔍 Checking profiles table structure...')
  
  try {
    // Get sample data to see structure
    console.log('\n📋 Getting sample profiles data...')
    const { data: sampleData, error: sampleError } = await supabase
      .from('profiles')
      .select('*')
      .limit(3)
    
    if (sampleError) {
      console.log('❌ Sample data error:', sampleError)
    } else {
      console.log('✅ Sample data count:', sampleData?.length || 0)
      if (sampleData && sampleData.length > 0) {
        console.log('📝 Sample profile structure:')
        const firstProfile = sampleData[0]
        Object.keys(firstProfile).forEach(key => {
          console.log(`  - ${key}: ${typeof firstProfile[key]} (${firstProfile[key]})`)
        })
      }
    }

    // Test specific columns
    console.log('\n📋 Testing specific columns...')
    
    const columnsToTest = [
      'id',
      'user_id',
      'uid', 
      'full_name',
      'username',
      'avatar_url',
      'created_at',
      'updated_at'
    ]

    for (const column of columnsToTest) {
      try {
        const { error } = await supabase
          .from('profiles')
          .select(column)
          .limit(1)
        
        if (error) {
          console.log(`❌ Column '${column}': ${error.message}`)
        } else {
          console.log(`✅ Column '${column}': EXISTS`)
        }
      } catch (err) {
        console.log(`💥 Column '${column}': ERROR - ${err.message}`)
      }
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

// Run the check
checkProfilesTableStructure()
  .then(() => {
    console.log('\n✅ Profiles table structure check completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
