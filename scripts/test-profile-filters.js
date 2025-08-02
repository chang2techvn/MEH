#!/usr/bin/env node

/**
 * Profile Filter Test Script
 * Test profile page filter functionality with real database data
 * Usage: node scripts/test-profile-filters.js [user_id]
 * 
 * Example:
 * node scripts/test-profile-filters.js 13df7bf1-d38f-4b58-b444-3dfa67e04f17
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
 * Extract YouTube ID from content
 */
function extractYouTubeId(content) {
  if (!content) return null
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  const match = content.match(youtubeRegex)
  return match ? match[1] : null
}

/**
 * Determine media type based on real data patterns
 */
function determineMediaType(post) {
  // Check for YouTube first
  const youtubeId = extractYouTubeId(post.content || "")
  if (youtubeId) {
    return 'youtube'
  }
  
  // Use post_type as primary source (this is what's in database)
  if (post.post_type === 'image') {
    return 'image'
  } else if (post.post_type === 'video') {
    return 'video'
  } else if (post.post_type === 'challenge' || post.post_type === 'submission') {
    return 'ai-submission'
  } else {
    // Fallback to text for null or other post_types
    return 'text'
  }
}

/**
 * Test filter logic
 */
function testFilters(posts, filterType) {
  console.log(`\n🧪 Testing filter: ${filterType}`)
  console.log('─'.repeat(50))
  
  let filteredPosts = []
  
  if (filterType === 'All') {
    filteredPosts = posts
  } else if (filterType === 'With AI') {
    filteredPosts = posts.filter(post => {
      // Check if ai_evaluation has actual data (not null, not empty string, not empty object)
      const hasAI = post.ai_evaluation && 
                   post.ai_evaluation !== '' &&
                   (typeof post.ai_evaluation === 'object' ? 
                     Object.keys(post.ai_evaluation).length > 0 : 
                     post.ai_evaluation.toString().trim() !== '')
      return hasAI
    })
  } else if (filterType === 'Videos') {
    filteredPosts = posts.filter(post => {
      const mediaType = determineMediaType(post)
      return mediaType === 'video' || mediaType === 'youtube'
    })
  } else if (filterType === 'Images') {
    filteredPosts = posts.filter(post => {
      const mediaType = determineMediaType(post)
      return mediaType === 'image'
    })
  } else if (filterType === 'Text Only') {
    filteredPosts = posts.filter(post => {
      const mediaType = determineMediaType(post)
      return mediaType === 'text'
    })
  }
  
  console.log(`📊 Found ${filteredPosts.length} posts`)
  
  filteredPosts.forEach(post => {
    const mediaType = determineMediaType(post)
    const hasAI = !!(post.ai_evaluation && 
                    post.ai_evaluation !== '' &&
                    (typeof post.ai_evaluation === 'object' ? 
                      Object.keys(post.ai_evaluation).length > 0 : 
                      post.ai_evaluation.toString().trim() !== ''))
    
    console.log(`  📝 Post ${post.id}:`)
    console.log(`     post_type: "${post.post_type}"`)
    console.log(`     mediaType: "${mediaType}"`)
    console.log(`     hasAI: ${hasAI}`)
    console.log(`     ai_evaluation type: ${typeof post.ai_evaluation}`)
    if (post.ai_evaluation && typeof post.ai_evaluation === 'object') {
      console.log(`     ai_evaluation keys: [${Object.keys(post.ai_evaluation).join(', ')}]`)
    }
    console.log(`     content preview: "${(post.content || '').substring(0, 50)}..."`)
    console.log('')
  })
  
  return filteredPosts
}

/**
 * Get user posts using RPC function (same as profile page)
 */
async function getUserPosts(userId) {
  try {
    console.log(`🔍 Fetching posts for user: ${userId}`)
    
    const { data: posts, error: postsError } = await supabase
      .rpc('get_user_posts', { 
        user_id_param: userId, 
        posts_limit: 20 
      })

    if (postsError) {
      console.error('❌ Error fetching posts:', postsError)
      return []
    }

    console.log(`✅ Loaded ${posts?.length || 0} posts`)
    return posts || []
  } catch (error) {
    console.error('❌ Unexpected error fetching posts:', error)
    return []
  }
}

/**
 * Analyze post data
 */
function analyzePostData(posts) {
  console.log('\n📊 POST DATA ANALYSIS')
  console.log('='.repeat(50))
  
  const postTypeStats = {}
  const aiEvaluationStats = { hasData: 0, isNull: 0, isEmpty: 0 }
  
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
  })
  
  console.log(`📋 Total posts: ${posts.length}`)
  console.log(`📊 post_type distribution:`)
  Object.entries(postTypeStats).forEach(([type, count]) => {
    console.log(`   ${type}: ${count} posts`)
  })
  
  console.log(`🤖 ai_evaluation distribution:`)
  console.log(`   Has data: ${aiEvaluationStats.hasData} posts`)
  console.log(`   Is null: ${aiEvaluationStats.isNull} posts`)
  console.log(`   Is empty: ${aiEvaluationStats.isEmpty} posts`)
}

/**
 * Main function
 */
async function main() {
  const userId = process.argv[2]
  
  if (!userId) {
    console.error('❌ Please provide a user ID')
    console.log('Usage: node scripts/test-profile-filters.js <user_id>')
    process.exit(1)
  }

  console.log('🚀 Profile Filter Test Script')
  console.log('='.repeat(50))
  console.log(`Testing filters for user: ${userId}`)

  try {
    // Get posts data
    const posts = await getUserPosts(userId)
    
    if (posts.length === 0) {
      console.log('⚠️ No posts found for this user')
      return
    }

    // Analyze post data
    analyzePostData(posts)

    // Test all filters
    const filters = ['All', 'With AI', 'Videos', 'Images', 'Text Only']
    const results = {}
    
    for (const filter of filters) {
      results[filter] = testFilters(posts, filter)
    }
    
    // Summary
    console.log('\n📈 FILTER RESULTS SUMMARY')
    console.log('='.repeat(50))
    Object.entries(results).forEach(([filter, filteredPosts]) => {
      console.log(`${filter}: ${filteredPosts.length} posts`)
    })
    
    // Validation checks
    console.log('\n✅ VALIDATION CHECKS')
    console.log('='.repeat(50))
    
    // Check if all filters add up to total (allowing overlap)
    const withAI = results['With AI'].length
    const videos = results['Videos'].length  
    const images = results['Images'].length
    const textOnly = results['Text Only'].length
    
    console.log(`Total posts: ${posts.length}`)
    console.log(`Sum of categorized posts: ${videos + images + textOnly} (should equal total)`)
    console.log(`Posts with AI: ${withAI} (can overlap with categories)`)
    
    if (videos + images + textOnly !== posts.length) {
      console.log('⚠️  WARNING: Category filters don\'t add up to total posts!')
      console.log('   This indicates an issue with mediaType classification logic')
    } else {
      console.log('✅ Category filters add up correctly')
    }

  } catch (error) {
    console.error('❌ Error running tests:', error)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}
