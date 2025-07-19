#!/usr/bin/env node

/**
 * Test script specifically for the "Create New Challenge" modal workflow
 * Tests the same functionality as the modal but from command line
 * Usage: node scripts/test-create-challenge-modal.js
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

console.log('🧪 Testing Create Challenge Modal Workflow')
console.log('==========================================')
console.log('🎯 This tests the exact same flow as the "Create New Challenge" modal')
console.log('📝 Reproduces the stuck "Creating..." state issue')
console.log('')

// Test scenarios - same URLs users would paste into the modal
const TEST_SCENARIOS = [
  {
    name: 'TED Talk - Short',
    url: 'https://www.youtube.com/watch?v=UF8uR6Z6KLc',
    description: 'Power of Vulnerability by Brené Brown',
    expectedSuccess: true
  },
  {
    name: 'English Learning Video',
    url: 'https://www.youtube.com/watch?v=WqStqyuAiIM',
    description: 'Basic English Introduction',
    expectedSuccess: true
  },
  {
    name: 'Invalid URL',
    url: 'https://www.youtube.com/watch?v=INVALID123',
    description: 'This should fail gracefully',
    expectedSuccess: false
  },
  {
    name: 'Non-YouTube URL',
    url: 'https://google.com',
    description: 'This should be rejected',
    expectedSuccess: false
  }
]

// Test user ID (real user from Supabase database)
const TEST_USER_ID = '13df7bf1-d38f-4b58-b444-3dfa67e04f17' // teacher1@university.edu

/**
 * Extract YouTube video ID from URL
 */
function extractYoutubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

/**
 * Get video metadata from YouTube
 */
