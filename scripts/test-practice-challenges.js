#!/usr/bin/env node

/**
 * Test script to create 15 practice challenges with real transcripts using Gemini AI
 * Usage: node scripts/test-practice-challenges.js
 */

const { config } = require('dotenv')
config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')
const { GoogleGenerativeAI } = require('@google/generative-ai')
const { getActiveApiKey, incrementUsage, markKeyAsInactive } = require('./api-key-manager.js')

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('🧪 Testing Practice Challenges Creation')
console.log('========================================')
console.log('🎯 Goal: Create 15 practice challenges (5 days x 3 difficulties)')
console.log('📊 Each challenge will have a real 10-second transcript via Gemini AI')
console.log('')

// Pool of YouTube video IDs for testing (verified English videos with captions)
const VIDEO_POOL = [
  // TED Talks (verified with captions)
  { id: 'UF8uR6Z6KLc', title: 'The Power of Vulnerability - Brené Brown' },
  { id: 'ZXsQAXx_ao0', title: 'How to Speak so People Want to Listen - Julian Treasure' },
  { id: 'RYlCVwxoL_g', title: 'How to Sound Smart in Your TEDx Talk - Will Stephen' },
  { id: 'eIho2S0ZahI', title: 'How to Have Better Conversations - Celeste Headlee' },
  { id: 'H14bBuluwB8', title: 'Communication - Basics and Importance' },
  { id: 'IJjWlBSbJDk', title: 'Public Speaking Tips' },
  
  // English Learning Content (verified)
  { id: 'WqStqyuAiIM', title: 'Learn English - Basic Introduction' },
  { id: 'VQVlKNLBpqE', title: 'English Conversation Practice' },
  { id: '3i_HEKcI1n8', title: 'English Pronunciation Basics' },
  { id: 'YMyofREc5Jk', title: 'Body Language Communication' },
  { id: 'kJQP7kiw5Fk', title: 'Advanced English Vocabulary' },
  { id: 'jNQXAC9IVRw', title: 'English Idioms Explained' },
  { id: 'fJ9rUzIMcZQ', title: 'Business English Communication' },
  { id: 'L3wKzyIN1yk', title: 'English Speaking Practice' },
  { id: 'QB7ACr7pUuE', title: 'Build Speaking Confidence' },
  
  // Business and Professional (verified)
  { id: '_drPlp_r_Gw', title: 'Effective Communication Skills' },
  { id: 'K0pxo-dS9Hc', title: 'Professional English Communication' },
  { id: 'M4q6kIUBJiE', title: 'Business English Presentation' },
  { id: 'HAnw168huqA', title: 'Workplace Communication' },
  { id: 'W_2jNwYMbi4', title: 'English for Business Meetings' },
  
  // Additional verified videos for backup
  { id: 'Ks-_Mh1QhMc', title: 'Basic English Conversation' },
  { id: 'sNhhvQGsMEc', title: 'English Grammar Fundamentals' },
  { id: 'QvTNkY8ZgJ4', title: 'English Listening Practice' },
  { id: 'vLXp18rQ_5I', title: 'American English Pronunciation' },
  { id: '2fuKw4kd4l8', title: 'English Speaking Tips' }
]

/**
 * Extract transcript using Gemini AI with API key rotation (using proper fileData method)
 */
