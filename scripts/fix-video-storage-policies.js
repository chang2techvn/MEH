#!/usr/bin/env node

/**
 * Fix Video Storage Policies
 * Fix RLS policies blocking video uploads
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const client = createClient(supabaseUrl, supabaseServiceKey)

async function fixStoragePolicies() {
  console.log('🔧 Fixing video storage policies...')
  
  try {
    // Drop existing policies if any
    console.log('1. Dropping existing storage policies...')
    
    const dropPolicies = [
      `DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Authenticated users can view videos" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Authenticated users can delete videos" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Videos are publicly accessible" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Users can upload to videos bucket" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Users can view videos bucket" ON storage.objects;`
    ]
    
    for (const sql of dropPolicies) {
      await client.rpc('exec_sql', { sql })
    }
    
    // Create new policies
    console.log('2. Creating new storage policies...')
    
    // Policy 1: Allow authenticated users to upload videos
    await client.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Authenticated users can upload videos" 
        ON storage.objects FOR INSERT 
        WITH CHECK (
          bucket_id = 'videos' 
          AND auth.role() = 'authenticated'
          AND (storage.foldername(name))[1] = auth.uid()::text
        );
      `
    })
    
    // Policy 2: Allow public access to view videos  
    await client.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Videos are publicly accessible" 
        ON storage.objects FOR SELECT 
        USING (bucket_id = 'videos');
      `
    })
    
    // Policy 3: Allow users to delete their own videos
    await client.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Users can delete their own videos" 
        ON storage.objects FOR DELETE 
        USING (
          bucket_id = 'videos' 
          AND auth.role() = 'authenticated'
          AND (storage.foldername(name))[1] = auth.uid()::text
        );
      `
    })
    
    console.log('✅ Storage policies fixed successfully!')
    
    // Test the policies
    console.log('3. Testing policies...')
    
    const { data: policies, error } = await client.rpc('exec_sql', {
      sql: `
        SELECT policyname, cmd, qual, with_check 
        FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects'
        AND policyname LIKE '%video%';
      `
    })
    
    if (error) {
      console.error('Error checking policies:', error)
    } else {
      console.log('Current video storage policies:')
      console.log(policies)
    }
    
  } catch (error) {
    console.error('❌ Failed to fix storage policies:', error)
  }
}

fixStoragePolicies()
