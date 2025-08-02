#!/usr/bin/env node

/**
 * User Data Checker Script
 * Check real data in Supabase Cloud for debugging
 * Usage: node scripts/check-user-data.js [user_id]
 * 
 * Example:
 * node scripts/check-user-data.js 13df7bf1-d38f-4b58-b444-3dfa67e04f17
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
 * Get user profile data
 */
async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('❌ Error fetching user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('❌ Unexpected error fetching profile:', error)
    return null
  }
}

/**
 * Get user posts with scores
 */
async function getUserPosts(userId, limit = 10) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        score,
        created_at,
        post_type,
        likes_count,
        comments_count
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('❌ Error fetching user posts:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('❌ Unexpected error fetching posts:', error)
    return []
  }
}

/**
 * Get latest post with score
 */
async function getLatestPost(userId) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        score,
        created_at,
        post_type
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('❌ Error fetching latest post:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('❌ Unexpected error fetching latest post:', error)
    return null
  }
}

/**
 * Get weekly points data
 */
async function getWeeklyPoints(userId) {
  try {
    const { data, error } = await supabase
      .from('weekly_points')
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false })
      .limit(5)

    if (error) {
      console.error('❌ Error fetching weekly points:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('❌ Unexpected error fetching weekly points:', error)
    return []
  }
}

/**
 * Calculate stats manually for verification
 */
