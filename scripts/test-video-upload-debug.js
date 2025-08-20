#!/usr/bin/env node

/**
 * Debug Video Upload Issues Script
 * Comprehensive test to identify why video uploads are hanging
 * Usage: node scripts/test-video-upload-debug.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔧 Debug Video Upload Issues')
console.log('============================\n')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  process.exit(1)
}

// Create clients
const serviceClient = createClient(supabaseUrl, supabaseServiceKey)
const anonClient = createClient(supabaseUrl, supabaseAnonKey)

const VIDEO_BUCKET = 'videos'
const TEST_USER_ID = '13df7bf1-d38f-4b58-b444-3dfa67e04f17' // From your logs

// Create test video files of different sizes
function createTestFile(sizeKB, name) {
  const data = Buffer.alloc(sizeKB * 1024, 'A') // Fill with 'A' characters
  const fileName = `test-${name}-${sizeKB}kb-${Date.now()}.mp4`
  const filePath = path.join(__dirname, fileName)
  fs.writeFileSync(filePath, data)
  return { filePath, fileName, size: data.length }
}

// Test 1: Check bucket and policies
async function testBucketPolicies() {
  console.log('📁 Testing bucket and policies...')
  
  try {
    // Check bucket exists
    const { data: buckets, error: bucketsError } = await serviceClient.storage.listBuckets()
    if (bucketsError) throw bucketsError
    
    const videoBucket = buckets.find(b => b.name === VIDEO_BUCKET)
    if (!videoBucket) {
      console.error(`❌ Bucket '${VIDEO_BUCKET}' not found`)
      return false
    }
    
    console.log('✅ Bucket found:', {
      name: videoBucket.name,
      public: videoBucket.public,
      file_size_limit: videoBucket.file_size_limit,
      allowed_mime_types: videoBucket.allowed_mime_types
    })
    
    // Check policies
    const { data: policies, error: policiesError } = await serviceClient
      .from('storage.policies')
      .select('*')
      .eq('bucket_id', VIDEO_BUCKET)
    
    if (policiesError) {
      console.warn('⚠️ Could not fetch policies:', policiesError.message)
    } else {
      console.log('📋 Storage policies:')
      policies.forEach(policy => {
        console.log(`  - ${policy.name}: ${policy.command} (${policy.roles?.join(', ')})`)
      })
    }
    
    return true
  } catch (error) {
    console.error('❌ Bucket test failed:', error.message)
    return false
  }
}

// Test 2: Network connectivity and DNS
async function testNetworkConnectivity() {
  console.log('\n🌐 Testing network connectivity...')
  
  try {
    // Test basic HTTP connectivity to Supabase
    const startTime = Date.now()
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseAnonKey
      }
    })
    const responseTime = Date.now() - startTime
    
    console.log(`✅ Supabase API reachable (${responseTime}ms)`)
    console.log(`   Status: ${response.status}`)
    console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`)
    
    // Test storage endpoint specifically
    const storageStart = Date.now()
    const storageResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    })
    const storageTime = Date.now() - storageStart
    
    console.log(`✅ Storage API reachable (${storageTime}ms)`)
    console.log(`   Status: ${storageResponse.status}`)
    
    return true
  } catch (error) {
    console.error('❌ Network test failed:', error.message)
    return false
  }
}

// Test 3: Different upload methods with timeouts
async function testUploadMethods() {
  console.log('\n🚀 Testing upload methods...')
  
  // Create test files of different sizes
  const testFiles = [
    createTestFile(10, 'small'),    // 10KB
    createTestFile(100, 'medium'),  // 100KB
    createTestFile(1000, 'large')   // 1MB
  ]
  
  for (const testFile of testFiles) {
    console.log(`\n📄 Testing ${testFile.fileName} (${testFile.size} bytes)`)
    
    // Method 1: Service role client upload
    await testServiceRoleUpload(testFile)
    
    // Method 2: Authenticated client upload
    await testAuthenticatedUpload(testFile)
    
    // Method 3: Direct fetch upload
    await testDirectFetchUpload(testFile)
    
    // Cleanup
    try {
      fs.unlinkSync(testFile.filePath)
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

// Test service role upload with timeout
async function testServiceRoleUpload(testFile) {
  console.log('  🔑 Testing service role upload...')
  
  const uploadPath = `${TEST_USER_ID}/${testFile.fileName}`
  const timeoutMs = 15000 // 15 seconds
  
  try {
    const uploadPromise = serviceClient.storage
      .from(VIDEO_BUCKET)
      .upload(uploadPath, fs.readFileSync(testFile.filePath), {
        contentType: 'video/mp4',
        upsert: true
      })
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Upload timeout after ${timeoutMs}ms`)), timeoutMs)
    )
    
    const startTime = Date.now()
    const { data, error } = await Promise.race([uploadPromise, timeoutPromise])
    const uploadTime = Date.now() - startTime
    
    if (error) {
      console.error(`    ❌ Service role upload failed (${uploadTime}ms):`, error.message)
    } else {
      console.log(`    ✅ Service role upload success (${uploadTime}ms)`)
      console.log(`       Path: ${data.path}`)
      
      // Test public URL
      const { data: urlData } = serviceClient.storage.from(VIDEO_BUCKET).getPublicUrl(uploadPath)
      console.log(`       URL: ${urlData.publicUrl}`)
      
      // Cleanup uploaded file
      await serviceClient.storage.from(VIDEO_BUCKET).remove([uploadPath])
    }
  } catch (error) {
    console.error(`    ❌ Service role upload error:`, error.message)
  }
}

// Test authenticated upload (simulating frontend)
async function testAuthenticatedUpload(testFile) {
  console.log('  👤 Testing authenticated upload...')
  
  // First get a session (simulate login)
  const uploadPath = `${TEST_USER_ID}/${testFile.fileName}`
  const timeoutMs = 15000
  
  try {
    // Create authenticated client (you might need to adjust this based on your auth setup)
    const authClient = createClient(supabaseUrl, supabaseAnonKey)
    
    const uploadPromise = authClient.storage
      .from(VIDEO_BUCKET)
      .upload(uploadPath, fs.readFileSync(testFile.filePath), {
        contentType: 'video/mp4',
        upsert: true
      })
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Upload timeout after ${timeoutMs}ms`)), timeoutMs)
    )
    
    const startTime = Date.now()
    const { data, error } = await Promise.race([uploadPromise, timeoutPromise])
    const uploadTime = Date.now() - startTime
    
    if (error) {
      console.error(`    ❌ Authenticated upload failed (${uploadTime}ms):`, error.message)
    } else {
      console.log(`    ✅ Authenticated upload success (${uploadTime}ms)`)
      
      // Cleanup
      await serviceClient.storage.from(VIDEO_BUCKET).remove([uploadPath])
    }
  } catch (error) {
    console.error(`    ❌ Authenticated upload error:`, error.message)
  }
}

// Test direct fetch upload
async function testDirectFetchUpload(testFile) {
  console.log('  🌐 Testing direct fetch upload...')
  
  const uploadPath = `${TEST_USER_ID}/${testFile.fileName}`
  const timeoutMs = 15000
  
  try {
    const formData = new FormData()
    const fileBlob = new Blob([fs.readFileSync(testFile.filePath)], { type: 'video/mp4' })
    formData.append('file', fileBlob)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    
    const startTime = Date.now()
    const response = await fetch(`${supabaseUrl}/storage/v1/object/${VIDEO_BUCKET}/${uploadPath}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: formData,
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    const uploadTime = Date.now() - startTime
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`    ❌ Direct fetch upload failed (${uploadTime}ms):`, errorText)
    } else {
      console.log(`    ✅ Direct fetch upload success (${uploadTime}ms)`)
      
      // Cleanup
      await serviceClient.storage.from(VIDEO_BUCKET).remove([uploadPath])
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`    ❌ Direct fetch upload timeout after ${timeoutMs}ms`)
    } else {
      console.error(`    ❌ Direct fetch upload error:`, error.message)
    }
  }
}

// Test 4: Check current storage state
async function checkStorageState() {
  console.log('\n📊 Checking current storage state...')
  
  try {
    // List files in user folder
    const { data: files, error } = await serviceClient.storage
      .from(VIDEO_BUCKET)
      .list(TEST_USER_ID, { limit: 10 })
    
    if (error) {
      console.error('❌ Error listing user files:', error.message)
    } else {
      console.log(`✅ Found ${files.length} files in user folder:`)
      files.forEach(file => {
        console.log(`  - ${file.name} (${file.metadata?.size || 'unknown'} bytes)`)
      })
    }
    
    // Check bucket stats
    const { data: bucketFiles, error: bucketError } = await serviceClient.storage
      .from(VIDEO_BUCKET)
      .list('', { limit: 100 })
    
    if (!bucketError && bucketFiles) {
      console.log(`📈 Total files in bucket: ${bucketFiles.length}`)
    }
    
  } catch (error) {
    console.error('❌ Storage state check failed:', error.message)
  }
}

// Main test runner
async function runAllTests() {
  console.log(`🎯 Testing with user ID: ${TEST_USER_ID}`)
  console.log(`🏗️ Supabase URL: ${supabaseUrl}`)
  console.log(`📦 Bucket: ${VIDEO_BUCKET}\n`)
  
  const results = {
    bucket: await testBucketPolicies(),
    network: await testNetworkConnectivity(),
    storage: true
  }
  
  if (results.bucket && results.network) {
    await testUploadMethods()
    await checkStorageState()
  } else {
    console.log('\n❌ Skipping upload tests due to failed prerequisites')
  }
  
  console.log('\n🏁 Test completed!')
  console.log('Results:', results)
}

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error)
  process.exit(1)
})

// Run tests
runAllTests().catch(console.error)
