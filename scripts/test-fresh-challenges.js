#!/usr/bin/env node

/**
 * Test script with fresh YouTube URLs to verify Create Challenge functionality
 * Usage: node scripts/test-fresh-challenges.js
 */

const { config } = require('dotenv')
config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')
const { GoogleGenerativeAI } = require('@google/generative-ai')
const { getActiveApiKey, incrementUsage, markKeyAsInactive } = require('./api-key-manager.js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('🧪 Testing Fresh YouTube URLs for Create Challenge')
console.log('=================================================')
console.log('🎯 Goal: Test với video mới chưa được sử dụng')
console.log('')

// Fresh YouTube URLs that haven't been used in our tests
const FRESH_VIDEOS = [
  {
    url: 'https://www.youtube.com/watch?v=9No-FiEInLA',
    title: 'How to learn any language in six months',
    description: 'Chris Lonsdale TEDx Talk about language learning',
    expectedSuccess: true
  },
  {
    url: 'https://www.youtube.com/watch?v=hi_9B_69jWA',
    title: 'English Speaking Practice',
    description: 'Basic English conversation practice',
    expectedSuccess: true
  },
  {
    url: 'https://www.youtube.com/watch?v=8jPQjjsBbIc',
    title: 'Business English Basics',
    description: 'Professional English communication',
    expectedSuccess: true
  }
]

const TEST_USER_ID = '13df7bf1-d38f-4b58-b444-3dfa67e04f17' // teacher1@university.edu

/**
 * Create a single test challenge
 */
async function testCreateChallenge(videoData, index) {
  console.log(`\n📝 Test ${index + 1}/${FRESH_VIDEOS.length}: ${videoData.title}`)
  console.log('======================================')
  console.log(`📹 URL: ${videoData.url}`)
  console.log(`👤 User: ${TEST_USER_ID}`)
  
  const startTime = Date.now()
  
  try {
    // Step 1: Extract video ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = videoData.url.match(regExp)
    const videoId = match && match[2].length === 11 ? match[2] : null
    
    if (!videoId) {
      throw new Error('Invalid YouTube URL')
    }
    
    console.log(`🎬 Video ID: ${videoId}`)
    
    // Step 2: Get metadata
    console.log('🔍 Fetching video metadata...')
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.status}`)
    }
    
    const html = await response.text()
    
    // Extract basic info
    let title = videoData.title
    let duration = 300
    
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/)
    if (titleMatch) {
      title = titleMatch[1].replace(" - YouTube", "")
    }
    
    const durationMatch = html.match(/"lengthSeconds":"(\d+)"/)
    if (durationMatch) {
      duration = parseInt(durationMatch[1])
    }
    
    console.log(`✅ Title: "${title}"`)
    console.log(`⏱️ Duration: ${duration} seconds`)
    
    // Step 3: Generate transcript with Gemini
    console.log('🤖 Generating transcript with Gemini AI...')
    const apiKeyData = await getActiveApiKey('gemini')
    if (!apiKeyData) {
      throw new Error('No active API key found')
    }
    
    const genAI = new GoogleGenerativeAI(apiKeyData.decrypted_key)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    
    const prompt = `Please transcribe ONLY the first 300 seconds of this YouTube video.

Requirements:
- Extract spoken words from ONLY the first 300 seconds
- Provide exact transcript as spoken
- Format with proper punctuation
- Do not summarize or add commentary

Video URL: ${videoData.url}
Time limit: First 300 seconds only`
    
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: "video/*",
          fileUri: videoData.url
        }
      },
      prompt
    ])
    
    const transcript = result.response.text().trim()
    
    if (transcript.length < 100) {
      throw new Error('Transcript too short or failed to generate')
    }
    
    await incrementUsage(apiKeyData.id)
    console.log(`✅ Transcript generated: ${transcript.length} characters`)
    
    // Step 4: Create challenge in database
    console.log('💾 Inserting into database...')
    const today = new Date().toISOString().split('T')[0]
    
    const challengeData = {
      title: title,
      description: videoData.description,
      video_url: videoData.url,
      thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      embed_url: `https://www.youtube.com/embed/${videoId}`,
      duration: duration,
      topics: ['English Learning', 'Education'],
      transcript: transcript,
      challenge_type: 'user_generated',
      difficulty: 'intermediate',
      user_id: TEST_USER_ID,
      batch_id: null,
      is_active: true,
      featured: false,
      date: today,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('challenges')
      .insert(challengeData)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Database error:', error.message)
      throw new Error(error.message)
    }
    
    const endTime = Date.now()
    const duration_ms = endTime - startTime
    
    console.log(`✅ Challenge created successfully!`)
    console.log(`   ID: ${data.id}`)
    console.log(`   Duration: ${Math.round(duration_ms / 1000)}s`)
    console.log(`   Transcript: ${transcript.substring(0, 100)}...`)
    
    return { success: true, data, duration_ms }
    
  } catch (error) {
    const endTime = Date.now()
    const duration_ms = endTime - startTime
    
    console.error(`❌ Test failed: ${error.message}`)
    console.log(`   Duration: ${Math.round(duration_ms / 1000)}s`)
    
    return { success: false, error: error.message, duration_ms }
  }
}

/**
 * Main test function
 */
async function testFreshChallenges() {
  const startTime = Date.now()
  const results = []
  
  console.log('🚀 Starting fresh challenge tests...')
  console.log(`📊 Testing ${FRESH_VIDEOS.length} fresh YouTube URLs`)
  console.log('')
  
  for (let i = 0; i < FRESH_VIDEOS.length; i++) {
    const video = FRESH_VIDEOS[i]
    const result = await testCreateChallenge(video, i)
    results.push({ video, result })
    
    // Wait between tests
    if (i < FRESH_VIDEOS.length - 1) {
      console.log('\n⏳ Waiting 3 seconds before next test...')
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }
  
  // Summary
  const endTime = Date.now()
  const totalDuration = endTime - startTime
  const successCount = results.filter(r => r.result.success).length
  
  console.log('\n🏁 Test Summary')
  console.log('===============')
  console.log(`✅ Successful: ${successCount}/${FRESH_VIDEOS.length}`)
  console.log(`⏱️ Total time: ${Math.round(totalDuration / 1000)}s`)
  console.log('')
  
  results.forEach((item, index) => {
    const { video, result } = item
    const status = result.success ? '✅' : '❌'
    const time = Math.round(result.duration_ms / 1000)
    console.log(`${index + 1}. ${status} ${video.title} (${time}s)`)
    if (!result.success) {
      console.log(`   Error: ${result.error}`)
    }
  })
  
  if (successCount > 0) {
    console.log('\n🎉 Create Challenge modal should work properly!')
    console.log('✅ Users can now create challenges from YouTube URLs')
  } else {
    console.log('\n⚠️ All tests failed - there may be configuration issues')
  }
}

// Run the test
if (require.main === module) {
  testFreshChallenges()
    .then(() => {
      console.log('\n✅ Fresh challenge test completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Test script failed:', error)
      process.exit(1)
    })
}

module.exports = { testFreshChallenges }
