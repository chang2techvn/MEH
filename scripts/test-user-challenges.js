#!/usr/bin/env node

/**
 * Test script to create user-generated challenges with real transcripts using Gemini AI
 * Usage: node scripts/test-user-challenges.js
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

console.log('🧪 Testing User-Generated Challenges Creation')
console.log('=============================================')
console.log('🎯 Goal: Test user challenge creation with YouTube URLs')
console.log('📊 Each challenge will have a real transcript via Gemini AI')
console.log('👤 Simulating different users creating challenges')
console.log('')

// Test YouTube URLs for user-generated challenges (various topics)
const TEST_URLS = [
  {
    url: 'https://www.youtube.com/watch?v=UF8uR6Z6KLc',
    title: 'The Power of Vulnerability - Brené Brown',
    difficulty: 'intermediate',
    expectedDuration: 1200 // 20 minutes
  },
  {
    url: 'https://www.youtube.com/watch?v=ZXsQAXx_ao0',
    title: 'How to Speak so People Want to Listen',
    difficulty: 'advanced',
    expectedDuration: 540 // 9 minutes
  },
  {
    url: 'https://www.youtube.com/watch?v=WqStqyuAiIM',
    title: 'Learn English - Basic Introduction',
    difficulty: 'beginner',
    expectedDuration: 600 // 10 minutes
  },
  {
    url: 'https://www.youtube.com/watch?v=eIho2S0ZahI',
    title: 'How to Have Better Conversations',
    difficulty: 'intermediate',
    expectedDuration: 720 // 12 minutes
  },
  {
    url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    title: 'English Idioms Explained',
    difficulty: 'advanced',
    expectedDuration: 480 // 8 minutes
  }
]

// Test user IDs (real users from Supabase database)
const TEST_USERS = [
  '13df7bf1-d38f-4b58-b444-3dfa67e04f17', // teacher1@university.edu (teacher)
  '63b605f9-bb19-4c10-97b1-6b1188c1d5e3', // john.smith@university.edu (student)
  '870abf1d-8236-4d98-9746-e9d2cd3457d2', // teacher2@university.edu (teacher)
  'ad95dc22-bc3c-4efc-8f75-15c573364d34', // ahmed.hassan@university.edu (student)
  'd00bf226-620a-4f21-bd10-a7e29d49b923'  // david.johnson@university.edu (student)
]

/**
 * Extract YouTube video ID from URL
 */
function extractYoutubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

/**
 * Extract video metadata from YouTube
 */
async function getVideoMetadata(videoId) {
  try {
    console.log(`   🔍 Fetching metadata for video: ${videoId}`)
    
    // Fetch video details from YouTube page
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch video details with status: ${response.status}`)
    }

    const html = await response.text()
    
    // Simple extraction (in real implementation, use cheerio)
    let title = "Educational Video"
    let description = "Learn with this educational video"
    let duration = 300 // Default 5 minutes

    // Extract title from meta tag
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/)
    if (titleMatch) {
      title = titleMatch[1].replace(" - YouTube", "")
    }

    // Extract description from meta tag
    const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/)
    if (descMatch) {
      description = descMatch[1]
    }

    // Try to extract duration (simplified)
    const durationMatch = html.match(/"lengthSeconds":"(\d+)"/)
    if (durationMatch) {
      duration = parseInt(durationMatch[1])
    }

    console.log(`   ✅ Metadata extracted: "${title}" (${duration}s)`)
    
    return {
      videoId,
      title,
      description,
      duration,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`
    }
  } catch (error) {
    console.error(`   ❌ Error fetching metadata: ${error.message}`)
    throw error
  }
}

/**
 * Extract transcript using Gemini AI with API key rotation
 */
