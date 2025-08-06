import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/admin/topics - Get all topics
export async function GET() {
  try {
    const { data: topics, error } = await supabase
      .from('topics')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching topics:', error)
      return NextResponse.json(
        { error: 'Failed to fetch topics', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ topics })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/topics - Create new topic
export async function POST(request: NextRequest) {
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

    // Check if topic with this name already exists
    const { data: existingTopic } = await supabase
      .from('topics')
      .select('id')
      .eq('name', name.trim())
      .single()

    if (existingTopic) {
      return NextResponse.json(
        { error: 'Topic with this name already exists' },
        { status: 409 }
      )
    }

    // Insert new topic
    const { data: topic, error } = await supabase
      .from('topics')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        category: category || 'general',
        keywords: keywords || [],
        weight: weight || 1,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating topic:', error)
      return NextResponse.json(
        { error: 'Failed to create topic', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ topic }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
