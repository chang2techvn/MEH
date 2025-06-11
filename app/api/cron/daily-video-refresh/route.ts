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
        results.video = { existing: true, videoId: existingVideo.id }
      } else {
        const newVideo = await fetchRandomYoutubeVideo(
          120,  // min 2 minutes
          1800, // max 30 minutes
          ["english learning", "education", "ted talk", "communication", "business", "technology"]
        )

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
        console.log('✅ New video saved for homepage')
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

