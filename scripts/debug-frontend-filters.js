#!/usr/bin/env node

/**
 * Debug Frontend Filter Logic Script
 * Replicate exact frontend filter logic to debug issues
 * Usage: node scripts/debug-frontend-filters.js [user_id]
 * 
 * Example:
 * node scripts/debug-frontend-filters.js 13df7bf1-d38f-4b58-b444-3dfa67e04f17
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
 * Extract YouTube ID (exact same as frontend)
 */
function extractYouTubeId(content) {
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  const match = content.match(youtubeRegex)
  return match ? match[1] : undefined
}

/**
 * Transform posts exactly like frontend
 */
function transformPosts(posts, user) {
  return posts.map((post) => {
    // Parse media_urls if it exists (from database it might be JSON string)
    let mediaUrlsArray = []
    if (post.media_urls) {
      try {
        mediaUrlsArray = typeof post.media_urls === 'string' 
          ? JSON.parse(post.media_urls) 
          : post.media_urls
      } catch (e) {
        console.warn('Failed to parse media_urls:', post.media_urls)
        mediaUrlsArray = []
      }
    } else if (post.media_url) {
      mediaUrlsArray = [post.media_url]
    }
    
    // Determine media type based on post_type and content (EXACT frontend logic)
    let mediaType = 'text'
    
    // Check for YouTube first
    const youtubeId = extractYouTubeId(post.content || "")
    if (youtubeId) {
      mediaType = 'youtube'
    } else if (post.post_type === 'image') {
      // Image posts - use post_type as definitive source
      mediaType = 'image'
    } else if (post.post_type === 'video') {
      // Video posts - use post_type as definitive source
      mediaType = 'video'
    } else if (post.post_type === 'challenge' || post.post_type === 'submission') {
      mediaType = 'ai-submission'
    } else if (post.post_type === null || post.post_type === undefined || post.post_type === 'text' || post.post_type === 'null') {
      // Text posts - when post_type is null, undefined, 'text', or string 'null'
      mediaType = 'text'
    } else {
      // Fallback to text for other unknown post_types
      mediaType = 'text'
    }

    console.log(`📊 Post ${post.id}: post_type="${post.post_type}" (${typeof post.post_type}), ai_evaluation=${!!post.ai_evaluation}, mediaType="${mediaType}"`)

    return {
      id: post.id,
      username: user.name || 'Unknown User',
      userImage: user.avatar || '/placeholder.svg',
      content: post.content || '',
      mediaType,
      mediaUrl: post.media_url,
      mediaUrls: mediaUrlsArray,
      youtubeVideoId: youtubeId,
      textContent: mediaType === "text" ? post.content : undefined,
      likes: post.likes_count || 0,
      comments: post.comments_count || 0,
      title: post.title,
      ai_evaluation: post.ai_evaluation,
      isNew: false
    }
  })
}

/**
 * Filter posts exactly like frontend
 */
function filterPosts(userPosts, activeFilter, searchQuery = '') {
  console.log(`\n🔍 Frontend filter logic: ${activeFilter}`)
  console.log('─'.repeat(50))
  
  let filtered = [...userPosts]

  // Search by content or title (exact frontend logic)
  if (searchQuery) {
    filtered = filtered.filter(post => {
      const searchLower = searchQuery.toLowerCase()
      // Handle ai_evaluation as object (JSONB) for search
      const aiEvaluationText = post.ai_evaluation && typeof post.ai_evaluation === 'object' 
        ? JSON.stringify(post.ai_evaluation).toLowerCase()
        : (post.ai_evaluation || '').toString().toLowerCase()
      
      return (
        post.content?.toLowerCase().includes(searchLower) ||
        aiEvaluationText.includes(searchLower) ||
        post.title?.toLowerCase().includes(searchLower)
      )
    })
  }

  // Filter by category (EXACT frontend logic)
  if (activeFilter && activeFilter !== 'All') {
    console.log(`🎯 Applying filter: ${activeFilter}`)
    
    if (activeFilter === 'With AI') {
      const aiPosts = filtered.filter(post => {
        // Check if ai_evaluation has actual data (not null, not empty string, not empty object)
        const hasAI = post.ai_evaluation && 
                     post.ai_evaluation !== '' &&
                     (typeof post.ai_evaluation === 'object' ? 
                       Object.keys(post.ai_evaluation).length > 0 : 
                       post.ai_evaluation.toString().trim() !== '')
        console.log(`Post ${post.id}: hasAI=${hasAI}, ai_evaluation type:`, typeof post.ai_evaluation)
        return hasAI
      })
      console.log(`With AI filter: ${aiPosts.length} posts found`)
      filtered = aiPosts
    } else if (activeFilter === 'Videos') {
      const videoPosts = filtered.filter(post => {
        // Filter by post_type = 'video' (from database post_type column)
        const isVideo = post.mediaType === 'video' || post.mediaType === 'youtube'
        console.log(`Post ${post.id}: isVideo=${isVideo}, mediaType=${post.mediaType}`)
        return isVideo
      })
      console.log(`Videos filter: ${videoPosts.length} posts found`)
      filtered = videoPosts
    } else if (activeFilter === 'Images') {
      const imagePosts = filtered.filter(post => {
        // Filter by post_type = 'image' (from database post_type column) 
        const isImage = post.mediaType === 'image'
        console.log(`Post ${post.id}: isImage=${isImage}, mediaType=${post.mediaType}`)
        return isImage
      })
      console.log(`Images filter: ${imagePosts.length} posts found`)
      filtered = imagePosts
    } else if (activeFilter === 'Text Only') {
      const textPosts = filtered.filter(post => {
        // Filter by post_type = null or 'text' (from database post_type column)
        const isTextOnly = post.mediaType === 'text'
        console.log(`Post ${post.id}: isTextOnly=${isTextOnly}, mediaType=${post.mediaType}`)
        return isTextOnly
      })
      console.log(`Text Only filter: ${textPosts.length} posts found`)
      filtered = textPosts
    }
  }

  console.log(`🎯 Final filtered posts: ${filtered.length}`)
  return filtered
}

