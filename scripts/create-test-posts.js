#!/usr/bin/env node

/**
 * Create Test Posts Script
 * Create test posts with different post_type values to test filters
 * Usage: node scripts/create-test-posts.js [user_id]
 * 
 * Example:
 * node scripts/create-test-posts.js 13df7bf1-d38f-4b58-b444-3dfa67e04f17
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Create test posts with different post_type values
 */
async function createTestPosts(userId) {
  const testPosts = [
    {
      user_id: userId,
      content: "This is a text-only post for testing filters. No media attached.",
      post_type: null, // This should be filtered as "Text Only"
      ai_evaluation: null,
      title: "Test Text Post 1"
    },
    {
      user_id: userId, 
      content: "Another text post with some English practice content. Let me share my learning progress!",
      post_type: null, // This should be filtered as "Text Only"
      ai_evaluation: null,
      title: "Test Text Post 2"
    },
    {
      user_id: userId,
      content: "This is a text post with AI evaluation to test overlapping filters.",
      post_type: null, // This should be filtered as "Text Only" 
      ai_evaluation: JSON.stringify({
        pronunciation: { score: 85, feedback: "Good pronunciation" },
        grammar: { score: 90, feedback: "Excellent grammar" },
        overall_score: 87
      }),
      title: "Test Text Post with AI"
    },
    {
      user_id: userId,
      content: "Explicit text post type for testing",
      post_type: 'text', // This should also be filtered as "Text Only"
      ai_evaluation: null,
      title: "Test Explicit Text Post"
    }
  ]

  console.log('🚀 Creating test posts...')
  
  for (const post of testPosts) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select()
        .single()

      if (error) {
        console.error(`❌ Error creating post "${post.title}":`, error)
      } else {
        console.log(`✅ Created post: ${data.id} - "${post.title}"`)
        console.log(`   post_type: ${post.post_type}`)
        console.log(`   hasAI: ${!!post.ai_evaluation}`)
      }
    } catch (error) {
      console.error(`❌ Unexpected error creating post "${post.title}":`, error)
    }
  }
}

/**
 * Clean up test posts (optional)
 */
async function cleanupTestPosts(userId) {
  console.log('🧹 Cleaning up test posts...')
  
  try {
    const { data, error } = await supabase
      .from('posts')
      .delete()
      .eq('user_id', userId)
      .like('title', 'Test %')
      .select()

    if (error) {
      console.error('❌ Error cleaning up test posts:', error)
    } else {
      console.log(`✅ Deleted ${data?.length || 0} test posts`)
    }
  } catch (error) {
    console.error('❌ Unexpected error cleaning up:', error)
  }
}

/**
 * Main function
 */
async function main() {
  const userId = process.argv[2]
  const action = process.argv[3] || 'create' // 'create' or 'cleanup'
  
  if (!userId) {
    console.error('❌ Please provide a user ID')
    console.log('Usage: node scripts/create-test-posts.js <user_id> [create|cleanup]')
    process.exit(1)
  }

  console.log('🧪 Test Posts Script')
  console.log('='.repeat(50))
  console.log(`User ID: ${userId}`)
  console.log(`Action: ${action}`)

  try {
    if (action === 'cleanup') {
      await cleanupTestPosts(userId)
    } else {
      await createTestPosts(userId)
    }
    
    console.log('\n✅ Script completed successfully!')
    
  } catch (error) {
    console.error('❌ Error running script:', error)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}
