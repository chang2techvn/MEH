import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
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
    const { userId, action, reason } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      )
    }

    console.log('👤 Account approval API:', { userId, action, reason })

    // Basic security: Only allow from admin routes
    const referer = request.headers.get('referer')
    if (!referer || !referer.includes('/admin/')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get current admin user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: adminCheck, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (adminError || adminCheck?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    let result
    let message

    switch (action) {
      case 'approve':
        // Call approve function
        const { data: approveData, error: approveError } = await supabaseAdmin
          .rpc('approve_user_account', {
            user_id_param: userId,
            admin_id_param: user.id
          })

        if (approveError) {
          console.error('Approve error:', approveError)
          return NextResponse.json(
            { error: 'Failed to approve account', details: approveError.message },
            { status: 500 }
          )
        }

        message = 'Account approved successfully'
        result = { approved: true, approvedBy: user.id, approvedAt: new Date().toISOString() }
        break

      case 'reject':
        // Call reject function
        const { data: rejectData, error: rejectError } = await supabaseAdmin
          .rpc('reject_user_account', {
            user_id_param: userId,
            admin_id_param: user.id,
            reason_param: reason || 'No reason provided'
          })

        if (rejectError) {
          console.error('Reject error:', rejectError)
          return NextResponse.json(
            { error: 'Failed to reject account', details: rejectError.message },
            { status: 500 }
          )
        }

        message = 'Account rejected successfully'
        result = { rejected: true, rejectedBy: user.id, rejectedAt: new Date().toISOString(), reason }
        break

      case 'suspend':
        // Update account status to suspended
        const { error: suspendError } = await supabaseAdmin
          .from('users')
          .update({
            account_status: 'suspended',
            is_active: false,
            approved_by: user.id,
            approved_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (suspendError) {
          console.error('Suspend error:', suspendError)
          return NextResponse.json(
            { error: 'Failed to suspend account', details: suspendError.message },
            { status: 500 }
          )
        }

        message = 'Account suspended successfully'
        result = { suspended: true, suspendedBy: user.id }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    console.log('👤 Account approval result:', { action, message, result })

    return NextResponse.json({
      success: true,
      message,
      data: result
    })

  } catch (error) {
    console.error('👤 Account approval error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Basic security check
    const referer = request.headers.get('referer')
    if (!referer || !referer.includes('/admin/')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get pending approvals count
    const { data: pendingCount, error } = await supabaseAdmin
      .rpc('get_pending_approvals_count')

    if (error) {
      console.error('Error getting pending count:', error)
      return NextResponse.json(
        { error: 'Failed to get pending approvals count' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        pendingCount: pendingCount || 0
      }
    })

  } catch (error) {
    console.error('👤 Get pending approvals error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
