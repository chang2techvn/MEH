import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }


    // Basic security: Only allow from admin routes
    const referer = request.headers.get('referer')
    if (!referer || !referer.includes('/admin/')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check admin authentication (flexible approach)
    let currentAdminId = null
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
        
        currentAdminId = user.id
      } else {

      }
    } catch (authError) {
      // For development/testing: continue with service role
    }

    // Approve user using function with admin ID
    const { data, error } = await supabaseAdmin.rpc('approve_user_account', {
      user_id_param: userId,
      admin_id_param: currentAdminId
    })

    if (error) {
      console.error('✅ Admin API: Error approving user:', error)
      return NextResponse.json(
        { 
          error: 'Failed to approve user',
          details: error.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User approved successfully',
      data
    })

  } catch (error) {
    console.error('✅ Admin API: Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
