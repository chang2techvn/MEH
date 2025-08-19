import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

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

export async function GET(request: NextRequest) {
  try {

    // Get pending approvals count
    const { data, error } = await supabaseAdmin.rpc('get_pending_approvals_count')

    if (error) {
      console.error('📊 Admin API: Error getting pending count:', error)
      return NextResponse.json(
        { 
          error: 'Failed to get pending approvals count',
          details: error.message 
        },
        { status: 500 }
      )
    }

    // Also get detailed pending users list
    const { data: pendingUsers, error: pendingError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        name,
        email,
        created_at,
        account_status,
        role
      `)
      .eq('account_status', 'pending')
      .order('created_at', { ascending: false })

    if (pendingError) {
      console.error('📊 Admin API: Error getting pending users:', pendingError)
    }

    return NextResponse.json({
      success: true,
      pendingCount: data || 0,
      pendingUsers: pendingUsers || []
    })

  } catch (error) {
    console.error('📊 Admin API: Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
