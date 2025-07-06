#!/usr/bin/env node

/**
 * Debug community posts loading issue
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.error('❌ Missing Supabase keys in .env.local');
    process.exit(1);
}

console.log('🔗 Connecting to Supabase CLOUD:', supabaseUrl);

// Test with both anon and service role
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

async function debugCommunityPosts() {
    console.log('🔍 Debugging community posts loading...\n');
    
    // Test 1: Check posts with service role (should see everything)
    console.log('1️⃣ Testing with SERVICE ROLE:');
    const { data: servicePosts, error: serviceError } = await supabaseService
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (serviceError) {
        console.error('❌ Service role error:', serviceError);
    } else {
        console.log(`✅ Service role found ${servicePosts.length} posts`);
        servicePosts.forEach((post, index) => {
            console.log(`  ${index + 1}. ${post.title} (public: ${post.is_public})`);
        });
    }
    
    // Test 2: Check posts with anon role (what frontend uses)
    console.log('\n2️⃣ Testing with ANON ROLE (frontend):');
    const { data: anonPosts, error: anonError } = await supabaseAnon
        .from('posts')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
    
    if (anonError) {
        console.error('❌ Anon role error:', anonError);
    } else {
        console.log(`✅ Anon role found ${anonPosts.length} public posts`);
        anonPosts.forEach((post, index) => {
            console.log(`  ${index + 1}. ${post.title} (public: ${post.is_public})`);
        });
    }
    
    // Test 3: Check profiles with anon role
    console.log('\n3️⃣ Testing profiles with ANON ROLE:');
    const { data: anonProfiles, error: anonProfilesError } = await supabaseAnon
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .limit(5);
    
    if (anonProfilesError) {
        console.error('❌ Anon profiles error:', anonProfilesError);
    } else {
        console.log(`✅ Anon role found ${anonProfiles.length} profiles`);
        anonProfiles.forEach((profile, index) => {
            console.log(`  ${index + 1}. ${profile.username} (${profile.full_name})`);
        });
    }
    
    // Test 4: Test the exact same query that frontend uses
    console.log('\n4️⃣ Testing EXACT frontend query:');
    const { data: frontendPosts, error: frontendError } = await supabaseAnon
        .from('posts')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);
    
    if (frontendError) {
        console.error('❌ Frontend query error:', frontendError);
    } else {
        console.log(`✅ Frontend query found ${frontendPosts.length} posts`);
        console.log('📊 Post details:');
        frontendPosts.forEach((post, index) => {
            console.log(`  ${index + 1}. "${post.title}" by ${post.username || 'Unknown'}`);
            console.log(`     - Created: ${post.created_at}`);
            console.log(`     - Public: ${post.is_public}`);
            console.log(`     - Type: ${post.post_type}`);
        });
    }
    
    // Test 5: Check RLS policies
    console.log('\n5️⃣ Checking RLS policies:');
    const { data: policies, error: policiesError } = await supabaseService
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'posts');
    
    if (policiesError) {
        console.error('❌ Policies error:', policiesError);
    } else {
        console.log(`✅ Found ${policies.length} RLS policies for posts table`);
        policies.forEach(policy => {
            console.log(`  - ${policy.policyname}: ${policy.cmd} (${policy.permissive})`);
        });
    }
}

debugCommunityPosts().catch(console.error);