async function calculateManualStats(userId) {
  try {
    // Count posts
    const { count: postsCount, error: postsError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (postsError) {
      console.error('❌ Error counting posts:', postsError)
    }

    // Get posts for likes calculation
    const { data: userPosts, error: userPostsError } = await supabase
      .from('posts')
      .select('id')
      .eq('user_id', userId)

    if (userPostsError) {
      console.error('❌ Error fetching user posts for likes:', userPostsError)
      return { postsCount: postsCount || 0, likesCount: 0, commentsCount: 0 }
    }

    let likesCount = 0
    let commentsCount = 0

    if (userPosts && userPosts.length > 0) {
      // Count likes
      const { count: likes, error: likesError } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .in('post_id', userPosts.map(p => p.id))

      if (!likesError) {
        likesCount = likes || 0
      }

      // Count comments
      const { count: comments, error: commentsError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .in('post_id', userPosts.map(p => p.id))

      if (!commentsError) {
        commentsCount = comments || 0
      }
    }

    return {
      postsCount: postsCount || 0,
      likesCount,
      commentsCount,
      experiencePoints: (postsCount || 0) * 10 + likesCount * 2 + commentsCount * 1,
      level: Math.max(1, Math.floor(((postsCount || 0) * 10 + likesCount * 2 + commentsCount * 1) / 100) + 1)
    }
  } catch (error) {
    console.error('❌ Error calculating manual stats:', error)
    return { postsCount: 0, likesCount: 0, commentsCount: 0, experiencePoints: 0, level: 1 }
  }
}

/**
 * Display user data in a formatted way
 */
function displayUserData(profile, posts, latestPost, weeklyPoints, manualStats) {
  console.log('\n' + '='.repeat(80))
  console.log('👤 USER PROFILE DATA')
  console.log('='.repeat(80))
  
  if (profile) {
    console.log(`Name: ${profile.full_name || 'N/A'}`)
    console.log(`Username: ${profile.username || 'N/A'}`)
    console.log(`User ID: ${profile.user_id}`)
    console.log(`Level: ${profile.level || 'N/A'}`)
    console.log(`Experience Points: ${profile.experience_points || 'N/A'}`)
    console.log(`Streak Days: ${profile.streak_days || 'N/A'}`)
    console.log(`Total Posts: ${profile.total_posts || 'N/A'}`)
    console.log(`Total Likes: ${profile.total_likes || 'N/A'}`)
    console.log(`Total Comments: ${profile.total_comments || 'N/A'}`)
    console.log(`Completed Challenges: ${profile.completed_challenges || 'N/A'}`)
    console.log(`Created: ${profile.created_at ? new Date(profile.created_at).toLocaleString() : 'N/A'}`)
    console.log(`Updated: ${profile.updated_at ? new Date(profile.updated_at).toLocaleString() : 'N/A'}`)
  } else {
    console.log('❌ No profile data found')
  }

  console.log('\n' + '='.repeat(80))
  console.log('📊 CALCULATED STATS (Manual Verification)')
  console.log('='.repeat(80))
  console.log(`Posts Count: ${manualStats.postsCount}`)
  console.log(`Likes Count: ${manualStats.likesCount}`)
  console.log(`Comments Count: ${manualStats.commentsCount}`)
  console.log(`Experience Points: ${manualStats.experiencePoints}`)
  console.log(`Level: ${manualStats.level}`)

  console.log('\n' + '='.repeat(80))
  console.log(`📝 LATEST POST`)
  console.log('='.repeat(80))
  
  if (latestPost) {
    console.log(`ID: ${latestPost.id}`)
    console.log(`Title: ${latestPost.title || 'N/A'}`)
    console.log(`Content: ${latestPost.content ? latestPost.content.substring(0, 100) + '...' : 'N/A'}`)
    console.log(`Score: ${latestPost.score !== null ? latestPost.score : 'NULL (no score)'}`)
    console.log(`Type: ${latestPost.post_type || 'N/A'}`)
    console.log(`Created: ${new Date(latestPost.created_at).toLocaleString()}`)
  } else {
    console.log('❌ No posts found')
  }

  console.log('\n' + '='.repeat(80))
  console.log(`📅 WEEKLY POINTS (Last 5 weeks)`)
  console.log('='.repeat(80))
  
  if (weeklyPoints.length > 0) {
    weeklyPoints.forEach((week, index) => {
      console.log(`Week ${index + 1}:`)
      console.log(`  Start: ${new Date(week.week_start_date).toLocaleDateString()}`)
      console.log(`  End: ${new Date(week.week_end_date).toLocaleDateString()}`)
      console.log(`  Total Points: ${week.total_points || 0}`)
      console.log(`  Latest Post Points: ${week.latest_post_points !== null ? week.latest_post_points : 'NULL'}`)
      console.log(`  Updated: ${new Date(week.updated_at).toLocaleString()}`)
      console.log('')
    })
  } else {
    console.log('❌ No weekly points data found')
  }

  console.log('\n' + '='.repeat(80))
  console.log(`📝 RECENT POSTS (Last 10)`)
  console.log('='.repeat(80))
  
  if (posts.length > 0) {
    posts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title || 'Untitled'}`)
      console.log(`   ID: ${post.id}`)
      console.log(`   Score: ${post.score !== null ? post.score : 'NULL'}`)
      console.log(`   Type: ${post.post_type || 'N/A'}`)
      console.log(`   Likes: ${post.likes_count || 0}`)
      console.log(`   Comments: ${post.comments_count || 0}`)
      console.log(`   Created: ${new Date(post.created_at).toLocaleString()}`)
      console.log(`   Content: ${post.content ? post.content.substring(0, 80) + '...' : 'N/A'}`)
      console.log('')
    })
  } else {
    console.log('❌ No posts found')
  }
}

/**
 * Main function
 */
async function main() {
  const userId = process.argv[2]
  
  if (!userId) {
    console.error('❌ Please provide a user ID')
    console.log('Usage: node scripts/check-user-data.js <user_id>')
    console.log('Example: node scripts/check-user-data.js 13df7bf1-d38f-4b58-b444-3dfa67e04f17')
    process.exit(1)
  }

  console.log(`🔍 Checking data for user ID: ${userId}`)
  
  try {
    // Fetch all data in parallel
    const [profile, posts, latestPost, weeklyPoints, manualStats] = await Promise.all([
      getUserProfile(userId),
      getUserPosts(userId),
      getLatestPost(userId),
      getWeeklyPoints(userId),
      calculateManualStats(userId)
    ])

    // Display results
    displayUserData(profile, posts, latestPost, weeklyPoints, manualStats)

    console.log('\n✅ Data check completed successfully')

  } catch (error) {
    console.error('❌ Data check failed:', error)
    process.exit(1)
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('⚠️  Data check interrupted')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('⚠️  Data check terminated')
  process.exit(0)
})

// Run the script
if (require.main === module) {
  main()
}

module.exports = { getUserProfile, getUserPosts, getLatestPost, getWeeklyPoints, calculateManualStats }
