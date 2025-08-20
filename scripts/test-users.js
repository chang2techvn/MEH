#!/usr/bin/env node

/**
 * Test Users Script
 * Test users table connectivity and data retrieval
 * Usage: node scripts/test-users.js
 * 
 * This script will:
 * 1. Test Supabase connection
 * 2. Check users table structure
 * 3. Fetch users with profiles
 * 4. Test the same query used by useUsers hook
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔧 Environment Check:')
console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing')
console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ Missing Supabase configuration. Please check your .env file.')
  console.error('Required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create admin client (with service role key)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Create regular client (like in the app)
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Test basic connection
 */
async function testConnection() {
  console.log('\n🔗 Testing Supabase connection...')
  
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count', { count: 'exact' })
      .limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Connection successful')
    console.log(`📊 Total users count: ${data?.length || 0}`)
    return true
  } catch (error) {
    console.error('❌ Unexpected connection error:', error.message)
    return false
  }
}

/**
 * Test table structure
 */
async function testTableStructure() {
  console.log('\n📋 Testing users table structure...')
  
  try {
    // Get first user to see structure
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Table structure test failed:', error.message)
      return false
    }
    
    if (data && data.length > 0) {
      console.log('✅ Users table accessible')
      console.log('📝 Sample user structure:')
      console.log(JSON.stringify(data[0], null, 2))
    } else {
      console.log('⚠️  Users table is empty')
    }
    
    return true
  } catch (error) {
    console.error('❌ Unexpected table structure error:', error.message)
    return false
  }
}

/**
 * Test the exact query used by useUsers hook
 */
async function testUsersHookQuery() {
  console.log('\n🎯 Testing useUsers hook query (with admin client)...')
  
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        name,
        email,
        created_at,
        last_active,
        last_login,
        account_status,
        role,
        level,
        streak_days,
        points,
        experience_points,
        profiles(*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ useUsers hook query failed (admin):', error.message)
      console.error('Error details:', error)
      return false
    }
    
    console.log('✅ useUsers hook query successful (admin)')
    console.log(`📊 Users found: ${data?.length || 0}`)
    
    if (data && data.length > 0) {
      console.log('👤 First user sample:')
      console.log(JSON.stringify(data[0], null, 2))
    }
    
    return data
  } catch (error) {
    console.error('❌ Unexpected useUsers hook query error (admin):', error.message)
    return false
  }
}

/**
 * Test with anon client (like in frontend)
 */
async function testWithAnonClient() {
  console.log('\n🔒 Testing with anonymous client (like frontend)...')
  
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select(`
        id,
        name,
        email,
        created_at,
        last_active,
        last_login,
        account_status,
        role,
        level,
        streak_days,
        points,
        experience_points,
        profiles(*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Anonymous client query failed:', error.message)
      console.error('Error details:', error)
      console.log('\n💡 This might be a RLS (Row Level Security) issue')
      console.log('   The frontend app might not have permission to read users table')
      return false
    }
    
    console.log('✅ Anonymous client query successful')
    console.log(`📊 Users found with anon client: ${data?.length || 0}`)
    
    return true
  } catch (error) {
    console.error('❌ Unexpected anonymous client error:', error.message)
    return false
  }
}

/**
 * Check RLS policies
 */
async function checkRLSPolicies() {
  console.log('\n🛡️  Checking RLS policies for users table...')
  
  try {
    const { data, error } = await supabaseAdmin
      .rpc('get_table_policies', { table_name: 'users' })
    
    if (error) {
      console.log('⚠️  Could not fetch RLS policies:', error.message)
      return
    }
    
    if (data && data.length > 0) {
      console.log('📋 RLS Policies found:')
      data.forEach(policy => {
        console.log(`- ${policy.policyname}: ${policy.cmd} for ${policy.roles}`)
      })
    } else {
      console.log('⚠️  No RLS policies found for users table')
    }
  } catch (error) {
    console.log('⚠️  RLS policy check not available:', error.message)
  }
}

/**
 * Test profiles table
 */
async function testProfilesTable() {
  console.log('\n👥 Testing profiles table...')
  
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('❌ Profiles table test failed:', error.message)
      return false
    }
    
    console.log('✅ Profiles table accessible')
    console.log(`📊 Sample profiles found: ${data?.length || 0}`)
    
    if (data && data.length > 0) {
      console.log('👤 First profile sample:')
      console.log(JSON.stringify(data[0], null, 2))
    }
    
    return true
  } catch (error) {
    console.error('❌ Unexpected profiles table error:', error.message)
    return false
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🧪 Starting Users Table Test Suite')
  console.log('=' .repeat(50))
  
  const results = {
    connection: false,
    tableStructure: false,
    usersQuery: false,
    anonClient: false,
    profilesTable: false
  }
  
  // Test connection
  results.connection = await testConnection()
  
  if (!results.connection) {
    console.log('\n❌ Basic connection failed. Cannot proceed with other tests.')
    return results
  }
  
  // Test table structure
  results.tableStructure = await testTableStructure()
  
  // Test profiles table
  results.profilesTable = await testProfilesTable()
  
  // Test useUsers hook query with admin
  const usersData = await testUsersHookQuery()
  results.usersQuery = !!usersData
  
  // Test with anon client
  results.anonClient = await testWithAnonClient()
  
  // Check RLS policies
  await checkRLSPolicies()
  
  // Summary
  console.log('\n📊 Test Results Summary:')
  console.log('=' .repeat(50))
  console.log(`🔗 Connection: ${results.connection ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`📋 Table Structure: ${results.tableStructure ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`👥 Profiles Table: ${results.profilesTable ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`🎯 Users Query (Admin): ${results.usersQuery ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`🔒 Anonymous Client: ${results.anonClient ? '✅ PASS' : '❌ FAIL'}`)
  
  if (!results.anonClient && results.usersQuery) {
    console.log('\n💡 Issue Identified:')
    console.log('   ✅ Database connection works')
    console.log('   ✅ Users table has data') 
    console.log('   ❌ Frontend cannot access users table (RLS issue)')
    console.log('\n🔧 Recommended Solutions:')
    console.log('   1. Check RLS policies on users table')
    console.log('   2. Add policy to allow authenticated users to read users table')
    console.log('   3. Or disable RLS temporarily for testing')
  }
  
  return results
}

// Run tests
runTests().catch(console.error)
