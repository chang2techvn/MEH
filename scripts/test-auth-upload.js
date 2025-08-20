#!/usr/bin/env node

/**
 * Test authenticated video upload with real session
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const TEST_USER_ID = '13df7bf1-d38f-4b58-b444-3dfa67e04f17'

// Create test file
function createTestFile() {
  const data = Buffer.alloc(5000, 'A') // 5KB test file
  const fileName = `auth-test-${Date.now()}.mp4`
  const filePath = path.join(__dirname, fileName)
  fs.writeFileSync(filePath, data)
  return { filePath, fileName, size: data.length }
}

async function testWithRealAuth() {
  console.log('🔐 Testing with authenticated client...')
  
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey)
  const anonClient = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    // Step 1: Get user info
    console.log('1️⃣ Getting user info...')
    const { data: userData, error: userError } = await serviceClient.auth.admin.getUserById(TEST_USER_ID)
    if (userError) {
      console.error('❌ User fetch error:', userError)
      return
    }
    console.log('✅ User found:', userData.user.email)
    
    // Step 2: Create session for this user (simulate login)
    console.log('2️⃣ Creating session...')
    const { data: sessionData, error: sessionError } = await serviceClient.auth.admin.generateLink({
      type: 'magiclink',
      email: userData.user.email
    })
    
    if (sessionError) {
      console.error('❌ Session creation error:', sessionError)
      return
    }
    
    // Step 3: Test upload with different auth states
    const testFile = createTestFile()
    const uploadPath = `${TEST_USER_ID}/${testFile.fileName}`
    
    // Test A: No auth (should fail)
    console.log('3️⃣ Test A: Upload without auth...')
    try {
      const { data, error } = await anonClient.storage
        .from('videos')
        .upload(uploadPath, fs.readFileSync(testFile.filePath), {
          contentType: 'video/mp4'
        })
      
      if (error) {
        console.log('✅ Expected failure (no auth):', error.message)
      } else {
        console.log('⚠️ Unexpected success without auth')
      }
    } catch (e) {
      console.log('✅ Expected failure (no auth):', e.message)
    }
    
    // Test B: Mock auth session
    console.log('4️⃣ Test B: Upload with mocked session...')
    const authClient = createClient(supabaseUrl, supabaseAnonKey)
    
    // Set session manually (this simulates what happens in frontend)
    await authClient.auth.setSession({
      access_token: 'fake-token',
      refresh_token: 'fake-refresh',
      user: {
        id: TEST_USER_ID,
        email: userData.user.email,
        aud: 'authenticated'
      }
    })
    
    // Test upload
    try {
      const { data, error } = await authClient.storage
        .from('videos')
        .upload(uploadPath, fs.readFileSync(testFile.filePath), {
          contentType: 'video/mp4'
        })
      
      if (error) {
        console.log('❌ Mock auth upload failed:', error.message)
      } else {
        console.log('✅ Mock auth upload success:', data.path)
      }
    } catch (e) {
      console.log('❌ Mock auth upload error:', e.message)
    }
    
    // Test C: Service role (should work)
    console.log('5️⃣ Test C: Upload with service role...')
    try {
      const { data, error } = await serviceClient.storage
        .from('videos')
        .upload(uploadPath, fs.readFileSync(testFile.filePath), {
          contentType: 'video/mp4',
          upsert: true
        })
      
      if (error) {
        console.log('❌ Service role upload failed:', error.message)
      } else {
        console.log('✅ Service role upload success:', data.path)
        
        // Cleanup
        await serviceClient.storage.from('videos').remove([uploadPath])
      }
    } catch (e) {
      console.log('❌ Service role upload error:', e.message)
    }
    
    // Step 4: Check policy conditions
    console.log('6️⃣ Testing policy conditions...')
    console.log(`   Target path: ${uploadPath}`)
    console.log(`   User ID: ${TEST_USER_ID}`)
    console.log(`   Folder check: (storage.foldername('${uploadPath}'))[1] should equal '${TEST_USER_ID}'`)
    
    // Test folder extraction
    const { data: folderTest, error: folderError } = await serviceClient
      .rpc('exec', { query: `SELECT (storage.foldername('${uploadPath}'))[1] as folder_id` })
      .single()
    
    if (!folderError && folderTest) {
      console.log(`   Actual folder ID: ${folderTest.folder_id}`)
      console.log(`   Match: ${folderTest.folder_id === TEST_USER_ID ? '✅' : '❌'}`)
    }
    
    // Cleanup test file
    fs.unlinkSync(testFile.filePath)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

async function testPolicyDirectly() {
  console.log('\n🔍 Testing policy conditions directly...')
  
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    // Test the storage.foldername function
    const testPaths = [
      `${TEST_USER_ID}/test.mp4`,
      `${TEST_USER_ID}/subfolder/test.mp4`,
      'test.mp4'
    ]
    
    for (const testPath of testPaths) {
      try {
        const { data, error } = await serviceClient
          .rpc('exec', { 
            query: `SELECT 
              '${testPath}' as path,
              storage.foldername('${testPath}') as folder_array,
              (storage.foldername('${testPath}'))[1] as first_folder,
              '${TEST_USER_ID}' as user_id,
              (storage.foldername('${testPath}'))[1] = '${TEST_USER_ID}' as policy_match
            `
          })
          .single()
        
        if (error) {
          console.log(`❌ Error testing ${testPath}:`, error.message)
        } else {
          console.log(`✅ Path: ${testPath}`)
          console.log(`   Folder array: ${JSON.stringify(data.folder_array)}`)
          console.log(`   First folder: ${data.first_folder}`)
          console.log(`   Policy match: ${data.policy_match}`)
        }
      } catch (e) {
        console.log(`❌ Failed to test ${testPath}:`, e.message)
      }
    }
  } catch (error) {
    console.error('❌ Policy test failed:', error)
  }
}

async function runTests() {
  console.log('🧪 Authenticated Upload Test')
  console.log('============================\n')
  
  await testWithRealAuth()
  await testPolicyDirectly()
  
  console.log('\n🏁 Tests completed!')
}

runTests().catch(console.error)
