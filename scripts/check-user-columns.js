/**
 * Quick script to check if posts table has username and user_image columns
 */

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkUserColumns() {
  console.log('🔍 Checking for username and user_image columns in posts table...')
  
  const columnsToCheck = ['username', 'user_image']
  
  for (const column of columnsToCheck) {
    try {
      const { error } = await supabase
        .from('posts')
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
}

checkUserColumns()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