async function extractTranscriptWithGemini(videoId, videoTitle, maxWatchTimeSeconds = 300) {
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
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192,
        }
      })

      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

      console.log(`   🤖 Requesting transcript from Gemini for: ${videoUrl} (first ${maxWatchTimeSeconds}s)`)
      
      // Create content using the proper format with time limit
      const prompt = `Please transcribe ONLY the first ${maxWatchTimeSeconds} seconds of this YouTube video.

IMPORTANT REQUIREMENTS:
- Extract spoken words from ONLY the first ${maxWatchTimeSeconds} seconds (${Math.floor(maxWatchTimeSeconds/60)} minutes ${maxWatchTimeSeconds%60} seconds)
- Do NOT transcribe beyond ${maxWatchTimeSeconds} seconds
- Provide the transcript exactly as spoken within this time limit
- Format as continuous paragraphs with proper punctuation
- Do not summarize, do not add commentary, just transcribe what is actually spoken in the first ${maxWatchTimeSeconds} seconds

Video Title: ${videoTitle}
Video URL: ${videoUrl}
Time limit: First ${maxWatchTimeSeconds} seconds only`
      
      const result = await model.generateContent([
        {
          fileData: {
            mimeType: "video/*", 
            fileUri: videoUrl
          }
        },
        prompt
      ])
      
      const response = await result.response
      const transcript = response.text().trim()
      
      console.log(`   📝 Raw response length: ${transcript.length} characters`)
      console.log(`   📄 Preview: "${transcript.substring(0, 100)}..."`)

      // Check if Gemini couldn't access the video
      if (transcript.includes('CANNOT_ACCESS_VIDEO') || 
          transcript.includes('cannot access') || 
          transcript.includes('unable to access') ||
          transcript.includes('I cannot') ||
          transcript.includes('I don\'t have') ||
          transcript.includes('I can\'t access') ||
          transcript.includes('I\'m unable to') ||
          transcript.includes('I am unable to') ||
          transcript.length < 100) {
        throw new Error('Gemini cannot access this YouTube video or provided insufficient content')
      }

      // Clean the transcript text
      let cleanTranscript = transcript
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/^[\s]*Transcript:[\s]*/i, '') // Remove "Transcript:" prefix
        .replace(/\[Music\]/gi, '')
        .replace(/\[Applause\]/gi, '')
        .replace(/\[Laughter\]/gi, '')
        .replace(/\[Sound effects?\]/gi, '')
        .replace(/\[Background music\]/gi, '')
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()

      // Validate we have substantial, real content
      if (cleanTranscript.length < 100) {
        throw new Error(`Transcript too short: ${cleanTranscript.length} characters`)
      }

      // Increment usage on success
      await incrementUsage(apiKeyData.id)
      console.log(`   📊 API key usage incremented`)
      
      console.log(`   ✅ Transcript extracted successfully: ${cleanTranscript.length} characters`)
      return cleanTranscript
      
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
        throw new Error(`Failed to extract transcript after ${maxRetries} attempts: ${error.message}`)
      }
    }
  }
}

/**
 * Extract topics from title and description
 */
function extractTopics(title, description) {
  const commonTopics = [
    "Technology", "Science", "Education", "Health", "Environment",
    "Business", "Economics", "Politics", "Culture", "Art", "History",
    "Psychology", "Philosophy", "Language", "Communication",
    "Climate Change", "Artificial Intelligence", "Sustainability",
    "Innovation", "Leadership", "Personal Development", "Social Media"
  ]

  const content = `${title} ${description}`.toLowerCase()
  const matchedTopics = commonTopics.filter(topic => 
    content.includes(topic.toLowerCase())
  )

  if (matchedTopics.length === 0) {
    return ["Education", "English Learning"]
  }
  return matchedTopics
}

/**
 * Create a user-generated challenge
 */
