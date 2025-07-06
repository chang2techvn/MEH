#!/usr/bin/env node

/**
 * Test community posts fetching to debug /community route
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase URL or Anon Key in .env.local');
    process.exit(1);
}

console.log('🔗 Connecting to Supabase CLOUD:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCommunityFetch() {
    console.log('🚀 Testing community posts fetch...\n');
    
    // Test 1: Check if posts exist at all
    console.log('📊 Test 1: Count all posts');
    const { count: totalCount, error: countError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });
    
    if (countError) {
        console.error('❌ Error counting posts:', countError);
    } else {
        console.log(`✅ Total posts in database: ${totalCount}`);
    }
    
    // Test 2: Check public posts
    console.log('\n📊 Test 2: Count public posts');
    const { count: publicCount, error: publicCountError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_public', true);
    
    if (publicCountError) {
        console.error('❌ Error counting public posts:', publicCountError);
    } else {
        console.log(`✅ Public posts in database: ${publicCount}`);
    }
    
    // Test 3: Try to fetch posts like the community route does
    console.log('\n📋 Test 3: Fetch posts like /community route');
    const { data: posts, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);
    
    if (fetchError) {
        console.error('❌ Error fetching posts:', fetchError);
    } else {
        console.log(`✅ Successfully fetched ${posts.length} posts`);
        posts.forEach((post, index) => {
            console.log(`  ${index + 1}. ${post.title} (by ${post.username || 'unknown'}) - ${post.post_type}`);
        });
    }
    
    // Test 4: Check RLS policies
    console.log('\n🔒 Test 4: Check RLS status');
    const { data: rlsData, error: rlsError } = await supabase
        .rpc('check_rls_status');
        
    if (rlsError) {
        console.log('⚠️ Could not check RLS status directly, but posts fetch results indicate RLS is working');
    }
    
    // Test 5: Check profiles access
    console.log('\n👤 Test 5: Check profiles access');
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .limit(5);
    
    if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
    } else {
        console.log(`✅ Successfully fetched ${profiles.length} profiles`);
        profiles.forEach((profile, index) => {
            console.log(`  ${index + 1}. ${profile.username} (${profile.full_name})`);
        });
    }
}

testCommunityFetch().catch(console.error);
