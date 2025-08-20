// Simple video upload test from frontend context
// This will use the actual auth session from the running app

async function testVideoUpload() {
  console.log('🎬 Testing video upload from frontend context...')
  
  try {
    // Get current auth state
    const { data: { session }, error: sessionError } = await window.supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError)
      return
    }
    
    if (!session?.user) {
      console.error('❌ No authenticated user found')
      return
    }
    
    console.log('✅ Auth user:', session.user.id, session.user.email)
    
    // Create a small test file
    const testData = new Uint8Array([0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70]) // MP4 header
    const testFile = new File([testData], 'test.mp4', { type: 'video/mp4' })
    
    const fileName = `${session.user.id}/test-${Date.now()}.mp4`
    
    console.log('🚀 Uploading test file:', fileName)
    
    // Test direct Supabase storage upload
    const { data, error } = await window.supabase.storage
      .from('videos')
      .upload(fileName, testFile)
    
    if (error) {
      console.error('❌ Upload error:', error)
      console.error('Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error
      })
    } else {
      console.log('✅ Upload success:', data)
      
      // Test getting public URL
      const { data: urlData } = window.supabase.storage
        .from('videos')
        .getPublicUrl(fileName)
      
      console.log('✅ Public URL:', urlData.publicUrl)
      
      // Clean up - delete the test file
      const { error: deleteError } = await window.supabase.storage
        .from('videos')
        .remove([fileName])
      
      if (deleteError) {
        console.warn('⚠️ Could not delete test file:', deleteError)
      } else {
        console.log('🗑️ Test file cleaned up')
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

// Run the test
testVideoUpload()

console.log('📋 To run this test:')
console.log('1. Open browser DevTools Console')
console.log('2. Make sure you are logged in')
console.log('3. Copy and paste this entire script')
console.log('4. Press Enter to run')