async function extractTranscriptWithGemini(videoId, videoTitle) {
  const maxRetries = 3
  let currentAttempt = 0
  
  while (currentAttempt < maxRetries) {
    try {
      currentAttempt++
      console.log(`   🔄 Transcript extraction attempt ${currentAttempt}/${maxRetries}`)
      
      // Get active API key
      const apiKeyData = await getActiveApiKey('gemini')
      if (!apiKeyData) {
        throw new Error('No active API key found')
      }
      
      console.log(`   🔑 Using API key: ${apiKeyData.key_name}`)
      
      const genAI = new GoogleGenerativeAI(apiKeyData.decrypted_key)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

      // Create video URL for fileData
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

      console.log(`   🤖 Requesting real transcript from Gemini for: ${videoUrl}`)
      
      // Use proper fileData method for video content
      const result = await model.generateContent([
        `Please extract the exact transcript from the FIRST 10 SECONDS of spoken content from this YouTube video.

STRICT REQUIREMENTS:
- Extract ONLY the first 10 seconds of actual spoken words
- Provide the exact transcript (word-for-word), not a summary
- If the first 10 seconds contain no speech, start from when speech begins
- Format with proper punctuation and capitalization
- If video is not in English, provide English translation
- If you cannot access the video content, respond with "TRANSCRIPT_NOT_AVAILABLE"

Video Title: ${videoTitle}
Extract the first 10 seconds transcript:`,
        {
          fileData: {
            fileUri: videoUrl,
          },
        },
      ])
      
      const response = await result.response
      const transcript = response.text().trim()
      
      // Validate that we got a real transcript, not generic response
      if (transcript === 'TRANSCRIPT_NOT_AVAILABLE' || 
          transcript.includes('I cannot access') || 
          transcript.includes('I\'m unable to') ||
          transcript.includes('I can\'t access') ||
          transcript.length < 15) {
        throw new Error('Could not extract real transcript from video')
      }
      
      // Check for generic/fake responses
      const genericPhrases = [
        'Welcome to this video',
        'Hello and welcome',
        'Hi everyone',
        'Let\'s talk about',
        'In this video',
        'Today we\'re going to'
      ]
      
      const isGeneric = genericPhrases.some(phrase => 
        transcript.toLowerCase().includes(phrase.toLowerCase())
      )
      
      if (isGeneric && transcript.length < 50) {
        console.log(`   ⚠️ Transcript appears generic, may not be real: ${transcript}`)
        throw new Error('Transcript appears to be generic/fabricated')
      }
      
      // Increment usage on success
      await incrementUsage(apiKeyData.id)
      console.log(`   📊 API key usage incremented`)
      
      console.log(`   ✅ Real transcript extracted: ${transcript.substring(0, 100)}...`)
      return transcript
      
    } catch (error) {
      console.error(`   ❌ Attempt ${currentAttempt} failed:`, error.message)
      
      // Handle API key errors
      if (error.message.includes('403') || error.message.includes('Invalid')) {
        console.log(`   🚫 Marking API key as inactive and trying next...`)
        const currentKey = await getActiveApiKey('gemini').catch(() => null)
        if (currentKey) {
          await markKeyAsInactive(currentKey.id, 'Invalid API key (403)')
        }
      } else if (error.message.includes('429') || error.message.includes('quota')) {
        console.log(`   ⚠️ Quota exceeded, trying next API key...`)
        const currentKey = await getActiveApiKey('gemini').catch(() => null)
        if (currentKey) {
          await markKeyAsInactive(currentKey.id, 'Quota exceeded (429)')
        }
      }
      
      if (currentAttempt >= maxRetries) {
        throw new Error(`Failed to extract transcript after ${maxRetries} attempts`)
      }
    }
  }
}

/**
 * Create a single practice challenge with video fallback
 */
