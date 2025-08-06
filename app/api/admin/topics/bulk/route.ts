import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/admin/topics/bulk - Bulk operations for topics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { operation, topics, data } = body

    switch (operation) {
      case 'import':
        return await handleBulkImport(topics)
      case 'delete':
        return await handleBulkDelete(data.ids)
      case 'activate':
        return await handleBulkStatusUpdate(data.ids, true)
      case 'deactivate':
        return await handleBulkStatusUpdate(data.ids, false)
      case 'update_category':
        return await handleBulkCategoryUpdate(data.ids, data.category)
      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Unexpected error in bulk operation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleBulkImport(topics: any[]) {
  if (!Array.isArray(topics) || topics.length === 0) {
    return NextResponse.json(
      { error: 'Invalid topics data' },
      { status: 400 }
    )
  }

  const results = {
    success: 0,
    errors: 0,
    skipped: 0,
    details: [] as any[]
  }

  for (const topic of topics) {
    try {
      const { name, description, category, keywords, weight } = topic

      if (!name || !name.trim()) {
        results.errors++
        results.details.push({
          name: name || 'Unknown',
          status: 'error',
          message: 'Name is required'
        })
        continue
      }

      // Check if topic already exists
      const { data: existingTopic } = await supabase
        .from('topics')
        .select('id')
        .eq('name', name.trim())
        .single()

      if (existingTopic) {
        results.skipped++
        results.details.push({
          name: name.trim(),
          status: 'skipped',
          message: 'Topic already exists'
        })
        continue
      }

      // Insert new topic
      const { error } = await supabase
        .from('topics')
        .insert({
          name: name.trim(),
          description: description?.trim() || null,
          category: category || 'general',
          keywords: keywords || [],
          weight: weight || 1,
          is_active: true,
        })

      if (error) {
        results.errors++
        results.details.push({
          name: name.trim(),
          status: 'error',
          message: error.message
        })
      } else {
        results.success++
        results.details.push({
          name: name.trim(),
          status: 'success',
          message: 'Topic created successfully'
        })
      }
    } catch (error) {
      results.errors++
      results.details.push({
        name: topic.name || 'Unknown',
        status: 'error',
        message: 'Unexpected error occurred'
      })
    }
  }

  return NextResponse.json({ results })
}

async function handleBulkDelete(ids: string[]) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { error: 'No topic IDs provided' },
      { status: 400 }
    )
  }

  try {
    // Check which topics are in use
    const { data: topicsInUse, error: checkError } = await supabase
      .from('topics')
      .select('id, name, usage_count')
      .in('id', ids)
      .gt('usage_count', 0)

    if (checkError) {
      return NextResponse.json(
        { error: 'Failed to check topic usage', message: checkError.message },
        { status: 500 }
      )
    }

    if (topicsInUse && topicsInUse.length > 0) {
      return NextResponse.json(
        { 
          error: 'Some topics are in use and cannot be deleted',
          topicsInUse: topicsInUse.map(t => ({ id: t.id, name: t.name, usageCount: t.usage_count }))
        },
        { status: 409 }
      )
    }

    // Delete topics
    const { error: deleteError } = await supabase
      .from('topics')
      .delete()
      .in('id', ids)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete topics', message: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: `Successfully deleted ${ids.length} topics`,
      deletedCount: ids.length
    })
  } catch (error) {
    console.error('Error in bulk delete:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleBulkStatusUpdate(ids: string[], isActive: boolean) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { error: 'No topic IDs provided' },
      { status: 400 }
    )
  }

  try {
    const { error } = await supabase
      .from('topics')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .in('id', ids)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update topics', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: `Successfully ${isActive ? 'activated' : 'deactivated'} ${ids.length} topics`,
      updatedCount: ids.length
    })
  } catch (error) {
    console.error('Error in bulk status update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleBulkCategoryUpdate(ids: string[], category: string) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { error: 'No topic IDs provided' },
      { status: 400 }
    )
  }

  if (!category || !category.trim()) {
    return NextResponse.json(
      { error: 'Category is required' },
      { status: 400 }
    )
  }

  try {
    const { error } = await supabase
      .from('topics')
      .update({ 
        category: category.trim(),
        updated_at: new Date().toISOString()
      })
      .in('id', ids)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update topic categories', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: `Successfully updated category for ${ids.length} topics`,
      updatedCount: ids.length,
      newCategory: category.trim()
    })
  } catch (error) {
    console.error('Error in bulk category update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