async function createUserChallenge(testData, userId, challengeIndex) {
  console.log(`📝 Creating user challenge ${challengeIndex + 1}: ${testData.title}`)
  console.log(`   👤 User: ${userId}`)
  console.log(`   📹 URL: ${testData.url}`)
  console.log(`   🎚️ Difficulty: ${testData.difficulty}`)
  
  try {
    // Extract video ID
    const videoId = extractYoutubeId(testData.url)
    if (!videoId) {
      throw new Error('Invalid YouTube URL - could not extract video ID')
    }
    
    console.log(`   🎬 Video ID: ${videoId}`)
    
    // Get video metadata
    const metadata = await getVideoMetadata(videoId)
    
    // Extract transcript with 5-minute limit (like admin settings)
    const transcript = await extractTranscriptWithGemini(videoId, metadata.title, 300)
    
    // Extract topics
    const topics = extractTopics(metadata.title, metadata.description)
    
    // Create challenge data
    const today = new Date().toISOString().split('T')[0]
    const challengeData = {
      title: metadata.title,
      description: metadata.description,
      video_url: metadata.videoUrl,
      thumbnail_url: metadata.thumbnailUrl,
      embed_url: metadata.embedUrl,
      duration: metadata.duration,
      topics: topics,
      transcript: transcript,
      challenge_type: 'user_generated',
      difficulty: testData.difficulty,
      user_id: userId,
      batch_id: null,
      is_active: true,
      featured: false,
      date: today,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log(`   💾 Inserting challenge into database...`)
    const { data, error } = await supabase
      .from('challenges')
      .insert(challengeData)
      .select()
      .single()
    
    if (error) {
      console.error(`   ❌ Database error:`, error)
      throw error
    }
    
    console.log(`   ✅ Challenge created successfully!`)
    console.log(`      ID: ${data.id}`)
    console.log(`      Title: ${data.title}`)
    console.log(`      Transcript: ${transcript.length} characters`)
    console.log(`      Topics: ${topics.join(', ')}`)
    console.log(`      Duration: ${metadata.duration} seconds`)
    
    return data
    
  } catch (error) {
    console.error(`   ❌ Failed to create challenge: ${error.message}`)
    throw error
  }
}

/**
 * Main test function
 */
async function testUserChallenges() {
  const startTime = Date.now()
  const createdChallenges = []
  const errors = []
  
  console.log('🚀 Starting user-generated challenges creation...')
  console.log(`📹 Testing ${TEST_URLS.length} different YouTube URLs`)
  console.log(`👥 Using ${TEST_USERS.length} test users`)
  console.log('')
  
  // Create challenges for each test URL
  for (let i = 0; i < TEST_URLS.length; i++) {
    const testData = TEST_URLS[i]
    const userId = TEST_USERS[i % TEST_USERS.length] // Rotate through users
    
    console.log(`📅 Challenge ${i + 1}/${TEST_URLS.length}`)
    console.log('==============================')
    
    try {
      const challenge = await createUserChallenge(testData, userId, i)
      createdChallenges.push(challenge)
      
      // Add delay to avoid rate limiting
      console.log(`   ⏳ Waiting 3 seconds before next challenge...`)
      await new Promise(resolve => setTimeout(resolve, 3000))
      
    } catch (error) {
      errors.push(`Challenge ${i + 1} (${testData.title}): ${error.message}`)
      console.error(`   ❌ Failed: ${error.message}`)
    }
    
    console.log('')
  }
  
  // Summary
  const endTime = Date.now()
  const duration = endTime - startTime
  
  console.log('🏁 Test Completed!')
  console.log('==================')
  console.log(`✅ Successfully created: ${createdChallenges.length}/${TEST_URLS.length} challenges`)
  console.log(`❌ Errors: ${errors.length}`)
  console.log(`⏱️  Total time: ${Math.round(duration / 1000)}s (avg: ${Math.round(duration / TEST_URLS.length / 1000)}s per challenge)`)
  console.log('')
  
  if (createdChallenges.length > 0) {
    console.log('📊 Created Challenges Summary:')
    createdChallenges.forEach((challenge, index) => {
      console.log(`   ${index + 1}. ${challenge.title}`)
      console.log(`      Difficulty: ${challenge.difficulty}`)
      console.log(`      User: ${challenge.user_id}`)
      console.log(`      Date: ${challenge.date}`)
      console.log(`      ID: ${challenge.id}`)
      console.log(`      Transcript: ${challenge.transcript.length} chars`)
      console.log('')
    })
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
    .select('id, title, difficulty, user_id, challenge_type, created_at')
    .eq('challenge_type', 'user_generated')
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (verifyError) {
    console.error('❌ Verification failed:', verifyError)
  } else {
    console.log(`✅ Found ${verifyData.length} user-generated challenges in database`)
    
    console.log('\n📋 Recent user challenges:')
    verifyData.forEach(challenge => {
      const shortUserId = challenge.user_id ? challenge.user_id.substring(0, 8) + '...' : 'null'
      console.log(`   • ${challenge.title.substring(0, 50)}... (${challenge.difficulty})`)
      console.log(`     User: ${shortUserId}, ID: ${challenge.id}`)
    })
  }
  
  console.log('\n🎉 User Challenge Test completed!')
  console.log('\nℹ️  This simulates the "Create New Challenge" functionality')
  console.log('ℹ️  Users can now paste YouTube URLs and get challenges with real transcripts')
}

// Run the test
if (require.main === module) {
  testUserChallenges()
    .then(() => {
      console.log('✅ Script finished successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

module.exports = { testUserChallenges, createUserChallenge, extractTranscriptWithGemini }
