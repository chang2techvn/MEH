import { NextRequest, NextResponse } from 'next/server'
import { fetchRandomYoutubeVideo } from '@/app/actions/youtube-video'
import { generateDailyChallenges } from '@/app/actions/challenge-videos'
import { supabaseServer } from '@/lib/supabase-server'

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
        results.video = { existing: true, videoId: existingVideo.id }      } else {
        console.log('🎯 Fetching new video with transcript...')
        const newVideo = await fetchRandomYoutubeVideo(
          120,  // min 2 minutes
          1800, // max 30 minutes
          ["english learning", "education", "ted talk", "communication", "business", "technology"]
        )

        // Extract transcript using Gemini AI
        console.log(`🎬 Extracting transcript for video: ${newVideo.id}`)
        let transcript = newVideo.transcript
        
        if (!transcript || transcript === "Transcript unavailable" || transcript.length < 100) {
          try {
            const { GoogleGenerativeAI } = await import('@google/generative-ai')
            
            if (process.env.GEMINI_API_KEY) {
              const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
              const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash" // Use flash to save quota
              })

              const youtubeUrl = `https://www.youtube.com/watch?v=${newVideo.id}`
              console.log(`🤖 Using Gemini AI to extract transcript`)

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
              
              if (geminiTranscript && geminiTranscript.length > 50) {
                transcript = geminiTranscript.trim()
                console.log(`✅ Gemini AI transcript extracted: ${transcript.length} characters`)
              } else {
                console.log(`⚠️ Gemini AI returned short transcript, using fallback`)
                transcript = `Educational content about ${newVideo.title}. ${newVideo.description}`
              }
            } else {
              console.log(`⚠️ No GEMINI_API_KEY, using fallback transcript`)
              transcript = `Educational content about ${newVideo.title}. ${newVideo.description}`
            }
          } catch (error) {
            console.error("❌ Gemini AI transcript failed:", error)
            transcript = `Educational content about ${newVideo.title}. ${newVideo.description}`
          }
        }

        const { error } = await supabaseServer
          .from('daily_videos')
          .insert({
            id: newVideo.id,
            title: newVideo.title,
            description: newVideo.description,
            video_url: newVideo.videoUrl,
            thumbnail_url: newVideo.thumbnailUrl,
            embed_url: newVideo.embedUrl,
            duration: newVideo.duration,
            topics: newVideo.topics,
            transcript: transcript, // Save transcript to database
            date: today,
            created_at: new Date().toISOString()
          })

        if (error) throw error

        results.video = {
          existing: false,
          videoId: newVideo.id,
          videoTitle: newVideo.title,
          videoUrl: newVideo.videoUrl
        }
        console.log('✅ New video saved for homepage with transcript')
        console.log(`📝 Transcript length: ${transcript.length} characters`)
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
        const newChallenges = await generateDailyChallenges()
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

