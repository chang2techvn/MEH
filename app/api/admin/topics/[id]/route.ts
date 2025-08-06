import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/admin/topics/[id] - Get single topic
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: topic, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Topic not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching topic:', error)
      return NextResponse.json(
        { error: 'Failed to fetch topic', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ topic })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/topics/[id] - Update topic
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, category, keywords, weight, is_active } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Topic name is required' },
        { status: 400 }
      )
    }

    // Check if another topic with this name already exists
    const { data: existingTopic } = await supabase
      .from('topics')
      .select('id')
      .eq('name', name.trim())
      .neq('id', params.id)
      .single()

    if (existingTopic) {
      return NextResponse.json(
        { error: 'Another topic with this name already exists' },
        { status: 409 }
      )
    }

    // Update topic
    const { data: topic, error } = await supabase
      .from('topics')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        category: category || 'general',
        keywords: keywords || [],
        weight: weight || 1,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Topic not found' },
          { status: 404 }
        )
      }
      console.error('Error updating topic:', error)
      return NextResponse.json(
        { error: 'Failed to update topic', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ topic })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/topics/[id] - Delete topic
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if topic exists and get its current state
    const { data: existingTopic, error: fetchError } = await supabase
      .from('topics')
      .select('id, name, usage_count')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Topic not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching topic for deletion:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch topic', message: fetchError.message },
        { status: 500 }
      )
    }

    // Optional: Check if topic is being used and prevent deletion
    if (existingTopic.usage_count && existingTopic.usage_count > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete topic that is currently in use',
          message: `Topic "${existingTopic.name}" has been used ${existingTopic.usage_count} times. Consider deactivating it instead.`
        },
        { status: 409 }
      )
    }

    // Delete topic
    const { error: deleteError } = await supabase
      .from('topics')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Error deleting topic:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete topic', message: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Topic deleted successfully',
      deletedTopic: existingTopic
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
