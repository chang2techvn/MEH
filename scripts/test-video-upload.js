#!/usr/bin/env node

/**
 * Video Upload Test Script
 * Test video upload to Supabase storage bucket to diagnose hanging issues
 * Usage: node scripts/test-video-upload.js
 * 
 * This script will:
 * 1. Test Supabase storage connection
 * 2. Check bucket policies and permissions
 * 3. Test different upload methods
 * 4. Identify the root cause of hanging uploads
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔧 Environment Check:')
console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing')
console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ Missing Supabase configuration. Please check your .env file.')
  console.error('Required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY') 
  process.exit(1)
}

// Create clients
const serviceClient = createClient(supabaseUrl, supabaseServiceKey)
const anonClient = createClient(supabaseUrl, supabaseAnonKey)

const VIDEO_BUCKET = 'videos'

// Create a small test video file (fake MP4 data)
function createTestVideoFile() {
  const testData = Buffer.from('fake video data for testing upload functionality')
  const fileName = `test-video-${Date.now()}.mp4`
  const filePath = path.join(__dirname, fileName)
  fs.writeFileSync(filePath, testData)
  return { filePath, fileName, size: testData.length }
}

// Test 1: Check bucket existence and policies
async function testBucketAccess() {
  console.log('\n📁 Testing bucket access...')
  
  try {
    // List buckets
    const { data: buckets, error: bucketsError } = await serviceClient.storage.listBuckets()
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError)
      return false
    }
    
    const videoBucket = buckets.find(b => b.name === VIDEO_BUCKET)
    if (!videoBucket) {
      console.error(`❌ Bucket '${VIDEO_BUCKET}' not found`)
      console.log('Available buckets:', buckets.map(b => b.name))
      return false
    }
    
    console.log(`✅ Bucket '${VIDEO_BUCKET}' found`)
    console.log('Bucket details:', videoBucket)
    
    // Test bucket file listing
    const { data: files, error: listError } = await serviceClient.storage
      .from(VIDEO_BUCKET)
      .list('', { limit: 5 })
    
    if (listError) {
      console.error('❌ Error listing files in bucket:', listError)
      return false
    }
    
    console.log(`✅ Can list files in bucket (${files.length} files found)`)
    return true
    
  } catch (error) {
    console.error('❌ Bucket access test failed:', error)
    return false
  }
}

// Test 2: Test upload with service role
async function testServiceRoleUpload() {
  console.log('\n🔑 Testing upload with service role...')
  
  const testFile = createTestVideoFile()
  const uploadPath = `test-uploads/${testFile.fileName}`
  
  try {
    const startTime = Date.now()
    
    const { data, error } = await serviceClient.storage
      .from(VIDEO_BUCKET)
      .upload(uploadPath, fs.readFileSync(testFile.filePath), {
        contentType: 'video/mp4',
        upsert: true
      })
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    if (error) {
      console.error('❌ Service role upload failed:', error)
      return false
    }
    
    console.log(`✅ Service role upload successful in ${duration}ms`)
    console.log('Upload result:', data)
    
    // Test getting public URL
    const { data: urlData } = serviceClient.storage
      .from(VIDEO_BUCKET)
      .getPublicUrl(uploadPath)
    
    console.log('✅ Public URL generated:', urlData.publicUrl)
    
    // Cleanup
    await serviceClient.storage.from(VIDEO_BUCKET).remove([uploadPath])
    fs.unlinkSync(testFile.filePath)
    
    return true
    
  } catch (error) {
    console.error('❌ Service role upload test failed:', error)
    fs.unlinkSync(testFile.filePath)
    return false
  }
}

// Test 3: Test upload with anon client (simulating frontend)
async function testAnonUpload() {
  console.log('\n👤 Testing upload with anon client...')
  
  const testFile = createTestVideoFile()
  const uploadPath = `test-uploads/${testFile.fileName}`
  
  try {
    const startTime = Date.now()
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Upload timeout after 10 seconds')), 10000)
    })
    
    // Upload with timeout
    const uploadPromise = anonClient.storage
      .from(VIDEO_BUCKET)
      .upload(uploadPath, fs.readFileSync(testFile.filePath), {
        contentType: 'video/mp4',
        upsert: true
      })
    
    const { data, error } = await Promise.race([uploadPromise, timeoutPromise])
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    if (error) {
      console.error('❌ Anon upload failed:', error)
      return false
    }
    
    console.log(`✅ Anon upload successful in ${duration}ms`)
    console.log('Upload result:', data)
    
    // Cleanup
    await serviceClient.storage.from(VIDEO_BUCKET).remove([uploadPath])
    fs.unlinkSync(testFile.filePath)
    
    return true
    
  } catch (error) {
    console.error('❌ Anon upload test failed:', error)
    fs.unlinkSync(testFile.filePath)
    return false
  }
}

// Test 4: Test upload with direct API call
async function testDirectAPIUpload() {
  console.log('\n🌐 Testing direct API upload...')
  
  const testFile = createTestVideoFile()
  const uploadPath = `test-uploads/${testFile.fileName}`
  
  try {
    const startTime = Date.now()
    
    const formData = new FormData()
    const fileBuffer = fs.readFileSync(testFile.filePath)
    const blob = new Blob([fileBuffer], { type: 'video/mp4' })
    formData.append('file', blob, testFile.fileName)
    
    const response = await fetch(`${supabaseUrl}/storage/v1/object/${VIDEO_BUCKET}/${uploadPath}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: formData
    })
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Direct API upload failed: ${response.status} - ${errorText}`)
      return false
    }
    
    console.log(`✅ Direct API upload successful in ${duration}ms`)
    
    // Cleanup
    await serviceClient.storage.from(VIDEO_BUCKET).remove([uploadPath])
    fs.unlinkSync(testFile.filePath)
    
    return true
    
  } catch (error) {
    console.error('❌ Direct API upload test failed:', error)
    fs.unlinkSync(testFile.filePath)
    return false
  }
}

// Test 5: Network connectivity test
async function testNetworkConnectivity() {
  console.log('\n🌍 Testing network connectivity...')
  
  try {
    const startTime = Date.now()
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey
      }
    })
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`✅ Network connectivity OK (${duration}ms)`)
    console.log('Response status:', response.status)
    
    return true
  } catch (error) {
    console.error('❌ Network connectivity test failed:', error)
    return false
  }
}

// Main test function
async function runAllTests() {
  console.log('🎬 Starting Video Upload Diagnostic Tests...\n')
  
  const results = {
    bucketAccess: false,
    serviceRoleUpload: false,
    anonUpload: false,
    directAPIUpload: false,
    networkConnectivity: false
  }
  
  // Run tests
  results.networkConnectivity = await testNetworkConnectivity()
  results.bucketAccess = await testBucketAccess()
  
  if (results.bucketAccess) {
    results.serviceRoleUpload = await testServiceRoleUpload()
    results.anonUpload = await testAnonUpload()
    results.directAPIUpload = await testDirectAPIUpload()
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:')
  console.log('========================')
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`)
  })
  
  // Diagnosis
  console.log('\n🔍 Diagnosis:')
  if (!results.networkConnectivity) {
    console.log('❌ Network connectivity issues detected')
  } else if (!results.bucketAccess) {
    console.log('❌ Bucket access issues - check bucket existence and permissions')
  } else if (results.serviceRoleUpload && !results.anonUpload) {
    console.log('❌ RLS policies blocking anon uploads - check bucket policies')
  } else if (!results.serviceRoleUpload && !results.anonUpload && !results.directAPIUpload) {
    console.log('❌ All upload methods failing - possible Supabase service issues')
  } else if (results.directAPIUpload && !results.anonUpload) {
    console.log('❌ Supabase client library issues - use direct API as fallback')
  } else if (results.serviceRoleUpload && results.anonUpload && results.directAPIUpload) {
    console.log('✅ All upload methods working - issue may be in frontend implementation')
  }
  
  console.log('\n🏁 Diagnostic complete!')
}

// Run the tests
runAllTests().catch(error => {
  console.error('❌ Test runner failed:', error)
  process.exit(1)
})
