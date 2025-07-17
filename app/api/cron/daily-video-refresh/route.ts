import { NextRequest, NextResponse } from 'next/server'
import { fetchRandomYoutubeVideo } from '@/app/actions/youtube-video'
import { generateDailyChallenges } from '@/app/actions/daily-challenges'
import { supabaseServer } from '@/lib/supabase-server'
import { getActiveApiKey, incrementUsage, markKeyAsInactive } from '@/lib/api-key-manager'

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🚀 Starting daily refresh at 23:59 (video + challenges)...')
    const startTime = Date.now()
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format

    type VideoResult = {
      existing: boolean;
      videoId?: string;
      videoTitle?: string;
      videoUrl?: string;
      error?: string;
    }

    type ChallengesResult = {
      existing: boolean;
      challengeCount?: number;
      challengeIds?: string[];
      challengeTitles?: string[];
      error?: string;
    }

    const results: {
      video: VideoResult | null;
      challenges: ChallengesResult | null;
    } = {
      video: null,
      challenges: null
    }

    // 1. Refresh daily video for homepage "/"
    console.log('1. Refreshing daily video for homepage...')
    try {
      const { data: existingVideo } = await supabaseServer
        .from('daily_videos')
        .select('id')
        .eq('date', today)
        .single()

      if (existingVideo) {
        console.log('📺 Video already exists for today')
        results.video = { existing: true, videoId: existingVideo.id }
      } else {
        console.log('🎯 Fetching new video with transcript...')
        
        // Retry video fetching until we get one with a successful transcript
        const maxVideoRetries = 3
        let videoAttempt = 0
        let successfulVideo = null
        
        while (videoAttempt < maxVideoRetries && !successfulVideo) {
          try {
            videoAttempt++
            console.log(`🔄 Video fetch attempt ${videoAttempt}/${maxVideoRetries}`)
            
            const newVideo = await fetchRandomYoutubeVideo(
              120,  // min 2 minutes
              1800, // max 30 minutes
              ["english learning", "education", "ted talk", "communication", "business", "technology"]
            )

            // Extract transcript using Gemini AI with API key rotation
            console.log(`🎬 Extracting transcript for video: ${newVideo.id}`)
            let transcript = newVideo.transcript
            
            if (!transcript || transcript === "Transcript unavailable" || transcript.length < 100) {
              try {
                transcript = await extractTranscriptWithApiKeyRotation(newVideo.id, newVideo.title, newVideo.description)
              } catch (transcriptError) {
                console.error(`❌ Failed to extract transcript for video ${newVideo.id}:`, transcriptError)
                // Try with a different video
                if (videoAttempt < maxVideoRetries) {
                  console.log(`🔄 Trying different video due to transcript extraction failure...`)
                  continue
                } else {
                  throw new Error(`Failed to extract transcript after trying ${maxVideoRetries} different videos`)
                }
              }
            }
            
            // If we reach here, we have a video with a valid transcript
            successfulVideo = { ...newVideo, transcript }
            console.log(`✅ Successfully found video with transcript: ${successfulVideo.id}`)
            
          } catch (videoFetchError) {
            console.error(`❌ Video fetch attempt ${videoAttempt} failed:`, videoFetchError)
            if (videoAttempt >= maxVideoRetries) {
              throw videoFetchError
            }
          }
        }
        
        if (!successfulVideo) {
          throw new Error('Failed to find a video with valid transcript after all attempts')
        }

        const { error } = await supabaseServer
          .from('daily_videos')
          .insert({
            id: successfulVideo.id,
            title: successfulVideo.title,
            description: successfulVideo.description,
            video_url: successfulVideo.videoUrl,
            thumbnail_url: successfulVideo.thumbnailUrl,
            embed_url: successfulVideo.embedUrl,
            duration: successfulVideo.duration,
            topics: successfulVideo.topics,
            transcript: successfulVideo.transcript, // Save transcript to database
            date: today,
            created_at: new Date().toISOString()
          })

        if (error) throw error

        results.video = {
          existing: false,
          videoId: successfulVideo.id,
          videoTitle: successfulVideo.title,
          videoUrl: successfulVideo.videoUrl
        }
        console.log('✅ New video saved for homepage with transcript')
        console.log(`📝 Transcript length: ${successfulVideo.transcript.length} characters`)
      }
    } catch (videoError) {
      console.error('❌ Error refreshing video:', videoError)
      results.video = { 
        existing: false,
        error: videoError instanceof Error ? videoError.message : 'Unknown error' 
      }
    }

    // 2. Refresh daily challenges for "/challenges"
    console.log('2. Refreshing daily challenges for /challenges page...')
    try {
      const { data: existingChallenges } = await supabaseServer
        .from('daily_challenges')
        .select('id')
        .eq('date', today)

      if (existingChallenges && existingChallenges.length > 0) {
        console.log(`📺 ${existingChallenges.length} challenges already exist for today`)
        results.challenges = { 
          existing: true, 
          challengeCount: existingChallenges.length,
          challengeIds: existingChallenges.map(c => c.id)
        }
      } else {
        const newChallenges = await generateDailyChallenges(1) // Generate only 1 challenge per day
        results.challenges = {
          existing: false,
          challengeCount: newChallenges.length,
          challengeIds: newChallenges.map(c => c.id),
          challengeTitles: newChallenges.map(c => c.title)
        }
        console.log('✅ New challenges saved for /challenges page')
      }
    } catch (challengesError) {
      console.error('❌ Error refreshing challenges:', challengesError)
      results.challenges = { 
        existing: false,
        error: challengesError instanceof Error ? challengesError.message : 'Unknown error' 
      }
    }

    const executionTime = Date.now() - startTime

    const response = {
      success: true,
      message: 'Daily refresh completed successfully at 23:59',
      data: {
        video: results.video,
        challenges: results.challenges,
        date: today,
        refreshTime: new Date().toISOString(),
        executionTimeMs: executionTime
      }
    }

    console.log('✅ Daily refresh completed successfully:', response.data)
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Daily video refresh failed:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        refreshTime: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}

