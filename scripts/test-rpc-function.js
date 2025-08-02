#!/usr/bin/env node

/**
 * Test RPC Function Script
 * Test get_user_posts RPC function to debug frontend issues
 * Usage: node scripts/test-rpc-function.js [user_id]
 * 
 * Example:
 * node scripts/test-rpc-function.js 13df7bf1-d38f-4b58-b444-3dfa67e04f17
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
 * Extract YouTube ID from content (same as frontend)
 */
function extractYouTubeId(content) {
  if (!content) return null
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  const match = content.match(youtubeRegex)
  return match ? match[1] : null
}

/**
 * Determine media type (same logic as frontend)
 */
function determineMediaType(post) {
  // Check for YouTube first
  const youtubeId = extractYouTubeId(post.content || "")
  if (youtubeId) {
    return 'youtube'
  } else if (post.post_type === 'image') {
    // Image posts - use post_type as definitive source
    return 'image'
  } else if (post.post_type === 'video') {
    // Video posts - use post_type as definitive source
    return 'video'
  } else if (post.post_type === 'challenge' || post.post_type === 'submission') {
    return 'ai-submission'
  } else if (post.post_type === null || post.post_type === undefined || post.post_type === 'text') {
    // Text posts - when post_type is null, undefined, or explicitly 'text'
    return 'text'
  } else {
    // Fallback to text for other unknown post_types
    return 'text'
  }
}

/**
 * Test RPC function
 */
async function testRPCFunction(userId) {
  try {
    console.log(`🔍 Testing RPC function for user: ${userId}`)
    
    // Test with different limits to see what's happening
    const limits = [10, 20, 50]
    
    for (const limit of limits) {
      console.log(`\n📊 Testing with limit: ${limit}`)
      console.log('─'.repeat(50))
      
      const { data: posts, error: postsError } = await supabase
        .rpc('get_user_posts', { 
          user_id_param: userId, 
          posts_limit: limit 
        })

      if (postsError) {
        console.error(`❌ Error with limit ${limit}:`, postsError)
        continue
      }

      console.log(`✅ RPC returned ${posts?.length || 0} posts`)
      
      if (posts && posts.length > 0) {
        // Analyze the posts
        const postTypeStats = {}
        const aiEvaluationStats = { hasData: 0, isNull: 0, isEmpty: 0 }
        const mediaTypeStats = {}
        
        posts.forEach(post => {
          // Count post_type values
          const postType = post.post_type || 'null'
          postTypeStats[postType] = (postTypeStats[postType] || 0) + 1
          
          // Count ai_evaluation patterns
          if (post.ai_evaluation && 
              post.ai_evaluation !== '' &&
              (typeof post.ai_evaluation === 'object' ? 
                Object.keys(post.ai_evaluation).length > 0 : 
                post.ai_evaluation.toString().trim() !== '')) {
            aiEvaluationStats.hasData++
          } else if (post.ai_evaluation === null || post.ai_evaluation === undefined) {
            aiEvaluationStats.isNull++
          } else {
            aiEvaluationStats.isEmpty++
          }
          
          // Count mediaType after processing
          const mediaType = determineMediaType(post)
          mediaTypeStats[mediaType] = (mediaTypeStats[mediaType] || 0) + 1
        })
        
        console.log(`📋 post_type distribution:`)
        Object.entries(postTypeStats).forEach(([type, count]) => {
          console.log(`   ${type}: ${count} posts`)
        })
        
        console.log(`🤖 ai_evaluation distribution:`)
        console.log(`   Has data: ${aiEvaluationStats.hasData} posts`)
        console.log(`   Is null: ${aiEvaluationStats.isNull} posts`)
        console.log(`   Is empty: ${aiEvaluationStats.isEmpty} posts`)
        
        console.log(`🎯 mediaType distribution (after processing):`)
        Object.entries(mediaTypeStats).forEach(([type, count]) => {
          console.log(`   ${type}: ${count} posts`)
        })
        
        // Show sample posts for debugging
        console.log(`\n📝 Sample posts:`)
        posts.slice(0, 3).forEach(post => {
          const mediaType = determineMediaType(post)
          console.log(`  Post ${post.id}:`)
          console.log(`    post_type: "${post.post_type}"`)
          console.log(`    mediaType: "${mediaType}"`)
          console.log(`    hasAI: ${!!(post.ai_evaluation && post.ai_evaluation !== '' && (typeof post.ai_evaluation === 'object' ? Object.keys(post.ai_evaluation).length > 0 : post.ai_evaluation.toString().trim() !== ''))}`)
          console.log(`    content preview: "${(post.content || '').substring(0, 50)}..."`)
          console.log(`    media_urls: ${post.media_urls ? 'present' : 'null'}`)
          console.log('')
        })
      }
    }

  } catch (error) {
    console.error('❌ Error testing RPC function:', error)
  }
}

/**
 * Compare with direct query
 */
async function compareWithDirectQuery(userId) {
  try {
    console.log(`\n🔍 Comparing with direct query...`)
    console.log('─'.repeat(50))
    
    const { data: directPosts, error: directError } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        score,
        created_at,
        post_type,
        likes_count,
        comments_count,
        ai_evaluation,
        media_url,
        media_urls
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (directError) {
      console.error('❌ Error with direct query:', directError)
      return
    }

    console.log(`✅ Direct query returned ${directPosts?.length || 0} posts`)
    
    if (directPosts && directPosts.length > 0) {
      const postTypeStats = {}
      
      directPosts.forEach(post => {
        const postType = post.post_type || 'null'
        postTypeStats[postType] = (postTypeStats[postType] || 0) + 1
      })
      
      console.log(`📋 Direct query post_type distribution:`)
      Object.entries(postTypeStats).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} posts`)
      })
    }

  } catch (error) {
    console.error('❌ Error with direct query:', error)
  }
}

/**
 * Main function
 */
async function main() {
  const userId = process.argv[2]
  
  if (!userId) {
    console.error('❌ Please provide a user ID')
    console.log('Usage: node scripts/test-rpc-function.js <user_id>')
    process.exit(1)
  }

  console.log('🧪 RPC Function Test Script')
  console.log('='.repeat(50))
  console.log(`Testing for user: ${userId}`)

  try {
    await testRPCFunction(userId)
    await compareWithDirectQuery(userId)
    
    console.log('\n✅ Test completed!')
    
  } catch (error) {
    console.error('❌ Error running tests:', error)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}
