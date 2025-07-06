#!/usr/bin/env node

/**
 * Test users fetching for Start New Chat functionality
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

async function testUsersFetch() {
    console.log('🚀 Testing users fetch for Start New Chat...\n');
    
    // Test 1: Check if users exist at all
    console.log('📊 Test 1: Count all users');
    const { count: totalCount, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
    
    if (countError) {
        console.error('❌ Error counting users:', countError);
    } else {
        console.log(`✅ Total users in database: ${totalCount}`);
    }
    
    // Test 2: Try to fetch users (basic select)
    console.log('\n📋 Test 2: Fetch all users');
    const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('id, email, role, points, level');
    
    if (fetchError) {
        console.error('❌ Error fetching users:', fetchError);
    } else {
        console.log(`✅ Successfully fetched ${users.length} users`);
        users.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.email} (${user.role}) - Level ${user.level}`);
        });
    }
    
    // Test 3: Try to fetch users with profiles joined (like chat component might do)
    console.log('\n👤 Test 3: Fetch users with profiles (for chat)');
    const { data: usersWithProfiles, error: profilesError } = await supabase
        .from('users')
        .select(`
            id,
            email,
            role,
            profiles (
                username,
                full_name,
                avatar_url
            )
        `)
        .neq('role', 'admin'); // Usually exclude admin from chat
    
    if (profilesError) {
        console.error('❌ Error fetching users with profiles:', profilesError);
    } else {
        console.log(`✅ Successfully fetched ${usersWithProfiles.length} users with profiles`);
        usersWithProfiles.forEach((user, index) => {
            const profile = user.profiles?.[0] || {};
            console.log(`  ${index + 1}. ${profile.full_name || user.email} (@${profile.username || 'no-username'})`);
        });
    }
    
    // Test 4: Check active users only
    console.log('\n⚡ Test 4: Fetch active users only');
    const { data: activeUsers, error: activeError } = await supabase
        .from('users')
        .select('id, email, role, is_active')
        .eq('is_active', true);
    
    if (activeError) {
        console.error('❌ Error fetching active users:', activeError);
    } else {
        console.log(`✅ Successfully fetched ${activeUsers.length} active users`);
        activeUsers.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.email} (${user.role}) - Active: ${user.is_active}`);
        });
    }
}

testUsersFetch().catch(console.error);
