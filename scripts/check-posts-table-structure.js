/**
 * Script to check the structure of the 'posts' table in Supabase
 * This will help us understand what columns are available
 */

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkPostsTableStructure() {
  console.log('🔍 Checking posts table structure...')
  console.log('📊 Supabase URL:', supabaseUrl)
  
  try {
    // Method 1: Try to get table info from information_schema
    console.log('\n📋 Method 1: Checking table columns via information_schema...')
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'posts' })
      .select()
    
    if (columnsError) {
      console.log('⚠️ RPC method failed:', columnsError.message)
    } else {
      console.log('✅ Table columns (via RPC):', columns)
    }

    // Method 2: Try to select from posts table with limit 0 to see structure
    console.log('\n📋 Method 2: Checking via SELECT with LIMIT 0...')
    const { data: emptyData, error: selectError } = await supabase
      .from('posts')
      .select('*')
      .limit(0)
    
    if (selectError) {
      console.log('❌ Select error:', selectError)
    } else {
      console.log('✅ Empty select successful, columns exist')
    }

    // Method 3: Try to get a few rows to see actual data structure
    console.log('\n📋 Method 3: Getting sample data...')
    const { data: sampleData, error: sampleError } = await supabase
      .from('posts')
      .select('*')
      .limit(3)
    
    if (sampleError) {
      console.log('❌ Sample data error:', sampleError)
    } else {
      console.log('✅ Sample data count:', sampleData?.length || 0)
      if (sampleData && sampleData.length > 0) {
        console.log('📝 Sample post structure:')
        const firstPost = sampleData[0]
        Object.keys(firstPost).forEach(key => {
          console.log(`  - ${key}: ${typeof firstPost[key]} (${firstPost[key]})`)
        })
      }
    }

    // Method 4: Check if table exists by trying different column names
    console.log('\n📋 Method 4: Testing specific columns...')
    
    const columnsToTest = [
      'id',
      'user_id', 
      'author_id',
      'content',
      'title',
      'type',
      'media_type',
      'media_url',
      'created_at',
      'updated_at',
      'likes_count',
      'comments_count'
    ]

    for (const column of columnsToTest) {
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

    // Method 5: List all tables to see if 'posts' exists
    console.log('\n📋 Method 5: Checking available tables...')
    try {
      // Try to get some table that should exist
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
      
      if (tablesError) {
        console.log('⚠️ Could not list tables:', tablesError.message)
      } else {
        console.log('📊 Available tables:', tables?.map(t => t.table_name))
      }
    } catch (err) {
      console.log('💥 Error listing tables:', err.message)
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

// Run the check
checkPostsTableStructure()
  .then(() => {
    console.log('\n✅ Posts table structure check completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
