import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const difficulty = searchParams.get('difficulty')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    let query = supabaseServer
      .from('challenges')
      .select(`
        id,
        title,
        description,
        video_url,
        thumbnail_url,
        difficulty,
        duration,
        challenge_type,
        date,
        is_active,
        created_at,
        updated_at
      `)
      .eq('challenge_type', 'practice')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Add filters if provided
    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty)
    }

    if (dateFrom) {
      query = query.gte('date', dateFrom)
    }

    if (dateTo) {
      query = query.lte('date', dateTo)
    }

    const { data: challenges, error } = await query

    if (error) {
      console.error('Error fetching practice challenges:', error)
      return NextResponse.json(
        { error: 'Failed to fetch practice challenges' },
        { status: 500 }
      )
    }

    // Transform data to match frontend interface
    const transformedChallenges = challenges?.map(challenge => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description || '',
      videoUrl: challenge.video_url,
      video_url: challenge.video_url,
      thumbnailUrl: challenge.thumbnail_url,
      difficulty: challenge.difficulty,
      topics: [], // You might want to fetch this from a topics table
      duration: challenge.duration,
      createdAt: new Date(challenge.created_at || new Date()),
      updatedAt: new Date(challenge.updated_at || new Date()),
      isPublished: challenge.is_active,
      category: 'practice',
      tags: [],
      author: 'System',
      viewCount: 0,
      likeCount: 0,
      completionCount: 0,
      featured: false,
      embedUrl: challenge.video_url,
      challenge_type: challenge.challenge_type,
      date: challenge.date,
      is_active: challenge.is_active,
      created_at: challenge.created_at,
      updated_at: challenge.updated_at
    })) || []

    // Get total count for pagination
    const { count, error: countError } = await supabaseServer
      .from('challenges')
      .select('*', { count: 'exact', head: true })
      .eq('challenge_type', 'practice')

    if (countError) {
      console.error('Error counting practice challenges:', countError)
    }

    return NextResponse.json({
      challenges: transformedChallenges,
      total: count || 0,
      hasMore: (offset + limit) < (count || 0)
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