async function getVideoMetadata(videoId) {
  try {
    console.log(`      🔍 Fetching metadata for video: ${videoId}`)
    
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch video details with status: ${response.status}`)
    }

    const html = await response.text()
    
    let title = "Educational Video"
    let description = "Learn with this educational video"
    let duration = 300

    // Extract title
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/)
    if (titleMatch) {
      title = titleMatch[1].replace(" - YouTube", "")
    }

    // Extract description
    const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/)
    if (descMatch) {
      description = descMatch[1]
    }

    // Extract duration
    const durationMatch = html.match(/"lengthSeconds":"(\d+)"/)
    if (durationMatch) {
      duration = parseInt(durationMatch[1])
    }

    console.log(`      ✅ Metadata: "${title}" (${duration}s)`)
    
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
    console.error(`      ❌ Metadata error: ${error.message}`)
    throw error
  }
}

/**
 * Extract transcript using Gemini AI (same as Create Challenge modal)
 */
async function extractTranscriptWithGemini(videoId, videoTitle, maxWatchTimeSeconds = 300) {
  const maxRetries = 3
  let currentAttempt = 0
  
  while (currentAttempt < maxRetries) {
    try {
      currentAttempt++
      console.log(`      🔄 Transcript extraction attempt ${currentAttempt}/${maxRetries}`)
      
      const apiKeyData = await getActiveApiKey('gemini')
      if (!apiKeyData) {
        throw new Error('No active API key found')
      }
      
      console.log(`      🔑 Using API key: ${apiKeyData.key_name}`)
      
      const genAI = new GoogleGenerativeAI(apiKeyData.decrypted_key)
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192,
        }
      })

      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

      console.log(`      🤖 Requesting transcript from Gemini (first ${maxWatchTimeSeconds}s)`)
      
      const prompt = `Please transcribe ONLY the first ${maxWatchTimeSeconds} seconds of this YouTube video.

IMPORTANT REQUIREMENTS:
- Extract spoken words from ONLY the first ${maxWatchTimeSeconds} seconds
- Provide the transcript exactly as spoken within this time limit
- Format as continuous paragraphs with proper punctuation
- Do not summarize, do not add commentary, just transcribe

Video Title: ${videoTitle}
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
      
      console.log(`      📝 Raw response: ${transcript.length} characters`)

      // Check if Gemini couldn't access the video
      if (transcript.includes('cannot access') || 
          transcript.includes('unable to access') ||
          transcript.includes('I cannot') ||
          transcript.length < 100) {
        throw new Error('Gemini cannot access this YouTube video')
      }

      // Clean transcript
      let cleanTranscript = transcript
        .replace(/```[\s\S]*?```/g, '')
        .replace(/^[\s]*Transcript:[\s]*/i, '')
        .replace(/\[Music\]/gi, '')
        .replace(/\[Applause\]/gi, '')
        .replace(/\s+/g, ' ')
        .trim()

      if (cleanTranscript.length < 100) {
        throw new Error(`Transcript too short: ${cleanTranscript.length} characters`)
      }

      await incrementUsage(apiKeyData.id)
      console.log(`      ✅ Transcript extracted: ${cleanTranscript.length} characters`)
      return cleanTranscript
      
    } catch (error) {
      console.error(`      ❌ Attempt ${currentAttempt} failed: ${error.message}`)
      
      if (error.message.includes('403') || error.message.includes('Invalid')) {
        const currentKey = await getActiveApiKey('gemini').catch(() => null)
        if (currentKey) {
          await markKeyAsInactive(currentKey.id, 'Invalid API key (403)')
        }
      } else if (error.message.includes('429') || error.message.includes('quota')) {
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
 * Extract video data from URL (same as Create Challenge modal)
 */
async function extractVideoFromUrl(url) {
  console.log(`   📹 Extracting video data from: ${url}`)
  
  // Validate YouTube URL
  const videoId = extractYoutubeId(url)
  if (!videoId) {
    throw new Error('Invalid YouTube URL - could not extract video ID')
  }
  
  console.log(`   🎬 Video ID: ${videoId}`)
  
  // Get metadata
  const metadata = await getVideoMetadata(videoId)
  
  // Get transcript (5 minutes like admin settings)
  const transcript = await extractTranscriptWithGemini(videoId, metadata.title, 300)
  
  return {
    videoId,
    title: metadata.title,
    description: metadata.description,
    duration: metadata.duration,
    thumbnailUrl: metadata.thumbnailUrl,
    videoUrl: metadata.videoUrl,
    embedUrl: metadata.embedUrl,
    transcript
  }
}

/**
 * Create challenge in database (same as Create Challenge modal)
 */
async function createChallenge(challengeData) {
  console.log(`   💾 Creating challenge in database...`)
  
  const { videoData, userId } = challengeData
  
  // Extract topics
  const content = `${videoData.title} ${videoData.description}`.toLowerCase()
  const commonTopics = [
    "Technology", "Science", "Education", "Health", "Environment",
    "Business", "Economics", "Politics", "Culture", "Art", "History",
    "Psychology", "Philosophy", "Language", "Communication"
  ]
  
  const topics = commonTopics.filter(topic => 
    content.includes(topic.toLowerCase())
  )
  
  if (topics.length === 0) {
    topics.push("Education", "English Learning")
  }
  
  const today = new Date().toISOString().split('T')[0]
  const dbData = {
    title: videoData.title,
    description: videoData.description,
    video_url: videoData.videoUrl,
    thumbnail_url: videoData.thumbnailUrl,
    embed_url: videoData.embedUrl,
    duration: videoData.duration,
    topics: topics,
    transcript: videoData.transcript,
    challenge_type: 'user_generated',
    difficulty: 'intermediate',
    user_id: userId,
    batch_id: null,
    is_active: true,
    featured: false,
    date: today,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  const { data, error } = await supabase
    .from('challenges')
    .insert(dbData)
    .select()
    .single()
  
  if (error) {
    console.error(`   ❌ Database error:`, error)
    throw error
  }
  
  console.log(`   ✅ Challenge created: ${data.id}`)
  return data
}

/**
 * Test the extractVideoFromUrl function (first step in modal)
 */
async function testVideoExtraction(scenario) {
  console.log(`📹 Testing video extraction: ${scenario.name}`)
  console.log(`   URL: ${scenario.url}`)
  
  try {
    console.log('   🔄 Calling extractVideoFromUrl...')
    const videoData = await extractVideoFromUrl(scenario.url)
    
    console.log('   ✅ Video extraction successful!')
    console.log('   📊 Video data:')
    console.log(`      Video ID: ${videoData.videoId}`)
    console.log(`      Title: ${videoData.title}`)
    console.log(`      Duration: ${videoData.duration} seconds`)
    console.log(`      Transcript length: ${videoData.transcript?.length || 0} characters`)
    
    if (videoData.transcript) {
      console.log(`      Transcript preview: "${videoData.transcript.substring(0, 100)}..."`)
    }
    
    return videoData
    
  } catch (error) {
    if (scenario.expectedSuccess) {
      console.error('   ❌ Unexpected failure in video extraction:')
      console.error(`      Error: ${error.message}`)
      console.error(`      Stack: ${error.stack}`)
    } else {
      console.log('   ⚠️ Expected failure in video extraction:')
      console.log(`      Error: ${error.message}`)
    }
    throw error
  }
}

/**
 * Test the createChallenge function (second step in modal)
 */
async function testChallengeCreation(videoData, scenario) {
  console.log(`   💾 Testing challenge creation...`)
  
  try {
    const challengeData = {
      videoData: videoData,
      userId: TEST_USER_ID
    }
    
    console.log('   🔄 Calling createChallenge...')
    const result = await createChallenge(challengeData)
    
    console.log('   ✅ Challenge creation successful!')
    console.log('   📊 Challenge data:')
    console.log(`      Challenge ID: ${result.id}`)
    console.log(`      Title: ${result.title}`)
    console.log(`      Type: ${result.challenge_type}`)
    console.log(`      User ID: ${result.user_id}`)
    
    return result
    
  } catch (error) {
    if (scenario.expectedSuccess) {
      console.error('   ❌ Unexpected failure in challenge creation:')
      console.error(`      Error: ${error.message}`)
      console.error(`      Stack: ${error.stack}`)
    } else {
      console.log('   ⚠️ Expected failure in challenge creation:')
      console.log(`      Error: ${error.message}`)
    }
    throw error
  }
}

/**
 * Test a complete scenario (like what happens when user clicks "Create Challenge")
 */
async function testCompleteScenario(scenario, index) {
  console.log(`\n🎬 Scenario ${index + 1}: ${scenario.name}`)
  console.log('================================')
  console.log(`Description: ${scenario.description}`)
  console.log(`Expected to succeed: ${scenario.expectedSuccess}`)
  
  const startTime = Date.now()
  
  try {
    // Step 1: Extract video data (like the modal does)
    const videoData = await testVideoExtraction(scenario)
    
    // Step 2: Create challenge (like the modal does)
    const challenge = await testChallengeCreation(videoData, scenario)
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`   ⏱️  Total time: ${duration}ms`)
    console.log(`   ✅ Scenario completed successfully!`)
    
    return { success: true, challenge, duration }
    
  } catch (error) {
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`   ⏱️  Failed after: ${duration}ms`)
    
    if (scenario.expectedSuccess) {
      console.log(`   ❌ Scenario failed unexpectedly!`)
      return { success: false, error, duration, unexpected: true }
    } else {
      console.log(`   ✅ Scenario failed as expected`)
      return { success: false, error, duration, unexpected: false }
    }
  }
}

/**
 * Main test function
 */
async function testCreateChallengeWorkflow() {
  const startTime = Date.now()
  const results = []
  
  console.log('🚀 Starting Create Challenge Modal workflow test...')
  console.log(`🧪 Running ${TEST_SCENARIOS.length} test scenarios`)
  console.log(`👤 Test user ID: ${TEST_USER_ID}`)
  console.log('')
  
  // Test each scenario
  for (let i = 0; i < TEST_SCENARIOS.length; i++) {
    const scenario = TEST_SCENARIOS[i]
    const result = await testCompleteScenario(scenario, i)
    results.push({ scenario, result })
    
    // Add delay between tests
    if (i < TEST_SCENARIOS.length - 1) {
      console.log('\n   ⏳ Waiting 2 seconds before next test...')
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  // Summary
  const endTime = Date.now()
  const totalDuration = endTime - startTime
  
  console.log('\n🏁 Test Summary')
  console.log('===============')
  
  const successfulTests = results.filter(r => r.result.success).length
  const expectedFailures = results.filter(r => !r.result.success && !r.result.unexpected).length
  const unexpectedFailures = results.filter(r => r.result.unexpected).length
  
  console.log(`✅ Successful tests: ${successfulTests}`)
  console.log(`⚠️  Expected failures: ${expectedFailures}`)
  console.log(`❌ Unexpected failures: ${unexpectedFailures}`)
  console.log(`⏱️  Total time: ${Math.round(totalDuration / 1000)}s`)
  console.log('')
  
  // Detailed results
  console.log('📊 Detailed Results:')
  results.forEach((item, index) => {
    const { scenario, result } = item
    const status = result.success ? '✅' : 
                  result.unexpected ? '❌' : '⚠️'
    console.log(`   ${index + 1}. ${status} ${scenario.name} (${result.duration}ms)`)
    if (result.error && result.unexpected) {
      console.log(`      Error: ${result.error.message}`)
    }
  })
  
  // Check if any challenges were created
  if (successfulTests > 0) {
    console.log('\n🔍 Verifying created challenges in database...')
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('id, title, challenge_type, user_id, created_at')
      .eq('user_id', TEST_USER_ID)
      .eq('challenge_type', 'user_generated')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error('❌ Database verification failed:', error)
    } else {
      console.log(`✅ Found ${challenges.length} user challenges in database`)
      challenges.forEach(challenge => {
        console.log(`   • ${challenge.title} (ID: ${challenge.id})`)
      })
    }
  }
  
  console.log('\n🎉 Create Challenge Modal Test completed!')
  
  if (unexpectedFailures > 0) {
    console.log('\n⚠️  Some tests failed unexpectedly. This might indicate:')
    console.log('   - API key issues with Gemini AI')
    console.log('   - Database connection problems')
    console.log('   - YouTube video access issues')
    console.log('   - Network connectivity problems')
  } else {
    console.log('\n✅ All tests behaved as expected!')
    console.log('   The Create Challenge modal should work properly.')
  }
}

// Run the test
if (require.main === module) {
  testCreateChallengeWorkflow()
    .then(() => {
      console.log('\n✅ Test script finished successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Test script failed:', error)
      process.exit(1)
    })
}

module.exports = { testCreateChallengeWorkflow }
