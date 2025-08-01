import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    // Get user statistics
    const [
      { count: postsCount },
      { data: likesData },
      { count: commentsCount },
      { count: challengesCount }
    ] = await Promise.all([
      // Get posts count
      supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
      
      // Get total likes on user's posts
      supabase
        .from('likes')
        .select('post_id')
        .in('post_id', 
          (await supabase
            .from('posts')
            .select('id')
            .eq('user_id', user.id)
          ).data?.map(p => p.id) || []
        ),
      
      // Get total comments on user's posts
      supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .in('post_id',
          (await supabase
            .from('posts')
            .select('id')
            .eq('user_id', user.id)
          ).data?.map(p => p.id) || []
        ),
      
      // Get completed challenges count
      supabase
        .from('user_challenges')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed')
    ])

    const stats = {
      totalPosts: postsCount || 0,
      totalLikes: likesData?.length || 0,
      totalComments: commentsCount || 0,
      streakDays: profile.streak_days || 0,
      completedChallenges: challengesCount || 0,
      level: profile.level || 1,
      experiencePoints: profile.experience_points || 0,
      joinedAt: profile.created_at || new Date().toISOString()
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        email: user.email,
        name: profile.full_name,
        avatar: profile.avatar_url,
        bio: profile.bio,
        major: profile.major,
        academicYear: profile.academic_year,
        role: profile.role,
        points: profile.points,
        level: profile.level,
        experiencePoints: profile.experience_points,
        streakDays: profile.streak_days,
        lastActive: profile.last_active,
        joinedAt: profile.created_at,
        isActive: profile.is_active,
        preferences: profile.preferences
      },
      stats
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, bio, major, academicYear } = body

    // Update user profile
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: name,
        bio: bio,
        major: major,
        academic_year: academicYear,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profile: data
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
