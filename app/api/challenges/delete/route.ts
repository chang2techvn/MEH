"use server"

import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function DELETE(request: NextRequest) {
  try {
    const { challengeId } = await request.json()

    if (!challengeId) {
      return NextResponse.json(
        { error: 'Challenge ID is required' },
        { status: 400 }
      )
    }

    // Delete challenge from Supabase
    const { error } = await supabaseServer
      .from('challenges')
      .delete()
      .eq('id', challengeId)

    if (error) {
      console.error('Error deleting challenge:', error)
      return NextResponse.json(
        { error: 'Failed to delete challenge' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Challenge deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error in delete challenge API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
