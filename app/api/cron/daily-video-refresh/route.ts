import { NextRequest, NextResponse } from 'next/server'
import { createChallenge } from '@/app/actions/youtube-video'
import { recoverInactiveApiKeys } from '@/app/actions/api-key-recovery'
import { 
  notifyVideoGenerationSuccess, 
  notifyVideoGenerationFailure, 
  notifyAutomationHealthCheck 
} from '@/app/actions/daily-video-admin'

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const startTime = Date.now()
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format

    const logData = {
      dailyChallenge: null as any,
      practiceChallenges: [] as any[],
      errors: [] as string[],
      apiKeyRecovery: null as any
    }

    // 1. Generate daily challenge (1 video for "Your Current Challenge")
    console.log('\n🎯 === GENERATING DAILY CHALLENGE ===')
    try {
      const dailyResult = await createChallenge('daily', {
        minDuration: 180,  // 3 minutes
        maxDuration: 600,  // 10 minutes
        preferredTopics: ['english learning', 'ted talk', 'communication', 'business']
      })
      
      if (dailyResult && !Array.isArray(dailyResult)) {
        logData.dailyChallenge = {
          id: dailyResult.id,
          title: dailyResult.title,
          difficulty: dailyResult.difficulty,
          challenge_type: 'daily'
        }
        console.log(`✅ Daily challenge generated: ${dailyResult.title}`)
        
        // Notify success
        await notifyVideoGenerationSuccess({
          title: dailyResult.title,
          duration: dailyResult.duration || 0,
          challenge_type: 'daily',
          difficulty: dailyResult.difficulty
        })
      } else {
        console.log('✅ Daily challenge already exists for today')
      }
    } catch (dailyError) {
      console.error('❌ Daily challenge generation failed:', dailyError)
      logData.errors.push(`Daily: ${dailyError}`)
      
      // Notify failure
      await notifyVideoGenerationFailure(
        'daily',
        dailyError instanceof Error ? dailyError.message : String(dailyError)
      )
    }

    // 2. Generate practice challenges (3 per day: 1 beginner + 1 intermediate + 1 advanced)
    console.log('\n📚 === GENERATING PRACTICE CHALLENGES (3 difficulties) ===')
    
    const difficulties: ('beginner' | 'intermediate' | 'advanced')[] = ['beginner', 'intermediate', 'advanced']
    
    for (const difficulty of difficulties) {
      try {
        console.log(`\n🔄 Generating ${difficulty} practice challenge...`)
        
        const practiceResult = await createChallenge('practice', {
          difficulty: difficulty,
          minDuration: 120,  // 2 minutes
          maxDuration: 480,  // 8 minutes
          count: 1, // Only 1 video per difficulty
          preferredTopics: getTopicsForDifficulty(difficulty)
        })
        
        const practiceArray = Array.isArray(practiceResult) ? practiceResult : [practiceResult]
        
        if (practiceArray.length > 0) {
          const challenge = practiceArray[0]
          logData.practiceChallenges.push({
            id: challenge.id,
            title: challenge.title,
            difficulty: challenge.difficulty,
            challenge_type: 'practice'
          })
          console.log(`✅ ${difficulty} practice challenge generated: ${challenge.title}`)
        } else {
          console.log(`✅ ${difficulty} practice challenge already exists for today`)
        }
        
        // Add small delay between requests to avoid rate limiting
        if (difficulty !== 'advanced') {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        
      } catch (practiceError) {
        console.error(`❌ ${difficulty} practice challenge generation failed:`, practiceError)
        logData.errors.push(`Practice ${difficulty}: ${practiceError}`)
      }
    }

    // 3. API Key Recovery (Auto-reactivate keys that have been inactive for 24+ hours)
    console.log('\n🔑 === API KEY RECOVERY ===')
    try {
      const recoveryResult = await recoverInactiveApiKeys('gemini')
      
      if (recoveryResult.success) {
        console.log(`✅ API Key Recovery completed: ${recoveryResult.recoveredKeys}/${recoveryResult.totalInactiveKeys} keys recovered`)
        logData.apiKeyRecovery = {
          success: true,
          recoveredKeys: recoveryResult.recoveredKeys,
          totalInactiveKeys: recoveryResult.totalInactiveKeys,
          errors: recoveryResult.errors
        }
      } else {
        console.log(`⚠️ API Key Recovery completed with issues: ${recoveryResult.errors.join(', ')}`)
        logData.apiKeyRecovery = {
          success: false,
          recoveredKeys: recoveryResult.recoveredKeys,
          totalInactiveKeys: recoveryResult.totalInactiveKeys,
          errors: recoveryResult.errors
        }
        logData.errors.push(`API Key Recovery: ${recoveryResult.errors.join(', ')}`)
      }
    } catch (recoveryError) {
      console.error('❌ API Key Recovery failed:', recoveryError)
      logData.errors.push(`API Key Recovery: ${recoveryError}`)
      logData.apiKeyRecovery = {
        success: false,
        recoveredKeys: 0,
        totalInactiveKeys: 0,
        errors: [recoveryError instanceof Error ? recoveryError.message : 'Unknown recovery error']
      }
    }

    const endTime = Date.now()
    const duration = endTime - startTime

    console.log(`\n🏁 === CRON JOB COMPLETED ===`)
    console.log(`Duration: ${duration}ms`)
    console.log(`Date: ${today}`)
    console.log(`Daily Challenge: ${logData.dailyChallenge ? 'Generated' : 'Existed'}`)
    console.log(`Practice Challenges: ${logData.practiceChallenges.length}/3 generated`)
    console.log(`API Key Recovery: ${logData.apiKeyRecovery?.recoveredKeys || 0} keys recovered`)
    console.log(`Errors: ${logData.errors.length}`)

    return NextResponse.json({
      success: true,
      date: today,
      duration: `${duration}ms`,
      generatedAt: new Date().toISOString(),
      dailyChallenge: logData.dailyChallenge,
      practiceChallenges: {
        count: logData.practiceChallenges.length,
        challenges: logData.practiceChallenges
      },
      apiKeyRecovery: logData.apiKeyRecovery,
      errors: logData.errors,
      message: `Auto-generated ${logData.practiceChallenges.length}/3 practice challenges + ${logData.dailyChallenge ? '1' : '0'} daily challenge + API key recovery`
    })

  } catch (error) {
    console.error('❌ Cron job failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      generatedAt: new Date().toISOString()
    }, { status: 500 })
  }
}

// GET endpoint for manual testing
export async function GET(request: NextRequest) {
  return POST(request)
}

/**
 * Get appropriate topics based on difficulty level
 */
function getTopicsForDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): string[] {
  switch (difficulty) {
    case 'beginner':
      return [
        'basic english vocabulary',
        'english for beginners', 
        'simple english conversation',
        'english pronunciation basics',
        'daily english expressions'
      ]
    case 'intermediate':
      return [
        'business english',
        'english idioms',
        'english presentation skills',
        'english conversation practice',
        'english for work'
      ]
    case 'advanced':
      return [
        'advanced english vocabulary',
        'professional english communication',
        'english public speaking',
        'english academic writing',
        'english debate techniques'
      ]
    default:
      return ['english learning']
  }
}