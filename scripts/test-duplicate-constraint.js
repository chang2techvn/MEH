#!/usr/bin/env node

/**
 * Quick test to reproduce the duplicate constraint issue
 */

const { config } = require('dotenv')
config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testDuplicateConstraint() {
  console.log('🧪 Testing Duplicate Constraint Issue')
  console.log('====================================')
  
  // Test data
  const testVideoUrl = 'https://www.youtube.com/watch?v=TEST_DUPLICATE_123'
  const testUserId = '13df7bf1-d38f-4b58-b444-3dfa67e04f17'
  const today = new Date().toISOString().split('T')[0]
  
  console.log('📅 Date:', today)
  console.log('📹 Test URL:', testVideoUrl)
  console.log('👤 User:', testUserId)
  console.log('')
  
  try {
    // First attempt - should succeed
    console.log('1️⃣ Creating first user-generated challenge...')
    const challenge1 = {
      title: 'Test Challenge 1',
      description: 'Test description',
      video_url: testVideoUrl,
      thumbnail_url: 'https://img.youtube.com/vi/TEST/maxresdefault.jpg',
      embed_url: 'https://www.youtube.com/embed/TEST',
      duration: 300,
      topics: ['test'],
      transcript: 'Test transcript content goes here.',
      challenge_type: 'user_generated',
      difficulty: 'intermediate',
      user_id: testUserId,
      batch_id: null,
      is_active: true,
      featured: false,
      date: today,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data: result1, error: error1 } = await supabase
      .from('challenges')
      .insert(challenge1)
      .select()
      .single()
    
    if (error1) {
      console.error('❌ First challenge failed:', error1.message)
      return
    }
    
    console.log('✅ First challenge created:', result1.id)
    
    // Second attempt with same URL - should fail with constraint error
    console.log('2️⃣ Creating second user-generated challenge with same URL...')
    const challenge2 = {
      ...challenge1,
      title: 'Test Challenge 2',
      user_id: 'ad95dc22-bc3c-4efc-8f75-15c573364d34' // Different user
    }
    
    const { data: result2, error: error2 } = await supabase
      .from('challenges')
      .insert(challenge2)
      .select()
      .single()
    
    if (error2) {
      console.log('❌ Second challenge failed as expected:', error2.message)
      console.log('🎯 This confirms the constraint issue!')
    } else {
      console.log('⚠️ Unexpected: Second challenge succeeded:', result2.id)
    }
    
    // Cleanup - remove test challenge
    console.log('🧹 Cleaning up test data...')
    await supabase
      .from('challenges')
      .delete()
      .eq('id', result1.id)
    
    console.log('✅ Cleanup completed')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
  
  console.log('')
  console.log('💡 Solution Options:')
  console.log('1. Modify the unique constraint to exclude user_generated challenges')
  console.log('2. Add user_id to the constraint so each user can use the same video')
  console.log('3. Remove the constraint entirely for user_generated challenges')
  console.log('4. Use a different date format that includes time for user challenges')
}

if (require.main === module) {
  testDuplicateConstraint()
    .then(() => {
      console.log('✅ Test completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Test failed:', error)
      process.exit(1)
    })
}