/**
 * Replicate frontend data flow
 */
async function debugFrontendLogic(userId) {
  try {
    console.log(`🔍 Replicating frontend data flow for user: ${userId}`)
    
    // Step 1: Fetch posts using RPC (same as frontend)
    const { data: posts, error: postsError } = await supabase
      .rpc('get_user_posts', { 
        user_id_param: userId, 
        posts_limit: 50 
      })

    if (postsError) throw postsError
    
    console.log(`✅ Fetched ${posts?.length || 0} posts via RPC`)
    
    // Step 2: Transform posts (same as frontend)
    const mockUser = { name: 'Test User', avatar: '/placeholder.svg' }
    const userPosts = transformPosts(posts || [], mockUser)
    
    console.log(`✅ Transformed ${userPosts.length} posts`)
    
    // Step 3: Test each filter
    const filters = ['All', 'With AI', 'Videos', 'Images', 'Text Only']
    const results = {}
    
    for (const filter of filters) {
      results[filter] = filterPosts(userPosts, filter)
    }
    
    // Step 4: Summary
    console.log('\n📈 FRONTEND LOGIC RESULTS')
    console.log('='.repeat(50))
    Object.entries(results).forEach(([filter, filteredPosts]) => {
      console.log(`${filter}: ${filteredPosts.length} posts`)
    })
    
    // Step 5: Validation
    console.log('\n✅ VALIDATION')
    console.log('='.repeat(50))
    
    const videos = results['Videos'].length
    const images = results['Images'].length  
    const textOnly = results['Text Only'].length
    const withAI = results['With AI'].length
    
    console.log(`Total posts: ${userPosts.length}`)
    console.log(`Videos + Images + Text: ${videos + images + textOnly}`)
    console.log(`With AI: ${withAI}`)
    
    if (videos + images + textOnly !== userPosts.length) {
      console.log('⚠️  WARNING: Categories don\'t add up!')
      
      // Debug which posts are missing
      const categorized = [
        ...results['Videos'].map(p => ({ id: p.id, category: 'Videos' })),
        ...results['Images'].map(p => ({ id: p.id, category: 'Images' })),
        ...results['Text Only'].map(p => ({ id: p.id, category: 'Text Only' }))
      ]
      
      const categorizedIds = categorized.map(p => p.id)
      const allIds = userPosts.map(p => p.id)
      const missing = allIds.filter(id => !categorizedIds.includes(id))
      
      if (missing.length > 0) {
        console.log(`❌ Missing posts: ${missing.length} posts not categorized`)
        missing.forEach(id => {
          const post = userPosts.find(p => p.id === id)
          if (post) {
            console.log(`  Missing: ${post.id} - mediaType: ${post.mediaType}`)
          }
        })
      }
    } else {
      console.log('✅ All posts properly categorized')
    }

  } catch (error) {
    console.error('❌ Error replicating frontend logic:', error)
  }
}

/**
 * Main function
 */
async function main() {
  const userId = process.argv[2]
  
  if (!userId) {
    console.error('❌ Please provide a user ID')
    console.log('Usage: node scripts/debug-frontend-filters.js <user_id>')
    process.exit(1)
  }

  console.log('🔬 Frontend Filter Debug Script')
  console.log('='.repeat(50))
  console.log(`User ID: ${userId}`)

  try {
    await debugFrontendLogic(userId)
    
    console.log('\n✅ Debug completed!')
    
  } catch (error) {
    console.error('❌ Error running debug:', error)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}
