import { NextRequest, NextResponse } from 'next/server'
import * as cron from 'node-cron'
import { getTodayVideo } from '@/app/actions/youtube-video'

// Global variable to store cron job
let dailyVideoJob: cron.ScheduledTask | null = null

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    switch (action) {
      case 'start':
        return startDailyVideoScheduler()
      case 'stop':
        return stopDailyVideoScheduler()
      case 'status':
        return getDailyVideoSchedulerStatus()
      case 'run-now':
        return runDailyVideoNow()
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function startDailyVideoScheduler() {
  try {
    // Stop existing job if running
    if (dailyVideoJob) {
      dailyVideoJob.stop()
      dailyVideoJob.destroy()
    }

    // Schedule job to run at 23:59 every day
    dailyVideoJob = cron.schedule('59 23 * * *', async () => {
      console.log('🕐 Daily video scheduler triggered at 23:59')
      try {
        await getTodayVideo()
        console.log('✅ Daily video crawl completed successfully')
      } catch (error) {
        console.error('❌ Daily video crawl failed:', error)
      }    }, {
      timezone: "Asia/Ho_Chi_Minh" // Vietnam timezone
    })

    // Start the job
    dailyVideoJob.start()

    return NextResponse.json({
      success: true,
      message: 'Daily video scheduler started successfully',
      schedule: '23:59 every day (Vietnam time)',
      status: 'running'
    })

  } catch (error) {
    console.error('Error starting scheduler:', error)
    return NextResponse.json({ error: 'Failed to start scheduler' }, { status: 500 })
  }
}

function stopDailyVideoScheduler() {
  try {
    if (dailyVideoJob) {
      dailyVideoJob.stop()
      dailyVideoJob.destroy()
      dailyVideoJob = null
    }

    return NextResponse.json({
      success: true,
      message: 'Daily video scheduler stopped successfully',
      status: 'stopped'
    })

  } catch (error) {
    console.error('Error stopping scheduler:', error)
    return NextResponse.json({ error: 'Failed to stop scheduler' }, { status: 500 })
  }
}

function getDailyVideoSchedulerStatus() {
  const isRunning = dailyVideoJob !== null
  
  return NextResponse.json({
    success: true,
    status: isRunning ? 'running' : 'stopped',
    schedule: isRunning ? '23:59 every day (Vietnam time)' : 'Not scheduled',
    nextRun: isRunning ? getNextRunTime() : null
  })
}

async function runDailyVideoNow() {
  try {
    console.log('🚀 Manual trigger: Running daily video crawl now...')
    await getTodayVideo()
    
    return NextResponse.json({
      success: true,
      message: 'Daily video crawl completed successfully'
    })

  } catch (error) {
    console.error('Error running daily video crawl:', error)
    return NextResponse.json({ 
      error: 'Failed to run daily video crawl',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function getNextRunTime(): string {
  const now = new Date()
  const next = new Date()
  
  // Set to 23:59 today
  next.setHours(23, 59, 0, 0)
  
  // If it's already past 23:59 today, set to tomorrow
  if (now > next) {
    next.setDate(next.getDate() + 1)
  }
  
  return next.toISOString()
}

// Auto-start scheduler when server starts
export async function GET() {
  return getDailyVideoSchedulerStatus()
}

// Initialize scheduler on module load (when server starts)
if (process.env.NODE_ENV === 'production') {
  // Auto-start in production
  setTimeout(() => {
    startDailyVideoScheduler()
    console.log('🚀 Daily video scheduler auto-started in production mode')
  }, 5000) // Wait 5 seconds for server to fully initialize
}
