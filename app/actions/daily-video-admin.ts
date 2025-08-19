"use server"

import { supabaseServer } from "@/lib/supabase-server"

// Get today's date in YYYY-MM-DD format  
function getTodayDate(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Get automation status
export async function getAutomationStatus(): Promise<{
  hasToday: boolean
  lastRunTime: string | null
  nextRunTime: string
  isHealthy: boolean
  errors: string[]
}> {
  const today = getTodayDate()
  const errors: string[] = []
  
  try {
    // Check if today's daily challenge exists
    const { data: dailyChallenge, error: dailyError } = await supabaseServer
      .from('challenges')
      .select('created_at, title')
      .eq('challenge_type', 'daily')
      .eq('date', today)
      .eq('is_active', true)
      .single()
    
    if (dailyError && dailyError.code !== 'PGRST116') {
      errors.push(`Daily challenge query error: ${dailyError.message}`)
    }
    
    // Check practice challenges count for today
    const { data: practiceCount, error: practiceError } = await supabaseServer
      .from('challenges')
      .select('difficulty')
      .eq('challenge_type', 'practice')
      .eq('date', today)
      .eq('is_active', true)
    
    if (practiceError) {
      errors.push(`Practice challenges query error: ${practiceError.message}`)
    }
    
    // Calculate next run time (23:59 today or tomorrow)
    const now = new Date()
    const nextRun = new Date()
    nextRun.setHours(23, 59, 0, 0)
    
    // If it's past 23:59 today, set for tomorrow
    if (now.getTime() >= nextRun.getTime()) {
      nextRun.setDate(nextRun.getDate() + 1)
    }
    
    return {
      hasToday: !!dailyChallenge,
      lastRunTime: dailyChallenge?.created_at || null,
      nextRunTime: nextRun.toISOString(),
      isHealthy: errors.length === 0 && !!dailyChallenge,
      errors
    }
  } catch (error) {
    errors.push(`Automation status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    
    return {
      hasToday: false,
      lastRunTime: null,
      nextRunTime: new Date().toISOString(),
      isHealthy: false,
      errors
    }
  }
}

// Get video generation history (last 7 days)
export async function getVideoGenerationHistory(): Promise<{
  date: string
  daily: { id: string; title: string; created_at: string | null } | null
  practice: { id: string; title: string; difficulty: string; created_at: string | null }[]
}[]> {
  try {
    // Get last 7 days
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }
    
    const history = []
    
    for (const date of dates) {
      // Get daily challenge
      const { data: daily } = await supabaseServer
        .from('challenges')
        .select('id, title, created_at')
        .eq('challenge_type', 'daily')
        .eq('date', date)
        .eq('is_active', true)
        .single()
      
      // Get practice challenges
      const { data: practice } = await supabaseServer
        .from('challenges')
        .select('id, title, difficulty, created_at')
        .eq('challenge_type', 'practice')
        .eq('date', date)
        .eq('is_active', true)
        .order('difficulty', { ascending: true })
      
      history.push({
        date,
        daily: daily || null,
        practice: practice || []
      })
    }
    
    return history
  } catch (error) {
    console.error('Error fetching video generation history:', error)
    return []
  }
}

// Manually trigger daily video automation
export async function triggerDailyVideoAutomation(): Promise<{
  success: boolean
  message: string
  data?: any
}> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret) {
      throw new Error('CRON_SECRET not configured')
    }
    
    const response = await fetch(`${baseUrl}/api/cron/daily-video-refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API request failed: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    
    return {
      success: true,
      message: 'Daily video automation triggered successfully',
      data
    }
  } catch (error) {
    console.error('Error triggering daily video automation:', error)
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Validate automation settings
export async function validateAutomationSettings(): Promise<{
  isValid: boolean
  issues: string[]
  recommendations: string[]
}> {
  const issues: string[] = []
  const recommendations: string[] = []
  
  try {
    // Check environment variables
    const requiredEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'CRON_SECRET']
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
    
    if (missingEnvVars.length > 0) {
      issues.push(`Missing environment variables: ${missingEnvVars.join(', ')}`)
    }
    
    // Check for Gemini API keys
    let geminiKeyCount = 0
    for (let i = 1; i <= 10; i++) {
      if (process.env[`GEMINI_API_KEY_${i}`]) {
        geminiKeyCount++
      }
    }
    
    if (geminiKeyCount === 0) {
      issues.push('No Gemini API keys found')
    } else if (geminiKeyCount < 3) {
      recommendations.push(`Consider adding more Gemini API keys for better reliability (current: ${geminiKeyCount})`)
    }
    
    // Check database connectivity
    const { error: dbError } = await supabaseServer
      .from('challenges')
      .select('id')
      .limit(1)
    
    if (dbError) {
      issues.push(`Database connectivity issue: ${dbError.message}`)
    }
    
    // Check daily video settings
    // Note: Commenting out for now as daily_video_settings table may not be in type definitions
    // const { data: settings } = await supabaseServer
    //   .from('daily_video_settings')
    //   .select('*')
    //   .limit(1)
    
    // if (!settings || settings.length === 0) {
    //   recommendations.push('Consider creating default daily video settings')
    // }
    
    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    }
  } catch (error) {
    return {
      isValid: false,
      issues: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      recommendations: []
    }
  }
}

// Admin notification helpers
export async function sendAdminNotification(
  type: 'success' | 'error' | 'warning' | 'info',
  title: string,
  message: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Log to console for now (can be extended to email/Slack/etc)
    const timestamp = new Date().toISOString()
    const logLevel = type === 'error' ? 'ERROR' : type === 'warning' ? 'WARN' : 'INFO'

    
  } catch (error) {
    console.error('Failed to send admin notification:', error)
  }
}

// Specific notification helpers
export async function notifyVideoGenerationSuccess(videoData: {
  title: string
  duration: number
  challenge_type: string
  difficulty?: string
}): Promise<void> {
  await sendAdminNotification(
    'success',
    'Video Generated Successfully',
    `New ${videoData.challenge_type} video: "${videoData.title}" (${Math.floor(videoData.duration / 60)}min)`,
    {
      title: videoData.title,
      duration: videoData.duration,
      type: videoData.challenge_type,
      difficulty: videoData.difficulty,
      timestamp: new Date().toISOString()
    }
  )
}

export async function notifyVideoGenerationFailure(
  challengeType: string,
  error: string,
  attemptCount?: number
): Promise<void> {
  await sendAdminNotification(
    'error',
    'Video Generation Failed',
    `Failed to generate ${challengeType} video: ${error}${attemptCount ? ` (attempt ${attemptCount})` : ''}`,
    {
      type: challengeType,
      error,
      attemptCount,
      timestamp: new Date().toISOString()
    }
  )
}

export async function notifyApiKeyIssue(
  keyName: string,
  issue: string,
  remainingKeys: number
): Promise<void> {
  await sendAdminNotification(
    'warning',
    'API Key Issue Detected',
    `API key "${keyName}" issue: ${issue}. Remaining active keys: ${remainingKeys}`,
    {
      keyName,
      issue,
      remainingKeys,
      timestamp: new Date().toISOString()
    }
  )
}

export async function notifyAutomationHealthCheck(
  status: 'healthy' | 'degraded' | 'failed',
  details: string,
  metrics?: Record<string, any>
): Promise<void> {
  const type = status === 'healthy' ? 'info' : status === 'degraded' ? 'warning' : 'error'
  
  await sendAdminNotification(
    type,
    `Daily Video Automation - ${status.toUpperCase()}`,
    details,
    {
      status,
      metrics,
      timestamp: new Date().toISOString()
    }
  )
}
