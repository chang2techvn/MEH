#!/usr/bin/env node

/**
 * Quick Chat Test Script
 * Simple test for chat functionality
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  console.log('Please make sure .env.local contains:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your-url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function quickTest() {
  console.log('🚀 Quick Chat Test Starting...\n')
  
  try {
    // Test 1: Database Connection
    console.log('1️⃣ Testing database connection...')
    const { data: profiles, error: dbError } = await supabase
      .from('profiles')
      .select('id, full_name, user_id, username')
      .limit(3)
    
    if (dbError) throw new Error(`Database error: ${dbError.message}`)
    
    console.log(`✅ Database connected. Found ${profiles.length} users`)
    profiles.forEach(user => {
      console.log(`   - ${user.full_name || user.username} (ID: ${user.user_id})`)
    })
    
    // Test 2: Realtime Connection
    console.log('\n2️⃣ Testing realtime connection...')
    const realtimeTest = await new Promise((resolve) => {
      const channel = supabase
        .channel('quick-test')
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Realtime connected successfully')
            supabase.removeChannel(channel)
            resolve(true)
          } else if (status === 'CHANNEL_ERROR') {
            console.log('❌ Realtime connection failed')
            resolve(false)
          }
        })
      
      setTimeout(() => {
        console.log('⏰ Realtime connection timeout')
        supabase.removeChannel(channel)
        resolve(false)
      }, 5000)
    })
    
    // Test 3: Authentication Test
    console.log('\n3️⃣ Testing authentication...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'teacher1@university.edu',
      password: 'teacher123456'
    })
    
    if (authError) {
      console.log(`⚠️ Auth test failed: ${authError.message}`)
      console.log('   Make sure test account exists in database')
    } else {
      console.log(`✅ Authentication successful: ${authData.user.email}`)
      await supabase.auth.signOut()
    }
    
    // Test 4: Check Messages Table
    console.log('\n4️⃣ Testing messages table access...')
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('id, content, created_at')
      .limit(5)
      .order('created_at', { ascending: false })
    
    if (msgError) {
      console.log(`⚠️ Messages table error: ${msgError.message}`)
    } else {
      console.log(`✅ Messages table accessible. Found ${messages.length} recent messages`)
    }
    
    // Test 5: Check Conversations Table
    console.log('\n5️⃣ Testing conversations table access...')
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id, name, created_at')
      .limit(5)
    
    if (convError) {
      console.log(`⚠️ Conversations table error: ${convError.message}`)
    } else {
      console.log(`✅ Conversations table accessible. Found ${conversations.length} conversations`)
    }
    
    // Summary
    console.log('\n📊 Quick Test Summary:')
    console.log('='.repeat(40))
    
    const tests = [
      { name: 'Database Connection', status: profiles.length > 0 },
      { name: 'Realtime Connection', status: realtimeTest },
      { name: 'Authentication', status: !authError },
      { name: 'Messages Table', status: !msgError },
      { name: 'Conversations Table', status: !convError }
    ]
    
    tests.forEach(test => {
      const icon = test.status ? '✅' : '❌'
      console.log(`${icon} ${test.name}`)
    })
    
    const passedTests = tests.filter(t => t.status).length
    console.log(`\n🎯 Results: ${passedTests}/${tests.length} tests passed`)
    
    if (passedTests === tests.length) {
      console.log('🎉 All systems ready for chat testing!')
      console.log('   You can now run: node scripts/test-chat-realtime.js')
    } else {
      console.log('⚠️ Some issues detected. Please fix before running full tests.')
    }
    
  } catch (error) {
    console.error('❌ Quick test failed:', error.message)
    process.exit(1)
  }
}

quickTest()
