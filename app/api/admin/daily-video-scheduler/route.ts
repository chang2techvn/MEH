import { NextRequest, NextResponse } from 'next/server'
import * as cron from 'node-cron'

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
    }    // Schedule job to run at 23:59 every day
    dailyVideoJob = cron.schedule('59 23 * * *', async () => {
      try {
        // Call the daily-video-refresh endpoint
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        const cronSecret = process.env.CRON_SECRET
        
        if (!cronSecret) {
          console.error('❌ CRON_SECRET not found in environment')
          return
        }
        
        const response = await fetch(`${baseUrl}/api/cron/daily-video-refresh`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cronSecret}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
        } else {
          const errorText = await response.text()
          console.error('❌ Daily refresh failed:', response.status, errorText)
        }
      } catch (error) {
        console.error('❌ Daily refresh failed:', error)
      }
    }, {
      timezone: "Asia/Ho_Chi_Minh" // Vietnam timezone
    })    // Start the job
    dailyVideoJob.start();
    
    return NextResponse.json({
      success: true,
      message: 'Daily video & challenges scheduler started successfully',
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
    
    // Call the daily-video-refresh endpoint
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret) {
      console.error('❌ CRON_SECRET not found in environment')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    
    const response = await fetch(`${baseUrl}/api/cron/daily-video-refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        success: true,
        message: 'Daily video & challenges refresh completed successfully',
        data: data.data
      })
    } else {
      const errorText = await response.text()
      return NextResponse.json({ 
        error: 'Failed to run daily refresh',
        details: `${response.status}: ${errorText}`
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Error running daily refresh:', error)
    return NextResponse.json({ 
      error: 'Failed to run daily refresh',
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
  }, 5000) // Wait 5 seconds for server to fully initialize
}
