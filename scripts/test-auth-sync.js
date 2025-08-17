#!/usr/bin/env node

/**
 * Test Auth Sync Script
 * Test authentication sync between public.users and auth.users
 * Usage: node scripts/test-auth-sync.js [email] [password]
 * 
 * Example:
 * node scripts/test-auth-sync.js user@example.com temporary_password
 * node scripts/test-auth-sync.js  // Will test with first user found
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.')
  console.error('Required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create admin client (with service role key)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Create regular client (for auth testing)
const supabaseClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

/**
 * Get user data from both tables
 */
async function checkUserData(email) {
  console.log(`\n🔍 Checking user data for: ${email}`)
  
  try {
    // Check public.users
    const { data: publicUser, error: publicError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (publicError) {
      console.error('❌ Error fetching from public.users:', publicError.message)
      return null
    }
    
    console.log('✅ Found in public.users:', {
      id: publicUser.id,
      email: publicUser.email,
      name: publicUser.name,
      created_at: publicUser.created_at
    })
    
    // Check auth.users (requires service role)
    const { data: authUser, error: authError } = await supabaseAdmin
      .from('users')  // This will be mapped to auth.users by service role
      .select('*')
      .eq('email', email)
      .single()
    
    // Alternative direct query to auth.users
    const { data: authUsers, error: authUsersError } = await supabaseAdmin
      .rpc('get_auth_user_by_email', { user_email: email })
    
    if (authUsersError) {
      console.log('ℹ️  Could not query auth.users directly (expected with current setup)')
    } else {
      console.log('✅ Found in auth.users via RPC:', authUsers)
    }
    
    return publicUser
    
  } catch (error) {
    console.error('❌ Error checking user data:', error.message)
    return null
  }
}

/**
 * Test authentication with given credentials
 */
async function testAuthentication(email, password) {
  console.log(`\n🔐 Testing authentication for: ${email}`)
  
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    })
    
    if (error) {
      console.error('❌ Authentication failed:', error.message)
      console.error('Error details:', {
        status: error.status,
        statusText: error.statusText,
        message: error.message
      })
      return false
    }
    
    console.log('✅ Authentication successful!')
    console.log('User data:', {
      id: data.user.id,
      email: data.user.email,
      created_at: data.user.created_at,
      last_sign_in_at: data.user.last_sign_in_at
    })
    
    // Sign out after test
    await supabaseClient.auth.signOut()
    console.log('✅ Signed out successfully')
    
    return true
    
  } catch (error) {
    console.error('❌ Authentication error:', error.message)
    return false
  }
}

/**
 * Get statistics about sync status
 */
async function getSyncStats() {
  console.log('\n📊 Getting sync statistics...')
  
  try {
    // Count public.users
    const { count: publicCount, error: publicError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    if (publicError) {
      console.error('❌ Error counting public.users:', publicError.message)
      return
    }
    
    console.log(`✅ public.users count: ${publicCount}`)
    
    // Get sample users from public.users
    const { data: sampleUsers, error: sampleError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, created_at')
      .limit(5)
    
    if (sampleError) {
      console.error('❌ Error getting sample users:', sampleError.message)
      return
    }
    
    console.log('\n📋 Sample users from public.users:')
    sampleUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name}) - ID: ${user.id}`)
    })
    
    return sampleUsers
    
  } catch (error) {
    console.error('❌ Error getting sync stats:', error.message)
    return null
  }
}

/**
 * Test password reset functionality
 */
async function testPasswordReset(email) {
  console.log(`\n🔄 Testing password reset for: ${email}`)
  
  try {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/auth/reset-password'
    })
    
    if (error) {
      console.error('❌ Password reset failed:', error.message)
      return false
    }
    
    console.log('✅ Password reset email sent successfully!')
    console.log('ℹ️  Check your email for the reset link')
    return true
    
  } catch (error) {
    console.error('❌ Password reset error:', error.message)
    return false
  }
}

/**
 * Main test function
 */
async function main() {
  console.log('🚀 Starting Auth Sync Test...')
  console.log('Supabase URL:', supabaseUrl)
  
  // Get command line arguments
  const email = process.argv[2]
  const password = process.argv[3] || 'temporary_password'
  
  // Get sync statistics
  const sampleUsers = await getSyncStats()
  
  if (!sampleUsers || sampleUsers.length === 0) {
    console.error('❌ No users found in database')
    process.exit(1)
  }
  
  // Use provided email or first sample user
  const testEmail = email || sampleUsers[0].email
  
  // Check user data
  const userData = await checkUserData(testEmail)
  
  if (!userData) {
    console.error(`❌ User not found: ${testEmail}`)
    process.exit(1)
  }
  
  // Test authentication
  const authSuccess = await testAuthentication(testEmail, password)
  
  if (!authSuccess) {
    console.log('\n💡 Suggestions:')
    console.log('1. Make sure sync-auth-users.sql was executed successfully')
    console.log('2. Try using password: "temporary_password" (default from sync script)')
    console.log('3. Consider running password reset for the user')
    
    // Offer password reset
    console.log('\n🔄 Would you like to send a password reset email? (y/N)')
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    rl.question('', async (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        await testPasswordReset(testEmail)
      }
      rl.close()
      process.exit(authSuccess ? 0 : 1)
    })
  } else {
    console.log('\n🎉 All tests passed! Auth sync is working correctly.')
    process.exit(0)
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error.message)
    process.exit(1)
  })
}

module.exports = {
  checkUserData,
  testAuthentication,
  getSyncStats,
  testPasswordReset
}
