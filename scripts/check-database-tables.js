/**
 * Check database tables and data
 * This script will verify if all tables exist and have data
 */

const { createClient } = require('@supabase/supabase-js')

// Hardcoded values for local Supabase
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDatabaseTables() {
  console.log('🔍 Checking Database Tables and Data...\n')
  
  try {
    // Check if tables exist by trying to query them
    const tables = [
      'users',
      'conversations', 
      'conversation_participants',
      'conversation_messages',
      'profiles'
    ]
    
    for (const table of tables) {
      console.log(`📊 Checking table: ${table}`)
      
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.log(`   ❌ Error: ${error.message}`)
        } else {
          console.log(`   ✅ Table exists with ${count || 0} rows`)
        }
      } catch (err) {
        console.log(`   ❌ Table might not exist: ${err.message}`)
      }
    }
    
    console.log('\n📋 Detailed Data Check:')
    
    // Check users table in detail
    console.log('\n👥 Users table:')
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email, is_active, created_at')
        .limit(5)
      
      if (error) {
        console.log(`   ❌ Error querying users: ${error.message}`)
      } else if (users && users.length > 0) {
        console.log(`   ✅ Found ${users.length} users:`)
        users.forEach(user => {
          console.log(`      - ${user.name || user.email} (${user.id}) - Active: ${user.is_active}`)
        })
      } else {
        console.log('   ⚠️  No users found')
      }
    } catch (err) {
      console.log(`   ❌ Users table error: ${err.message}`)
    }
    
    // Check auth.users
    console.log('\n🔐 Auth users:')
    try {
      const { data: authUsers, error } = await supabase.auth.admin.listUsers()
      
      if (error) {
        console.log(`   ❌ Error querying auth users: ${error.message}`)
      } else if (authUsers && authUsers.users && authUsers.users.length > 0) {
        console.log(`   ✅ Found ${authUsers.users.length} auth users:`)
        authUsers.users.forEach(user => {
          console.log(`      - ${user.email} (${user.id}) - Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`)
        })
      } else {
        console.log('   ⚠️  No auth users found')
      }
    } catch (err) {
      console.log(`   ❌ Auth users error: ${err.message}`)
    }
    
    // Check conversations
    console.log('\n💬 Conversations table:')
    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('id, title, status, created_at')
        .limit(5)
      
      if (error) {
        console.log(`   ❌ Error querying conversations: ${error.message}`)
      } else if (conversations && conversations.length > 0) {
        console.log(`   ✅ Found ${conversations.length} conversations:`)
        conversations.forEach(conv => {
          console.log(`      - ${conv.title} (${conv.id}) - Status: ${conv.status}`)
        })
      } else {
        console.log('   ⚠️  No conversations found')
      }
    } catch (err) {
      console.log(`   ❌ Conversations table error: ${err.message}`)
    }
    
    // Check messages
    console.log('\n📨 Conversation Messages table:')
    try {
      const { data: messages, error } = await supabase
        .from('conversation_messages')
        .select('id, conversation_id, sender_id, content, created_at')
        .limit(5)
      
      if (error) {
        console.log(`   ❌ Error querying conversation_messages: ${error.message}`)
      } else if (messages && messages.length > 0) {
        console.log(`   ✅ Found ${messages.length} messages:`)
        messages.forEach(msg => {
          console.log(`      - ${msg.content?.substring(0, 30)}... (${msg.id}) - Conv: ${msg.conversation_id}`)
        })
      } else {
        console.log('   ⚠️  No messages found')
      }
    } catch (err) {
      console.log(`   ❌ Conversation Messages table error: ${err.message}`)
    }
    
    // Check table schemas
    console.log('\n🏗️  Checking Table Schemas:')
    
    // Check if we can describe tables
    try {
      const { data: userColumns } = await supabase
        .rpc('get_table_columns', { table_name: 'users' })
        .single()
      
      if (userColumns) {
        console.log('   ✅ Users table schema accessible')
      }
    } catch (err) {
      console.log('   ⚠️  Cannot access table schema info')
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message)
  }
}

// Run the check
checkDatabaseTables().then(() => {
  console.log('\n✅ Database check completed!')
}).catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
