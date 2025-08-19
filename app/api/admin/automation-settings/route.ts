import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET() {
  try {
    // For now, return default settings since we don't have automation table in types
    // In a real implementation, this would use daily_video_settings table
    const defaultSettings = {
      auto_fetch_enabled: true,
      schedule_time: "23:59",
      timezone: "Asia/Ho_Chi_Minh",
      min_watch_time: 180,
      max_watch_time: 1800,
      preferred_topics: [],
      topic_rotation_days: 7,
      require_transcript: true
    }

    return NextResponse.json({
      success: true,
      settings: defaultSettings
    })
  } catch (error) {
    console.error('Error in automation settings GET:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch automation settings' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const {
      auto_fetch_enabled = true,
      schedule_time = "23:59",
      timezone = "Asia/Ho_Chi_Minh",
      min_watch_time = 180,
      max_watch_time = 1800,
      preferred_topics = [],
      topic_rotation_days = 7,
      require_transcript = true
    } = body

    // Validate values
    if (min_watch_time < 60 || min_watch_time > 3600) {
      return NextResponse.json(
        { success: false, error: 'Minimum watch time must be between 60 and 3600 seconds' },
        { status: 400 }
      )
    }

    if (max_watch_time < 300 || max_watch_time > 1800) {
      return NextResponse.json(
        { success: false, error: 'Maximum watch time must be between 300 and 1800 seconds' },
        { status: 400 }
      )
    }

    if (min_watch_time >= max_watch_time) {
      return NextResponse.json(
        { success: false, error: 'Minimum watch time must be less than maximum watch time' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Automation settings updated successfully'
    })
  } catch (error) {
    console.error('Error in automation settings POST:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save automation settings' 
      },
      { status: 500 }
    )
  }
}