/**
 * Extract transcript using Gemini AI with automatic API key rotation
 * Tries different API keys until successful or all keys are exhausted
 */
async function extractTranscriptWithApiKeyRotation(
  videoId: string, 
  videoTitle: string, 
  videoDescription: string
): Promise<string> {
  const maxRetries = 5 // Try up to 5 different API keys
  let currentAttempt = 0
  
  while (currentAttempt < maxRetries) {
    try {
      currentAttempt++
      console.log(`🔄 Transcript extraction attempt ${currentAttempt}/${maxRetries}`)
      
      // Get active API key for this attempt
      const apiKeyData = await getActiveApiKey('gemini')
      if (!apiKeyData) {
        throw new Error('No active API key found in database')
      }
      
      console.log(`🔑 Using API key: ${apiKeyData.key_name} for transcript extraction`)
      
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(apiKeyData.decrypted_key)
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash" // Use flash to save quota
      })

      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`
      console.log(`🤖 Using Gemini AI to extract transcript for video: ${videoId}`)

      const result = await model.generateContent([
        {
          fileData: {
            mimeType: "video/*",
            fileUri: youtubeUrl
          }
        },
        `Please provide the COMPLETE and ACCURATE transcript of this YouTube video.

REQUIREMENTS:
- Extract 100% of all spoken words from the entire video
- Include every single word that is spoken  
- Format as clean paragraphs with proper punctuation
- Do NOT summarize or paraphrase - give exact spoken words
- If there are multiple speakers, indicate speaker changes

Please transcribe the ENTIRE audio content word-for-word:`
      ])

      const response = await result.response
      const geminiTranscript = response.text()
      
      // Increment API key usage on successful response
      await incrementUsage(apiKeyData.id)
      console.log(`📊 API key usage incremented for: ${apiKeyData.key_name}`)
      
      if (geminiTranscript && geminiTranscript.length > 50) {
        const finalTranscript = geminiTranscript.trim()
        console.log(`✅ Gemini AI transcript extracted: ${finalTranscript.length} characters`)
        return finalTranscript
      } else {
        throw new Error('Gemini AI returned short or empty transcript')
      }
      
    } catch (error) {
      console.error(`❌ Transcript extraction attempt ${currentAttempt} failed:`, error)
      
      // Handle specific error cases for API key management
      if (error instanceof Error && currentAttempt < maxRetries) {
        if (error.message.includes('403') || error.message.includes('Invalid API key')) {
          console.log(`🚫 API key invalid (403), marking as inactive and trying next key`)
          const currentApiKeyData = await getActiveApiKey('gemini').catch(() => null)
          if (currentApiKeyData) {
            await markKeyAsInactive(currentApiKeyData.id, 'Invalid API key (403 Forbidden)')
          }
          continue // Try with next API key
        } else if (error.message.includes('429') || error.message.includes('quota')) {
          console.log(`⚠️ API key quota exceeded (429), marking as inactive and trying next key`)
          const currentApiKeyData = await getActiveApiKey('gemini').catch(() => null)
          if (currentApiKeyData) {
            await markKeyAsInactive(currentApiKeyData.id, 'Quota exceeded (429)')
          }
          continue // Try with next API key
        } else if (error.message.includes('500') || error.message.includes('503') || error.message.includes('overloaded')) {
          console.log(`🔄 Server error (${error.message.includes('503') ? '503' : '500'}), marking key as inactive and trying next key`)
          const currentApiKeyData = await getActiveApiKey('gemini').catch(() => null)
          if (currentApiKeyData) {
            await markKeyAsInactive(currentApiKeyData.id, `Server error (${error.message})`)
          }
          continue // Try with next API key
        }
      }
      
      // If it's the last attempt or not an API key issue, move to final attempt
      if (currentAttempt >= maxRetries) {
        console.error("❌ All transcript extraction attempts exhausted")
        break
      }
    }
  }
  
  // If all API key attempts failed, throw an error instead of using fallback
  throw new Error(`Failed to extract transcript after trying ${maxRetries} different API keys. No fallback content will be used.`)
}

