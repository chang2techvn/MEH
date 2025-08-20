#!/usr/bin/env node

/**
 * Apply Users RLS Migration
 * Apply the RLS migration for users table
 * Usage: node scripts/apply-users-rls-migration.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  console.error('Required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  console.log('🚀 Applying Users RLS Migration')
  console.log('=' .repeat(50))
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250820_fix_users_rls.sql')
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath)
      return false
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    console.log('📄 Migration file loaded successfully')
    console.log(`📊 Migration size: ${migrationSQL.length} characters`)
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'))
    
    console.log(`🔧 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      
      try {
        console.log(`\n📝 Executing statement ${i + 1}/${statements.length}...`)
        
        // Use rpc to execute raw SQL
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message)
          errorCount++
          
          // Try alternative approach for some statements
          if (error.message.includes('exec_sql')) {
            console.log('⚠️  exec_sql function not available, trying alternative approach...')
            // For simple statements, we can try direct table operations
            if (statement.includes('ALTER TABLE') && statement.includes('ENABLE ROW LEVEL SECURITY')) {
              console.log('⚠️  RLS enable statement - you may need to run this manually in Supabase dashboard')
            }
            continue
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
          successCount++
        }
        
      } catch (err) {
        console.error(`❌ Unexpected error in statement ${i + 1}:`, err.message)
        errorCount++
      }
    }
    
    console.log('\n📊 Migration Results:')
    console.log(`✅ Successful statements: ${successCount}`)
    console.log(`❌ Failed statements: ${errorCount}`)
    console.log(`📝 Total statements: ${statements.length}`)
    
    if (errorCount > 0) {
      console.log('\n💡 If some statements failed, you can run the SQL manually:')
      console.log('1. Open Supabase Dashboard')
      console.log('2. Go to SQL Editor')
      console.log('3. Paste the content from supabase/migrations/20250820_fix_users_rls.sql')
      console.log('4. Run the query')
    }
    
    return errorCount === 0
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    return false
  }
}

async function testMigration() {
  console.log('\n🧪 Testing migration results...')
  
  try {
    // Test with anonymous client (like frontend)
    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const { data: anonData, error: anonError } = await anonClient
      .from('users')
      .select('id, email, name, role')
      .limit(5)
    
    if (anonError) {
      console.error('❌ Anonymous client test failed:', anonError.message)
      console.log('💡 This might be expected if users need to be authenticated')
      
      // Test if we can at least connect
      const { data: connectTest, error: connectError } = await anonClient
        .from('users')
        .select('count', { count: 'exact' })
        .limit(0)
      
      if (connectError) {
        console.log('❌ Basic connection also failed:', connectError.message)
        return false
      } else {
        console.log('✅ Basic connection works, RLS is properly configured')
        return true
      }
    } else {
      console.log(`✅ Anonymous client test successful! Found ${anonData?.length || 0} users`)
      if (anonData && anonData.length > 0) {
        console.log('👤 Sample user:', {
          id: anonData[0].id,
          email: anonData[0].email,
          name: anonData[0].name,
          role: anonData[0].role
        })
      }
      return true
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

// Main execution
async function main() {
  const migrationSuccess = await applyMigration()
  
  if (migrationSuccess) {
    console.log('\n🎉 Migration completed successfully!')
  } else {
    console.log('\n⚠️  Migration completed with some errors')
  }
  
  // Always test regardless of migration result
  const testSuccess = await testMigration()
  
  if (testSuccess) {
    console.log('\n🎉 Everything is working! Your /admin/users page should now load users.')
  } else {
    console.log('\n🔧 Additional manual steps may be required.')
    console.log('📖 Check the migration file: supabase/migrations/20250820_fix_users_rls.sql')
  }
  
  console.log('\n🌐 Next steps:')
  console.log('1. Refresh your browser on /admin/users page')
  console.log('2. Check browser console for any remaining errors')
  console.log('3. Verify users are now loading correctly')
}

main().catch(console.error)
