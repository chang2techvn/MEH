import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create service role client (bypasses RLS)
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key bypasses all RLS
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    console.log('📤 API: Receiving video upload request...')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    
    if (!file || !userId) {
      return NextResponse.json(
        { error: 'File and userId are required' },
        { status: 400 }
      )
    }

    console.log(`🎬 API: Uploading video`, {
      fileName: file.name,
      fileSize: file.size,
      userId: userId
    })

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileName = `${userId}/${timestamp}-${randomId}.mp4`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    console.log(`🚀 API: Uploading to storage with service role...`)

    // Upload using service role (bypasses all RLS policies)
    const { data, error } = await supabaseServiceRole.storage
      .from('videos')
      .upload(fileName, fileBuffer, {
        contentType: file.type || 'video/mp4',
        upsert: false
      })

    if (error) {
      console.error('❌ API: Upload failed:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log('✅ API: Upload successful:', data.path)

    // Get public URL
    const { data: urlData } = supabaseServiceRole.storage
      .from('videos')
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      publicUrl: urlData.publicUrl,
      filePath: fileName,
      fileSize: file.size
    })

  } catch (error) {
    console.error('❌ API: Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