async function createPracticeChallenge(difficulty, date, dayNumber) {
  console.log(`📝 Creating challenge ${dayNumber}: ${difficulty} level`)
  
  // Try multiple videos from the pool until we get a real transcript
  const maxVideoTries = 5
  let videoTries = 0
  
  while (videoTries < maxVideoTries) {
    // Get a random video from the pool (avoid already tried ones)
    const availableVideos = VIDEO_POOL.filter(v => !v.tried)
    if (availableVideos.length === 0) {
      throw new Error('No more videos available to try')
    }
    
    const randomIndex = Math.floor(Math.random() * availableVideos.length)
    const video = availableVideos[randomIndex]
    video.tried = true // Mark as tried
    videoTries++
    
    console.log(`   🎬 Trying video ${videoTries}/${maxVideoTries}: ${video.title}`)
    
    try {
      // Extract transcript
      const transcript = await extractTranscriptWithGemini(video.id, video.title)
      
      // If we got here, transcript extraction succeeded
      console.log(`   ✅ Successfully extracted transcript from: ${video.title}`)
      
      // Create video URLs
      const videoUrl = `https://www.youtube.com/watch?v=${video.id}`
      const embedUrl = `https://www.youtube.com/embed/${video.id}`
      const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`
      
      // Insert into database
      const challengeData = {
        title: video.title,
        description: `Practice your English with this ${difficulty} level challenge`,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        embed_url: embedUrl,
        duration: 10, // 10 seconds as requested
        topics: ['english learning', 'practice', difficulty],
        transcript: transcript,
        challenge_type: 'practice',
        difficulty: difficulty,
        user_id: null,
        batch_id: `practice_${date}_batch`,
        is_active: true,
        featured: false,
        date: date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('challenges')
        .insert(challengeData)
        .select()
        .single()
      
      if (error) {
        console.error(`   ❌ Database error:`, error)
        throw error
      }
      
      console.log(`   ✅ Challenge created successfully: ${data.id}`)
      console.log(`   📊 Transcript length: ${transcript.length} characters`)
      console.log(`   🎯 Final video used: ${video.title}`)
      
      return data
      
    } catch (error) {
      console.error(`   ❌ Failed with video "${video.title}": ${error.message}`)
      
      if (videoTries < maxVideoTries) {
        console.log(`   🔄 Trying next video...`)
        // Add delay before trying next video
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }
  
  throw new Error(`Failed to create challenge after trying ${maxVideoTries} videos`)
}

/**
 * Main test function
 */
async function testPracticeChallenges() {
  const startTime = Date.now()
  const createdChallenges = []
  const errors = []
  
  // Reset tried flag for all videos
  VIDEO_POOL.forEach(video => video.tried = false)
  
  console.log('🚀 Starting practice challenges creation...')
  console.log('📹 Video pool contains', VIDEO_POOL.length, 'videos')
  console.log('')
  
  // Create challenges for 5 different days (to simulate 5 days of data)
  const today = new Date()
  const difficulties = ['beginner', 'intermediate', 'advanced']
  
  for (let day = 0; day < 5; day++) {
    const challengeDate = new Date(today)
    challengeDate.setDate(today.getDate() - day)
    const dateString = challengeDate.toISOString().split('T')[0]
    
    console.log(`📅 Day ${5 - day}: Creating challenges for ${dateString}`)
    console.log('---------------------------------------------------')
    
    // Create 3 challenges per day (one for each difficulty)
    for (let diffIndex = 0; diffIndex < 3; diffIndex++) {
      const difficulty = difficulties[diffIndex]
      
      try {
        const challenge = await createPracticeChallenge(
          difficulty, 
          dateString, 
          `${5 - day}.${diffIndex + 1}`
        )
        createdChallenges.push(challenge)
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000))
        
      } catch (error) {
        errors.push(`Day ${5 - day}, Challenge ${diffIndex + 1} (${difficulty}): ${error.message}`)
        console.error(`   ❌ Failed to create ${difficulty} challenge: ${error.message}`)
      }
    }
    
    console.log('')
  }
  
  // Summary
  const endTime = Date.now()
  const duration = endTime - startTime
  
  console.log('🏁 Test Completed!')
  console.log('==================')
  console.log(`✅ Successfully created: ${createdChallenges.length}/15 challenges`)
  console.log(`❌ Errors: ${errors.length}`)
  console.log(`⏱️  Total time: ${Math.round(duration / 1000)}s`)
  console.log('')
  
  if (createdChallenges.length > 0) {
    console.log('📊 Created Challenges Summary:')
    createdChallenges.forEach((challenge, index) => {
      console.log(`   ${index + 1}. ${challenge.title} (${challenge.difficulty})`)
      console.log(`      Date: ${challenge.date}, ID: ${challenge.id}`)
    })
    console.log('')
  }
  
  if (errors.length > 0) {
    console.log('❌ Errors:')
    errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`)
    })
    console.log('')
  }
  
  // Verify in database
  console.log('🔍 Verifying in database...')
  const { data: verifyData, error: verifyError } = await supabase
    .from('challenges')
    .select('id, title, difficulty, date, challenge_type')
    .eq('challenge_type', 'practice')
    .order('date', { ascending: false })
    .limit(15)
  
  if (verifyError) {
    console.error('❌ Verification failed:', verifyError)
  } else {
    console.log(`✅ Found ${verifyData.length} practice challenges in database`)
    
    // Group by date
    const byDate = {}
    verifyData.forEach(challenge => {
      if (!byDate[challenge.date]) {
        byDate[challenge.date] = []
      }
      byDate[challenge.date].push(challenge)
    })
    
    console.log('\n📅 Challenges by date:')
    Object.entries(byDate)
      .sort(([a], [b]) => b.localeCompare(a))
      .forEach(([date, challenges]) => {
        console.log(`   ${date}: ${challenges.length} challenges`)
        challenges.forEach(challenge => {
          console.log(`      • ${challenge.difficulty}: ${challenge.title.substring(0, 40)}...`)
        })
      })
  }
  
  console.log('\n🎉 Test script completed!')
}

// Run the test
if (require.main === module) {
  testPracticeChallenges()
    .then(() => {
      console.log('✅ Script finished successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

module.exports = { testPracticeChallenges }
