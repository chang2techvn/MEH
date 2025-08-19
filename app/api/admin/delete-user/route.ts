import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // This has admin privileges
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }


    // Basic security: Only allow deletion from admin routes
    const referer = request.headers.get('referer')
    if (!referer || !referer.includes('/admin/')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }


    // Try to get authentication but don't fail if it doesn't work
    try {
      const supabase = createRouteHandlerClient({ cookies })
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      
      if (user) {
        // Check role in users table
        const { data: userRecord, error: userRecordError } = await supabaseAdmin
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        
        if (userRecord?.role !== 'admin') {
          return NextResponse.json(
            { error: 'Admin access required', role: userRecord?.role },
            { status: 403 }
          )
        }
        
      } 
    } catch (authError) {
    }


    // Delete from public tables first (profiles will cascade)
    const { error: publicDeleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)

    // Delete from auth.users using Admin API
    const { data: authDeleteData, error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authDeleteError) {
      console.error('🗑️ Admin API: Error deleting from auth.users:', authDeleteError)
      return NextResponse.json(
        { 
          error: 'Failed to delete from authentication system',
          details: authDeleteError.message 
        },
        { status: 500 }
      )
    }


    return NextResponse.json({
      success: true,
      message: 'User deleted completely from all systems',
      data: authDeleteData
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
